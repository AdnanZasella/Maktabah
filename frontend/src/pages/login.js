import { login } from '../api.js';
import { clearUserCache } from '../auth.js';

export async function renderLogin(container) {
  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-card">
        <h1 class="auth-heading">Welcome back</h1>
        <p class="auth-subheading">Log in to your Maktabah account</p>

        <form class="auth-form" id="login-form" novalidate>
          <div class="auth-error" id="login-error"></div>

          <div class="form-field">
            <label class="form-label" for="login-email">Email</label>
            <input
              class="form-input"
              id="login-email"
              type="email"
              placeholder="you@example.com"
              autocomplete="email"
              required
            />
          </div>

          <div class="form-field">
            <label class="form-label" for="login-password">Password</label>
            <input
              class="form-input"
              id="login-password"
              type="password"
              placeholder="••••••••"
              autocomplete="current-password"
              required
            />
          </div>

          <button class="auth-submit-btn" id="login-btn" type="submit">
            Log in
          </button>
        </form>

        <div class="auth-footer">
          Don't have an account? <a href="#/register">Create one</a>
        </div>
      </div>
    </div>
  `;

  const form    = document.getElementById('login-form');
  const emailEl = document.getElementById('login-email');
  const passEl  = document.getElementById('login-password');
  const errorEl = document.getElementById('login-error');
  const btn     = document.getElementById('login-btn');

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

    if (!email || !password) {
      showError('Please enter your email and password.');
      return;
    }

    btn.disabled    = true;
    btn.textContent = 'Logging in…';

    try {
      await login(email, password);
      clearUserCache();
      window.location.hash = '#/library';
    } catch (err) {
      showError('Invalid email or password.');
      btn.disabled    = false;
      btn.textContent = 'Log in';
      passEl.value    = '';
      passEl.focus();
    }
  });
}
