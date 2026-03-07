/**
 * Book card component.
 * Handles download button behaviour based on auth state:
 *   - not logged in  → redirect to #/login
 *   - logged in free → show inline upgrade prompt
 *   - logged in paid → trigger PDF download
 *
 * "Read more →" button opens a modal with full description and author bio.
 */
import { downloadBook } from '../api.js';

/**
 * @param {{ id, title, author, level, description, authorBio }} book
 * @param {{ accent: string }|null} fieldColors
 * @param {object|null} user
 * @returns {HTMLElement}
 */
export function createBookCard(book, fieldColors, user) {
  const accentColor = fieldColors?.accent || '#6B7280';

  const card = document.createElement('div');
  card.className = 'book-card';

  const hasMore = book.description || book.authorBio;

  card.innerHTML = `
    <div class="book-card-cover" style="background: ${accentColor}"></div>
    <div class="book-card-body">
      <span class="book-card-level ${esc(book.level)}">${esc(book.level)}</span>
      <h3 class="book-card-title">${esc(book.title)}</h3>
      <p class="book-card-author">by ${esc(book.author)}</p>
      ${book.description
        ? `<p class="book-card-description">${esc(book.description)}</p>`
        : ''}
      ${hasMore ? `<button class="read-more-btn">Read more →</button>` : ''}
    </div>
    <div class="book-card-footer"></div>
  `;

  if (hasMore) {
    card.querySelector('.read-more-btn').addEventListener('click', () => {
      openModal(book, accentColor, user);
    });
  }

  buildDownloadArea(card.querySelector('.book-card-footer'), book, user);

  return card;
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function openModal(book, accentColor, user) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${esc(book.title)}">
      <button class="modal-close" aria-label="Close">×</button>
      <div class="modal-accent" style="background: ${accentColor}"></div>
      <div class="modal-body">
        <span class="book-card-level ${esc(book.level)}">${esc(book.level)}</span>
        <h2 class="modal-title">${esc(book.title)}</h2>
        <p class="modal-author">by ${esc(book.author)}</p>

        ${book.authorBio ? `
          <div class="modal-section">
            <h3 class="modal-section-heading">About the Author</h3>
            <p class="modal-section-text">${esc(book.authorBio)}</p>
          </div>
        ` : ''}

        ${book.description ? `
          <div class="modal-section">
            <h3 class="modal-section-heading">About the Book</h3>
            <p class="modal-section-text">${esc(book.description)}</p>
          </div>
        ` : ''}

        <div class="modal-footer"></div>
      </div>
    </div>
  `;

  const close = () => closeModal(overlay, onKeyDown, onHashChange);
  overlay.querySelector('.modal-close').addEventListener('click', close);
  overlay.addEventListener('click', e => { if (e.target === overlay) close(); });

  const onKeyDown = e => { if (e.key === 'Escape') close(); };
  const onHashChange = () => close();
  document.addEventListener('keydown', onKeyDown);
  window.addEventListener('hashchange', onHashChange);

  buildDownloadArea(overlay.querySelector('.modal-footer'), book, user);

  document.body.appendChild(overlay);
  // Prevent background scroll
  document.body.style.overflow = 'hidden';
}

function closeModal(overlay, onKeyDown, onHashChange) {
  document.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('hashchange', onHashChange);
  document.body.style.overflow = '';
  overlay.remove();
}

// ── Download area ─────────────────────────────────────────────────────────────

function buildDownloadArea(container, book, user) {
  if (!user) {
    const btn = makeBtn('Download Book');
    btn.addEventListener('click', () => { window.location.hash = '#/login'; });
    container.appendChild(btn);

  } else {
    const btn = makeBtn('Download Book');
    btn.addEventListener('click', async () => {
      btn.textContent = 'Downloading…';
      btn.disabled = true;
      try {
        await downloadBook(book.id);
      } catch {
        btn.textContent = 'Download failed';
        setTimeout(() => {
          btn.textContent = 'Download Book';
          btn.disabled = false;
        }, 2000);
        return;
      }
      btn.textContent = 'Download Book';
      btn.disabled = false;
    });
    container.appendChild(btn);
  }
}

function makeBtn(label) {
  const btn = document.createElement('button');
  btn.className = 'download-btn';
  btn.textContent = label;
  return btn;
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
