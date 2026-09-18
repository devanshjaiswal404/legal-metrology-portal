/**
 * Officer Session Abstraction Utility
 * Manages frontend officer authentication state, persistence in localStorage,
 * and session structure ready for future backend authentication API integration.
 */

const SESSION_STORAGE_KEY = 'metrology_officer_session';

export const DEFAULT_DEMO_OFFICER = {
  officerId: 'LMO-2026-01',
  officerName: 'Field Enforcement Officer',
  name: 'Field Enforcement Officer',
  designation: 'Legal Metrology Officer',
  district: 'State Enforcement Zone',
  department: 'Department of Consumer Affairs, Legal Metrology Division',
  badgeNumber: 'GOI-LMO-2026',
  isDemo: true,
  loginTime: new Date().toISOString()
};

/**
 * Retrieves the currently logged-in officer from persistent storage
 */
export function getStoredOfficerSession() {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.officerId) return parsed;
    return null;
  } catch (err) {
    console.error('Failed to read officer session:', err);
    return null;
  }
}

/**
 * Persists officer session to storage and dispatches update event
 */
export function saveOfficerSession(officerData) {
  try {
    const sessionData = {
      ...officerData,
      loginTime: officerData.loginTime || new Date().toISOString()
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    window.dispatchEvent(new Event('metrology_officer_session_changed'));
    return sessionData;
  } catch (err) {
    console.error('Failed to save officer session:', err);
    return officerData;
  }
}

/**
 * Clears the officer session on logout
 */
export function clearOfficerSession() {
  try {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.dispatchEvent(new Event('metrology_officer_session_changed'));
  } catch (err) {
    console.error('Failed to clear officer session:', err);
  }
}
