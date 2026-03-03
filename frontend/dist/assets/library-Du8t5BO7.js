const g="",v={credentials:"include"};async function H(){const e=await fetch(`${g}/api/fields`,v);if(!e.ok)throw new Error("Failed to fetch fields");return e.json()}async function F(e){const n=await fetch(`${g}/api/fields/${e}/subfields`,v);if(!n.ok)throw new Error("Failed to fetch subfields");return n.json()}async function T(e,n=null){let s=`${g}/api/books?fieldId=${e}`;n&&n!=="all"&&(s+=`&level=${encodeURIComponent(n)}`);const t=await fetch(s,v);if(!t.ok)throw new Error("Failed to fetch books");return t.json()}async function M(e){const n=await fetch(`${g}/api/books/${e}/download`,v);if(!n.ok)throw new Error("Download failed");const s=await n.blob(),t=n.headers.get("Content-Disposition");let i="book.pdf";if(t){const u=t.match(/filename="([^"]+)"/);u&&(i=u[1])}const r=URL.createObjectURL(s),c=document.createElement("a");c.href=r,c.download=i,document.body.appendChild(c),c.click(),c.remove(),URL.revokeObjectURL(r)}const D={Aqeedah:{accent:"#10B981",bg:"#ECFDF5",description:"Islamic creed — tawheed, the names and attributes of Allah, and the foundational beliefs every Muslim must know."},Fiqh:{accent:"#3B82F6",bg:"#EFF6FF",description:"Islamic jurisprudence — rulings on worship, transactions, and daily life across the four madhabs: Hanafi, Maliki, Shafi'i, and Hanbali."},Hadith:{accent:"#F59E0B",bg:"#FFFBEB",description:"The sayings and actions of the Prophet ﷺ — including the science of hadith evaluation and commentary on the major collections."},Seerah:{accent:"#8B5CF6",bg:"#F5F3FF",description:"The life of the Prophet ﷺ, the stories of his Companions, and the history of the early Muslim community."}},I={accent:"#6B7280",bg:"#F9FAFB",description:null};function S(e){return D[e]||I}function B(e,n,s){const t=document.createElement("div");t.className="field-card",t.setAttribute("role","button"),t.setAttribute("tabindex","0");const r=e.parentFieldId!==null&&e.parentFieldId!==void 0?"Browse books":"Browse subfields";return t.innerHTML=`
    <div class="field-card-accent" style="background: ${n.accent}"></div>
    <div class="field-card-body">
      <div class="field-card-name">${$(e.name)}</div>
      ${n.description?`<p class="field-card-description">${$(n.description)}</p>`:""}
      <div class="field-card-hint">${r} →</div>
    </div>
  `,t.addEventListener("click",s),t.addEventListener("keydown",c=>{(c.key==="Enter"||c.key===" ")&&(c.preventDefault(),s())}),t}function $(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function A(e,n,s){const t=(n==null?void 0:n.accent)||"#6B7280",i=document.createElement("div");i.className="book-card",i.innerHTML=`
    <div class="book-card-cover" style="background: ${t}"></div>
    <div class="book-card-body">
      <span class="book-card-level ${b(e.level)}">${b(e.level)}</span>
      <h3 class="book-card-title">${b(e.title)}</h3>
      <p class="book-card-author">by ${b(e.author)}</p>
      ${e.description?`<p class="book-card-description">${b(e.description)}</p>`:""}
    </div>
    <div class="book-card-footer"></div>
  `;const r=i.querySelector(".book-card-footer");return x(r,e,s),i}function x(e,n,s){if(s)if(s.subscriptionStatus!=="paid"){const t=y("Download Book");t.addEventListener("click",()=>{e.innerHTML="";const i=document.createElement("a");i.href="#/account",i.className="upgrade-btn",i.textContent="Upgrade to download this book",e.appendChild(i)}),e.appendChild(t)}else{const t=y("Download Book");t.addEventListener("click",async()=>{t.textContent="Downloading…",t.disabled=!0;try{await M(n.id)}catch(i){console.error("Download error:",i),t.textContent="Download failed",setTimeout(()=>{t.textContent="Download Book",t.disabled=!1},2e3);return}t.textContent="Download Book",t.disabled=!1}),e.appendChild(t)}else{const t=y("Download Book");t.addEventListener("click",()=>{window.location.hash="#/login"}),e.appendChild(t)}}function y(e){const n=document.createElement("button");return n.className="download-btn",n.textContent=e,n}function b(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function j(e,n){e.innerHTML=`
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
  `;let s="all",t=[],i=null;const r=e.querySelectorAll(".filter-btn");r.forEach(a=>{a.addEventListener("click",()=>{r.forEach(o=>o.classList.remove("active")),a.classList.add("active"),s=a.dataset.level,t.length>0&&E()})});function c(){return document.getElementById("content-grid")}function u(){return document.getElementById("breadcrumb")}function f(a="Loading…"){c().innerHTML=`<p class="loading">${a}</p>`}function p(a){c().innerHTML=`<p class="error-message">${a}</p>`}async function m(){u().innerHTML="",t=[],i=null,f("Loading fields…");try{const a=await H();if(c().innerHTML="",a.length===0){c().innerHTML='<p class="empty-state">No fields available yet.</p>';return}a.forEach(o=>{const l=S(o.name),d=B(o,l,()=>C(o,l));c().appendChild(d)})}catch{p("Failed to load fields. Please refresh the page.")}}async function C(a,o){f();try{const l=await F(a.id);l.length>0?w(a,l,o):await L(a,null,o)}catch{p("Failed to load content. Please try again.")}}function w(a,o,l){t=[],i=null,u().innerHTML=`
      <button class="breadcrumb-link" id="bc-fields">All Fields</button>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">${h(a.name)}</span>
    `,document.getElementById("bc-fields").addEventListener("click",m),c().innerHTML="",o.forEach(d=>{const k=B(d,l,()=>L(d,a,l));c().appendChild(k)})}async function L(a,o,l){i=l,f("Loading books…");try{t=await T(a.id);const d=u();o?(d.innerHTML=`
          <button class="breadcrumb-link" id="bc-fields">All Fields</button>
          <span class="breadcrumb-sep">›</span>
          <button class="breadcrumb-link" id="bc-parent">${h(o.name)}</button>
          <span class="breadcrumb-sep">›</span>
          <span class="breadcrumb-current">${h(a.name)}</span>
        `,document.getElementById("bc-fields").addEventListener("click",m),document.getElementById("bc-parent").addEventListener("click",async()=>{f();try{const k=await F(o.id);w(o,k,l)}catch{p("Failed to load subfields.")}})):(d.innerHTML=`
          <button class="breadcrumb-link" id="bc-fields">All Fields</button>
          <span class="breadcrumb-sep">›</span>
          <span class="breadcrumb-current">${h(a.name)}</span>
        `,document.getElementById("bc-fields").addEventListener("click",m)),E()}catch{p("Failed to load books. Please try again.")}}function E(){const a=s==="all"?t:t.filter(o=>o.level===s);if(c().innerHTML="",a.length===0){c().innerHTML='<p class="empty-state">No books found for this filter.</p>';return}a.forEach(o=>{const l=A(o,i,n);c().appendChild(l)})}await m()}function h(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}export{j as renderLibrary};
