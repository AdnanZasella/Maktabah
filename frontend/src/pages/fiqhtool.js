import { getCurrentUser, isPaid } from '../auth.js';
import { getMasailCategories } from '../api.js';

/**
 * Fiqh Comparison Tool page.
 * Step 15: Auth gate — redirects to login if unauthenticated,
 *           shows upgrade prompt if not paid.
 * Step 18: Full masail content rendering will be added here.
 */
export async function renderFiqhTool(container) {
  // IMPORTANT: await getCurrentUser() must resolve before calling isPaid()
  const user = await getCurrentUser();
  if (!user) {
    window.location.hash = '#/login';
    return;
  }

  // All logged-in users see the tool shell.
  // Interactions (search, category click) are gated behind isPaid().
  let categories = [];
  try {
    categories = await getMasailCategories();
  } catch {
    // No categories yet — that's fine until Step 17
  }
  renderToolShell(container, categories);
}

function renderToolShell(container, categories) {
  container.innerHTML = `
    <div class="fiqh-tool">
      <div class="fiqh-header">
        <h1 class="fiqh-title">Fiqh Comparison Tool</h1>
        <p class="fiqh-subtitle">Compare madhab positions side by side</p>
      </div>
      <div class="fiqh-search-bar">
        <input
          type="text"
          class="fiqh-search-input"
          placeholder="Search a fiqh topic…"
          id="fiqh-search"
        />
      </div>
      <div class="fiqh-categories" id="fiqh-categories">
        ${categories.map(cat => `
          <button class="category-btn" data-category="${esc(cat)}">${esc(cat)}</button>
        `).join('')}
      </div>
      <div class="fiqh-results" id="fiqh-results">
        <p class="fiqh-prompt">Select a category or search for a topic above.</p>
      </div>
    </div>
  `;

  // Gate all interactions behind paid subscription
  document.getElementById('fiqh-search').addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      if (!isPaid()) { showUpgradeModal(); return; }
      // Full search logic added in Step 18
    }
  });

  document.getElementById('fiqh-categories').addEventListener('click', e => {
    const btn = e.target.closest('.category-btn');
    if (!btn) return;
    if (!isPaid()) { showUpgradeModal(); return; }
    // Full category logic added in Step 18
  });
}

function showUpgradeModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal" style="max-width: 420px;">
      <button class="modal-close" aria-label="Close">×</button>
      <div class="modal-accent" style="background: #1B4332;"></div>
      <div class="modal-body">
        <h2 class="modal-title">Paid Feature</h2>
        <p class="modal-section-text" style="margin-top: 0.75rem; color: #6B7280;">
          The Fiqh Comparison Tool is available to paid subscribers. Upgrade to compare all four madhab positions with evidence and sources.
        </p>
        <div style="margin-top: 1.5rem;">
          <a href="#/account" class="upgrade-link-btn">Upgrade Now</a>
        </div>
      </div>
    </div>
  `;
  const close = () => {
    document.removeEventListener('keydown', onKeyDown);
    document.body.style.overflow = '';
    overlay.remove();
  };
  overlay.querySelector('.modal-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
  const onKeyDown = e => { if (e.key === 'Escape') close(); };
  document.addEventListener('keydown', onKeyDown);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
