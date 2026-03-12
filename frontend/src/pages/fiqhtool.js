import { getCurrentUser, isPaid } from '../auth.js';
import { getMasailCategories, getMasailByCategory, searchMasail, getMasalah } from '../api.js';
import { createMadhabCard } from '../components/madhabcard.js';

// Consistent display order for the four madhabs
const MADHAB_ORDER = ['Hanafi', 'Maliki', "Shafi'i", 'Hanbali'];

export async function renderFiqhTool(container) {
  const user = await getCurrentUser();
  if (!user) {
    window.location.hash = '#/login';
    return;
  }

  let categories = [];
  try {
    categories = await getMasailCategories();
  } catch {
    // Proceed with empty categories — not a fatal error
  }

  renderToolShell(container, categories);
}

function renderToolShell(container, categories) {
  container.innerHTML = `
    <div class="library-hero">
      <div class="library-hero-inner">
        <span class="eyebrow-label">◆ Fiqh Comparison</span>
        <h1 class="library-title">All Four <span class="accent-gold">Madhab</span> Positions</h1>
        <p class="library-subtitle">Compare Hanafi, Maliki, Shafi&apos;i, and Hanbali opinions side by side — with evidence and sources.</p>
      </div>
    </div>
    <div class="fiqh-tool">
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

  const searchInput = document.getElementById('fiqh-search');
  const categoriesEl = document.getElementById('fiqh-categories');
  const resultsEl = document.getElementById('fiqh-results');

  // Track active category so the button stays highlighted
  let activeCategory = null;

  // ── Search ────────────────────────────────────────────────────────
  searchInput.addEventListener('keydown', async e => {
    if (e.key !== 'Enter') return;
    if (!isPaid()) { showUpgradeModal(); return; }

    const query = searchInput.value.trim();
    if (!query) return;

    // Clear active category highlight when a search is run
    activeCategory = null;
    categoriesEl.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));

    await loadList(resultsEl, () => searchMasail(query), `Results for "${query}"`);
  });

  // ── Category buttons ──────────────────────────────────────────────
  categoriesEl.addEventListener('click', async e => {
    const btn = e.target.closest('.category-btn');
    if (!btn) return;
    if (!isPaid()) { showUpgradeModal(); return; }

    const category = btn.dataset.category;

    // Highlight selected, clear others
    categoriesEl.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = category;

    // Clear search input when a category is chosen
    searchInput.value = '';

    await loadList(resultsEl, () => getMasailByCategory(category), category);
  });
}

// ── List view ──────────────────────────────────────────────────────

async function loadList(resultsEl, fetcher, title) {
  resultsEl.innerHTML = `<p class="loading">Loading…</p>`;

  let masail;
  try {
    masail = await fetcher();
  } catch {
    resultsEl.innerHTML = `<p class="error-message">Failed to load results. Please try again.</p>`;
    return;
  }

  renderMasalahList(masail, resultsEl, title);
}

function renderMasalahList(masail, resultsEl, title) {
  if (!masail.length) {
    resultsEl.innerHTML = `<p class="empty-state">No results found.</p>`;
    return;
  }

  const count = masail.length;
  resultsEl.innerHTML = `
    <div class="masalah-list-header">
      <span class="masalah-list-title">${esc(title)}</span>
      <span class="masalah-list-count">${count} result${count !== 1 ? 's' : ''}</span>
    </div>
    <div class="masalah-list">
      ${masail.map(m => `
        <button class="masalah-item" data-id="${m.id}">
          <span class="masalah-item-title">${esc(m.title)}</span>
          ${m.arabicTerm ? `<span class="masalah-item-arabic">${esc(m.arabicTerm)}</span>` : ''}
          <span class="masalah-item-chevron">›</span>
        </button>
      `).join('')}
    </div>
  `;

  // Attach click listeners — pass masail + title so back button can restore list without a re-fetch
  resultsEl.querySelectorAll('.masalah-item').forEach(btn => {
    btn.addEventListener('click', async () => {
      await loadDetail(resultsEl, btn.dataset.id, masail, title);
    });
  });
}

// ── Detail view ────────────────────────────────────────────────────

async function loadDetail(resultsEl, id, cachedList, cachedTitle) {
  resultsEl.innerHTML = `<p class="loading">Loading…</p>`;

  let masalah;
  try {
    masalah = await getMasalah(id);
  } catch {
    resultsEl.innerHTML = `<p class="error-message">Failed to load details. Please try again.</p>`;
    return;
  }

  renderMasalahDetail(masalah, resultsEl, cachedList, cachedTitle);
}

function renderMasalahDetail(masalah, resultsEl, cachedList, cachedTitle) {
  resultsEl.innerHTML = '';

  const detail = document.createElement('div');
  detail.className = 'masalah-detail';

  // Back button — restores the list from cache, no API call
  const backBtn = document.createElement('button');
  backBtn.className = 'masalah-back-btn';
  backBtn.textContent = '← Back to results';
  backBtn.addEventListener('click', () => renderMasalahList(cachedList, resultsEl, cachedTitle));
  detail.appendChild(backBtn);

  // Title row: English title + optional Arabic term
  const titleRow = document.createElement('div');
  titleRow.className = 'masalah-detail-title-row';

  const titleEl = document.createElement('h2');
  titleEl.className = 'masalah-detail-title';
  titleEl.textContent = masalah.title;
  titleRow.appendChild(titleEl);

  if (masalah.arabicTerm) {
    const arabicEl = document.createElement('span');
    arabicEl.className = 'masalah-detail-arabic';
    arabicEl.textContent = masalah.arabicTerm;
    titleRow.appendChild(arabicEl);
  }

  detail.appendChild(titleRow);

  // Description
  if (masalah.description) {
    const descEl = document.createElement('p');
    descEl.className = 'masalah-detail-desc';
    descEl.textContent = masalah.description;
    detail.appendChild(descEl);
  }

  // Madhab grid — sort to consistent display order
  const opinions = [...(masalah.opinions || [])].sort(
    (a, b) => MADHAB_ORDER.indexOf(a.madhab) - MADHAB_ORDER.indexOf(b.madhab)
  );

  const grid = document.createElement('div');
  grid.className = 'madhab-grid';

  if (opinions.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty-state';
    empty.textContent = 'No madhab opinions available yet.';
    grid.appendChild(empty);
  } else {
    opinions.forEach(op => grid.appendChild(createMadhabCard(op)));
  }

  detail.appendChild(grid);
  resultsEl.appendChild(detail);
}

// ── Upgrade modal ──────────────────────────────────────────────────

function showUpgradeModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal upgrade-modal">
      <button class="modal-close" aria-label="Close">×</button>
      <div class="modal-accent upgrade-modal-accent"></div>
      <div class="modal-body">
        <span class="eyebrow-label">◆ Premium Feature</span>
        <h2 class="modal-title" style="margin-top: 0.75rem;">Unlock Fiqh Comparison</h2>
        <p class="modal-section-text" style="margin-top: 0.625rem;">
          The Fiqh Comparison Tool is available to paid subscribers. Upgrade to compare all four madhab positions with evidence and sources.
        </p>
        <div style="margin-top: 1.5rem;">
          <a href="#/account" class="btn-gold-full">Upgrade Now →</a>
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

// ── XSS protection ─────────────────────────────────────────────────

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
