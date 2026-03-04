/**
 * Field / subfield card component.
 */

const FIELD_COLORS = {
  'Aqeedah': {
    accent: '#10B981',
    bg: '#ECFDF5',
    // inactive: medium-bright emerald-200 | active: vivid emerald-400
    inactiveBg: '#A7F3D0', activeBtn: '#34D399', activeText: '#064E3B',
    description: 'Islamic creed — tawheed, the names and attributes of Allah, and the foundational beliefs every Muslim must know.',
  },
  'Fiqh': {
    accent: '#3B82F6',
    bg: '#EFF6FF',
    // inactive: blue-200 | active: vivid blue-400
    inactiveBg: '#BFDBFE', activeBtn: '#60A5FA', activeText: '#1E3A8A',
    description: 'Islamic jurisprudence — rulings on worship, transactions, and daily life across the four madhabs: Hanafi, Maliki, Shafi\'i, and Hanbali.',
  },
  'Hadith': {
    accent: '#F59E0B',
    bg: '#FFFBEB',
    // inactive: amber-200 | active: vivid amber-400
    inactiveBg: '#FDE68A', activeBtn: '#FBBF24', activeText: '#78350F',
    description: 'The sayings and actions of the Prophet ﷺ — including the science of hadith evaluation and commentary on the major collections.',
  },
  'Seerah': {
    accent: '#8B5CF6',
    bg: '#F5F3FF',
    // inactive: violet-200 | active: vivid violet-400
    inactiveBg: '#DDD6FE', activeBtn: '#A78BFA', activeText: '#3B0764',
    description: 'The life of the Prophet ﷺ, the stories of his Companions, and the history of the early Muslim community.',
  },
};

const DEFAULT_COLORS = { accent: '#6B7280', bg: '#F9FAFB', inactiveBg: '#E5E7EB', activeBtn: '#9CA3AF', activeText: '#111827', description: null };

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
      ${colors.description
        ? `<p class="field-card-description">${escapeHtml(colors.description)}</p>`
        : ''}
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
