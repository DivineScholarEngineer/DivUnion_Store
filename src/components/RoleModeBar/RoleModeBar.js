import React, { useEffect, useState } from 'react';
import { navigate } from 'gatsby';

import { getActiveMode, getSession, isAuth, setActiveMode } from '../../helpers/general';

import * as styles from './RoleModeBar.module.css';

const RoleModeBar = () => {
  const [session, setSession] = useState(null);
  const [mode, setMode] = useState(getActiveMode());

  useEffect(() => {
    if (isAuth()) {
      setSession(getSession());
      setMode(getActiveMode());
    }
  }, []);

  if (!session || session.role !== 'minor-admin') return null;

  const isMinorAdminMode = mode === 'minor-admin';

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    const updated = setActiveMode(nextMode);
    setSession(updated || session);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('du:mode-changed', { detail: nextMode }));
    }

    if (nextMode === 'minor-admin') {
      navigate('/minor-admin');
      return;
    }

    navigate('/account');
  };

  return (
    <div className={styles.root}>
      <div className={styles.labelBlock}>
        <span className={styles.kicker}>Mode selector</span>
        <div className={styles.titleRow}>
          <span className={styles.title}>Choose your experience</span>
          <span className={styles.subtitle}>
            Switch between the standard shopper view and the Minor Admin workspace at any time.
          </span>
        </div>
      </div>
      <div className={styles.tabGroup}>
        <button
          className={`${styles.tab} ${mode === 'user' ? styles.activeTab : ''}`}
          onClick={() => handleModeChange('user')}
        >
          <span className={styles.emoji}>🧑</span>
          <div className={styles.tabCopy}>
            <span className={styles.tabLabel}>User</span>
            <span className={styles.tabHelper}>Shop, browse, and manage your account</span>
          </div>
        </button>
        <button
          className={`${styles.tab} ${isMinorAdminMode ? styles.activeTab : ''}`}
          onClick={() => handleModeChange('minor-admin')}
        >
          <span className={styles.emoji}>🛠️</span>
          <div className={styles.tabCopy}>
            <span className={styles.tabLabel}>Minor Admin</span>
            <span className={styles.tabHelper}>Content, moderation, and support tools</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default RoleModeBar;
