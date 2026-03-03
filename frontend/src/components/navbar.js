/**
 * Top navigation bar.
 * @param {string} activeRoute - Current route, e.g. '/library'
 * @param {object|null} user - Current user object or null
 * @returns {HTMLElement}
 */
export function renderNavbar(activeRoute, user) {
  const nav = document.createElement('nav');
  nav.className = 'navbar';

  const links = [
    { href: '#/library',  label: 'Library',   route: '/library'  },
    { href: '#/roadmap',  label: 'Roadmap',   route: '/roadmap'  },
    { href: '#/fiqhtool', label: 'Fiqh Tool', route: '/fiqhtool' },
  ];

  const navLinks = links
    .map(({ href, label, route }) => {
      const isActive = activeRoute === route;
      return `<a href="${href}" class="nav-link${isActive ? ' active' : ''}">${label}</a>`;
    })
    .join('');

  const authLink = user
    ? `<a href="#/account" class="nav-link${activeRoute === '/account' ? ' active' : ''}">Account</a>`
    : `<a href="#/login"   class="nav-link nav-link-cta${activeRoute === '/login' ? ' active' : ''}">Login</a>`;

  nav.innerHTML = `
    <div class="navbar-inner">
      <a href="#/" class="navbar-logo">
        <span class="logo-text">Maktabah</span>
        <span class="logo-arabic">مكتبة</span>
      </a>
      <div class="navbar-links">
        ${navLinks}
      </div>
      <div class="navbar-auth">
        ${authLink}
      </div>
    </div>
  `;

  return nav;
}
