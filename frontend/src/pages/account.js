import { getCurrentUser, isPaid, clearUserCache } from '../auth.js';
import { createCheckout, logout } from '../api.js';

/**
 * Account page.
 * Shows email, subscription status, upgrade flow, and logout button.
 */
export async function renderAccount(container, user) {
  const hashParts = window.location.hash.split('?');
  const params = new URLSearchParams(hashParts[1] || '');
  const paymentStatus = params.get('payment');

  if (!user) {
    window.location.hash = '#/login';
    return;
  }

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

      ${paymentStatus === 'success' ? `
        <div class="account-banner account-banner-success">
          ✓ Payment successful! Your account has been upgraded to Premium.
        </div>
      ` : ''}
      ${paymentStatus === 'cancelled' ? `
        <div class="account-banner account-banner-neutral">
          Payment cancelled. You can upgrade any time below.
        </div>
      ` : ''}

      <!-- Account info card -->
      <div class="account-info-card glass-card">
        <h1 class="account-title">My Account</h1>
        <div class="account-fields">
          <div class="account-field">
            <span class="account-field-label">Email</span>
            <span class="account-field-value">${esc(user.email)}</span>
          </div>
          <div class="account-field">
            <span class="account-field-label">Plan</span>
            <span class="account-field-value">
              ${paid
                ? `<span class="acct-badge acct-badge-paid">◆ Premium</span>`
                : `<span class="acct-badge acct-badge-free">Free</span>`
              }
            </span>
          </div>
          ${paid ? `
          <div class="account-field">
            <span class="account-field-label">Access</span>
            <span class="account-field-value acct-access-active">✓ Full access — all features unlocked</span>
          </div>
          ` : ''}
        </div>
        <button class="acct-logout-btn" id="logout-btn">Log out</button>
      </div>

      <!-- Upgrade section (free users only) -->
      ${!paid ? `
        <div class="account-upgrade-section">
          <div class="section-header">
            <span class="eyebrow-label">◆ Unlock Everything</span>
            <h2 class="section-title">Choose Your <span class="accent-gold">Plan</span></h2>
            <p class="section-subtitle">Start free. Upgrade when you're ready.</p>

            <div class="pricing-toggle">
              <button class="toggle-btn active" id="toggle-monthly">Monthly</button>
              <button class="toggle-btn" id="toggle-yearly">
                Yearly
                <span class="toggle-save-badge">Save 25%</span>
              </button>
            </div>
          </div>

          <div class="pricing-grid">
            <!-- Free card -->
            <div class="pricing-card glass-card">
              <div class="pricing-tier">Free</div>
              <div class="pricing-price">
                <span class="price-amount">0</span>
                <span class="price-currency">kr</span>
                <span class="price-period">/ month</span>
              </div>
              <p class="pricing-desc">Everything you need to browse and download from our Islamic library.</p>
              <ul class="pricing-features">
                <li>Full library access</li>
                <li>PDF downloads</li>
                <li>Browse all fields and subfields</li>
              </ul>
              <div class="acct-current-plan-label">Your current plan</div>
            </div>

            <!-- Premium card -->
            <div class="pricing-card glass-card gold-card">
              <div class="pricing-tier-row">
                <span class="pricing-tier gold">Premium</span>
                <span class="yearly-savings-badge" id="yearly-savings" style="display:none;">Best value</span>
              </div>
              <div class="pricing-price">
                <span class="price-amount gold" id="premium-price-amount">129</span>
                <span class="price-currency gold" id="premium-price-currency">kr</span>
                <span class="price-period" id="premium-price-period">/ month</span>
              </div>
              <p class="pricing-desc">Full access to every tool — the roadmap, fiqh comparisons, and everything that follows.</p>
              <ul class="pricing-features gold-checks">
                <li>Everything in Free</li>
                <li>Learning Roadmap access</li>
                <li>Fiqh Comparison Tool</li>
                <li>Progress tracking</li>
                <li>Future features included</li>
              </ul>
              <button class="btn-gold-full" id="upgrade-btn">Begin Your Journey →</button>
            </div>
          </div>

          <p class="pricing-note">Cancel anytime &nbsp;·&nbsp; No commitment &nbsp;·&nbsp; Secure payment via Stripe</p>
        </div>
      ` : ''}

    </div>
  `;

  // ── Logout ──────────────────────────────────────────────────────
  document.getElementById('logout-btn').addEventListener('click', async () => {
    await logout();
    clearUserCache();
    window.location.hash = '#/login';
  });

  if (!paid) {
    // ── Pricing toggle ─────────────────────────────────────────────
    const monthlyBtn = document.getElementById('toggle-monthly');
    const yearlyBtn  = document.getElementById('toggle-yearly');
    const priceAmount   = document.getElementById('premium-price-amount');
    const pricePeriod   = document.getElementById('premium-price-period');
    const savingsBadge  = document.getElementById('yearly-savings');

    monthlyBtn.addEventListener('click', () => {
      monthlyBtn.classList.add('active');
      yearlyBtn.classList.remove('active');
      priceAmount.textContent = '129';
      pricePeriod.textContent = '/ month';
      savingsBadge.style.display = 'none';
    });

    yearlyBtn.addEventListener('click', () => {
      yearlyBtn.classList.add('active');
      monthlyBtn.classList.remove('active');
      priceAmount.textContent = '1 160';
      pricePeriod.textContent = '/ year';
      savingsBadge.style.display = 'inline-flex';
    });

    // ── Upgrade button ─────────────────────────────────────────────
    document.getElementById('upgrade-btn').addEventListener('click', async () => {
      const btn = document.getElementById('upgrade-btn');
      const plan = yearlyBtn.classList.contains('active') ? 'yearly' : 'monthly';
      btn.textContent = 'Loading…';
      btn.disabled = true;
      try {
        const url = await createCheckout(plan);
        if (url) {
          window.location.href = url;
        } else {
          throw new Error('No checkout URL returned');
        }
      } catch (e) {
        console.error('Checkout error:', e);
        btn.textContent = 'Something went wrong. Please try again.';
        btn.disabled = false;
      }
    });
  }
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
