/**
 * Roadmap step details panel.
 * Rendered below the path when a node is clicked.
 * Download button behaviour matches bookcard.js exactly.
 */
import { downloadBook } from '../api.js';

/**
 * @param {object}   step        - RoadmapStepDTO
 * @param {object|null} user     - current user or null
 * @param {boolean}  isCompleted
 * @param {(stepId: number) => Promise<void>} onComplete
 * @returns {HTMLElement}
 */
export function createStepDetails(step, user, isCompleted, onComplete) {
  const el = document.createElement('div');
  el.className = `step-detail-card${isCompleted ? ' completed' : ''}`;

  el.innerHTML = `
    <div class="step-detail-meta">
      <span class="book-card-level ${esc(step.level)}">${esc(step.level)}</span>
    </div>
    <h3 class="step-title">${esc(step.bookTitle)}</h3>
    <p class="step-author">by ${esc(step.bookAuthor)}</p>
    <p class="step-description">${esc(step.description)}</p>
    <div class="step-footer">
      <div class="step-download-area"></div>
      ${user ? `
        <button class="step-complete-btn${isCompleted ? ' done' : ''}"
                ${isCompleted ? 'disabled' : ''}>
          ${isCompleted ? '✓ Completed' : 'Mark complete'}
        </button>
      ` : ''}
    </div>
  `;

  buildDownloadArea(el.querySelector('.step-download-area'), step, user);

  if (user && !isCompleted) {
    el.querySelector('.step-complete-btn').addEventListener('click', async e => {
      const btn = e.currentTarget;
      btn.textContent = 'Saving…';
      btn.disabled = true;
      try {
        await onComplete(step.id);
        btn.textContent = '✓ Completed';
        btn.classList.add('done');
        el.classList.add('completed');
      } catch {
        btn.textContent = 'Mark complete';
        btn.disabled = false;
      }
    });
  }

  return el;
}

function buildDownloadArea(container, step, user) {
  if (!user) {
    const btn = makeBtn('Download Book');
    btn.addEventListener('click', () => { window.location.hash = '/login'; });
    container.appendChild(btn);

  } else if (user.subscriptionStatus !== 'paid') {
    const btn = makeBtn('Download Book');
    btn.addEventListener('click', () => {
      container.innerHTML = '';
      const link = document.createElement('a');
      link.href = '#/account';
      link.className = 'upgrade-btn step-upgrade-btn';
      link.textContent = 'Upgrade to download this book';
      container.appendChild(link);
    });
    container.appendChild(btn);

  } else {
    const btn = makeBtn('Download Book');
    btn.addEventListener('click', async () => {
      btn.textContent = 'Downloading…';
      btn.disabled = true;
      try {
        await downloadBook(step.bookId);
      } catch {
        btn.textContent = 'Download failed';
        setTimeout(() => { btn.textContent = 'Download Book'; btn.disabled = false; }, 2000);
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
  btn.className = 'download-btn step-download-btn';
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
