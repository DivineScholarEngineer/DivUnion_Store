import React, { useState } from 'react';
import { navigate } from 'gatsby';
import {
  validateEmail,
  validateStrongPassword,
  isEmpty,
} from '../helpers/general';
import * as styles from './signup.module.css';

import AttributeGrid from '../components/AttributeGrid/AttributeGrid';
import Layout from '../components/Layout/Layout';
import FormInputField from '../components/FormInputField/FormInputField';
import Button from '../components/Button';

const RESERVED_MAIN_ADMIN_EMAIL = 'divinewos@gmail.com';

const SignupPage = () => {
  const initialState = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const errorState = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  };

  const [signupForm, setSignupForm] = useState(initialState);
  const [errorForm, setErrorForm] = useState(errorState);
  const [submitMessage, setSubmitMessage] = useState('');

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

  const handleChange = (id, e) => {
    const tempForm = { ...signupForm, [id]: e };
    setSignupForm(tempForm);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let validForm = true;
    const tempError = { ...errorState };

    if (isEmpty(signupForm.username) === true) {
      tempError.username = 'Field required';
      validForm = false;
    }

    if (validateEmail(signupForm.email) !== true) {
      tempError.email =
        'Please use a valid email address, such as user@example.com.';
      validForm = false;
    }

    if (validateStrongPassword(signupForm.password) !== true) {
      tempError.password =
        'Password must have at least 8 characters, 1 lowercase, 1 uppercase and 1 numeric character.';
      validForm = false;
    }

    if (signupForm.password !== signupForm.confirmPassword) {
      tempError.confirmPassword = 'Passwords must match exactly.';
      validForm = false;
    }

    const users = loadUsers();

    if (users.find((u) => u.username === signupForm.username)) {
      tempError.username = 'Username already in use.';
      validForm = false;
    }

    if (users.find((u) => u.email === signupForm.email)) {
      tempError.email = 'Email already in use.';
      validForm = false;
    }

    if (signupForm.email === RESERVED_MAIN_ADMIN_EMAIL && users.length > 0) {
      tempError.email = 'This email is reserved for the main admin and cannot be reused.';
      validForm = false;
    }

    if (validForm === true) {
      setErrorForm(errorState);
      const newUser = {
        username: signupForm.username,
        email: signupForm.email,
        password: signupForm.password,
        role: signupForm.email === RESERVED_MAIN_ADMIN_EMAIL ? 'main-admin' : 'user',
      };
      saveUsers([...users, newUser]);
      setSubmitMessage(
        newUser.role === 'main-admin'
          ? 'Main admin account created. Full access is now available on login.'
          : 'Account created. Please log in to continue.'
      );
      navigate('/accountSuccess');
      // account creation does not auto-login by default
    } else {
      setSubmitMessage('');
      setErrorForm(tempError);
    }
  };

  return (
    <Layout disablePaddingBottom={true}>
      <div className={styles.root}>
        <div className={styles.signupFormContainer}>
          <h1 className={styles.title}>Create Account</h1>
          <span className={styles.subtitle}>
            Please enter your the information below:
          </span>
          <form
            noValidate
            className={styles.signupForm}
            onSubmit={(e) => handleSubmit(e)}
          >
            <FormInputField
              id={'username'}
              value={signupForm.username}
              handleChange={(id, e) => handleChange(id, e)}
              type={'input'}
              labelName={'Username'}
              error={errorForm.username}
            />

            <FormInputField
              id={'email'}
              value={signupForm.email}
              handleChange={(id, e) => handleChange(id, e)}
              type={'email'}
              labelName={'Email'}
              error={errorForm.email}
            />

            <FormInputField
              id={'password'}
              value={signupForm.password}
              handleChange={(id, e) => handleChange(id, e)}
              type={'password'}
              labelName={'Password'}
              error={errorForm.password}
            />

            <FormInputField
              id={'confirmPassword'}
              value={signupForm.confirmPassword}
              handleChange={(id, e) => handleChange(id, e)}
              type={'password'}
              labelName={'Confirm Password'}
              error={errorForm.confirmPassword}
            />

            <Button fullWidth type={'submit'} level={'primary'}>
              create account
            </Button>
            <span className={styles.reminder}>Have an account?</span>
            <Button
              type={'button'}
              onClick={() => navigate('/login')}
              fullWidth
              level={'secondary'}
            >
              log in
            </Button>
            {submitMessage && <p className={styles.successMessage}>{submitMessage}</p>}
          </form>
        </div>

        <div className={styles.attributeGridContainer}>
          <AttributeGrid />
        </div>
      </div>
    </Layout>
  );
};

export default SignupPage;
