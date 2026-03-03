async function i(a){a.innerHTML="",a.classList.add("home-page");const s=[{icon:"📚",title:"Islamic Library",description:"Browse a curated collection of authentic Islamic books organised by field, subfield, and knowledge level — from beginner to advanced.",href:"#/library"},{icon:"🗺️",title:"Learning Roadmap",description:"Follow a structured reading path designed for your level. Know exactly which book to read next and why it belongs at that point in your journey.",href:"#/roadmap"},{icon:"⚖️",title:"Fiqh Comparison",description:"See the position of all four madhabs on any fiqh issue side by side — with evidence and source references, verified by qualified scholars.",href:"#/fiqhtool"}];a.innerHTML=`
    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">
        <span class="hero-badge">Islamic Knowledge Platform</span>

        <h1 class="hero-title">
          Maktabah
          <span class="hero-arabic">مكتبة</span>
        </h1>

        <p class="hero-tagline">
          Your home for authentic Islamic learning
        </p>

        <p class="hero-description">
          A verified Islamic book library, structured learning roadmaps, and a
          scholarly-backed fiqh comparison tool — all in one place, for students
          of knowledge at every level.
        </p>

        <a href="#/library" class="hero-cta">Browse the Library →</a>
      </div>
    </section>

    <!-- Features -->
    <section class="features">
      <div class="features-inner">
        <h2 class="features-heading">Everything a student of knowledge needs</h2>
        <div class="features-grid">
          ${s.map(e=>`
            <a href="${e.href}" class="feature-card">
              <span class="feature-icon">${e.icon}</span>
              <h3 class="feature-title">${e.title}</h3>
              <p class="feature-description">${e.description}</p>
            </a>
          `).join("")}
        </div>
      </div>
    </section>
  `}export{i as renderHome};
