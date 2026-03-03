import './style.css';
import { renderNavbar } from './components/navbar.js';
import { getCurrentUser, clearUserCache } from './auth.js';

// Re-export clearUserCache so pages can call it after login/logout
export { clearUserCache };

const routes = {
  '/':         () => import('./pages/library.js').then(m => m.renderLibrary),
  '/library':  () => import('./pages/library.js').then(m => m.renderLibrary),
  '/roadmap':  () => import('./pages/roadmap.js').then(m => m.renderRoadmap),
  '/fiqhtool': () => import('./pages/fiqhtool.js').then(m => m.renderFiqhTool),
  '/login':    () => import('./pages/login.js').then(m => m.renderLogin),
  '/register': () => import('./pages/register.js').then(m => m.renderRegister),
  '/account':  () => import('./pages/account.js').then(m => m.renderAccount),
};

function getRoute() {
  const hash = window.location.hash;
  if (!hash || hash === '#' || hash === '#/') return '/';
  return hash.slice(1); // remove the leading #
}

async function navigate() {
  const route = getRoute();
  const app = document.getElementById('app');

  const user = await getCurrentUser();

  app.innerHTML = '';

  // Navbar knows the active route — map '/' to '/library' for highlight purposes
  const activeRoute = route === '/' ? '/library' : route;
  const navbar = renderNavbar(activeRoute, user);
  app.appendChild(navbar);

  const pageContainer = document.createElement('main');
  pageContainer.className = 'page-content';
  app.appendChild(pageContainer);

  const loader = routes[route];
  if (!loader) {
    pageContainer.innerHTML = `
      <div class="error-page">
        <h2>Page not found</h2>
        <a href="#/library">Go to Library</a>
      </div>
    `;
    return;
  }

  try {
    const renderFn = await loader();
    await renderFn(pageContainer, user);
  } catch (err) {
    console.error('Page render error:', err);
    pageContainer.innerHTML = `
      <div class="error-page">
        <h2>Something went wrong</h2>
        <a href="#/library">Go to Library</a>
      </div>
    `;
  }
}

window.addEventListener('hashchange', navigate);
navigate();
