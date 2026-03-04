import { getFields, getRoadmap, getProgress, completeStep } from '../api.js';
import { createStepDetails } from '../components/roadmapstep.js';
import { getFieldColors } from '../components/fieldcard.js';

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
            <div class="field-btns" id="field-btns"></div>
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

  try { fields = await getFields(); } catch { /* field buttons stay empty */ }

  const fieldBtnsEl = document.getElementById('field-btns');
  const levelBtns   = container.querySelectorAll('#level-btns .filter-btn');

  // Build one colored button per field
  fields.forEach(f => {
    const colors     = getFieldColors(f.name);
    const inactiveBg = colors.inactiveBg || colors.bg;
    const activeBg   = colors.activeBtn  || colors.accent;
    const activeText = colors.activeText || '#111827';

    const btn = document.createElement('button');
    btn.className = 'field-btn';
    btn.textContent = f.name;
    // Store per-field colours for restore on deactivation
    btn.dataset.inactiveBg = inactiveBg;
    btn.dataset.activeBg   = activeBg;
    btn.dataset.activeText = activeText;

    // Inactive: medium-bright tint, dark text
    btn.style.background = inactiveBg;
    btn.style.color      = '#1F2937';

    btn.addEventListener('click', () => {
      // Restore all buttons to their own inactive state
      fieldBtnsEl.querySelectorAll('.field-btn').forEach(b => {
        b.classList.remove('active');
        b.style.background  = b.dataset.inactiveBg;
        b.style.color       = '#1F2937';
        b.style.borderColor = 'transparent';
        b.style.boxShadow   = '';
      });
      // Active: vivid bright colour, high-contrast dark text
      btn.classList.add('active');
      btn.style.background  = activeBg;
      btn.style.color       = activeText;
      btn.style.borderColor = activeBg;
      btn.style.boxShadow   = `0 0 0 2px ${activeBg}`;

      selectedFieldId = f.id;
      if (selectedLevel) loadRoadmap();
    });

    fieldBtnsEl.appendChild(btn);
  });

  // Level buttons — just set level and load if a field is already selected
  levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      levelBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedLevel = btn.dataset.level;
      if (selectedFieldId) loadRoadmap();
    });
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

    const isLastStep = idx === steps.length - 1;
    const detail = createStepDetails(step, user, isCompleted, async stepId => {
      if (user) await completeStep(stepId);
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
        const nextStep   = steps[idx + 1];
        const nextEl     = nodeEls[idx + 1];
        const nextCircle = nextEl.querySelector('.path-node-circle');
        const lockHint   = nextEl.querySelector('.path-node-lock-hint');

        nextEl.classList.replace('locked', 'available');
        nextCircle.classList.replace('locked', 'available');
        nextCircle.textContent = nextStep.stepOrder;

        // Pop + glow animation on the newly unlocked circle
        nextCircle.classList.add('just-unlocked');
        nextCircle.addEventListener('animationend', () => nextCircle.classList.remove('just-unlocked'), { once: true });

        // Remove the "Finish Step X first" hint
        if (lockHint) lockHint.remove();

        nextEl.setAttribute('tabindex', '0');
        nextEl.setAttribute('role', 'button');
        nextEl.removeAttribute('aria-disabled');
        nextEl.style.cursor = '';

        nextEl.addEventListener('click', () => selectStep(nextStep, nextEl));
        nextEl.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectStep(nextStep, nextEl); }
        });
      }
    }, isLastStep);

    detailContainer.appendChild(detail);
    detailContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  steps.forEach((step, index) => {
    const isRight     = index % 2 === 0;
    const isCompleted = completedIds.has(step.id);
    // Step 1 (index 0) is always unlocked. Steps 2+ lock until the previous step is completed.
    const isLocked    = index > 0 && !completedIds.has(steps[index - 1].id);

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
        ${isLocked ? `<span class="path-node-lock-hint">Finish Step ${step.stepOrder - 1} first</span>` : ''}
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
