import { getFields, getSubfields, getRoadmap, getProgress, completeStep } from '../api.js';
import { createStepDetails } from '../components/roadmapstep.js';
import { getFieldColors } from '../components/fieldcard.js';
import { isPaid } from '../auth.js';

// Per-madhab accent colors (matches fiqhtool madhab cards)
const MADHAB_ACCENTS = {
  'Hanafi':  '#6495ed',
  'Maliki':  '#4a7c59',
  'Shafii':  '#c9933a',
  'Hanbali': '#b47878',
};

function getMadhabAccent(name) {
  return MADHAB_ACCENTS[name] || '#e0b060';
}

export async function renderRoadmap(container, user) {
  container.innerHTML = `
    <div class="library-hero">
      <div class="library-hero-inner">
        <span class="eyebrow-label">◆ Learning Roadmap</span>
        <h1 class="library-title">Your Path Through<br><span class="accent-green">Islamic Knowledge</span></h1>
        <p class="library-subtitle">A structured progression — one book at a time, step by step.</p>
      </div>
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
          <div class="roadmap-selector-group" id="madhab-group" style="display:none">
            <span class="selector-label">Madhab</span>
            <div class="field-btns" id="madhab-btns"></div>
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

  const fieldBtnsEl  = document.getElementById('field-btns');
  const madhabGroup  = document.getElementById('madhab-group');
  const madhabBtnsEl = document.getElementById('madhab-btns');
  const levelBtns    = container.querySelectorAll('#level-btns .filter-btn');

  function clearMadhabRow() {
    madhabGroup.style.display = 'none';
    madhabBtnsEl.innerHTML = '';
    // Only clear selectedFieldId if a madhab was the active selection
    // (field buttons without subfields set it directly — don't clear those)
  }

  function setFieldBtnActive(btn, accent) {
    fieldBtnsEl.querySelectorAll('.field-btn').forEach(b => {
      b.classList.remove('active');
      b.style.borderColor = '';
      b.style.boxShadow   = '';
      b.style.color       = '';
    });
    btn.classList.add('active');
    btn.style.borderColor = accent;
    btn.style.boxShadow   = `0 0 0 2px ${accent}33`;
    btn.style.color       = accent;
  }

  function setMadhabBtnActive(btn, accent) {
    madhabBtnsEl.querySelectorAll('.field-btn').forEach(b => {
      b.classList.remove('active');
      b.style.borderColor = '';
      b.style.boxShadow   = '';
      b.style.color       = '';
    });
    btn.classList.add('active');
    btn.style.borderColor = accent;
    btn.style.boxShadow   = `0 0 0 2px ${accent}33`;
    btn.style.color       = accent;
  }

  // Build one colored button per top-level field
  fields.forEach(f => {
    const colors = getFieldColors(f.name);
    const accent = colors.accent;

    const btn = document.createElement('button');
    btn.className = 'field-btn';
    btn.textContent = f.name;
    btn.dataset.accent = accent;

    btn.addEventListener('click', async () => {
      setFieldBtnActive(btn, accent);

      // Always clear the madhab row first
      clearMadhabRow();
      selectedFieldId = null;

      // Check if this field has subfields
      let subs = [];
      try { subs = await getSubfields(f.id); } catch { subs = []; }

      if (subs.length > 0) {
        // Show madhab selector — don't load roadmap yet
        madhabBtnsEl.innerHTML = '';
        subs.forEach(sub => {
          const subAccent = getMadhabAccent(sub.name);
          const subBtn = document.createElement('button');
          subBtn.className = 'field-btn';
          subBtn.textContent = sub.name;
          subBtn.dataset.accent = subAccent;

          subBtn.addEventListener('click', () => {
            setMadhabBtnActive(subBtn, subAccent);
            selectedFieldId = sub.id;
            if (selectedLevel) loadRoadmap();
          });

          subBtn.addEventListener('mouseenter', () => {
            if (subBtn.classList.contains('active')) return;
            subBtn.style.borderColor = subAccent;
            subBtn.style.color       = subAccent;
            subBtn.style.background  = `${subAccent}1a`;
          });
          subBtn.addEventListener('mouseleave', () => {
            if (subBtn.classList.contains('active')) return;
            subBtn.style.borderColor = '';
            subBtn.style.color       = '';
            subBtn.style.background  = '';
          });

          madhabBtnsEl.appendChild(subBtn);
        });
        madhabGroup.style.display = '';
      } else {
        // No subfields — use this field directly
        selectedFieldId = f.id;
        if (selectedLevel) loadRoadmap();
      }
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
    detailEl.innerHTML = '';

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
    if (!user) { window.location.hash = '#/login'; return; }
    if (!isPaid()) { showUpgradeModal(); return; }

    if (selectedNodeEl) selectedNodeEl.classList.remove('selected');
    selectedNodeEl = nodeEl;
    nodeEl.classList.add('selected');

    detailContainer.innerHTML = '';
    const isCompleted = completedIds.has(step.id);
    const idx = steps.indexOf(step);

    const isLastStep = idx === steps.length - 1;
    const detail = createStepDetails(step, user, isCompleted, async stepId => {
      if (!user) { window.location.hash = '/login'; return; }
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

function showUpgradeModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal upgrade-modal">
      <button class="modal-close" aria-label="Close">×</button>
      <div class="modal-accent upgrade-modal-accent"></div>
      <div class="modal-body">
        <span class="eyebrow-label">◆ Premium Feature</span>
        <h2 class="modal-title" style="margin-top: 0.75rem;">Unlock the Roadmap</h2>
        <p class="modal-section-text" style="margin-top: 0.625rem;">
          The Learning Roadmap is available to paid subscribers. Upgrade to track your progress through Islamic knowledge.
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

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
