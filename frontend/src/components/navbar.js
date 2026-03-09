/**
 * Top navigation bar — centered logo, links split left/right, pill CTA.
 * @param {string} activeRoute - Current route, e.g. '/library'
 * @param {object|null} user - Current user object or null
 * @returns {HTMLElement}
 */
export function renderNavbar(activeRoute, user) {
  const nav = document.createElement('nav');
  nav.className = 'navbar';

  const leftLinks = [
    { href: '#/library',  label: 'Library',   route: '/library'  },
    { href: '#/roadmap',  label: 'Roadmap',   route: '/roadmap'  },
    { href: '#/fiqhtool', label: 'Fiqh Tool', route: '/fiqhtool' },
  ];

  const leftLinksHTML = leftLinks
    .map(({ href, label, route }) => {
      const isActive = activeRoute === route;
      return `<a href="${href}" class="nav-link${isActive ? ' active' : ''}">${label}</a>`;
    })
    .join('');

  const adminLink = (user && user.role === 'admin')
    ? `<a href="#/admin" class="nav-link${activeRoute === '/admin' ? ' active' : ''}">Admin</a>`
    : '';

  const scholarLink = (user && user.role === 'scholar')
    ? `<a href="#/scholar" class="nav-link${activeRoute === '/scholar' ? ' active' : ''}">Scholar</a>`
    : '';

  const authLink = user
    ? `<a href="#/account" class="nav-link-cta${activeRoute === '/account' ? ' active' : ''}">Account</a>`
    : `<a href="#/login" class="nav-link-cta${activeRoute === '/login' ? ' active' : ''}">Login →</a>`;

  nav.innerHTML = `
    <div class="navbar-inner">
      <div class="navbar-left">
        ${leftLinksHTML}
      </div>
      <a href="#/" class="navbar-logo">
        <span class="logo-arabic">مكتبة</span>
        <span class="logo-text">Maktabah</span>
      </a>
      <div class="navbar-right">
        ${adminLink}
        ${scholarLink}
        ${authLink}
      </div>
    </div>
  `;

  return nav;
}
