import { getFields, getSubfields, getBooks } from '../api.js';
import { createFieldCard, getFieldColors } from '../components/fieldcard.js';
import { createBookCard } from '../components/bookcard.js';

/**
 * Library page.
 * Flow: All Fields → (optional subfields) → Books
 * Level filter bar filters already-loaded books in memory — no new API call.
 *
 * @param {HTMLElement} container
 * @param {object|null} user - current user
 */
export async function renderLibrary(container, user) {
  container.innerHTML = `
    <a href="#/" class="back-home-link">← Home</a>
    <div class="library-header">
      <h1 class="library-title">Islamic Library</h1>
      <p class="library-subtitle">Browse our collection of verified Islamic books</p>
    </div>
    <div class="level-filter" id="level-filter">
      <button class="filter-btn active" data-level="all">All Levels</button>
      <button class="filter-btn" data-level="beginner">Beginner</button>
      <button class="filter-btn" data-level="intermediate">Intermediate</button>
      <button class="filter-btn" data-level="advanced">Advanced</button>
    </div>
    <nav class="breadcrumb" id="breadcrumb" aria-label="breadcrumb"></nav>
    <div class="content-grid" id="content-grid">
      <p class="loading">Loading fields…</p>
    </div>
  `;

  // State
  let currentFilter = 'all';
  let allBooks = [];           // all books loaded for the current field/subfield
  let currentColors = null;   // accent colors of the current field

  // ── Level filter ────────────────────────────────────────────────────
  const filterBtns = container.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.level;
      if (allBooks.length > 0) {
        renderBooks();
      }
    });
  });

  // ── Helpers ──────────────────────────────────────────────────────────

  function grid() { return document.getElementById('content-grid'); }
  function breadcrumb() { return document.getElementById('breadcrumb'); }

  function setLoading(msg = 'Loading…') {
    grid().innerHTML = `<p class="loading">${msg}</p>`;
  }

  function setError(msg) {
    grid().innerHTML = `<p class="error-message">${msg}</p>`;
  }

  // ── Render layers ─────────────────────────────────────────────────────

  async function loadFields() {
    breadcrumb().innerHTML = '';
    allBooks = [];
    currentColors = null;
    setLoading('Loading fields…');

    try {
      const fields = await getFields();
      grid().innerHTML = '';

      if (fields.length === 0) {
        grid().innerHTML = '<p class="empty-state">No fields available yet.</p>';
        return;
      }

      fields.forEach(field => {
        const colors = getFieldColors(field.name);
        const card = createFieldCard(field, colors, () => onFieldClick(field, colors));
        grid().appendChild(card);
      });
    } catch {
      setError('Failed to load fields. Please refresh the page.');
    }
  }

  async function onFieldClick(field, colors) {
    setLoading();
    try {
      const subfields = await getSubfields(field.id);
      if (subfields.length > 0) {
        renderSubfields(field, subfields, colors);
      } else {
        await loadBooks(field, null, colors);
      }
    } catch {
      setError('Failed to load content. Please try again.');
    }
  }

  function renderSubfields(parentField, subfields, parentColors) {
    allBooks = [];
    currentColors = null;

    breadcrumb().innerHTML = `
      <button class="breadcrumb-link" id="bc-fields">All Fields</button>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">${esc(parentField.name)}</span>
    `;
    document.getElementById('bc-fields').addEventListener('click', loadFields);

    grid().innerHTML = '';
    subfields.forEach(subfield => {
      const card = createFieldCard(
        subfield,
        parentColors,
        () => loadBooks(subfield, parentField, parentColors)
      );
      grid().appendChild(card);
    });
  }

  async function loadBooks(field, parentField, colors) {
    currentColors = colors;
    setLoading('Loading books…');

    try {
      allBooks = await getBooks(field.id);

      // Build breadcrumb
      const bc = breadcrumb();
      if (parentField) {
        bc.innerHTML = `
          <button class="breadcrumb-link" id="bc-fields">All Fields</button>
          <span class="breadcrumb-sep">›</span>
          <button class="breadcrumb-link" id="bc-parent">${esc(parentField.name)}</button>
          <span class="breadcrumb-sep">›</span>
          <span class="breadcrumb-current">${esc(field.name)}</span>
        `;
        document.getElementById('bc-fields').addEventListener('click', loadFields);
        document.getElementById('bc-parent').addEventListener('click', async () => {
          setLoading();
          try {
            const subfields = await getSubfields(parentField.id);
            renderSubfields(parentField, subfields, colors);
          } catch {
            setError('Failed to load subfields.');
          }
        });
      } else {
        bc.innerHTML = `
          <button class="breadcrumb-link" id="bc-fields">All Fields</button>
          <span class="breadcrumb-sep">›</span>
          <span class="breadcrumb-current">${esc(field.name)}</span>
        `;
        document.getElementById('bc-fields').addEventListener('click', loadFields);
      }

      renderBooks();
    } catch {
      setError('Failed to load books. Please try again.');
    }
  }

  function renderBooks() {
    const filtered = currentFilter === 'all'
      ? allBooks
      : allBooks.filter(b => b.level === currentFilter);

    grid().innerHTML = '';

    if (filtered.length === 0) {
      grid().innerHTML = '<p class="empty-state">No books found for this filter.</p>';
      return;
    }

    filtered.forEach(book => {
      const card = createBookCard(book, currentColors, user);
      grid().appendChild(card);
    });
  }

  // ── Initial load ──────────────────────────────────────────────────────
  await loadFields();
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
