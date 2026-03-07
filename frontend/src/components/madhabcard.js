/**
 * Madhab opinion card component.
 * Returns a DOM element — caller appends it.
 * Uses textContent throughout so all user data is XSS-safe.
 */

const CLASS_MAP = {
  'Hanafi':  'madhab-hanafi',
  'Maliki':  'madhab-maliki',
  "Shafi'i": 'madhab-shafii',
  'Hanbali': 'madhab-hanbali',
};

export function createMadhabCard(opinion) {
  const colorClass = CLASS_MAP[opinion.madhab] || '';

  const card = document.createElement('div');
  card.className = `madhab-card ${colorClass}`.trim();

  const body = document.createElement('div');
  body.className = 'madhab-card-body';

  // Madhab name — styled heading, no separate coloured block
  const nameEl = document.createElement('div');
  nameEl.className = 'madhab-card-name';
  nameEl.textContent = opinion.madhab;
  body.appendChild(nameEl);

  // Thin rule separating name from content
  const divider = document.createElement('div');
  divider.className = 'madhab-card-divider';
  body.appendChild(divider);

  body.appendChild(createSection('Ruling', opinion.opinion));

  if (opinion.evidence) {
    body.appendChild(createSection('Evidence', opinion.evidence));
  }

  const source = buildSourceText(opinion.sourceBook, opinion.sourcePage);
  if (source) {
    body.appendChild(createSection('Source', source));
  }

  card.appendChild(body);
  return card;
}

function createSection(label, text) {
  const section = document.createElement('div');
  section.className = 'madhab-card-section';

  const labelEl = document.createElement('span');
  labelEl.className = 'madhab-card-label';
  labelEl.textContent = label;
  section.appendChild(labelEl);

  const textEl = document.createElement('p');
  textEl.className = 'madhab-card-text';
  textEl.textContent = text;
  section.appendChild(textEl);

  return section;
}

function buildSourceText(book, page) {
  const parts = [];
  if (book) parts.push(book);
  if (page) parts.push(`p. ${page}`);
  return parts.join(', ');
}
