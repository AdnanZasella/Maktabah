const v="",g={credentials:"include"};async function M(){const e=await fetch(`${v}/api/fields`,g);if(!e.ok)throw new Error("Failed to fetch fields");return e.json()}async function $(e){const n=await fetch(`${v}/api/fields/${e}/subfields`,g);if(!n.ok)throw new Error("Failed to fetch subfields");return n.json()}async function T(e,n=null){let s=`${v}/api/books?fieldId=${e}`;n&&n!=="all"&&(s+=`&level=${encodeURIComponent(n)}`);const t=await fetch(s,g);if(!t.ok)throw new Error("Failed to fetch books");return t.json()}async function S(e){const n=await fetch(`${v}/api/books/${e}/download`,g);if(!n.ok)throw new Error("Download failed");const s=await n.blob(),t=n.headers.get("Content-Disposition");let a="book.pdf";if(t){const u=t.match(/filename="([^"]+)"/);u&&(a=u[1])}const l=URL.createObjectURL(s),i=document.createElement("a");i.href=l,i.download=a,document.body.appendChild(i),i.click(),i.remove(),URL.revokeObjectURL(l)}const A={Aqeedah:{accent:"#10B981",bg:"#ECFDF5",description:"Islamic creed — tawheed, the names and attributes of Allah, and the foundational beliefs every Muslim must know."},Fiqh:{accent:"#3B82F6",bg:"#EFF6FF",description:"Islamic jurisprudence — rulings on worship, transactions, and daily life across the four madhabs: Hanafi, Maliki, Shafi'i, and Hanbali."},Hadith:{accent:"#F59E0B",bg:"#FFFBEB",description:"The sayings and actions of the Prophet ﷺ — including the science of hadith evaluation and commentary on the major collections."},Seerah:{accent:"#8B5CF6",bg:"#F5F3FF",description:"The life of the Prophet ﷺ, the stories of his Companions, and the history of the early Muslim community."}},I={accent:"#6B7280",bg:"#F9FAFB",description:null};function D(e){return A[e]||I}function B(e,n,s){const t=document.createElement("div");t.className="field-card",t.setAttribute("role","button"),t.setAttribute("tabindex","0");const l=e.parentFieldId!==null&&e.parentFieldId!==void 0?"Browse books":"Browse subfields";return t.innerHTML=`
    <div class="field-card-accent" style="background: ${n.accent}"></div>
    <div class="field-card-body">
      <div class="field-card-name">${F(e.name)}</div>
      ${n.description?`<p class="field-card-description">${F(n.description)}</p>`:""}
      <div class="field-card-hint">${l} →</div>
    </div>
  `,t.addEventListener("click",s),t.addEventListener("keydown",i=>{(i.key==="Enter"||i.key===" ")&&(i.preventDefault(),s())}),t}function F(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function q(e,n,s){const t=(n==null?void 0:n.accent)||"#6B7280",a=document.createElement("div");a.className="book-card";const l=e.description||e.authorBio;return a.innerHTML=`
    <div class="book-card-cover" style="background: ${t}"></div>
    <div class="book-card-body">
      <span class="book-card-level ${r(e.level)}">${r(e.level)}</span>
      <h3 class="book-card-title">${r(e.title)}</h3>
      <p class="book-card-author">by ${r(e.author)}</p>
      ${e.description?`<p class="book-card-description">${r(e.description)}</p>`:""}
      ${l?'<button class="read-more-btn">Read more →</button>':""}
    </div>
    <div class="book-card-footer"></div>
  `,l&&a.querySelector(".read-more-btn").addEventListener("click",()=>{x(e,t,s)}),C(a.querySelector(".book-card-footer"),e,s),a}function x(e,n,s){const t=document.createElement("div");t.className="modal-overlay",t.innerHTML=`
    <div class="modal" role="dialog" aria-modal="true" aria-label="${r(e.title)}">
      <button class="modal-close" aria-label="Close">×</button>
      <div class="modal-accent" style="background: ${n}"></div>
      <div class="modal-body">
        <span class="book-card-level ${r(e.level)}">${r(e.level)}</span>
        <h2 class="modal-title">${r(e.title)}</h2>
        <p class="modal-author">by ${r(e.author)}</p>

        ${e.authorBio?`
          <div class="modal-section">
            <h3 class="modal-section-heading">About the Author</h3>
            <p class="modal-section-text">${r(e.authorBio)}</p>
          </div>
        `:""}

        ${e.description?`
          <div class="modal-section">
            <h3 class="modal-section-heading">About the Book</h3>
            <p class="modal-section-text">${r(e.description)}</p>
          </div>
        `:""}

        <div class="modal-footer"></div>
      </div>
    </div>
  `;const a=()=>R(t,l,i);t.querySelector(".modal-close").addEventListener("click",a),t.addEventListener("click",u=>{u.target===t&&a()});const l=u=>{u.key==="Escape"&&a()},i=()=>a();document.addEventListener("keydown",l),window.addEventListener("hashchange",i),C(t.querySelector(".modal-footer"),e,s),document.body.appendChild(t),document.body.style.overflow="hidden"}function R(e,n,s){document.removeEventListener("keydown",n),window.removeEventListener("hashchange",s),document.body.style.overflow="",e.remove()}function C(e,n,s){if(s)if(s.subscriptionStatus!=="paid"){const t=w("Download Book");t.addEventListener("click",()=>{e.innerHTML="";const a=document.createElement("a");a.href="#/account",a.className="upgrade-btn",a.textContent="Upgrade to download this book",e.appendChild(a)}),e.appendChild(t)}else{const t=w("Download Book");t.addEventListener("click",async()=>{t.textContent="Downloading…",t.disabled=!0;try{await S(n.id)}catch{t.textContent="Download failed",setTimeout(()=>{t.textContent="Download Book",t.disabled=!1},2e3);return}t.textContent="Download Book",t.disabled=!1}),e.appendChild(t)}else{const t=w("Download Book");t.addEventListener("click",()=>{window.location.hash="#/login"}),e.appendChild(t)}}function w(e){const n=document.createElement("button");return n.className="download-btn",n.textContent=e,n}function r(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function j(e,n){e.innerHTML=`
    <a href="#/" class="back-home-link">← Home</a>
    <div class="library-header">
      <h1 class="library-title">Islamic Library</h1>
      <p class="library-subtitle">Browse our collection of verified Islamic books</p>
    </div>
    <div class="level-filter" id="level-filter">
      <button class="filter-btn active" data-level="all">All Levels</button>
      <button class="filter-btn" data-level="beginner">Beginner</button>
      <button class="filter-btn" data-level="intermediate">Intermediate</button>
      <button class="filter-btn" data-level="advanced">Advanced</button>
    </div>
    <nav class="breadcrumb" id="breadcrumb" aria-label="breadcrumb"></nav>
    <div class="content-grid" id="content-grid">
      <p class="loading">Loading fields…</p>
    </div>
  `;let s="all",t=[],a=null;const l=e.querySelectorAll(".filter-btn");l.forEach(o=>{o.addEventListener("click",()=>{l.forEach(c=>c.classList.remove("active")),o.classList.add("active"),s=o.dataset.level,t.length>0&&E()})});function i(){return document.getElementById("content-grid")}function u(){return document.getElementById("breadcrumb")}function f(o="Loading…"){i().innerHTML=`<p class="loading">${o}</p>`}function p(o){i().innerHTML=`<p class="error-message">${o}</p>`}async function m(){u().innerHTML="",t=[],a=null,f("Loading fields…");try{const o=await M();if(i().innerHTML="",o.length===0){i().innerHTML='<p class="empty-state">No fields available yet.</p>';return}o.forEach(c=>{const d=D(c.name),b=B(c,d,()=>H(c,d));i().appendChild(b)})}catch{p("Failed to load fields. Please refresh the page.")}}async function H(o,c){f();try{const d=await $(o.id);d.length>0?k(o,d,c):await L(o,null,c)}catch{p("Failed to load content. Please try again.")}}function k(o,c,d){t=[],a=null,u().innerHTML=`
      <button class="breadcrumb-link" id="bc-fields">All Fields</button>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">${h(o.name)}</span>
    `,document.getElementById("bc-fields").addEventListener("click",m),i().innerHTML="",c.forEach(b=>{const y=B(b,d,()=>L(b,o,d));i().appendChild(y)})}async function L(o,c,d){a=d,f("Loading books…");try{t=await T(o.id);const b=u();c?(b.innerHTML=`
          <button class="breadcrumb-link" id="bc-fields">All Fields</button>
          <span class="breadcrumb-sep">›</span>
          <button class="breadcrumb-link" id="bc-parent">${h(c.name)}</button>
          <span class="breadcrumb-sep">›</span>
          <span class="breadcrumb-current">${h(o.name)}</span>
        `,document.getElementById("bc-fields").addEventListener("click",m),document.getElementById("bc-parent").addEventListener("click",async()=>{f();try{const y=await $(c.id);k(c,y,d)}catch{p("Failed to load subfields.")}})):(b.innerHTML=`
          <button class="breadcrumb-link" id="bc-fields">All Fields</button>
          <span class="breadcrumb-sep">›</span>
          <span class="breadcrumb-current">${h(o.name)}</span>
        `,document.getElementById("bc-fields").addEventListener("click",m)),E()}catch{p("Failed to load books. Please try again.")}}function E(){const o=s==="all"?t:t.filter(c=>c.level===s);if(i().innerHTML="",o.length===0){i().innerHTML='<p class="empty-state">No books found for this filter.</p>';return}o.forEach(c=>{const d=q(c,a,n);i().appendChild(d)})}await m()}function h(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}export{j as renderLibrary};
