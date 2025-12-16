/**
 * Is value numeric
 * 
 * Determine whether variable is a number
 * 
 * @param {*} str 
 *
  import { isNumeric } from '../helpers/general'

  isNumeric(value)
*/
function isNumeric(str) {
  if (['string', 'number'].indexOf(typeof str) === -1) return false; // we only process strings and numbers!
  return (
    !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
    !isNaN(parseFloat(str))
  ); // ...and ensure strings of whitespace fail
}

/**
 * Validate email format
 * 
 * Checks the provided email address and validates its format
 * 
 * @param   {String} email  The email address
 * 
    import { validateEmail } from '../helpers/general'

    validateEmail(email)
 */
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validate strong password format
 * 
 * 
 * @param   {String} password  The password
 * 
    import { validateStrongPassword } from '../helpers/general'

    validateStrongPassword(email)
 */
function validateStrongPassword(password) {
  return /(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(password);
}

/**
 * Checks for empty string
 * 
 * @param   {String} email  input
 * 
    import { isEmpty } from '../helpers/general'

    isEmpty(email)
 */
function isEmpty(input) {
  if (input === '' || input === null || input === undefined) return true;

  return false;
}

/**
 * Checks if user is authenticated
 * 
 * 
 * 
    import { isAuth } from '../helpers/general'

    isAuth()
 */
const SESSION_COLLECTION_KEY = 'du_sessions';
const ACTIVE_SESSION_KEY = 'du_active_session_id';
const DEFAULT_ROLE_MODE = 'user';

function generateSessionId() {
  return `du_sess_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getStoredSessions() {
  const isBrowser = typeof window !== 'undefined';
  if (!isBrowser) return [];

  const sessions = window.localStorage.getItem(SESSION_COLLECTION_KEY);
  if (!sessions) return [];

  try {
    return JSON.parse(sessions);
  } catch (error) {
    return [];
  }
}

function saveStoredSessions(sessions) {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(SESSION_COLLECTION_KEY, JSON.stringify(sessions));
}

function setActiveSession(sessionId) {
  if (typeof window === 'undefined') return;

  window.sessionStorage.setItem(ACTIVE_SESSION_KEY, sessionId);
}

function getActiveSessionId() {
  const isBrowser = typeof window !== 'undefined';
  if (!isBrowser) return null;

  return window.sessionStorage.getItem(ACTIVE_SESSION_KEY);
}

function persistSession(user) {
  if (typeof window === 'undefined') return null;

  const session = { ...user, mode: user.mode || DEFAULT_ROLE_MODE, id: generateSessionId() };
  const sessions = getStoredSessions();

  saveStoredSessions([...sessions, session]);
  setActiveSession(session.id);

  return session;
}

function clearActiveSession() {
  if (typeof window === 'undefined') return;

  const activeSessionId = getActiveSessionId();
  const sessions = getStoredSessions();

  const filteredSessions = activeSessionId
    ? sessions.filter((session) => session.id !== activeSessionId)
    : sessions;

  saveStoredSessions(filteredSessions);

  if (activeSessionId) {
    window.sessionStorage.removeItem(ACTIVE_SESSION_KEY);
  }
}

function getSession() {
  const isBrowser = typeof window !== 'undefined';
  if (!isBrowser) return null;

  const activeSessionId = getActiveSessionId();
  const storedSessions = getStoredSessions();

  if (!activeSessionId) {
    const legacySession = window.localStorage.getItem('du_session');
    if (legacySession) {
      try {
        const parsedLegacy = JSON.parse(legacySession);
        const migratedSession = persistSession(parsedLegacy);
        window.localStorage.removeItem('du_session');
        return migratedSession;
      } catch (error) {
        return null;
      }
    }

    return null;
  }

  const activeSession = storedSessions.find((session) => session.id === activeSessionId);
  if (activeSession) return { ...activeSession, mode: activeSession.mode || DEFAULT_ROLE_MODE };

  window.sessionStorage.removeItem(ACTIVE_SESSION_KEY);
  return null;
}

function isAuth() {
  const session = getSession();

  if (!session) return false;

  return Boolean(session?.username && session?.role);
}

function updateActiveSession(payload) {
  if (typeof window === 'undefined') return null;

  const activeSessionId = getActiveSessionId();
  if (!activeSessionId) return null;

  const sessions = getStoredSessions();
  const updatedSessions = sessions.map((session) =>
    session.id === activeSessionId ? { ...session, ...payload } : session
  );

  saveStoredSessions(updatedSessions);

  const activeSession = updatedSessions.find((session) => session.id === activeSessionId);
  return activeSession ? { ...activeSession, mode: activeSession.mode || DEFAULT_ROLE_MODE } : null;
}

function getActiveMode() {
  const session = getSession();
  return session?.mode || DEFAULT_ROLE_MODE;
}

function setActiveMode(mode) {
  if (!mode) return getActiveMode();
  return updateActiveSession({ mode });
}

/**
 * Adds a query param to URLs which is captures by redirect rules
 * (when running in Netlify - otherwise it's harmless)
 * 
    import { toOptimizedImage } from '../helpers/general'

    <img src={toOptimizedImage(image)} .../>
 */
function toOptimizedImage(imageUrl) {
  if (!imageUrl.startsWith('/') || imageUrl.endsWith("imgcdn=true")) return imageUrl;
  return imageUrl +
          (imageUrl.includes("?") ? "&" : "?") +
          "imgcdn=true";
}

export {
  isNumeric,
  validateEmail,
  validateStrongPassword,
  isEmpty,
  isAuth,
  getSession,
  toOptimizedImage,
  persistSession,
  clearActiveSession,
  getActiveMode,
  setActiveMode,
  updateActiveSession,
};
