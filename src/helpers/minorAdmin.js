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
});

const loadMinorRequests = () => {
  const requests = loadFromStorage(REQUESTS_KEY, []);
  return requests.map(normalizeRequest);
};

const saveMinorRequests = (requests) => saveToStorage(REQUESTS_KEY, requests);

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
  };

  const updated = [newRequest, ...current];
  saveMinorRequests(updated);
  return updated;
};

const approveMinorRequest = (request) => {
  if (!request?.username) return null;
  const code = generateCode();
  const approvedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + APPROVAL_CODE_TTL_MS).toISOString();

  const updated = loadMinorRequests().map((req) =>
    req.username === request.username
      ? {
          ...req,
          status: 'APPROVED',
          approvedAt,
          rejectedAt: null,
          code,
          expiresAt,
          delivered: true,
        }
      : req
  );

  saveMinorRequests(updated);
  recordNotification({ ...request, code, expiresAt, approvedAt });

  return { requests: updated, code, approvedAt, expiresAt };
};

const rejectMinorRequest = (request) => {
  if (!request?.username) return null;
  const rejectedAt = new Date().toISOString();

  const updated = loadMinorRequests().map((req) =>
    req.username === request.username
      ? { ...req, status: 'REJECTED', rejectedAt, approvedAt: null, code: null, expiresAt: null, delivered: false }
      : req
  );

  saveMinorRequests(updated);
  return { requests: updated, rejectedAt };
};

const findMinorRequest = (username) => loadMinorRequests().find((req) => req.username === username);

const isCodeValidForRequest = (request, code) => {
  if (!request || !code) return { valid: false, reason: 'missing' };
  if (request.status !== 'APPROVED' || !request.code) return { valid: false, reason: 'pending' };

  const trimmedCode = code.trim();
  if (trimmedCode !== request.code) return { valid: false, reason: 'mismatch' };

  if (request.expiresAt && new Date(request.expiresAt).getTime() < Date.now()) {
    return { valid: false, reason: 'expired' };
  }

  return { valid: true };
};

const hasDeliveredCode = (request) => Boolean(request?.status === 'APPROVED' && request?.code && request?.delivered);

export {
  addPendingRequest,
  approveMinorRequest,
  findMinorRequest,
  hasDeliveredCode,
  isCodeValidForRequest,
  loadMinorRequests,
  rejectMinorRequest,
  saveMinorRequests,
};
