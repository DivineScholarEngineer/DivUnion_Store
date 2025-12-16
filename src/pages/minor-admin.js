import React, { useEffect, useMemo, useState } from 'react';
import { navigate } from 'gatsby';

import MinorAdminLayout from '../components/MinorAdminLayout/MinorAdminLayout';
import Button from '../components/Button';
import { getSession, isAuth, setActiveMode } from '../helpers/general';
import { normalizeMinorPermissions } from '../helpers/permissions';

import * as styles from './minor-admin.module.css';

const MinorAdminPage = () => {
  const [session, setSession] = useState(null);
  const [canRender, setCanRender] = useState(false);

  const permissions = useMemo(
    () => normalizeMinorPermissions(session?.permissions),
    [session?.permissions]
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!isAuth()) {
      navigate('/login');
      return;
    }

    const activeSession = getSession();
    if (activeSession?.role !== 'minor-admin') {
      navigate('/account');
      return;
    }

    const normalizedPermissions = normalizeMinorPermissions(activeSession.permissions);
    const updatedSession = setActiveMode('minor-admin') || {
      ...activeSession,
      mode: 'minor-admin',
    };

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('du:mode-changed', { detail: 'minor-admin' }));
    }

    setSession({
      ...activeSession,
      ...updatedSession,
      permissions: normalizedPermissions,
      mode: 'minor-admin',
    });
    setCanRender(true);
  }, []);

  if (!canRender) return null;

  const sidebar = (
    <nav className={styles.sidebarNav}>
      {permissions.analytics && <a href="#overview">Overview</a>}
      {permissions.journal && <a href="#journal">Journal tools</a>}
      {permissions.productContent && <a href="#content">Product content</a>}
      {permissions.inventory && <a href="#inventory">Inventory</a>}
      {permissions.support && <a href="#support">User support</a>}
      {permissions.moderation && <a href="#moderation">Moderation</a>}
    </nav>
  );

  const supportTickets = [
    { id: 'SUP-2481', user: 'jordan.h', topic: 'Delivery ETA', status: 'Watching' },
    { id: 'SUP-2482', user: 'mina.cho', topic: 'Account help', status: 'Read-only' },
    { id: 'SUP-2483', user: 'leo.l', topic: 'Return window', status: 'Watching' },
  ];

  const moderationQueue = [
    { id: 'FLAG-442', type: 'Review', summary: 'Repeated spam phrases', action: 'Escalated' },
    { id: 'FLAG-443', type: 'Comment', summary: 'Suspicious link sharing', action: 'Muted user for 24h' },
    { id: 'FLAG-444', type: 'Message', summary: 'Reported by 3 users', action: 'Pending main admin' },
  ];

  return (
    <MinorAdminLayout sidebar={sidebar} session={session}>
      {permissions.analytics && (
        <section id="overview" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Session mode</p>
              <h1>Minor Admin workspace</h1>
              <span className={styles.subtitle}>
                Shopper UI is hidden. Only the tools granted to this minor admin account are visible.
              </span>
            </div>
            <div className={styles.badgeStack}>
              <span className={styles.statusBadge}>Mode: Minor Admin</span>
              <span className={styles.statusBadge}>Permissions enforced</span>
            </div>
          </div>
          <div className={styles.metricGrid}>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Live status</span>
              <strong className={styles.metricValue}>Active</strong>
              <span className={styles.metricHint}>Mode stays locked to this session until switched.</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Basic analytics</span>
              <strong className={styles.metricValue}>3.2k</strong>
              <span className={styles.metricHint}>Page + product views available to minor admins.</span>
            </div>
            <div className={styles.metricCard}>
              <span className={styles.metricLabel}>Support queue</span>
              <strong className={styles.metricValue}>{supportTickets.length}</strong>
              <span className={styles.metricHint}>Read-only; routing stays with the main admin.</span>
            </div>
          </div>
        </section>
      )}

      {permissions.journal && (
        <section id="journal" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Content controls</p>
              <h2>Journal tools</h2>
              <span className={styles.subtitle}>
                Draft, publish, or flag Journal entries. Main admin still holds final approval.
              </span>
            </div>
            <Button level={'primary'} type={'button'}>
              Open Journal composer
            </Button>
          </div>
          <div className={styles.cardGrid}>
            <div className={styles.toolCard}>
              <strong>Drafts awaiting review</strong>
              <p className={styles.toolCopy}>Create or edit entries, then notify the main admin for final publish.</p>
              <Button level={'secondary'} type={'button'}>
                View drafts
              </Button>
            </div>
            <div className={styles.toolCard}>
              <strong>Published entries</strong>
              <p className={styles.toolCopy}>Update copy or schedule takedowns without touching pricing or inventory.</p>
              <Button level={'secondary'} type={'button'}>
                Audit live posts
              </Button>
            </div>
          </div>
        </section>
      )}

      {permissions.productContent && (
        <section id="content" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Product content</p>
              <h2>Content-safe edits</h2>
              <span className={styles.subtitle}>
                Update descriptions and imagery. Pricing, discounts, and checkout settings remain hidden.
              </span>
            </div>
            <Button level={'secondary'} type={'button'}>
              Request main admin for price change
            </Button>
          </div>
          <div className={styles.tableLike}>
            <div className={styles.tableRow}>
              <span>Photon Control Hub</span>
              <span className={styles.tableTag}>Copy only</span>
              <span className={styles.tableHint}>Ready for SEO review</span>
            </div>
            <div className={styles.tableRow}>
              <span>BioSync Wearable Band</span>
              <span className={styles.tableTag}>Media</span>
              <span className={styles.tableHint}>Gallery refresh queued</span>
            </div>
            <div className={styles.tableRow}>
              <span>Quantum Foam Speaker</span>
              <span className={styles.tableTag}>Copy only</span>
              <span className={styles.tableHint}>Awaiting main admin approval</span>
            </div>
          </div>
        </section>
      )}

      {permissions.inventory && (
        <section id="inventory" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Inventory visibility</p>
              <h2>Stock flags</h2>
              <span className={styles.subtitle}>
                Read-only inventory with flagging. Quantity edits remain locked to the main admin.
              </span>
            </div>
            <Button level={'primary'} type={'button'}>
              Flag low stock
            </Button>
          </div>
          <div className={styles.cardGrid}>
            <div className={styles.toolCard}>
              <strong>Photon Control Hub</strong>
              <p className={styles.toolCopy}>18 units available • Flagged for QC</p>
              <span className={styles.toolTag}>Read-only</span>
            </div>
            <div className={styles.toolCard}>
              <strong>BioSync Wearable Band</strong>
              <p className={styles.toolCopy}>7 units available • Notify vendor</p>
              <span className={styles.toolTag}>Escalated</span>
            </div>
            <div className={styles.toolCard}>
              <strong>Quantum Foam Speaker</strong>
              <p className={styles.toolCopy}>22 units available • Stable</p>
              <span className={styles.toolTag}>Healthy</span>
            </div>
          </div>
        </section>
      )}

      {permissions.support && (
        <section id="support" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>User support</p>
              <h2>Read-only support queue</h2>
              <span className={styles.subtitle}>
                Review tickets and add notes. Routing and resolutions stay under main admin control.
              </span>
            </div>
            <span className={styles.statusBadge}>Read-only</span>
          </div>
          <div className={styles.tableLike}>
            {supportTickets.map((ticket) => (
              <div key={ticket.id} className={styles.tableRow}>
                <span>{ticket.id}</span>
                <span className={styles.tableHint}>{ticket.user}</span>
                <span className={styles.tableHint}>{ticket.topic}</span>
                <span className={styles.tableTag}>{ticket.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {permissions.moderation && (
        <section id="moderation" className={styles.section}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.kicker}>Moderation</p>
              <h2>Safety controls</h2>
              <span className={styles.subtitle}>
                Hide shopper CTAs while you review flags. Escalations flow to the main admin.
              </span>
            </div>
            <Button level={'secondary'} type={'button'}>
              Escalate to main admin
            </Button>
          </div>
          <div className={styles.tableLike}>
            {moderationQueue.map((flag) => (
              <div key={flag.id} className={styles.tableRow}>
                <span>{flag.id}</span>
                <span className={styles.tableHint}>{flag.type}</span>
                <span className={styles.tableHint}>{flag.summary}</span>
                <span className={styles.tableTag}>{flag.action}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </MinorAdminLayout>
  );
};

export default MinorAdminPage;
