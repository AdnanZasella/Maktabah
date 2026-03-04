import { register } from '../api.js';
import { clearUserCache } from '../auth.js';

export async function renderRegister(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <h1 class="auth-heading">Create your account</h1>
        <p class="auth-subheading">Join Maktabah and start your journey</p>

        <form class="auth-form" id="register-form" novalidate>
          <div class="auth-error" id="register-error"></div>

          <div class="form-field">
            <label class="form-label" for="reg-email">Email</label>
            <input
              class="form-input"
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="form-field">
            <label class="form-label" for="reg-password">Password</label>
            <input
              class="form-input"
              id="reg-password"
              type="password"
              placeholder="At least 8 characters"
              autocomplete="new-password"
              required
            />
          </div>

          <div class="form-field">
            <label class="form-label" for="reg-confirm">Confirm password</label>
            <input
              class="form-input"
              id="reg-confirm"
              type="password"
              placeholder="••••••••"
              autocomplete="new-password"
              required
            />
          </div>

          <button class="auth-submit-btn" id="register-btn" type="submit">
            Create account
          </button>
        </form>

        <div class="auth-footer">
          Already have an account? <a href="#/login">Log in</a>
        </div>
      </div>
    </div>
  `;

  const form      = document.getElementById('register-form');
  const emailEl   = document.getElementById('reg-email');
  const passEl    = document.getElementById('reg-password');
  const confirmEl = document.getElementById('reg-confirm');
  const errorEl   = document.getElementById('register-error');
  const btn       = document.getElementById('register-btn');

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.add('visible');
  }

  function clearError() {
    errorEl.classList.remove('visible');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();

    const email    = emailEl.value.trim();
    const password = passEl.value;
    const confirm  = confirmEl.value;

    // Frontend validation — check before sending anything to the server
    if (!email || !password || !confirm) {
      showError('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      showError('Password must be at least 8 characters.');
      return;
    }

    if (password.length > 100) {
      showError('Password must be 100 characters or fewer.');
      return;
    }

    if (password !== confirm) {
      showError('Passwords do not match.');
      confirmEl.value = '';
      confirmEl.focus();
      return;
    }

    btn.disabled    = true;
    btn.textContent = 'Creating account…';

    try {
      await register(email, password);
      clearUserCache();
      window.location.hash = '#/library';
    } catch (err) {
      showError(err.message || 'Registration failed. Please try again.');
      btn.disabled    = false;
      btn.textContent = 'Create account';
    }
  });
}
