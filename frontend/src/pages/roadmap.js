import { getFields, getRoadmap, getProgress, completeStep } from '../api.js';
import { createStepDetails } from '../components/roadmapstep.js';

/**
 * Learning Roadmap page.
 * Renders a zigzag path of book nodes (TryHackMe-style).
 * Clicking a node reveals the book details panel below the path.
 */
export async function renderRoadmap(container, user) {
  container.innerHTML = `
    <a href="#/" class="back-home-link">← Home</a>
    <div class="library-header">
      <h1 class="library-title">Learning Roadmap</h1>
      <p class="library-subtitle">Your path through Islamic knowledge — one book at a time</p>
    </div>

    <div class="roadmap-selectors">
      <div class="roadmap-selector-group">
        <span class="selector-label">Level</span>
        <div class="level-filter" id="level-btns">
          <button class="filter-btn" data-level="beginner">Beginner</button>
          <button class="filter-btn" data-level="intermediate">Intermediate</button>
          <button class="filter-btn" data-level="advanced">Advanced</button>
        </div>
      </div>
      <div class="roadmap-selector-group">
        <span class="selector-label">Field</span>
        <select class="field-select" id="field-select" disabled>
          <option value="">Select a level first</option>
        </select>
      </div>
    </div>

    <div id="roadmap-content"></div>
  `;

  let selectedLevel   = null;
  let selectedFieldId = null;
  let completedIds    = new Set();
  let fields          = [];

  try { fields = await getFields(); } catch { /* dropdown stays disabled */ }

  const fieldSelect = document.getElementById('field-select');
  const levelBtns   = container.querySelectorAll('#level-btns .filter-btn');

  levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      levelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedLevel = btn.dataset.level;

      fieldSelect.disabled = false;
      fieldSelect.innerHTML = '<option value="">Select a field…</option>';
      fields.forEach(f => {
        const opt = document.createElement('option');
        opt.value   = f.id;
        opt.textContent = f.name;
        fieldSelect.appendChild(opt);
      });

      if (selectedFieldId) { fieldSelect.value = selectedFieldId; loadRoadmap(); }
    });
  });

  fieldSelect.addEventListener('change', () => {
    selectedFieldId = fieldSelect.value ? Number(fieldSelect.value) : null;
    if (selectedLevel && selectedFieldId) loadRoadmap();
  });

  async function loadRoadmap() {
    const content = document.getElementById('roadmap-content');
    if (!content) return;
    content.innerHTML = '<p class="loading">Loading roadmap…</p>';

    if (user) {
      try   { completedIds = new Set(await getProgress()); }
      catch { completedIds = new Set(); }
    }

    try {
      const steps = await getRoadmap(selectedFieldId, selectedLevel);
      const content2 = document.getElementById('roadmap-content');
      if (!content2) return;

      if (steps.length === 0) {
        content2.innerHTML = '<p class="empty-state">No roadmap steps for this field and level yet.</p>';
        return;
      }

      content2.innerHTML = '';
      renderPath(steps, completedIds, user, content2);
    } catch {
      const c = document.getElementById('roadmap-content');
      if (c) c.innerHTML = '<p class="error-message">Failed to load roadmap. Please try again.</p>';
    }
  }
}

// ── Path renderer ───────────────────────────────────────────────────────────

const NODES_PER_ROW = window.innerWidth < 520 ? 2 : 3;

function renderPath(steps, completedIds, user, container) {
  // Slice steps into rows
  const rows = [];
  for (let i = 0; i < steps.length; i += NODES_PER_ROW) {
    rows.push(steps.slice(i, i + NODES_PER_ROW));
  }

  const pathEl   = document.createElement('div');
  pathEl.className = 'path-container';

  const detailsEl = document.createElement('div');
  detailsEl.className = 'path-details';
  detailsEl.innerHTML = '<p class="path-details-hint">Tap a step on the path to see the book details</p>';

  let selectedNodeEl = null;

  function selectStep(step, nodeEl) {
    if (selectedNodeEl) selectedNodeEl.classList.remove('selected');
    selectedNodeEl = nodeEl;
    nodeEl.classList.add('selected');

    detailsEl.innerHTML = '';
    const isCompleted = completedIds.has(step.id);

    const detail = createStepDetails(step, user, isCompleted, async stepId => {
      await completeStep(stepId);
      completedIds.add(stepId);
      // Update the path node to green
      const circle = nodeEl.querySelector('.path-node-circle');
      circle.textContent = '✓';
      circle.classList.add('completed');
      nodeEl.classList.add('completed');
    });

    detailsEl.appendChild(detail);
    detailsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  rows.forEach((row, rowIndex) => {
    const isRTL  = rowIndex % 2 === 1;
    const rowEl  = document.createElement('div');
    rowEl.className = `path-row${isRTL ? ' path-row-rtl' : ''}`;

    row.forEach((step, nodeIndex) => {
      const isCompleted = completedIds.has(step.id);

      const nodeEl = document.createElement('div');
      nodeEl.className  = `path-node${isCompleted ? ' completed' : ''}`;
      nodeEl.setAttribute('role', 'button');
      nodeEl.setAttribute('tabindex', '0');
      nodeEl.setAttribute('aria-label', `Step ${step.stepOrder}: ${step.bookTitle}`);

      nodeEl.innerHTML = `
        <div class="path-node-circle${isCompleted ? ' completed' : ''}">
          ${isCompleted ? '✓' : step.stepOrder}
        </div>
        <div class="path-node-label">
          <span class="path-node-title">${esc(step.bookTitle)}</span>
        </div>
      `;

      nodeEl.addEventListener('click', () => selectStep(step, nodeEl));
      nodeEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectStep(step, nodeEl); }
      });

      rowEl.appendChild(nodeEl);

      // Horizontal connector — not after the last node in the row
      if (nodeIndex < row.length - 1) {
        const conn = document.createElement('div');
        conn.className = 'path-connector';
        rowEl.appendChild(conn);
      }
    });

    pathEl.appendChild(rowEl);

    // Turn connector between rows — not after the last row
    if (rowIndex < rows.length - 1) {
      const turn  = document.createElement('div');
      turn.className = `path-turn path-turn-${isRTL ? 'left' : 'right'}`;
      const inner = document.createElement('div');
      inner.className = 'path-turn-inner';
      turn.appendChild(inner);
      pathEl.appendChild(turn);
    }
  });

  container.appendChild(pathEl);
  container.appendChild(detailsEl);
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
