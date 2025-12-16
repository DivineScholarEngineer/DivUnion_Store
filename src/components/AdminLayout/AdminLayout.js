import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { navigate } from 'gatsby';

import FormInputField from '../FormInputField/FormInputField';
import Icon from '../Icons/Icon';
import { clearActiveSession, getSession, isAuth } from '../../helpers/general';
import * as styles from './AdminLayout.module.css';

const RESERVED_MAIN_ADMIN_EMAIL = 'divinewos@gmail.com';

const AdminLayout = ({ children, sidebar, title }) => {
  const [search, setSearch] = useState('');
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (isAuth()) {
      setSession(getSession());
    }
  }, []);

  const handleLogout = () => {
    clearActiveSession();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/search?q=${encodeURIComponent(search)}`);
  };

  const isMainAdmin =
    session?.email === RESERVED_MAIN_ADMIN_EMAIL && session?.role === 'main-admin';

  return (
    <div className={styles.adminShell}>
      <header className={styles.header}>
        <div className={styles.brandBlock}>
          <div className={styles.brandMark}>DU</div>
          <div className={styles.brandText}>
            <span className={styles.brandTitle}>DivUnion Tech — Admin Panel</span>
            <span className={styles.brandSubtitle}>Secure controls for the main administrator</span>
          </div>
        </div>
        <div className={styles.headerControls}>
          <form className={styles.searchForm} onSubmit={handleSearch}>
            <FormInputField
              id={'adminSearch'}
              value={search}
              placeholder={'Search site data'}
              handleChange={(_, value) => setSearch(value)}
              icon={'search'}
              type={'text'}
            />
          </form>
          <div className={styles.profileArea}>
            <div className={styles.profileMeta}>
              <span className={styles.profileLabel}>Signed in</span>
              <span className={styles.profileName}>{session?.username || 'Admin'}</span>
              {isMainAdmin && <span className={styles.rolePill}>MAIN_ADMIN</span>}
            </div>
            <button className={styles.logoutButton} onClick={handleLogout}>
              <Icon symbol={'logout'} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>{sidebar}</aside>
        <main className={styles.content}>{title && <h1>{title}</h1>}{children}</main>
      </div>
    </div>
  );
};

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
  sidebar: PropTypes.node,
  title: PropTypes.string,
};

export default AdminLayout;
