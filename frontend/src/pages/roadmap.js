import { getFields, getRoadmap, getProgress, completeStep } from '../api.js';
import { createStepDetails } from '../components/roadmapstep.js';

export async function renderRoadmap(container, user) {
  container.innerHTML = `
    <a href="#/" class="back-home-link">← Home</a>
    <div class="library-header">
      <h1 class="library-title">Learning Roadmap</h1>
      <p class="library-subtitle">Your path through Islamic knowledge — one book at a time</p>
    </div>

    <div class="roadmap-layout">

      <div class="roadmap-col-left">
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

        <div id="roadmap-detail" class="roadmap-detail-panel">
          <p class="path-details-hint">Select a level and field, then tap a step to see the book details.</p>
        </div>
      </div>

      <div class="roadmap-col-right">
        <div id="roadmap-path"></div>
      </div>

    </div>
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
        opt.value       = f.id;
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
    const pathEl   = document.getElementById('roadmap-path');
    const detailEl = document.getElementById('roadmap-detail');
    if (!pathEl || !detailEl) return;

    pathEl.innerHTML   = '<p class="loading">Loading roadmap…</p>';
    detailEl.innerHTML = '<p class="path-details-hint">Select a level and field, then tap a step to see the book details.</p>';

    if (user) {
      try   { completedIds = new Set(await getProgress()); }
      catch { completedIds = new Set(); }
    }

    try {
      const steps   = await getRoadmap(selectedFieldId, selectedLevel);
      const pathEl2 = document.getElementById('roadmap-path');
      if (!pathEl2) return;

      if (steps.length === 0) {
        pathEl2.innerHTML = '<p class="empty-state">No roadmap steps for this field and level yet.</p>';
        return;
      }

      pathEl2.innerHTML = '';
      renderPath(steps, completedIds, user, pathEl2, document.getElementById('roadmap-detail'));
    } catch {
      const p = document.getElementById('roadmap-path');
      if (p) p.innerHTML = '<p class="error-message">Failed to load roadmap. Please try again.</p>';
    }
  }
}

// ── Path renderer ────────────────────────────────────────────────────────────

const LOCK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="1.25em" height="1.25em">
  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
</svg>`;

function renderPath(steps, completedIds, user, pathContainer, detailContainer) {
  const pathEl  = document.createElement('div');
  pathEl.className = 'path-container';

  // Keep references so we can unlock nodes in place when a step is completed
  const nodeEls = [];
  const connEls = []; // connEls[i] is the connector between nodeEls[i] and nodeEls[i+1]

  let selectedNodeEl = null;

  function selectStep(step, nodeEl) {
    if (selectedNodeEl) selectedNodeEl.classList.remove('selected');
    selectedNodeEl = nodeEl;
    nodeEl.classList.add('selected');

    detailContainer.innerHTML = '';
    const isCompleted = completedIds.has(step.id);
    const idx = steps.indexOf(step);

    const detail = createStepDetails(step, user, isCompleted, async stepId => {
      await completeStep(stepId);
      completedIds.add(stepId);

      // Mark current node as completed
      const circle = nodeEls[idx].querySelector('.path-node-circle');
      circle.innerHTML = '✓';
      circle.classList.replace('available', 'completed');
      nodeEls[idx].classList.replace('available', 'completed');

      // Turn the connector green
      if (connEls[idx]) connEls[idx].classList.add('conn-completed');

      // Unlock the next node
      if (idx + 1 < steps.length) {
        const nextStep = steps[idx + 1];
        const nextEl   = nodeEls[idx + 1];
        const nextCircle = nextEl.querySelector('.path-node-circle');

        nextEl.classList.replace('locked', 'available');
        nextCircle.classList.replace('locked', 'available');
        nextCircle.textContent = nextStep.stepOrder;

        nextEl.setAttribute('tabindex', '0');
        nextEl.setAttribute('role', 'button');
        nextEl.removeAttribute('aria-disabled');
        nextEl.style.cursor = '';

        nextEl.addEventListener('click', () => selectStep(nextStep, nextEl));
        nextEl.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectStep(nextStep, nextEl); }
        });
      }
    });

    detailContainer.appendChild(detail);
    detailContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  steps.forEach((step, index) => {
    const isRight     = index % 2 === 0;
    const isCompleted = completedIds.has(step.id);
    // Locked: only when user is logged in AND the previous step has not been completed yet
    const isLocked    = user !== null && index > 0 && !completedIds.has(steps[index - 1].id);

    const state = isCompleted ? 'completed' : (isLocked ? 'locked' : 'available');

    const nodeEl = document.createElement('div');
    nodeEl.className = `path-node ${state} ${isRight ? 'node-right' : 'node-left'}`;
    nodeEl.setAttribute('role', isLocked ? 'presentation' : 'button');
    nodeEl.setAttribute('tabindex', isLocked ? '-1' : '0');
    nodeEl.setAttribute('aria-label',
      `Step ${step.stepOrder}: ${step.bookTitle}${isLocked ? ' — complete the previous step to unlock' : ''}`);
    if (isLocked) nodeEl.setAttribute('aria-disabled', 'true');

    nodeEl.innerHTML = `
      <div class="path-node-circle ${state}">
        ${isCompleted ? '✓' : (isLocked ? LOCK_SVG : step.stepOrder)}
      </div>
      <div class="path-node-label">
        <span class="path-node-title">${esc(step.bookTitle)}</span>
      </div>
    `;

    if (!isLocked) {
      nodeEl.addEventListener('click', () => selectStep(step, nodeEl));
      nodeEl.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectStep(step, nodeEl); }
      });
    }

    nodeEls.push(nodeEl);
    pathEl.appendChild(nodeEl);

    // Connector to next node (not after the last)
    if (index < steps.length - 1) {
      const turn = document.createElement('div');
      turn.className = `path-v-turn ${isRight ? 'v-turn-right-to-left' : 'v-turn-left-to-right'}${isCompleted ? ' conn-completed' : ''}`;
      const inner = document.createElement('div');
      inner.className = 'path-v-turn-inner';
      turn.appendChild(inner);
      connEls.push(turn);
      pathEl.appendChild(turn);
    }
  });

  pathContainer.appendChild(pathEl);
}

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
