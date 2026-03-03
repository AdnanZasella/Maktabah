/**
 * Field / subfield card component.
 */

const FIELD_COLORS = {
  'Aqeedah': { accent: '#10B981', bg: '#ECFDF5' },
  'Fiqh':    { accent: '#3B82F6', bg: '#EFF6FF' },
  'Hadith':  { accent: '#F59E0B', bg: '#FFFBEB' },
  'Seerah':  { accent: '#8B5CF6', bg: '#F5F3FF' },
};

const DEFAULT_COLORS = { accent: '#6B7280', bg: '#F9FAFB' };

/**
 * Returns color pair for a field name.
 * @param {string} name
 * @returns {{ accent: string, bg: string }}
 */
export function getFieldColors(name) {
  return FIELD_COLORS[name] || DEFAULT_COLORS;
}

/**
 * Creates a field or subfield card element.
 * @param {{ id: number, name: string, parentFieldId: number|null }} field
 * @param {{ accent: string, bg: string }} colors
 * @param {() => void} onClick
 * @returns {HTMLElement}
 */
export function createFieldCard(field, colors, onClick) {
  const card = document.createElement('div');
  card.className = 'field-card';
  card.setAttribute('role', 'button');
  card.setAttribute('tabindex', '0');

  const isSubfield = field.parentFieldId !== null && field.parentFieldId !== undefined;
  const hint = isSubfield ? 'Browse books' : 'Browse subfields';

  card.innerHTML = `
    <div class="field-card-accent" style="background: ${colors.accent}"></div>
    <div class="field-card-body">
      <div class="field-card-name">${escapeHtml(field.name)}</div>
      <div class="field-card-hint">${hint} →</div>
    </div>
  `;

  card.addEventListener('click', onClick);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  });

  return card;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
