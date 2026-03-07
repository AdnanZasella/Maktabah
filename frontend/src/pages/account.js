import { getCurrentUser, isPaid, clearUserCache } from '../auth.js';
import { createCheckout, logout } from '../api.js';

/**
 * Account page.
 * Shows email, subscription status, upgrade flow, and logout button.
 * Parses payment status from window.location.hash — NOT window.location.search
 * because the app uses hash-based routing (#/account?payment=success).
 */
export async function renderAccount(container, user) {
  // Parse payment query param from inside the hash
  const hashParts = window.location.hash.split('?');
  const params = new URLSearchParams(hashParts[1] || '');
  const paymentStatus = params.get('payment');

  // If user wasn't passed (defense in depth — main.js guard should catch this first)
  if (!user) {
    window.location.hash = '#/login';
    return;
  }

  // On payment success, re-fetch to pick up webhook-updated subscription status.
  // The first getCurrentUser() call in main.js may have run before the webhook fired.
  if (paymentStatus === 'success') {
    clearUserCache();
    user = await getCurrentUser();
    if (!user) {
      window.location.hash = '#/login';
      return;
    }
  }

  const paid = isPaid();

  container.innerHTML = `
    <div class="account-page">
      <div class="account-card">
        <h1 class="account-title">My Account</h1>

        ${paymentStatus === 'success' ? `
          <div class="banner banner-success">
            Payment successful! Your account has been upgraded to paid.
          </div>
        ` : ''}
        ${paymentStatus === 'cancelled' ? `
          <div class="banner banner-neutral">
            Payment cancelled. You can upgrade any time from this page.
          </div>
        ` : ''}

        <div class="account-section">
          <p class="account-label">Email</p>
          <p class="account-value">${esc(user.email)}</p>
        </div>

        <div class="account-section">
          <p class="account-label">Plan</p>
          <p class="account-value">
            ${paid
              ? `<span class="badge badge-paid">Paid</span>`
              : `<span class="badge badge-free">Free</span>`
            }
          </p>
        </div>

        ${paid ? `
          <div class="subscription-active">
            <span class="check-icon">&#10003;</span>
            Active subscription — full access to all features
          </div>
        ` : `
          <div class="upgrade-card">
            <h2 class="upgrade-title">Upgrade to unlock everything</h2>
            <ul class="upgrade-features">
              <li>Download any book from the Islamic Library as PDF</li>
              <li>Access the Fiqh Comparison Tool</li>
              <li>Compare all four madhab opinions side by side</li>
            </ul>
            <button class="upgrade-now-btn" id="upgrade-btn">Upgrade Now</button>
          </div>
        `}

        <button class="logout-btn" id="logout-btn">Log out</button>
      </div>
    </div>
  `;

  if (!paid) {
    document.getElementById('upgrade-btn').addEventListener('click', async () => {
      const btn = document.getElementById('upgrade-btn');
      btn.textContent = 'Loading…';
      btn.disabled = true;
      try {
        const url = await createCheckout();
        window.location.href = url;
      } catch {
        btn.textContent = 'Something went wrong. Please try again.';
        btn.disabled = false;
      }
    });
  }

  document.getElementById('logout-btn').addEventListener('click', async () => {
    await logout();
    clearUserCache();
    window.location.hash = '#/login';
  });
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
