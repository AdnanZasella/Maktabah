/**
 * Book card component.
 * Handles download button behaviour based on auth state:
 *   - not logged in  → redirect to #/login
 *   - logged in free → show inline upgrade prompt
 *   - logged in paid → trigger PDF download
 */
import { downloadBook } from '../api.js';

/**
 * @param {{ id: number, title: string, author: string, level: string, description: string }} book
 * @param {{ accent: string }|null} fieldColors
 * @param {object|null} user - current user or null
 * @returns {HTMLElement}
 */
export function createBookCard(book, fieldColors, user) {
  const accentColor = fieldColors?.accent || '#6B7280';

  const card = document.createElement('div');
  card.className = 'book-card';

  card.innerHTML = `
    <div class="book-card-cover" style="background: ${accentColor}"></div>
    <div class="book-card-body">
      <span class="book-card-level ${escapeHtml(book.level)}">${escapeHtml(book.level)}</span>
      <h3 class="book-card-title">${escapeHtml(book.title)}</h3>
      <p class="book-card-author">by ${escapeHtml(book.author)}</p>
      ${book.description
        ? `<p class="book-card-description">${escapeHtml(book.description)}</p>`
        : ''}
    </div>
    <div class="book-card-footer"></div>
  `;

  const footer = card.querySelector('.book-card-footer');
  buildDownloadArea(footer, book, user);

  return card;
}

function buildDownloadArea(footer, book, user) {
  if (!user) {
    // Not logged in — redirect to login on click
    const btn = makeDownloadBtn('Download Book');
    btn.addEventListener('click', () => {
      window.location.hash = '#/login';
    });
    footer.appendChild(btn);

  } else if (user.subscriptionStatus !== 'paid') {
    // Logged in but free — show upgrade prompt inline on first click
    const btn = makeDownloadBtn('Download Book');
    btn.addEventListener('click', () => {
      footer.innerHTML = '';
      const upgradeLink = document.createElement('a');
      upgradeLink.href = '#/account';
      upgradeLink.className = 'upgrade-btn';
      upgradeLink.textContent = 'Upgrade to download this book';
      footer.appendChild(upgradeLink);
    });
    footer.appendChild(btn);

  } else {
    // Logged in and paid — trigger download
    const btn = makeDownloadBtn('Download Book');
    btn.addEventListener('click', async () => {
      btn.textContent = 'Downloading…';
      btn.disabled = true;
      try {
        await downloadBook(book.id);
      } catch (err) {
        console.error('Download error:', err);
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
    footer.appendChild(btn);
  }
}

function makeDownloadBtn(label) {
  const btn = document.createElement('button');
  btn.className = 'download-btn';
  btn.textContent = label;
  return btn;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
