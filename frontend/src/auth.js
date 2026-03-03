/**
 * Auth state module.
 * Calls /api/auth/me once per session and caches the result.
 * Call clearUserCache() after login or logout so the next navigation re-fetches.
 */

let currentUser = null;
let fetched = false;

export async function getCurrentUser() {
  if (fetched) return currentUser;
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/auth/me`, { credentials: 'include' });
    currentUser = res.ok ? await res.json() : null;
  } catch {
    currentUser = null;
  }
  fetched = true;
  return currentUser;
}

export function clearUserCache() {
  currentUser = null;
  fetched = false;
}

export function isLoggedIn() {
  return currentUser !== null;
}

export function isPaid() {
  return currentUser?.subscriptionStatus === 'paid';
}

export function isAdmin() {
  return currentUser?.role === 'admin';
}
