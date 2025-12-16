import React, { useEffect, useMemo, useState } from 'react';
import { Link, navigate } from 'gatsby';

import AdminLayout from '../components/AdminLayout/AdminLayout';
import Button from '../components/Button';
import FormInputField from '../components/FormInputField/FormInputField';
import Modal from '../components/Modal';
import { getSession, isAuth } from '../helpers/general';
import products from '../helpers/product.json';
import {
  approveMinorRequest,
  loadMinorRequests,
  rejectMinorRequest,
  saveMinorRequests,
} from '../helpers/minorAdmin';
import * as styles from './admin.module.css';

const RESERVED_MAIN_ADMIN_EMAIL = 'divinewos@gmail.com';

const loadFromStorage = (key, fallback) => {
  const stored = window.localStorage.getItem(key);
  if (!stored) return fallback;
  try {
    return JSON.parse(stored);
  } catch (error) {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};

const buildProductCatalog = () =>
  products.map((item, index) => ({
    id: item.productCode || `product-${index}`,
    name: item.name,
    price: item.price || 0,
    inventory: item.inventory || 25,
    discount: item.discount || 0,
    category: item.tags?.[0] || 'general',
    tags: item.tags || [],
    description: item.description || 'Pending description',
  }));

const AdminPage = () => {
  const [canRender, setCanRender] = useState(false);
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [journalEntries, setJournalEntries] = useState([]);
  const [journalDraft, setJournalDraft] = useState({ title: '', body: '', status: 'draft' });
  const [minorRequests, setMinorRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderResolutions, setOrderResolutions] = useState({});
  const [productCatalog, setProductCatalog] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [roleUpdate, setRoleUpdate] = useState({ email: '', role: 'user' });
  const [approvalModal, setApprovalModal] = useState({ visible: false, request: null });

  const formatDate = (value) => (value ? new Date(value).toLocaleString() : 'Pending timestamp');

  const statusBadgeClass = (status) => {
    if (status === 'APPROVED') return `${styles.badge} ${styles.badgeSuccess}`;
    if (status === 'REJECTED') return `${styles.badge} ${styles.badgeDanger}`;
    return `${styles.badge} ${styles.badgeWarning}`;
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (isAuth() === false) {
      navigate('/login');
      return;
    }

    const storedSession = getSession();
    const isMainAdmin =
      storedSession?.email === RESERVED_MAIN_ADMIN_EMAIL && storedSession?.role === 'main-admin';

    if (!isMainAdmin) {
      navigate('/login');
      return;
    }

    setSession(storedSession);
    setUsers(loadFromStorage('du_users', []));
    setJournalEntries(loadFromStorage('du_journal', []));
    setMinorRequests(loadMinorRequests());
    setOrders(loadFromStorage('orders', []));
    setOrderResolutions(loadFromStorage('du_order_resolutions', {}));

    const storedProducts = loadFromStorage('du_admin_products', buildProductCatalog());
    setProductCatalog(storedProducts);
    setActivityLog(loadFromStorage('du_admin_log', []));
    setCanRender(true);
  }, []);

  useEffect(() => {
    if (!canRender) return;
    saveToStorage('du_journal', journalEntries);
  }, [journalEntries, canRender]);

  useEffect(() => {
    if (!canRender) return;
    saveToStorage('du_admin_products', productCatalog);
  }, [productCatalog, canRender]);

  useEffect(() => {
    if (!canRender) return;
    saveToStorage('du_admin_log', activityLog);
  }, [activityLog, canRender]);

  useEffect(() => {
    if (!canRender) return;
    saveToStorage('du_order_resolutions', orderResolutions);
  }, [orderResolutions, canRender]);

  useEffect(() => {
    if (!canRender) return;
    saveMinorRequests(minorRequests);
  }, [minorRequests, canRender]);

  const recordActivity = (message) => {
    const timestamp = new Date().toISOString();
    setActivityLog((prev) => [{ message, timestamp }, ...prev].slice(0, 50));
  };

  const totalUsers = users.length;
  const totalOrders = orders.length;
  const lowStock = productCatalog.filter((item) => item.inventory < 10).length;

  const handleJournalSubmit = (e) => {
    e.preventDefault();
    if (!journalDraft.title.trim()) return;
    const newEntry = {
      id: `journal-${Date.now()}`,
      ...journalDraft,
      updatedAt: new Date().toISOString(),
    };
    setJournalEntries((prev) => [newEntry, ...prev]);
    setJournalDraft({ title: '', body: '', status: 'draft' });
    recordActivity(`Created journal entry "${newEntry.title}"`);
  };

  const toggleJournalStatus = (id) => {
    setJournalEntries((prev) => {
      const updated = prev.map((entry) =>
        entry.id === id
          ? { ...entry, status: entry.status === 'published' ? 'draft' : 'published' }
          : entry
      );
      const changed = updated.find((entry) => entry.id === id);
      recordActivity(
        `${changed.status === 'published' ? 'Published' : 'Unpublished'} journal entry "${changed.title}"`
      );
      return updated;
    });
  };

  const deleteJournal = (id) => {
    setJournalEntries((prev) => prev.filter((entry) => entry.id !== id));
    recordActivity('Deleted journal entry');
  };

const approveRequest = (request) => {
  const approval = approveMinorRequest(request);
  if (!approval) return;
  const latestRequest = approval.requests.find((req) => req.username === request.username);
  setMinorRequests(approval.requests);

  if (approval.error) {
    recordActivity(
      `Approval email for ${request.username} failed: ${approval.error}. Request stays pending until delivery succeeds.`
    );
    return;
  }

  setApprovalModal({ visible: true, request: latestRequest });
  recordActivity(`Approved minor admin request for ${request.username} (code emailed)`);
};

  const denyRequest = (request) => {
    const rejection = rejectMinorRequest(request);
    if (!rejection) return;
    setMinorRequests(rejection.requests);
    recordActivity(`Denied minor admin request for ${request.username}`);
  };

  const removeUser = (email) => {
    if (email === RESERVED_MAIN_ADMIN_EMAIL) return;
    const filtered = users.filter((u) => u.email !== email);
    setUsers(filtered);
    saveToStorage('du_users', filtered);
    recordActivity(`Deleted user ${email}`);
  };

  const updateRole = (e) => {
    e.preventDefault();
    if (!roleUpdate.email) return;
    if (roleUpdate.email === RESERVED_MAIN_ADMIN_EMAIL) return;
    const updatedUsers = users.map((u) =>
      u.email === roleUpdate.email ? { ...u, role: roleUpdate.role } : u
    );
    setUsers(updatedUsers);
    saveToStorage('du_users', updatedUsers);
    recordActivity(`Updated role for ${roleUpdate.email} to ${roleUpdate.role}`);
    setRoleUpdate({ email: '', role: 'user' });
  };

  const resolveOrder = (id, status) => {
    const updated = { ...orderResolutions, [id]: status };
    setOrderResolutions(updated);
    recordActivity(`Marked order ${id} as ${status}`);
  };

  const updateProductField = (id, field, value) => {
    setProductCatalog((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const sidebar = (
    <nav className={styles.sidebarNav}>
      <a href="#dashboard">Dashboard</a>
      <a href="#journal">Journal</a>
      <a href="#users">Users</a>
      <a href="#orders">Orders</a>
      <a href="#products">Products</a>
      <a href="#analytics">Analytics</a>
      <a href="#security">Security & Settings</a>
    </nav>
  );

  const basicAnalytics = useMemo(
    () => [
      { label: 'Page views', value: 4280 },
      { label: 'Product views', value: 1210 },
      { label: 'Journal engagement', value: 312 },
    ],
    []
  );

  const advancedAnalytics = useMemo(
    () => [
      { label: 'Net revenue (mock)', value: '$48,200' },
      { label: 'Avg. order value', value: '$182' },
      { label: 'Pending payouts', value: '$4,120' },
    ],
    []
  );

  if (!canRender) return null;

  return (
    <AdminLayout sidebar={sidebar} title={'Control center'}>
      <div id="dashboard" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Dashboard overview</h2>
          <span className={styles.muted}>Quick stats for the main administrator</span>
        </div>
        <div className={styles.panelGrid}>
          <div className={styles.panelCard}>
            <h3>Total users</h3>
            <div className={styles.value}>{totalUsers}</div>
            <span className={styles.subtext}>Account count including admins</span>
          </div>
          <div className={styles.panelCard}>
            <h3>Total orders</h3>
            <div className={styles.value}>{totalOrders}</div>
            <span className={styles.subtext}>History visible to main admin</span>
          </div>
          <div className={styles.panelCard}>
            <h3>Low stock items</h3>
            <div className={styles.value}>{lowStock}</div>
            <span className={styles.subtext}>Alerts fire under 10 units</span>
          </div>
          <div className={styles.panelCard}>
            <h3>Recent activity</h3>
            <div className={styles.stack}>
              {activityLog.slice(0, 3).map((log) => (
                <span key={log.timestamp} className={styles.subtext}>
                  {new Date(log.timestamp).toLocaleString()} — {log.message}
                </span>
              ))}
              {activityLog.length === 0 && <span className={styles.subtext}>Awaiting first action.</span>}
            </div>
          </div>
        </div>
      </div>

      <div id="journal" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Journal management</h2>
          <span className={styles.muted}>Create, edit, publish, and remove DevUnion Journal entries</span>
        </div>
        <form onSubmit={handleJournalSubmit} className={styles.gridTwo}>
          <FormInputField
            id={'journal-title'}
            value={journalDraft.title}
            labelName={'Title'}
            handleChange={(_, value) => setJournalDraft({ ...journalDraft, title: value })}
          />
          <FormInputField
            id={'journal-status'}
            value={journalDraft.status}
            labelName={'Status'}
            handleChange={(_, value) => setJournalDraft({ ...journalDraft, status: value })}
            placeholder={'draft or published'}
          />
          <textarea
            className={styles.textArea}
            value={journalDraft.body}
            onChange={(e) => setJournalDraft({ ...journalDraft, body: e.target.value })}
            placeholder={'Entry body'}
          />
          <Button type={'submit'} level={'primary'}>
            Save entry
          </Button>
        </form>
        <div className={styles.tableLike}>
          {journalEntries.length === 0 && <div className={styles.alert}>No journal entries yet. Only admins can add content.</div>}
          {journalEntries.map((entry) => (
            <div key={entry.id} className={styles.row}>
              <div className={styles.stack}>
                <strong>{entry.title}</strong>
                <span className={styles.subtext}>{entry.body}</span>
                <span className={styles.badge}>{entry.status}</span>
              </div>
              <div className={styles.inlineActions}>
                <button className={styles.buttonGhost} onClick={() => toggleJournalStatus(entry.id)}>
                  {entry.status === 'published' ? 'Unpublish' : 'Publish'}
                </button>
                <button className={`${styles.buttonGhost} ${styles.badgeDanger}`} onClick={() => deleteJournal(entry.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div id="users" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>User management</h2>
          <span className={styles.muted}>Full controls are limited to the main admin</span>
        </div>
        <div className={styles.gridTwo}>
          <div className={styles.panelCard}>
            <h3>All users</h3>
            <div className={styles.tableLike}>
              {users.length === 0 && <span className={styles.subtext}>No users found.</span>}
              {users.map((user) => (
                <div key={user.email} className={styles.row}>
                  <div className={styles.stack}>
                    <strong>{user.username}</strong>
                    <span className={styles.subtext}>{user.email}</span>
                    <span className={styles.badge}>{user.role || 'user'}</span>
                  </div>
                  <div className={styles.inlineActions}>
                    <button className={styles.buttonGhost} onClick={() => removeUser(user.email)} disabled={user.email === RESERVED_MAIN_ADMIN_EMAIL}>
                      Delete
                    </button>
                    <span className={styles.smallNote}>Only main admin can delete.</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.panelCard}>
            <h3>Minor admin requests</h3>
            {minorRequests.length === 0 && <span className={styles.subtext}>No minor admin requests yet.</span>}
            {minorRequests.map((request) => (
              <div key={request.username} className={styles.row}>
                <div className={styles.stack}>
                  <strong>{request.username}</strong>
                  <span className={styles.subtext}>{request.email}</span>
                  <span className={statusBadgeClass(request.status)}>{request.status}</span>
                  <span className={styles.smallNote}>Requested {formatDate(request.requestedAt)}</span>
                  {request.deliveryError && (
                    <span className={styles.smallNote}>
                      Email delivery failed ({request.deliveryError}). Confirm the admin sender credentials and try again.
                    </span>
                  )}
                  {request.status === 'APPROVED' && request.approvedAt && !request.deliveryError && (
                    <span className={styles.smallNote}>
                      Approved {formatDate(request.approvedAt)} • Code sent to the registered email address
                    </span>
                  )}
                  {request.status === 'REJECTED' && request.rejectedAt && (
                    <span className={styles.smallNote}>Rejected {formatDate(request.rejectedAt)}</span>
                  )}
                </div>
                <div className={styles.inlineActions}>
                  {request.status === 'PENDING' && (
                    <>
                      <button className={styles.buttonGhost} onClick={() => approveRequest(request)}>
                        Approve & send code
                      </button>
                      <button className={`${styles.buttonGhost} ${styles.badgeDanger}`} onClick={() => denyRequest(request)}>
                        Reject
                      </button>
                    </>
                  )}
                  {request.status !== 'PENDING' && <span className={styles.smallNote}>No further actions.</span>}
                </div>
              </div>
            ))}
            {minorRequests.length > 0 && (
              <p className={styles.smallNote}>
                Approved requests trigger an email with the approval code using admin-owned credentials. Requests remain
                visible with their status and any delivery errors for audit history.
              </p>
            )}
          </div>
        </div>

        <div className={styles.panelCard} style={{ marginTop: '16px' }}>
          <h3>Role assignment (Main admin only)</h3>
          <form className={styles.formGrid} onSubmit={updateRole}>
            <FormInputField
              id={'role-email'}
              value={roleUpdate.email}
              labelName={'User email'}
              handleChange={(_, value) => setRoleUpdate({ ...roleUpdate, email: value })}
              placeholder={'user@example.com'}
            />
            <FormInputField
              id={'role-role'}
              value={roleUpdate.role}
              labelName={'Role'}
              handleChange={(_, value) => setRoleUpdate({ ...roleUpdate, role: value })}
              placeholder={'user | minor-admin | main-admin'}
            />
            <Button level={'primary'} type={'submit'}>
              Update role
            </Button>
            <p className={styles.smallNote}>
              Reserved email enforcement is active: divinewos@gmail.com always remains MAIN_ADMIN.
            </p>
          </form>
        </div>
      </div>

      <div id="orders" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Orders</h2>
          <span className={styles.muted}>Read-only for minor admins; full visibility with tracked resolutions for the main admin</span>
        </div>
        {orders.length === 0 && <div className={styles.alert}>No orders captured yet.</div>}
        {orders.length > 0 && (
          <div>
            <div className={styles.tableHeader}>
              <span>Order</span>
              <span>Placed</span>
              <span>Status</span>
              <span>Resolution</span>
            </div>
            {orders.map((order) => (
              <div key={order.id} className={styles.tableRow}>
                <span>{order.id}</span>
                <span>{order.date || 'Pending date'}</span>
                <span>{order.status || 'Open'}</span>
                <div className={styles.inlineActions}>
                  <button className={styles.buttonGhost} onClick={() => resolveOrder(order.id, 'resolved')}>
                    Resolve
                  </button>
                  <button className={styles.buttonGhost} onClick={() => resolveOrder(order.id, 'needs-review')}>
                    Flag issue
                  </button>
                  <span className={styles.smallNote}>{orderResolutions[order.id] || 'Untracked'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div id="products" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Products & Categories</h2>
          <span className={styles.muted}>Minor admins edit content only. Main admin can change pricing and inventory.</span>
        </div>
        <div className={styles.gridTwo}>
          {productCatalog.map((item) => (
            <div key={item.id} className={styles.panelCard}>
              <div className={styles.sectionHeader}>
                <h3>{item.name}</h3>
                <span className={styles.badge}>{item.category}</span>
              </div>
              <div className={styles.formGrid}>
                <FormInputField
                  id={`${item.id}-description`}
                  value={item.description}
                  labelName={'Description (content safe for minor admins)'}
                  handleChange={(_, value) => updateProductField(item.id, 'description', value)}
                />
                <FormInputField
                  id={`${item.id}-price`}
                  value={item.price}
                  labelName={'Price (main admin only)'}
                  type={'number'}
                  handleChange={(_, value) => updateProductField(item.id, 'price', Number(value))}
                />
                <FormInputField
                  id={`${item.id}-inventory`}
                  value={item.inventory}
                  labelName={'Inventory (main admin only)'}
                  type={'number'}
                  handleChange={(_, value) => updateProductField(item.id, 'inventory', Number(value))}
                />
                <FormInputField
                  id={`${item.id}-discount`}
                  value={item.discount}
                  labelName={'Discount % (main admin only)'}
                  type={'number'}
                  handleChange={(_, value) => updateProductField(item.id, 'discount', Number(value))}
                />
              </div>
              <div className={styles.tagList}>
                {item.tags.map((tag) => (
                  <span key={tag} className={styles.badge}>
                    {tag}
                  </span>
                ))}
              </div>
              <p className={styles.smallNote}>
                Minor admins cannot change pricing, discounts, inventory quantities, or create/delete categories.
              </p>
            </div>
          ))}
        </div>
      </div>

      <div id="analytics" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Analytics</h2>
          <span className={styles.muted}>Tiered access with advanced summaries for the main admin</span>
        </div>
        <div className={styles.gridTwo}>
          <div className={styles.panelCard}>
            <h3>Basic analytics (Minor admin)</h3>
            {basicAnalytics.map((metric) => (
              <div key={metric.label} className={styles.row}>
                <strong>{metric.label}</strong>
                <span>{metric.value}</span>
              </div>
            ))}
          </div>
          <div className={styles.panelCard}>
            <h3>Advanced analytics (Main admin)</h3>
            {advancedAnalytics.map((metric) => (
              <div key={metric.label} className={styles.row}>
                <strong>{metric.label}</strong>
                <span>{metric.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="security" className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Security & Settings</h2>
          <span className={styles.muted}>Main admin only: role assignment, reserved email enforcement, audit logs</span>
        </div>
        <div className={styles.gridTwo}>
          <div className={styles.panelCard}>
            <h3>Audit log</h3>
            {activityLog.length === 0 && <span className={styles.subtext}>No actions recorded yet.</span>}
            <div className={styles.tableLike}>
              {activityLog.map((log) => (
                <div key={log.timestamp} className={styles.row}>
                  <div className={styles.stack}>
                    <strong>{new Date(log.timestamp).toLocaleString()}</strong>
                    <span className={styles.subtext}>{log.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.panelCard}>
            <h3>Controls</h3>
            <ul className={styles.muted}>
              <li>Reserved email enforced: {RESERVED_MAIN_ADMIN_EMAIL}</li>
              <li>Main admin controls approvals, deletions, and financial summaries.</li>
              <li>Database/export controls reserved for main admin only.</li>
            </ul>
            <Link to={'/login'} className={styles.buttonGhost}>
              Switch account
            </Link>
          </div>
        </div>
      </div>

      <Modal
        visible={approvalModal.visible}
        close={() => setApprovalModal({ visible: false, request: null })}
      >
        <div className={styles.modalContainer}>
          <h3>Approval code sent</h3>
          <p>
            A one-time approval code was emailed to the user's registered address. The user can sign in as a minor admin
            after entering that code.
          </p>

          <div className={styles.codeBox}>
            <span className={styles.subtext}>Current approval code</span>
            <div className={styles.codeBadge}>{approvalModal.request?.code || 'Pending code'}</div>
            {approvalModal.request?.expiresAt && (
              <span className={styles.smallNote}>
                Expires {formatDate(approvalModal.request?.expiresAt)}. Ensure the admin email credentials are configured to
                deliver production emails.
              </span>
            )}
          </div>

          <div className={styles.inlineActions}>
            <Button
              level={'primary'}
              onClick={() => setApprovalModal({ visible: false, request: null })}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </AdminLayout>
  );
};

export default AdminPage;
