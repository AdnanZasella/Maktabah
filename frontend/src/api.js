/**
 * All fetch() calls live here and only here.
 * Every function uses credentials: 'include' so the JWT cookie is sent automatically.
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const JSON_HEADERS = { 'Content-Type': 'application/json' };
const OPTS = { credentials: 'include' };

// ── Fields ────────────────────────────────────────────────────────────

export async function getFields() {
  const res = await fetch(`${API_BASE}/api/fields`, OPTS);
  if (!res.ok) throw new Error('Failed to fetch fields');
  return res.json();
}

export async function getSubfields(fieldId) {
  const res = await fetch(`${API_BASE}/api/fields/${fieldId}/subfields`, OPTS);
  if (!res.ok) throw new Error('Failed to fetch subfields');
  return res.json();
}

// ── Books ─────────────────────────────────────────────────────────────

export async function getBooks(fieldId, level = null) {
  let url = `${API_BASE}/api/books?fieldId=${fieldId}`;
  if (level && level !== 'all') url += `&level=${encodeURIComponent(level)}`;
  const res = await fetch(url, OPTS);
  if (!res.ok) throw new Error('Failed to fetch books');
  return res.json();
}

export async function downloadBook(bookId) {
  const res = await fetch(`${API_BASE}/api/books/${bookId}/download`, OPTS);
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const contentDisposition = res.headers.get('Content-Disposition');
  let filename = 'book.pdf';
  if (contentDisposition) {
    const match = contentDisposition.match(/filename="([^"]+)"/);
    if (match) filename = match[1];
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ── Roadmap ───────────────────────────────────────────────────────────

export async function getRoadmap(fieldId, level) {
  const res = await fetch(`${API_BASE}/api/roadmap?fieldId=${fieldId}&level=${encodeURIComponent(level)}`, OPTS);
  if (!res.ok) throw new Error('Failed to fetch roadmap');
  return res.json();
}

export async function getProgress() {
  const res = await fetch(`${API_BASE}/api/progress`, OPTS);
  if (!res.ok) throw new Error('Failed to fetch progress');
  return res.json();
}

export async function completeStep(stepId) {
  const res = await fetch(`${API_BASE}/api/progress/${stepId}/complete`, { ...OPTS, method: 'POST' });
  if (!res.ok) throw new Error('Failed to complete step');
  return res.json();
}

// ── Auth ──────────────────────────────────────────────────────────────

export async function fetchCurrentUser() {
  const res = await fetch(`${API_BASE}/api/auth/me`, OPTS);
  if (!res.ok) return null;
  return res.json();
}

export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    ...OPTS,
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Invalid email or password');
  }
  return res.json();
}

export async function register(email, password) {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    ...OPTS,
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Registration failed');
  }
  return res.json();
}

export async function logout() {
  const res = await fetch(`${API_BASE}/api/auth/logout`, { ...OPTS, method: 'POST' });
  return res.ok;
}

export async function forgotPassword(email) {
  await fetch(`${API_BASE}/api/auth/forgot-password`, {
    ...OPTS,
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ email }),
  });
  // Always returns 200 per spec — no error handling needed
}

export async function resetPassword(token, newPassword) {
  const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
    ...OPTS,
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || 'Password reset failed');
  }
}

// ── Payments ──────────────────────────────────────────────────────────

export async function createCheckout() {
  const res = await fetch(`${API_BASE}/api/payment/create-checkout`, { ...OPTS, method: 'POST' });
  if (!res.ok) throw new Error('Failed to create checkout session');
  const data = await res.json();
  return data.url;
}

// ── Masail ────────────────────────────────────────────────────────────

export async function getMasailCategories() {
  const res = await fetch(`${API_BASE}/api/masail/categories`, OPTS);
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function getMasailByCategory(category) {
  const res = await fetch(`${API_BASE}/api/masail?category=${encodeURIComponent(category)}`, OPTS);
  if (!res.ok) throw new Error('Failed to fetch masail');
  return res.json();
}

export async function searchMasail(query) {
  const res = await fetch(`${API_BASE}/api/masail/search?query=${encodeURIComponent(query)}`, OPTS);
  if (!res.ok) throw new Error('Failed to search masail');
  return res.json();
}

export async function getMasalah(id) {
  const res = await fetch(`${API_BASE}/api/masail/${id}`, OPTS);
  if (!res.ok) throw new Error('Failed to fetch masalah');
  return res.json();
}

// ── Admin ─────────────────────────────────────────────────────────────

export async function adminGetUsers() {
  const res = await fetch(`${API_BASE}/api/admin/users`, OPTS);
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function adminUpdateSubscription(userId, status) {
  const res = await fetch(`${API_BASE}/api/admin/users/${userId}/subscription`, {
    ...OPTS,
    method: 'PUT',
    headers: JSON_HEADERS,
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update subscription');
  return res.json();
}

export async function adminAddBook(formData) {
  // FormData — browser sets Content-Type with boundary automatically
  const res = await fetch(`${API_BASE}/api/admin/books`, {
    ...OPTS,
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to add book');
  return res.json();
}

export async function adminAddMasalah(masalahData) {
  const res = await fetch(`${API_BASE}/api/admin/masail`, {
    ...OPTS,
    method: 'POST',
    headers: JSON_HEADERS,
    body: JSON.stringify(masalahData),
  });
  if (!res.ok) throw new Error('Failed to add masalah');
  return res.json();
}

export async function adminVerifyMasalah(masalahId) {
  const res = await fetch(`${API_BASE}/api/admin/masail/${masalahId}/verify`, {
    ...OPTS,
    method: 'PUT',
  });
  if (!res.ok) throw new Error('Failed to verify masalah');
  return res.json();
}
