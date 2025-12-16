import React from 'react';
import PropTypes from 'prop-types';
import { navigate } from 'gatsby';

import Icon from '../Icons/Icon';
import RoleModeBar from '../RoleModeBar/RoleModeBar';
import { clearActiveSession, setActiveMode } from '../../helpers/general';

import * as styles from './MinorAdminLayout.module.css';

const MinorAdminLayout = ({ children, sidebar, session }) => {
  const handleLogout = () => {
    clearActiveSession();
    navigate('/login');
  };

  const returnToUserMode = () => {
    setActiveMode('user');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('du:mode-changed', { detail: 'user' }));
    }
    navigate('/account');
  };

  return (
    <div className={styles.shell}>
      <RoleModeBar />
      <header className={styles.header}>
        <div className={styles.brandBlock}>
          <div className={styles.brandMark}>DU</div>
          <div className={styles.brandCopy}>
            <span className={styles.brandTitle}>DevUnion Tech — Minor Admin</span>
            <span className={styles.brandSubtitle}>
              Limited controls with shopper UI fully hidden. Switch back to User mode anytime.
            </span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <div className={styles.sessionMeta}>
            <span className={styles.sessionLabel}>Signed in</span>
            <span className={styles.sessionName}>{session?.username || 'Minor Admin'}</span>
            <span className={styles.rolePill}>MINOR_ADMIN</span>
          </div>
          <div className={styles.actionGroup}>
            <button className={styles.secondaryButton} onClick={returnToUserMode}>
              <Icon symbol={'user'} />
              <span>User mode</span>
            </button>
            <button className={styles.primaryButton} onClick={handleLogout}>
              <Icon symbol={'logout'} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <div className={styles.workspace}>
        <aside className={styles.sidebar}>{sidebar}</aside>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
};

MinorAdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
  sidebar: PropTypes.node,
  session: PropTypes.object,
};

export default MinorAdminLayout;
