import {
  scholarGetAllMasail,
  scholarAddMasalah,
  scholarUpdateMasalah,
  scholarDeleteMasalah,
  scholarVerifyMasalah,
} from '../api.js';

const MADHABS = ['Hanafi', 'Maliki', "Shafi'i", 'Hanbali'];
const CATEGORIES = [
  'Taharah', 'Salah', 'Zakat', 'Sawm', 'Hajj',
  'Nikah', "Buyoo'", 'Food and Drink', 'Dress and Appearance',
];

export async function renderScholar(container, user) {
  if (!user || user.role !== 'scholar') {
    container.innerHTML = `<div class="error-page"><h2>Page not found</h2><a href="#/library">Go to Library</a></div>`;
    return;
  }

  container.innerHTML = `
    <div class="admin-panel">
      <div class="panel-hero">
        <div class="panel-hero-inner">
          <div class="eyebrow-label">◆ Scholar Panel</div>
          <h1 class="panel-hero-title">Fiqh Content <span style="color:var(--green-light)">Management</span></h1>
          <p class="panel-hero-sub">Add, edit, verify, and manage masail and madhab opinions.</p>
        </div>
      </div>
      <div id="scholar-content"></div>
    </div>
  `;

  await renderMasailSection(container.querySelector('#scholar-content'));
}

// ── Masail Section ────────────────────────────────────────────────────────────

async function renderMasailSection(container) {
  let masail;
  try {
    masail = await scholarGetAllMasail();
  } catch {
    container.innerHTML = '<p class="admin-error">Failed to load masail.</p>';
    return;
  }

  const opinionFormHtml = (prefix, data = {}) => MADHABS.map(m => `
    <fieldset class="admin-opinion-fieldset">
      <legend>${escHtml(m)}</legend>
      <input type="hidden" name="${prefix}-${m}-madhab" value="${escHtml(m)}">
      <label>Opinion *<textarea name="${prefix}-${m}-opinion" rows="2" required>${escHtml((data[m] || {}).opinion || '')}</textarea></label>
      <label>Evidence *<textarea name="${prefix}-${m}-evidence" rows="2" required>${escHtml((data[m] || {}).evidence || '')}</textarea></label>
      <div class="admin-form-row">
        <label>Source Book<input name="${prefix}-${m}-sourceBook" value="${escHtml((data[m] || {}).sourceBook || '')}"></label>
        <label>Source Page<input name="${prefix}-${m}-sourcePage" value="${escHtml((data[m] || {}).sourcePage || '')}"></label>
      </div>
    </fieldset>
  `).join('');

  const categoryOptions = CATEGORIES.map(c => `<option value="${escHtml(c)}">${escHtml(c)}</option>`).join('');

  container.innerHTML = `
    <div class="admin-section">
      <div id="add-masalah-intro">
        <h2>Masail</h2>
        <p class="admin-section-desc">Manage all fiqh masail. Add new masail with all four madhab opinions, edit existing ones, verify them to make them visible to paid users, or delete them. A masalah can only be verified once all four madhab opinions are present.</p>
        <button class="admin-btn admin-btn-primary" id="show-add-masalah-btn">+ Add Masalah</button>
      </div>
      <div id="add-masalah-form-wrap" style="display:none">
        <h2>Add Masalah</h2>
        <form id="add-masalah-form" class="admin-form">
          <div class="admin-form-row">
            <label>Title *<input name="title" required></label>
            <label>Arabic Term<input name="arabicTerm"></label>
          </div>
          <label>Category *
            <select name="category" required>${categoryOptions}</select>
          </label>
          <label>Description<textarea name="description" rows="3"></textarea></label>
          <h3>Madhab Opinions</h3>
          ${opinionFormHtml('add')}
          <div id="add-masalah-msg" class="admin-msg"></div>
          <div style="display:flex;gap:0.5rem">
            <button type="submit" class="admin-btn admin-btn-primary">Add Masalah</button>
            <button type="button" class="admin-btn" id="cancel-add-masalah-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <div class="admin-section">
      <h2>All Masail (${masail.length})</h2>
      <div class="admin-filters">
        <select id="masail-sort" class="admin-filter-select">
          <option value="id-asc">Sort: ID</option>
          <option value="title-asc">Title A → Z</option>
          <option value="title-desc">Title Z → A</option>
        </select>
        <select id="masail-filter-category" class="admin-filter-select">
          <option value="">All Categories</option>
          ${CATEGORIES.map(c => `<option value="${escHtml(c)}">${escHtml(c)}</option>`).join('')}
        </select>
        <select id="masail-filter-verified" class="admin-filter-select">
          <option value="">Verified &amp; Unverified</option>
          <option value="true">Verified only</option>
          <option value="false">Unverified only</option>
        </select>
      </div>
      <div id="masail-table-wrap"></div>
    </div>
  `;

  // ── Filter / sort helpers ─────────────────────────────────────────────────

  function getFilteredMasail() {
    const sort = container.querySelector('#masail-sort').value;
    const category = container.querySelector('#masail-filter-category').value;
    const verified = container.querySelector('#masail-filter-verified').value;

    let filtered = masail.slice();
    if (category) filtered = filtered.filter(m => m.category === category);
    if (verified === 'true') filtered = filtered.filter(m => m.verified);
    else if (verified === 'false') filtered = filtered.filter(m => !m.verified);

    if (sort === 'title-asc') filtered.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'title-desc') filtered.sort((a, b) => b.title.localeCompare(a.title));
    else filtered.sort((a, b) => a.id - b.id);

    return filtered;
  }

  function renderMasailTable() {
    const filtered = getFilteredMasail();
    const wrap = container.querySelector('#masail-table-wrap');
    wrap.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr><th>ID</th><th>Title</th><th>Category</th><th>Verified</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${filtered.map(m => {
            const opinionsByMadhab = {};
            (m.opinions || []).forEach(o => { opinionsByMadhab[o.madhab] = o; });
            return `
              <tr class="${m.verified ? '' : 'admin-row-unverified'}">
                <td>${m.id}</td>
                <td>${escHtml(m.title)}</td>
                <td>${escHtml(m.category)}</td>
                <td><span class="admin-badge ${m.verified ? 'sub-paid' : 'sub-free'}">${m.verified ? 'Verified' : 'Unverified'}</span></td>
                <td>
                  <button class="admin-btn admin-btn-sm" data-action="edit-masalah" data-id="${m.id}">Edit</button>
                  ${!m.verified
                    ? `<button class="admin-btn admin-btn-sm admin-btn-primary" data-action="verify-masalah" data-id="${m.id}" data-title="${escHtml(m.title)}">Verify</button>`
                    : ''
                  }
                  <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="delete-masalah" data-id="${m.id}" data-title="${escHtml(m.title)}">Delete</button>
                </td>
              </tr>
              <tr class="admin-edit-row" id="edit-masalah-row-${m.id}" style="display:none">
                <td colspan="5">
                  <form class="admin-form admin-inline-form" data-edit-masalah-form="${m.id}">
                    <div class="admin-form-row">
                      <label>Title *<input name="title" value="${escHtml(m.title)}" required></label>
                      <label>Arabic Term<input name="arabicTerm" value="${escHtml(m.arabicTerm || '')}"></label>
                    </div>
                    <label>Category *
                      <select name="category" required>
                        ${CATEGORIES.map(c => `<option value="${escHtml(c)}" ${m.category === c ? 'selected' : ''}>${escHtml(c)}</option>`).join('')}
                      </select>
                    </label>
                    <label>Description<textarea name="description" rows="3">${escHtml(m.description || '')}</textarea></label>
                    <h3>Madhab Opinions</h3>
                    ${opinionFormHtml(`edit-${m.id}`, opinionsByMadhab)}
                    <div id="edit-masalah-msg-${m.id}" class="admin-msg"></div>
                    <button type="submit" class="admin-btn admin-btn-primary">Save</button>
                    <button type="button" class="admin-btn" data-cancel-masalah="${m.id}">Cancel</button>
                  </form>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
    wireMasailTableEvents();
  }

  ['#masail-sort', '#masail-filter-category', '#masail-filter-verified'].forEach(sel => {
    container.querySelector(sel).addEventListener('change', renderMasailTable);
  });

  renderMasailTable();

  // ── Add masalah form ──────────────────────────────────────────────────────

  container.querySelector('#show-add-masalah-btn').addEventListener('click', () => {
    container.querySelector('#add-masalah-intro').style.display = 'none';
    container.querySelector('#add-masalah-form-wrap').style.display = 'block';
  });

  container.querySelector('#cancel-add-masalah-btn').addEventListener('click', () => {
    container.querySelector('#add-masalah-form').reset();
    container.querySelector('#add-masalah-msg').textContent = '';
    container.querySelector('#add-masalah-form-wrap').style.display = 'none';
    container.querySelector('#add-masalah-intro').style.display = 'block';
  });

  container.querySelector('#add-masalah-form').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const msg = form.querySelector('#add-masalah-msg');
    const data = buildMasalahPayload(form, 'add');
    msg.textContent = 'Adding...';
    msg.className = 'admin-msg';
    try {
      await scholarAddMasalah(data);
      form.reset();
      await renderMasailSection(container);
    } catch {
      msg.textContent = 'Failed to add masalah.';
      msg.className = 'admin-msg admin-msg-error';
    }
  });

  // ── Table event wiring ────────────────────────────────────────────────────

  function wireMasailTableEvents() {
    container.querySelectorAll('[data-action="edit-masalah"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = container.querySelector(`#edit-masalah-row-${btn.dataset.id}`);
        row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
      });
    });

    container.querySelectorAll('[data-cancel-masalah]').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelector(`#edit-masalah-row-${btn.dataset.cancelMasalah}`).style.display = 'none';
      });
    });

    container.querySelectorAll('[data-edit-masalah-form]').forEach(form => {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const masalahId = form.dataset.editMasalahForm;
        const msg = form.querySelector(`#edit-masalah-msg-${masalahId}`);
        const data = buildMasalahPayload(form, `edit-${masalahId}`);
        msg.textContent = 'Saving...';
        msg.className = 'admin-msg';
        try {
          await scholarUpdateMasalah(masalahId, data);
          msg.textContent = 'Masalah updated.';
          msg.className = 'admin-msg admin-msg-success';
          await renderMasailSection(container);
        } catch {
          msg.textContent = 'Failed to update masalah.';
          msg.className = 'admin-msg admin-msg-error';
        }
      });
    });

    container.querySelectorAll('[data-action="verify-masalah"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Verify "${btn.dataset.title}"? This will make it visible to paid users.`)) return;
        try {
          await scholarVerifyMasalah(btn.dataset.id);
          await renderMasailSection(container);
        } catch (err) {
          alert(err.message || 'Failed to verify masalah. Ensure all four madhab opinions are present.');
        }
      });
    });

    container.querySelectorAll('[data-action="delete-masalah"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Delete "${btn.dataset.title}"? This cannot be undone.`)) return;
        try {
          await scholarDeleteMasalah(btn.dataset.id);
          await renderMasailSection(container);
        } catch {
          alert('Failed to delete masalah.');
        }
      });
    });
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildMasalahPayload(form, prefix) {
  const opinions = MADHABS.map(m => ({
    madhab: m,
    opinion: form.querySelector(`[name="${prefix}-${m}-opinion"]`).value,
    evidence: form.querySelector(`[name="${prefix}-${m}-evidence"]`).value,
    sourceBook: form.querySelector(`[name="${prefix}-${m}-sourceBook"]`).value,
    sourcePage: form.querySelector(`[name="${prefix}-${m}-sourcePage"]`).value,
  }));
  return {
    title: form.querySelector('[name=title]').value,
    arabicTerm: form.querySelector('[name=arabicTerm]').value || null,
    category: form.querySelector('[name=category]').value,
    description: form.querySelector('[name=description]').value,
    opinions,
  };
}

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
