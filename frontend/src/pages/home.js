/**
 * Home / landing page.
 * Hero → Stats → Features → Pricing → Footer
 */
export async function renderHome(container) {
  container.innerHTML = '';
  container.classList.add('home-page');

  container.innerHTML = `
    <!-- ── Hero ──────────────────────────────────────────────────── -->
    <section class="home-hero">
      <div class="home-container">
        <div class="home-eyebrow">
          <span class="eyebrow-label">◆ Islamic Knowledge Platform</span>
        </div>

        <h1 class="home-headline">
          Seek Knowledge<br>with <span class="accent-gold">Purpose</span>
        </h1>

        <p class="home-subtext">
          A curated Islamic library, structured learning roadmaps, and a
          scholarly-backed fiqh comparison tool — all in one place.
        </p>

        <div class="home-cta-row">
          <a href="#/library" class="btn-primary-lg">Browse the Library →</a>
          <a href="#/register" class="btn-ghost-lg">Create Free Account</a>
        </div>

        <div class="home-announcement">
          <span class="announcement-pill">
            ◆ All madhab opinions verified by qualified scholars before publication
          </span>
        </div>
      </div>
    </section>

    <!-- ── Stats ─────────────────────────────────────────────────── -->
    <div class="home-stats">
      <div class="stats-grid">
        <div class="stat-cell">
          <span class="stat-num green">100+</span>
          <span class="stat-label">Islamic Books</span>
        </div>
        <div class="stat-cell">
          <span class="stat-num gold">4</span>
          <span class="stat-label">Madhabs Covered</span>
        </div>
        <div class="stat-cell">
          <span class="stat-num green">3</span>
          <span class="stat-label">Knowledge Levels</span>
        </div>
        <div class="stat-cell">
          <span class="stat-num gold">100%</span>
          <span class="stat-label">Scholar Verified</span>
        </div>
      </div>
    </div>

    <!-- ── Features ──────────────────────────────────────────────── -->
    <section class="home-features">
      <div class="home-container">
        <div class="section-header">
          <span class="eyebrow-label green">◆ Core Learning</span>
          <h2 class="section-title">
            Everything a Student of<br><span class="accent-green">Knowledge</span> Needs
          </h2>
          <p class="section-subtitle">
            Three tools, one platform, built for serious students of Islamic sciences.
          </p>
        </div>

        <div class="home-features-grid">
          <a href="#/library" class="feature-card glass-card">
            <div class="feature-icon-wrap">
              <span class="feature-icon">📚</span>
            </div>
            <h3 class="feature-card-title">Islamic Library</h3>
            <p class="feature-card-subtitle">Curated classical texts, organised by field and level</p>
            <ul class="feature-list">
              <li>Full library access by field and subfield</li>
              <li>Beginner to advanced levels</li>
              <li>Download PDFs directly</li>
              <li>Free for all registered users</li>
            </ul>
            <span class="feature-badge">Free Access</span>
          </a>

          <a href="#/roadmap" class="feature-card glass-card">
            <div class="feature-icon-wrap">
              <span class="feature-icon">🗺️</span>
            </div>
            <h3 class="feature-card-title">Learning Roadmap</h3>
            <p class="feature-card-subtitle">A structured path through the Islamic sciences</p>
            <ul class="feature-list">
              <li>Step-by-step book progression</li>
              <li>Know exactly what to read next</li>
              <li>Track your completion</li>
              <li>Built by scholars of knowledge</li>
            </ul>
            <span class="feature-badge gold">Premium</span>
          </a>

          <a href="#/fiqhtool" class="feature-card glass-card">
            <div class="feature-icon-wrap">
              <span class="feature-icon">⚖️</span>
            </div>
            <h3 class="feature-card-title">Fiqh Comparison</h3>
            <p class="feature-card-subtitle">All four madhab positions, side by side</p>
            <ul class="feature-list">
              <li>Hanafi, Maliki, Shafi&apos;i, Hanbali</li>
              <li>Evidence and source references</li>
              <li>All rulings scholar-verified</li>
              <li>Search any fiqh issue</li>
            </ul>
            <span class="feature-badge gold">Premium</span>
          </a>
        </div>
      </div>
    </section>

    <!-- ── Pricing ────────────────────────────────────────────────── -->
    <section class="home-pricing">
      <div class="home-container">
        <div class="section-header">
          <span class="eyebrow-label">◆ Choose Your Path</span>
          <h2 class="section-title">
            Invest in Your <span class="accent-gold">Knowledge</span>
          </h2>
          <p class="section-subtitle">Start free. Unlock everything when you&apos;re ready.</p>

          <div class="pricing-toggle">
            <button class="toggle-btn active" id="toggle-monthly">Monthly</button>
            <button class="toggle-btn" id="toggle-yearly">
              Yearly
              <span class="toggle-save-badge">Save 25%</span>
            </button>
          </div>
        </div>

        <div class="pricing-grid">
          <div class="pricing-card glass-card">
            <div class="pricing-tier">Free</div>
            <div class="pricing-price">
              <span class="price-amount">0</span>
              <span class="price-currency">kr</span>
              <span class="price-period">/ month</span>
            </div>
            <p class="pricing-desc">
              Everything you need to browse and download from our Islamic library.
            </p>
            <ul class="pricing-features">
              <li>Full library access</li>
              <li>PDF downloads</li>
              <li>Browse all fields and subfields</li>
            </ul>
            <a href="#/register" class="btn-ghost-full">Get Started Free</a>
          </div>

          <div class="pricing-card glass-card gold-card">
            <div class="pricing-tier-row">
              <span class="pricing-tier gold">Premium</span>
              <span class="yearly-savings-badge" id="yearly-savings" style="display:none;">Best value</span>
            </div>
            <div class="pricing-price">
              <span class="price-amount gold" id="premium-price-amount">129</span>
              <span class="price-currency gold" id="premium-price-currency">kr</span>
              <span class="price-period" id="premium-price-period">/ month</span>
            </div>
            <p class="pricing-desc">
              Full access to every tool — the roadmap, fiqh comparisons, and everything that follows.
            </p>
            <ul class="pricing-features gold-checks">
              <li>Everything in Free</li>
              <li>Learning Roadmap access</li>
              <li>Fiqh Comparison Tool</li>
              <li>Progress tracking</li>
              <li>Future features included</li>
            </ul>
            <a href="#/account" class="btn-gold-full">Begin Your Journey →</a>
          </div>
        </div>

        <p class="pricing-note">Cancel anytime &nbsp;·&nbsp; No commitment &nbsp;·&nbsp; Secure payment via Stripe</p>
      </div>
    </section>

    <!-- ── Footer ─────────────────────────────────────────────────── -->
    <footer class="home-footer">
      <div class="home-container">
        <div class="footer-row-1">
          <a href="#/" class="footer-logo">
            <span class="footer-logo-arabic">مكتبة</span>
            <span class="footer-logo-text">Maktabah</span>
          </a>
          <nav class="footer-links">
            <a href="#/library">Library</a>
            <span class="footer-dot">·</span>
            <a href="#/roadmap">Roadmap</a>
            <span class="footer-dot">·</span>
            <a href="#/fiqhtool">Fiqh Tool</a>
            <span class="footer-dot">·</span>
            <a href="#/login">Login</a>
            <span class="footer-dot">·</span>
            <a href="#/register">Register</a>
          </nav>
        </div>
        <div class="footer-divider"></div>
        <div class="footer-row-2">
          <p class="footer-copyright">© 2026 Maktabah. All rights reserved.</p>
          <p class="footer-quote">"Seeking knowledge is an obligation upon every Muslim."</p>
        </div>
      </div>
    </footer>
  `;

  // ── Pricing toggle ──────────────────────────────────────────────
  const monthlyBtn = container.querySelector('#toggle-monthly');
  const yearlyBtn  = container.querySelector('#toggle-yearly');
  const priceAmount   = container.querySelector('#premium-price-amount');
  const priceCurrency = container.querySelector('#premium-price-currency');
  const pricePeriod   = container.querySelector('#premium-price-period');
  const savingsBadge  = container.querySelector('#yearly-savings');

  monthlyBtn.addEventListener('click', () => {
    monthlyBtn.classList.add('active');
    yearlyBtn.classList.remove('active');
    priceAmount.textContent   = '129';
    priceCurrency.textContent = 'kr';
    pricePeriod.textContent   = '/ month';
    savingsBadge.style.display = 'none';
  });

  yearlyBtn.addEventListener('click', () => {
    yearlyBtn.classList.add('active');
    monthlyBtn.classList.remove('active');
    priceAmount.textContent   = '1 160';
    priceCurrency.textContent = 'kr';
    pricePeriod.textContent   = '/ year';
    savingsBadge.style.display = 'inline-flex';
  });
}
