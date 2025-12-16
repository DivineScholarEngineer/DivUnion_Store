import { ADMIN_EMAIL_CONFIG } from '../config/email';

const REQUESTS_KEY = 'du_minor_requests';
const NOTIFICATIONS_KEY = 'du_minor_notifications';
const APPROVAL_CODE_TTL_MS = 1000 * 60 * 30; // 30 minutes

const loadFromStorage = (key, fallback) => {
  if (typeof window === 'undefined') return fallback;
  const stored = window.localStorage.getItem(key);
  if (!stored) return fallback;

  try {
    return JSON.parse(stored);
  } catch (error) {
    return fallback;
  }
};

const saveToStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
};

const normalizeRequest = (request) => ({
  username: request.username,
  email: request.email,
  status: request.status || 'PENDING',
  requestedAt: request.requestedAt || request.timestamp || new Date().toISOString(),
  approvedAt: request.approvedAt || null,
  rejectedAt: request.rejectedAt || null,
  code: request.code || null,
  expiresAt: request.expiresAt || null,
  delivered: request.delivered ?? false,
  deliveryError: request.deliveryError || null,
  redeemedAt: request.redeemedAt || null,
});

const loadMinorRequests = () => {
  const requests = loadFromStorage(REQUESTS_KEY, []);
  return requests.map(normalizeRequest);
};

const saveMinorRequests = (requests) => saveToStorage(REQUESTS_KEY, requests);

const loadRegisteredUsers = () => {
  if (typeof window === 'undefined') return [];
  const stored = window.localStorage.getItem('du_users');
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch (error) {
    return [];
  }
};

const resolveRegisteredEmail = (username) => {
  const users = loadRegisteredUsers();
  const matched = users.find((user) => user.username === username);
  return matched?.email || null;
};

const isEmailConfigValid = () =>
  Boolean(
    ADMIN_EMAIL_CONFIG.address &&
      ADMIN_EMAIL_CONFIG.appPassword &&
      !ADMIN_EMAIL_CONFIG.appPassword.includes('YOUR_APP_PASSWORD')
  );

const sendApprovalEmail = ({ username, email, code, expiresAt }) => {
  if (!email) {
    return { sent: false, reason: 'missing-recipient' };
  }

  if (!isEmailConfigValid()) {
    recordNotification({
      username,
      email,
      code,
      expiresAt,
      status: 'failed',
      reason: 'missing-credentials',
    });
    return { sent: false, reason: 'missing-credentials' };
  }

  recordNotification({ username, email, code, expiresAt, status: 'queued' });

  return { sent: true };
};

const generateCode = () => {
  const randomSegment = () => Math.random().toString(36).slice(2, 6).toUpperCase();
  return `DU-${randomSegment()}-${randomSegment()}`;
};

const recordNotification = (payload) => {
  const queued = loadFromStorage(NOTIFICATIONS_KEY, []);
  const entry = {
    ...payload,
    sentFrom: ADMIN_EMAIL_CONFIG.address,
    dispatchedAt: new Date().toISOString(),
  };
  saveToStorage(NOTIFICATIONS_KEY, [entry, ...queued].slice(0, 50));
};

const addPendingRequest = ({ username, email }) => {
  const current = loadMinorRequests();
  const existing = current.find((req) => req.username === username);

  if (existing) {
    const updated = current.map((req) =>
      req.username === username
        ? {
            ...req,
            email,
            requestedAt: req.requestedAt || new Date().toISOString(),
          }
        : req
    );
    saveMinorRequests(updated);
    return updated;
  }

  const newRequest = {
    username,
    email,
    status: 'PENDING',
    requestedAt: new Date().toISOString(),
    approvedAt: null,
    rejectedAt: null,
    code: null,
    expiresAt: null,
    delivered: false,
    redeemedAt: null,
  };

  const updated = [newRequest, ...current];
  saveMinorRequests(updated);
  return updated;
};

const approveMinorRequest = (request) => {
  if (!request?.username) return null;
  const registeredEmail = resolveRegisteredEmail(request.username) || request.email;
  if (!registeredEmail) return null;

  const code = generateCode();
  const approvedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + APPROVAL_CODE_TTL_MS).toISOString();

  const sendResult = sendApprovalEmail({
    username: request.username,
    email: registeredEmail,
    code,
    expiresAt,
  });

  const updated = loadMinorRequests().map((req) =>
    req.username === request.username
      ? {
          ...req,
          email: registeredEmail,
          status: sendResult.sent ? 'APPROVED' : 'PENDING',
          approvedAt: sendResult.sent ? approvedAt : null,
          rejectedAt: null,
          code: sendResult.sent ? code : null,
          expiresAt: sendResult.sent ? expiresAt : null,
          delivered: sendResult.sent,
          deliveryError: sendResult.sent ? null : sendResult.reason,
          redeemedAt: sendResult.sent ? null : req.redeemedAt,
        }
      : req
  );

  saveMinorRequests(updated);

  return sendResult.sent
    ? { requests: updated, code, approvedAt, expiresAt }
    : { requests: updated, error: sendResult.reason };
};

const rejectMinorRequest = (request) => {
  if (!request?.username) return null;
  const rejectedAt = new Date().toISOString();

  const updated = loadMinorRequests().map((req) =>
    req.username === request.username
      ? {
          ...req,
          status: 'REJECTED',
          rejectedAt,
          approvedAt: null,
          code: null,
          expiresAt: null,
          delivered: false,
          redeemedAt: null,
        }
      : req
  );

  saveMinorRequests(updated);
  return { requests: updated, rejectedAt };
};

const findMinorRequest = (username) => loadMinorRequests().find((req) => req.username === username);

const isCodeValidForRequest = (request, code) => {
  if (!request || !code) return { valid: false, reason: 'missing' };
  if (request.status !== 'APPROVED' || !request.code) return { valid: false, reason: 'pending' };
  if (request.redeemedAt) return { valid: false, reason: 'used' };

  const trimmedCode = code.trim();
  if (trimmedCode !== request.code) return { valid: false, reason: 'mismatch' };

  if (request.expiresAt && new Date(request.expiresAt).getTime() < Date.now()) {
    return { valid: false, reason: 'expired' };
  }

  return { valid: true };
};

const markCodeAsRedeemed = (username) => {
  const updated = loadMinorRequests().map((req) =>
    req.username === username
      ? {
          ...req,
          code: null,
          redeemedAt: new Date().toISOString(),
        }
      : req
  );

  saveMinorRequests(updated);
  return updated;
};

const hasDeliveredCode = (request) => Boolean(request?.status === 'APPROVED' && request?.code && request?.delivered);

export {
  addPendingRequest,
  approveMinorRequest,
  findMinorRequest,
  hasDeliveredCode,
  isCodeValidForRequest,
  loadMinorRequests,
  markCodeAsRedeemed,
  rejectMinorRequest,
  saveMinorRequests,
};
