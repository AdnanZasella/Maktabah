import {
  adminGetUsers,
  adminDeleteUser,
  adminUpdateSubscription,
  adminGetBooks,
  adminAddBook,
  adminUpdateBook,
  adminDeleteBook,
  adminGetAllMasail,
  adminAddMasalah,
  adminUpdateMasalah,
  adminDeleteMasalah,
  adminVerifyMasalah,
  adminGetRoadmapSteps,
  adminAddRoadmapStep,
  adminUpdateRoadmapStep,
  adminDeleteRoadmapStep,
  getFields,
  getSubfields,
} from '../api.js';

const MADHABS = ['Hanafi', "Maliki", "Shafi'i", 'Hanbali'];
const CATEGORIES = [
  'Taharah', 'Salah', 'Zakat', 'Sawm', 'Hajj',
  "Nikah", "Buyoo'", 'Food and Drink', 'Dress and Appearance',
];

export async function renderAdmin(container, user) {
  if (!user || user.role !== 'admin') {
    container.innerHTML = `<div class="error-page"><h2>Page not found</h2><a href="#/library">Go to Library</a></div>`;
    return;
  }

  container.innerHTML = `
    <div class="admin-panel">
      <div class="panel-hero">
        <div class="panel-hero-inner">
          <div class="eyebrow-label">◆ Admin Panel</div>
          <h1 class="panel-hero-title">Platform <span style="color:var(--gold-light)">Management</span></h1>
          <p class="panel-hero-sub">Manage users, books, and fiqh content across the platform.</p>
        </div>
      </div>
      <div class="admin-tabs">
        <button class="admin-tab active" data-tab="users">Users</button>
        <button class="admin-tab" data-tab="books">Books</button>
        <button class="admin-tab" data-tab="masail">Masail</button>
        <button class="admin-tab" data-tab="roadmap">Roadmap</button>
      </div>
      <div id="admin-tab-content"></div>
    </div>
  `;

  const tabContent = container.querySelector('#admin-tab-content');

  async function showTab(tab) {
    container.querySelectorAll('.admin-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tab);
    });
    tabContent.innerHTML = '<p class="admin-loading">Loading...</p>';
    if (tab === 'users') await renderUsersTab(tabContent);
    if (tab === 'books') await renderBooksTab(tabContent);
    if (tab === 'masail') await renderMasailTab(tabContent);
    if (tab === 'roadmap') await renderRoadmapTab(tabContent);
  }

  container.querySelectorAll('.admin-tab').forEach(btn => {
    btn.addEventListener('click', () => showTab(btn.dataset.tab));
  });

  await showTab('users');
}

// ── Users Tab ─────────────────────────────────────────────────────────────────

async function renderUsersTab(container) {
  let users;
  try {
    users = await adminGetUsers();
  } catch {
    container.innerHTML = '<p class="admin-error">Failed to load users.</p>';
    return;
  }

  container.innerHTML = `
    <div class="admin-section">
      <h2>Users (${users.length})</h2>
      <table class="admin-table">
        <thead>
          <tr>
            <th>ID</th><th>Email</th><th>Role</th><th>Subscription</th><th>Joined</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(u => `
            <tr data-user-id="${u.id}">
              <td>${u.id}</td>
              <td>${escHtml(u.email)}</td>
              <td><span class="admin-badge role-${u.role}">${u.role}</span></td>
              <td><span class="admin-badge sub-${u.subscriptionStatus}">${u.subscriptionStatus}</span></td>
              <td>${u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
              <td>
                ${u.subscriptionStatus === 'paid'
                  ? `<button class="admin-btn admin-btn-sm" data-action="set-free" data-uid="${u.id}">Set Free</button>`
                  : `<button class="admin-btn admin-btn-sm admin-btn-primary" data-action="set-paid" data-uid="${u.id}">Set Paid</button>`
                }
                <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="delete-user" data-uid="${u.id}" data-email="${escHtml(u.email)}">Delete</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  container.querySelectorAll('[data-action="set-paid"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await updateSub(btn.dataset.uid, 'paid', container);
    });
  });
  container.querySelectorAll('[data-action="set-free"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      await updateSub(btn.dataset.uid, 'free', container);
    });
  });

  container.querySelectorAll('[data-action="delete-user"]').forEach(btn => {
    btn.addEventListener('click', async () => {
      if (!confirm(`Delete user "${btn.dataset.email}"? This cannot be undone.`)) return;
      try {
        await adminDeleteUser(btn.dataset.uid);
        await renderUsersTab(container);
      } catch {
        alert('Failed to delete user.');
      }
    });
  });
}

async function updateSub(userId, status, container) {
  try {
    await adminUpdateSubscription(userId, status);
    await renderUsersTab(container);
  } catch {
    alert('Failed to update subscription.');
  }
}

// ── Books Tab ─────────────────────────────────────────────────────────────────

async function renderBooksTab(container) {
  let books, fields;
  try {
    [books, fields] = await Promise.all([adminGetBooks(), getFields()]);
  } catch {
    container.innerHTML = '<p class="admin-error">Failed to load books.</p>';
    return;
  }

  // Load subfields for each top-level field
  const allSubfields = [];
  await Promise.all(fields.map(async f => {
    try {
      const subs = await getSubfields(f.id);
      subs.forEach(s => allSubfields.push({ ...s, parentName: f.name }));
    } catch { /* ignore */ }
  }));

  // Build a fieldId → display name map for use in the table
  const fieldNameMap = {};
  fields.forEach(f => { fieldNameMap[f.id] = f.name; });
  allSubfields.forEach(s => { fieldNameMap[s.id] = `${s.parentName} → ${s.name}`; });

  const fieldOptions = [
    ...fields.map(f => `<option value="${f.id}">[${escHtml(f.name)}] (top-level)</option>`),
    ...allSubfields.map(s => `<option value="${s.id}">${escHtml(s.parentName)} → ${escHtml(s.name)}</option>`),
  ].join('');

  container.innerHTML = `
    <div class="admin-section">
      <div id="add-book-intro">
        <h2>Books</h2>
        <p class="admin-section-desc">Manage all books in the library. You can add new books with a PDF file, edit existing book metadata, or delete books entirely. PDF files are validated and stored automatically under the correct field subfolder.</p>
        <button class="admin-btn admin-btn-primary" id="show-add-book-btn">+ Add Book</button>
      </div>
      <div id="add-book-form-wrap" style="display:none">
        <h2>Add Book</h2>
        <form id="add-book-form" class="admin-form">
          <div class="admin-form-row">
            <label>Title *<input name="title" required></label>
            <label>Author *<input name="author" required></label>
          </div>
          <div class="admin-form-row">
            <label>Field *
              <select name="fieldId" required>${fieldOptions}</select>
            </label>
            <label>Level *
              <select name="level" required>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
          </div>
          <label>Description<textarea name="description" rows="3"></textarea></label>
          <label>Author Bio<textarea name="authorBio" rows="2"></textarea></label>
          <label>PDF File<input type="file" name="file" accept=".pdf"><span class="admin-field-hint">Optional — you can upload the PDF later via Edit.</span></label>
          <div id="add-book-msg" class="admin-msg"></div>
          <div style="display:flex;gap:0.5rem">
            <button type="submit" class="admin-btn admin-btn-primary">Add Book</button>
            <button type="button" class="admin-btn" id="cancel-add-book-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <div class="admin-section" id="books-list-section">
      <h2>All Books (${books.length})</h2>
      <div class="admin-filters">
        <select id="book-sort" class="admin-filter-select">
          <option value="id-asc">Sort: ID</option>
          <option value="title-asc">Title A → Z</option>
          <option value="title-desc">Title Z → A</option>
        </select>
        <select id="book-filter-level" class="admin-filter-select">
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
        <select id="book-filter-field" class="admin-filter-select">
          <option value="">All Fields</option>
          ${allSubfields.map(s => `<option value="${s.id}">${escHtml(s.parentName)} → ${escHtml(s.name)}</option>`).join('')}
        </select>
      </div>
      <div id="books-table-wrap"></div>
    </div>
  `;

  // Show / hide add book form
  container.querySelector('#show-add-book-btn').addEventListener('click', () => {
    container.querySelector('#add-book-intro').style.display = 'none';
    container.querySelector('#add-book-form-wrap').style.display = 'block';
  });

  container.querySelector('#cancel-add-book-btn').addEventListener('click', () => {
    container.querySelector('#add-book-form').reset();
    container.querySelector('#add-book-msg').textContent = '';
    container.querySelector('#add-book-form-wrap').style.display = 'none';
    container.querySelector('#add-book-intro').style.display = 'block';
  });

  // Add book form
  container.querySelector('#add-book-form').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const msg = form.querySelector('#add-book-msg');
    const fd = new FormData(form);
    msg.textContent = 'Adding...';
    msg.className = 'admin-msg';
    try {
      await adminAddBook(fd);
      form.reset();
      await renderBooksTab(container);
    } catch (err) {
      msg.textContent = err.message || 'Failed to add book.';
      msg.className = 'admin-msg admin-msg-error';
    }
  });

  // ── Books table rendering with filter/sort ──────────────────────────────────
  function getFilteredBooks() {
    const sort = container.querySelector('#book-sort').value;
    const level = container.querySelector('#book-filter-level').value;
    const fieldId = container.querySelector('#book-filter-field').value;

    let filtered = books.slice();
    if (level) filtered = filtered.filter(b => b.level === level);
    if (fieldId) filtered = filtered.filter(b => String(b.fieldId) === fieldId);

    if (sort === 'title-asc') filtered.sort((a, b) => a.title.localeCompare(b.title));
    else if (sort === 'title-desc') filtered.sort((a, b) => b.title.localeCompare(a.title));
    else filtered.sort((a, b) => a.id - b.id);

    return filtered;
  }

  function renderBooksTable() {
    const filtered = getFilteredBooks();
    const wrap = container.querySelector('#books-table-wrap');
    wrap.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr><th>ID</th><th>Title</th><th>Author</th><th>Level</th><th>Field</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${filtered.map(b => `
            <tr>
              <td>${b.id}</td>
              <td>${escHtml(b.title)}</td>
              <td>${escHtml(b.author)}</td>
              <td>${escHtml(b.level)}</td>
              <td>${escHtml(fieldNameMap[b.fieldId] || String(b.fieldId))}</td>
              <td>
                <button class="admin-btn admin-btn-sm" data-action="edit-book" data-id="${b.id}">Edit</button>
                <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="delete-book" data-id="${b.id}" data-title="${escHtml(b.title)}">Delete</button>
              </td>
            </tr>
            <tr class="admin-edit-row" id="edit-book-row-${b.id}" style="display:none">
              <td colspan="6">
                <form class="admin-form admin-inline-form" data-edit-book-form="${b.id}">
                  <div class="admin-form-row">
                    <label>Title *<input name="title" value="${escHtml(b.title)}" required></label>
                    <label>Author *<input name="author" value="${escHtml(b.author)}" required></label>
                  </div>
                  <div class="admin-form-row">
                    <label>Field *
                      <select name="fieldId" required>
                        ${fields.map(f => `<option value="${f.id}" ${b.fieldId === f.id ? 'selected' : ''}>[${escHtml(f.name)}] (top-level)</option>`).join('')}
                        ${allSubfields.map(s => `<option value="${s.id}" ${b.fieldId === s.id ? 'selected' : ''}>${escHtml(s.parentName)} → ${escHtml(s.name)}</option>`).join('')}
                      </select>
                    </label>
                    <label>Level *
                      <select name="level" required>
                        ${['beginner','intermediate','advanced'].map(l => `<option value="${l}" ${b.level === l ? 'selected' : ''}>${l}</option>`).join('')}
                      </select>
                    </label>
                  </div>
                  <label>Description<textarea name="description" rows="3">${escHtml(b.description || '')}</textarea></label>
                  <label>Author Bio<textarea name="authorBio" rows="2">${escHtml(b.authorBio || '')}</textarea></label>
                  <label>Replace PDF<input type="file" name="file" accept=".pdf"><span class="admin-field-hint">${b.pdfFilename ? 'Current: ' + escHtml(b.pdfFilename) + ' — leave blank to keep it.' : 'No PDF uploaded yet.'}</span></label>
                  <div id="edit-book-msg-${b.id}" class="admin-msg"></div>
                  <button type="submit" class="admin-btn admin-btn-primary">Save</button>
                  <button type="button" class="admin-btn" data-cancel-edit="${b.id}">Cancel</button>
                </form>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    wireBookTableEvents();
  }

  function wireBookTableEvents() {
    container.querySelectorAll('[data-action="edit-book"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = container.querySelector(`#edit-book-row-${btn.dataset.id}`);
        row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
      });
    });

    container.querySelectorAll('[data-cancel-edit]').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelector(`#edit-book-row-${btn.dataset.cancelEdit}`).style.display = 'none';
      });
    });

    container.querySelectorAll('[data-edit-book-form]').forEach(form => {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const bookId = form.dataset.editBookForm;
        const msg = form.querySelector(`#edit-book-msg-${bookId}`);
        const fd = new FormData();
        fd.append('title', form.querySelector('[name=title]').value);
        fd.append('author', form.querySelector('[name=author]').value);
        fd.append('fieldId', form.querySelector('[name=fieldId]').value);
        fd.append('level', form.querySelector('[name=level]').value);
        fd.append('description', form.querySelector('[name=description]').value);
        fd.append('authorBio', form.querySelector('[name=authorBio]').value);
        const fileInput = form.querySelector('[name=file]');
        if (fileInput.files[0]) fd.append('file', fileInput.files[0]);
        msg.textContent = 'Saving...';
        msg.className = 'admin-msg';
        try {
          await adminUpdateBook(bookId, fd);
          msg.textContent = 'Book updated.';
          msg.className = 'admin-msg admin-msg-success';
          await renderBooksTab(container);
        } catch {
          msg.textContent = 'Failed to update book.';
          msg.className = 'admin-msg admin-msg-error';
        }
      });
    });

    container.querySelectorAll('[data-action="delete-book"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Delete "${btn.dataset.title}"? This cannot be undone.`)) return;
        try {
          await adminDeleteBook(btn.dataset.id);
          await renderBooksTab(container);
        } catch {
          alert('Failed to delete book.');
        }
      });
    });
  }

  // Wire filter controls
  ['#book-sort', '#book-filter-level', '#book-filter-field'].forEach(sel => {
    container.querySelector(sel).addEventListener('change', renderBooksTable);
  });

  renderBooksTable();
}

// ── Masail Tab ────────────────────────────────────────────────────────────────

async function renderMasailTab(container) {
  let masail;
  try {
    masail = await adminGetAllMasail();
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
        <p class="admin-section-desc">Manage all fiqh masail on the platform. You can add new masail with all four madhab opinions, edit existing ones, verify them to make them visible to paid users, or delete them.</p>
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

  // ── Masail table rendering with filter/sort ────────────────────────────────
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
              <tr>
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

  // Wire filter controls
  ['#masail-sort', '#masail-filter-category', '#masail-filter-verified'].forEach(sel => {
    container.querySelector(sel).addEventListener('change', renderMasailTable);
  });

  renderMasailTable();

  // Show / hide add masalah form
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

  // Add masalah form
  container.querySelector('#add-masalah-form').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const msg = form.querySelector('#add-masalah-msg');
    const data = buildMasalahPayload(form, 'add');
    msg.textContent = 'Adding...';
    msg.className = 'admin-msg';
    try {
      await adminAddMasalah(data);
      form.reset();
      await renderMasailTab(container);
    } catch {
      msg.textContent = 'Failed to add masalah.';
      msg.className = 'admin-msg admin-msg-error';
    }
  });

  function wireMasailTableEvents() {
    // Edit masalah toggle
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
          await adminUpdateMasalah(masalahId, data);
          msg.textContent = 'Masalah updated.';
          msg.className = 'admin-msg admin-msg-success';
          await renderMasailTab(container);
        } catch {
          msg.textContent = 'Failed to update masalah.';
          msg.className = 'admin-msg admin-msg-error';
        }
      });
    });

    // Verify masalah
    container.querySelectorAll('[data-action="verify-masalah"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Verify "${btn.dataset.title}"? This will make it visible to paid users.`)) return;
        try {
          await adminVerifyMasalah(btn.dataset.id);
          await renderMasailTab(container);
        } catch (err) {
          alert(err.message || 'Failed to verify masalah. Ensure all four madhab opinions are present.');
        }
      });
    });

    // Delete masalah
    container.querySelectorAll('[data-action="delete-masalah"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Delete "${btn.dataset.title}"? This cannot be undone.`)) return;
        try {
          await adminDeleteMasalah(btn.dataset.id);
          await renderMasailTab(container);
        } catch {
          alert('Failed to delete masalah.');
        }
      });
    });
  }
}

// ── Roadmap Tab ───────────────────────────────────────────────────────────────

async function renderRoadmapTab(container) {
  let steps, books, fields;
  try {
    [steps, books, fields] = await Promise.all([adminGetRoadmapSteps(), adminGetBooks(), getFields()]);
  } catch {
    container.innerHTML = '<p class="admin-error">Failed to load roadmap data.</p>';
    return;
  }

  // Load subfields for each top-level field
  const allSubfields = [];
  await Promise.all(fields.map(async f => {
    try {
      const subs = await getSubfields(f.id);
      subs.forEach(s => allSubfields.push({ ...s, parentName: f.name }));
    } catch { /* ignore */ }
  }));

  // fieldId → display name map
  const fieldNameMap = {};
  fields.forEach(f => { fieldNameMap[f.id] = f.name; });
  allSubfields.forEach(s => { fieldNameMap[s.id] = `${s.parentName} → ${s.name}`; });

  // bookId → book object map
  const bookMap = {};
  books.forEach(b => { bookMap[b.id] = b; });

  const fieldOptions = [
    ...fields.map(f => `<option value="${f.id}">[${escHtml(f.name)}] (top-level)</option>`),
    ...allSubfields.map(s => `<option value="${s.id}">${escHtml(s.parentName)} → ${escHtml(s.name)}</option>`),
  ].join('');

  const bookOptions = books
    .slice()
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(b => `<option value="${b.id}">${escHtml(b.title)} — ${escHtml(b.author)}</option>`)
    .join('');

  container.innerHTML = `
    <div class="admin-section">
      <div id="add-step-intro">
        <h2>Roadmap Steps</h2>
        <p class="admin-section-desc">Manage all roadmap steps. Each step links a book to a field (or madhab subfield) and level. Steps are ordered by step number within each field+level combination. When the field is Fiqh, select the madhab subfield (e.g. Fiqh → Hanafi).</p>
        <button class="admin-btn admin-btn-primary" id="show-add-step-btn">+ Add Step</button>
      </div>
      <div id="add-step-form-wrap" style="display:none">
        <h2>Add Roadmap Step</h2>
        <form id="add-step-form" class="admin-form">
          <div class="admin-form-row">
            <label>Field *
              <select name="fieldId" required>${fieldOptions}</select>
            </label>
            <label>Level *
              <select name="level" required>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </label>
          </div>
          <div class="admin-form-row">
            <label>Book *
              <select name="bookId" required>${bookOptions}</select>
            </label>
            <label>Step Order *<input type="number" name="stepOrder" min="1" required></label>
          </div>
          <label>Description *<textarea name="description" rows="3" required></textarea></label>
          <div id="add-step-msg" class="admin-msg"></div>
          <div style="display:flex;gap:0.5rem">
            <button type="submit" class="admin-btn admin-btn-primary">Add Step</button>
            <button type="button" class="admin-btn" id="cancel-add-step-btn">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <div class="admin-section">
      <h2>All Steps (${steps.length})</h2>
      <div class="admin-filters">
        <select id="step-filter-field" class="admin-filter-select">
          <option value="">All Fields</option>
          ${fields.map(f => `<option value="${f.id}">${escHtml(f.name)}</option>`).join('')}
          ${allSubfields.map(s => `<option value="${s.id}">${escHtml(s.parentName)} → ${escHtml(s.name)}</option>`).join('')}
        </select>
        <select id="step-filter-level" class="admin-filter-select">
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>
      <div id="steps-table-wrap"></div>
    </div>
  `;

  // Show / hide add form
  container.querySelector('#show-add-step-btn').addEventListener('click', () => {
    container.querySelector('#add-step-intro').style.display = 'none';
    container.querySelector('#add-step-form-wrap').style.display = 'block';
  });
  container.querySelector('#cancel-add-step-btn').addEventListener('click', () => {
    container.querySelector('#add-step-form').reset();
    container.querySelector('#add-step-msg').textContent = '';
    container.querySelector('#add-step-form-wrap').style.display = 'none';
    container.querySelector('#add-step-intro').style.display = 'block';
  });

  // Add step form submit
  container.querySelector('#add-step-form').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    const msg = form.querySelector('#add-step-msg');
    const data = {
      fieldId: Number(form.querySelector('[name=fieldId]').value),
      bookId: Number(form.querySelector('[name=bookId]').value),
      level: form.querySelector('[name=level]').value,
      stepOrder: Number(form.querySelector('[name=stepOrder]').value),
      description: form.querySelector('[name=description]').value,
    };
    msg.textContent = 'Adding...';
    msg.className = 'admin-msg';
    try {
      await adminAddRoadmapStep(data);
      form.reset();
      await renderRoadmapTab(container);
    } catch (err) {
      msg.textContent = err.message || 'Failed to add step.';
      msg.className = 'admin-msg admin-msg-error';
    }
  });

  // Filter logic
  function getFilteredSteps() {
    const fieldId = container.querySelector('#step-filter-field').value;
    const level = container.querySelector('#step-filter-level').value;
    let filtered = steps.slice();
    if (fieldId) filtered = filtered.filter(s => String(s.fieldId) === fieldId);
    if (level) filtered = filtered.filter(s => s.level === level);
    return filtered;
  }

  function renderStepsTable() {
    const filtered = getFilteredSteps();
    const wrap = container.querySelector('#steps-table-wrap');
    wrap.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr><th>#</th><th>Field</th><th>Level</th><th>Book</th><th>Description</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${filtered.map(s => `
            <tr>
              <td>${s.stepOrder}</td>
              <td>${escHtml(fieldNameMap[s.fieldId] || s.fieldName || String(s.fieldId))}</td>
              <td>${escHtml(s.level)}</td>
              <td>${escHtml(s.bookTitle)}</td>
              <td class="admin-cell-desc">${escHtml(s.description)}</td>
              <td>
                <button class="admin-btn admin-btn-sm" data-action="edit-step" data-id="${s.id}">Edit</button>
                <button class="admin-btn admin-btn-sm admin-btn-danger" data-action="delete-step" data-id="${s.id}" data-title="${escHtml(s.bookTitle)}">Delete</button>
              </td>
            </tr>
            <tr class="admin-edit-row" id="edit-step-row-${s.id}" style="display:none">
              <td colspan="6">
                <form class="admin-form admin-inline-form" data-edit-step-form="${s.id}">
                  <div class="admin-form-row">
                    <label>Field *
                      <select name="fieldId" required>
                        ${fields.map(f => `<option value="${f.id}" ${s.fieldId === f.id ? 'selected' : ''}>[${escHtml(f.name)}] (top-level)</option>`).join('')}
                        ${allSubfields.map(sub => `<option value="${sub.id}" ${s.fieldId === sub.id ? 'selected' : ''}>${escHtml(sub.parentName)} → ${escHtml(sub.name)}</option>`).join('')}
                      </select>
                    </label>
                    <label>Level *
                      <select name="level" required>
                        ${['beginner','intermediate','advanced'].map(l => `<option value="${l}" ${s.level === l ? 'selected' : ''}>${l}</option>`).join('')}
                      </select>
                    </label>
                  </div>
                  <div class="admin-form-row">
                    <label>Book *
                      <select name="bookId" required>
                        ${books.slice().sort((a,b) => a.title.localeCompare(b.title)).map(b => `<option value="${b.id}" ${s.bookId === b.id ? 'selected' : ''}>${escHtml(b.title)} — ${escHtml(b.author)}</option>`).join('')}
                      </select>
                    </label>
                    <label>Step Order *<input type="number" name="stepOrder" min="1" value="${s.stepOrder}" required></label>
                  </div>
                  <label>Description *<textarea name="description" rows="3" required>${escHtml(s.description)}</textarea></label>
                  <div id="edit-step-msg-${s.id}" class="admin-msg"></div>
                  <button type="submit" class="admin-btn admin-btn-primary">Save</button>
                  <button type="button" class="admin-btn" data-cancel-step="${s.id}">Cancel</button>
                </form>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    wireStepTableEvents();
  }

  function wireStepTableEvents() {
    container.querySelectorAll('[data-action="edit-step"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = container.querySelector(`#edit-step-row-${btn.dataset.id}`);
        row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
      });
    });

    container.querySelectorAll('[data-cancel-step]').forEach(btn => {
      btn.addEventListener('click', () => {
        container.querySelector(`#edit-step-row-${btn.dataset.cancelStep}`).style.display = 'none';
      });
    });

    container.querySelectorAll('[data-edit-step-form]').forEach(form => {
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const stepId = form.dataset.editStepForm;
        const msg = form.querySelector(`#edit-step-msg-${stepId}`);
        const data = {
          fieldId: Number(form.querySelector('[name=fieldId]').value),
          bookId: Number(form.querySelector('[name=bookId]').value),
          level: form.querySelector('[name=level]').value,
          stepOrder: Number(form.querySelector('[name=stepOrder]').value),
          description: form.querySelector('[name=description]').value,
        };
        msg.textContent = 'Saving...';
        msg.className = 'admin-msg';
        try {
          await adminUpdateRoadmapStep(stepId, data);
          msg.textContent = 'Step updated.';
          msg.className = 'admin-msg admin-msg-success';
          await renderRoadmapTab(container);
        } catch (err) {
          msg.textContent = err.message || 'Failed to update step.';
          msg.className = 'admin-msg admin-msg-error';
        }
      });
    });

    container.querySelectorAll('[data-action="delete-step"]').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm(`Delete step for "${btn.dataset.title}"? This cannot be undone.`)) return;
        try {
          await adminDeleteRoadmapStep(btn.dataset.id);
          await renderRoadmapTab(container);
        } catch {
          alert('Failed to delete step.');
        }
      });
    });
  }

  ['#step-filter-field', '#step-filter-level'].forEach(sel => {
    container.querySelector(sel).addEventListener('change', renderStepsTable);
  });

  renderStepsTable();
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
