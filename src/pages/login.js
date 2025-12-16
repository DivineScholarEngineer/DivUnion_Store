import React, { useState } from 'react';
import { Link, navigate } from 'gatsby';
import { isEmpty } from '../helpers/general';
import * as styles from './login.module.css';

import AttributeGrid from '../components/AttributeGrid/AttributeGrid';
import Layout from '../components/Layout/Layout';
import FormInputField from '../components/FormInputField/FormInputField';
import Button from '../components/Button';
import Modal from '../components/Modal';

const RESERVED_MAIN_ADMIN_EMAIL = 'divinewos@gmail.com';
const MAJOR_ADMIN_EMAIL = 'major.admin@devunion.tech';
const MAJOR_ADMIN_PASSWORD = 'devunion-major-2024';
const MINOR_ADMIN_CODE = 'DU-ACCESS-2024';

const LoginPage = () => {
  const initialState = {
    username: '',
    password: '',
    approvalCode: '',
  };

  const errorState = {
    username: '',
    password: '',
  };

  const [loginForm, setLoginForm] = useState(initialState);
  const [errorForm, setErrorForm] = useState(errorState);
  const [errorMessage, setErrorMessage] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [adminIntent, setAdminIntent] = useState('support');
  const [approvalMessage, setApprovalMessage] = useState('');
  const [pendingUser, setPendingUser] = useState(null);

  const loadUsers = () => {
    const stored = window.localStorage.getItem('du_users');
    if (!stored) return [];
    try {
      return JSON.parse(stored);
    } catch (error) {
      return [];
    }
  };

  const saveUsers = (users) => {
    window.localStorage.setItem('du_users', JSON.stringify(users));
  };

  const persistSession = (user) => {
    window.localStorage.setItem(
      'du_session',
      JSON.stringify({ username: user.username, role: user.role, email: user.email })
    );
  };

  const handleChange = (id, e) => {
    const tempForm = { ...loginForm, [id]: e };
    setLoginForm(tempForm);
  };

  const resolveUser = () => {
    const users = loadUsers();
    return users.find((u) => u.username === loginForm.username);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let validForm = true;
    const tempError = { ...errorForm };

    if (isEmpty(loginForm.username) === true) {
      tempError.username = 'Username required';
      validForm = false;
    } else {
      tempError.username = '';
    }

    if (isEmpty(loginForm.password) === true) {
      tempError.password = 'Field required';
      validForm = false;
    } else {
      tempError.password = '';
    }

    if (validForm === true) {
      setErrorForm(errorState);
      setErrorMessage('');

      // Major admin (hard coded)
      if (
        loginForm.username === MAJOR_ADMIN_EMAIL &&
        loginForm.password === MAJOR_ADMIN_PASSWORD
      ) {
        const majorAdmin = {
          username: 'Major Admin',
          email: MAJOR_ADMIN_EMAIL,
          role: 'major-admin',
        };
        persistSession(majorAdmin);
        navigate('/account');
        return;
      }

      const user = resolveUser();

      if (!user) {
        setErrorMessage('There is no account associated with this username.');
        return;
      }

      if (user.password !== loginForm.password) {
        setErrorMessage('Incorrect password.');
        return;
      }

      // Main admins should bypass the intent prompt and land directly in the account
      // area with their elevated role intact.
      if (user.role === 'main-admin') {
        persistSession(user);
        navigate('/account');
        return;
      }

      setPendingUser(user);
      setShowLoginPrompt(true);
      setApprovalMessage('');
    } else {
      setErrorMessage('');
      setErrorForm(tempError);
    }
  };

  const sendMinorAdminRequest = (user) => {
    const stored = window.localStorage.getItem('du_minor_requests');
    const requests = stored ? JSON.parse(stored) : [];
    const existingRequest = requests.find((req) => req.username === user.username);
    if (!existingRequest) {
      requests.push({ username: user.username, email: user.email });
      window.localStorage.setItem('du_minor_requests', JSON.stringify(requests));
    }
  };

  const handleApproval = () => {
    if (!pendingUser) return;

    if (adminIntent === 'minor-admin' && loginForm.approvalCode.trim() === '') {
      sendMinorAdminRequest(pendingUser);
      setApprovalMessage('Request sent to the main admin. Enter the approval code when it arrives.');
      persistSession({ ...pendingUser, role: pendingUser.role || 'user' });
      navigate('/account');
      return;
    }

    if (adminIntent === 'minor-admin' && loginForm.approvalCode.trim() !== '') {
      if (loginForm.approvalCode.trim() === MINOR_ADMIN_CODE) {
        const users = loadUsers().map((u) =>
          u.username === pendingUser.username ? { ...u, role: 'minor-admin' } : u
        );
        saveUsers(users);
        persistSession({ ...pendingUser, role: 'minor-admin' });
        navigate('/account');
        return;
      }
      setApprovalMessage('Enter the approval code emailed by the main admin.');
      return;
    }

    persistSession({ ...pendingUser, role: pendingUser.role || 'user' });
    navigate('/account');
  };

  return (
    <Layout disablePaddingBottom={true}>
      <div
        className={`${styles.errorContainer} ${
          errorMessage !== '' ? styles.show : ''
        }`}
      >
        <span className={styles.errorMessage}>{errorMessage}</span>
      </div>

      <div className={styles.root}>
        <div className={styles.loginFormContainer}>
          <h1 className={styles.loginTitle}>Login</h1>
          <span className={styles.subtitle}>
            Please enter your username and password
          </span>
          <form
            noValidate
            className={styles.loginForm}
            onSubmit={(e) => handleSubmit(e)}
          >
            <FormInputField
              id={'username'}
              value={loginForm.username}
              handleChange={(id, e) => handleChange(id, e)}
              type={'text'}
              labelName={'Username'}
              error={errorForm.username}
            />

            <FormInputField
              id={'password'}
              value={loginForm.password}
              handleChange={(id, e) => handleChange(id, e)}
              type={'password'}
              labelName={'Password'}
              error={errorForm.password}
            />
            <div className={styles.forgotPasswordContainer}>
              <Link to={'/forgot'} className={styles.forgotLink}>
                Forgot Password
              </Link>
            </div>

            <Button fullWidth type={'submit'} level={'primary'}>
              LOG IN
            </Button>
            <span className={styles.createLink}>New Customer? </span>
            <Button
              type={'button'}
              onClick={() => navigate('/signup')}
              fullWidth
              level={'secondary'}
            >
              create an account
            </Button>
          </form>
        </div>

        <div className={styles.attributeGridContainer}>
          <AttributeGrid />
        </div>
      </div>

      <Modal visible={showLoginPrompt} close={() => setShowLoginPrompt(false)}>
        <div className={styles.modalContainer}>
          <h2>Confirm your sign-in</h2>
          <p>
            Choose your sign-in path. Standard users continue directly. Minor
            admins request approval and unlock access only after a code is
            verified. Major admins sign in with the hard-coded credentials.
          </p>

          <div className={styles.intentGrid}>
            <label className={styles.radioRow}>
              <input
                type="radio"
                name="intent"
                value="support"
                checked={adminIntent === 'support'}
                onChange={() => setAdminIntent('support')}
              />
              <span>Standard user (shop & track orders)</span>
            </label>
            <label className={styles.radioRow}>
              <input
                type="radio"
                name="intent"
                value="minor-admin"
                checked={adminIntent === 'minor-admin'}
                onChange={() => setAdminIntent('minor-admin')}
              />
              <span>Request minor admin review</span>
            </label>
          </div>

          {adminIntent === 'minor-admin' && (
            <div className={styles.codeBlock}>
              <p>
                Enter the approval code you received in your email to unlock
                minor admin tooling. If you do not have one yet, submitting will
                send a request to the main admin.
              </p>
              <FormInputField
                id={'approvalCode'}
                value={loginForm.approvalCode}
                handleChange={(id, e) => handleChange(id, e)}
                labelName={'Approval code'}
                placeholder={'XXXX-XXXX'}
              />
            </div>
          )}

          <div className={styles.modalActions}>
            <Button level={'secondary'} onClick={() => setShowLoginPrompt(false)}>
              Back
            </Button>
            <Button level={'primary'} onClick={handleApproval}>
              Continue
            </Button>
          </div>

          {approvalMessage !== '' && (
            <span className={styles.inlineError}>{approvalMessage}</span>
          )}
        </div>
      </Modal>
    </Layout>
  );
};

export default LoginPage;
