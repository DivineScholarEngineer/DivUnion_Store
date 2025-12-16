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

  const isMinorAdmin = session?.role === 'minor-admin';
  const isMainAdmin = session?.role === 'main-admin';

  if (!session || (!isMinorAdmin && !isMainAdmin)) return null;

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

    if (nextMode === 'main-admin') {
      navigate('/admin');
      return;
    }

    navigate('/account');
  };

  const modeOptions = [
    {
      id: 'user',
      emoji: '🧑',
      label: 'User',
      helper: 'Shop, browse, and manage your account',
    },
    {
      id: 'minor-admin',
      emoji: '🛠️',
      label: 'Minor Admin',
      helper: 'Content, moderation, and support tools',
      visible: isMinorAdmin || isMainAdmin,
    },
  ];

  if (isMainAdmin) {
    modeOptions.push({
      id: 'main-admin',
      emoji: '👑',
      label: 'Main Admin',
      helper:
        'Full system control, role assignments, security, and analytics oversight',
      visible: true,
    });
  }

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
        {modeOptions
          .filter((option) => option.visible !== false)
          .map((option) => (
            <button
              key={option.id}
              className={`${styles.tab} ${mode === option.id ? styles.activeTab : ''}`}
              onClick={() => handleModeChange(option.id)}
            >
              <span className={styles.emoji}>{option.emoji}</span>
              <div className={styles.tabCopy}>
                <span className={styles.tabLabel}>{option.label}</span>
                <span className={styles.tabHelper}>{option.helper}</span>
              </div>
            </button>
          ))}
      </div>
    </div>
  );
};

export default RoleModeBar;
