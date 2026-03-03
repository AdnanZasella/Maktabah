const h="",v={credentials:"include"};async function C(){const e=await fetch(`${h}/api/fields`,v);if(!e.ok)throw new Error("Failed to fetch fields");return e.json()}async function F(e){const n=await fetch(`${h}/api/fields/${e}/subfields`,v);if(!n.ok)throw new Error("Failed to fetch subfields");return n.json()}async function H(e,n=null){let s=`${h}/api/books?fieldId=${e}`;n&&n!=="all"&&(s+=`&level=${encodeURIComponent(n)}`);const t=await fetch(s,v);if(!t.ok)throw new Error("Failed to fetch books");return t.json()}async function T(e){const n=await fetch(`${h}/api/books/${e}/download`,v);if(!n.ok)throw new Error("Download failed");const s=await n.blob(),t=n.headers.get("Content-Disposition");let c="book.pdf";if(t){const u=t.match(/filename="([^"]+)"/);u&&(c=u[1])}const i=URL.createObjectURL(s),l=document.createElement("a");l.href=i,l.download=c,document.body.appendChild(l),l.click(),l.remove(),URL.revokeObjectURL(i)}const D={Aqeedah:{accent:"#10B981",bg:"#ECFDF5"},Fiqh:{accent:"#3B82F6",bg:"#EFF6FF"},Hadith:{accent:"#F59E0B",bg:"#FFFBEB"},Seerah:{accent:"#8B5CF6",bg:"#F5F3FF"}},I={accent:"#6B7280",bg:"#F9FAFB"};function M(e){return D[e]||I}function B(e,n,s){const t=document.createElement("div");t.className="field-card",t.setAttribute("role","button"),t.setAttribute("tabindex","0");const i=e.parentFieldId!==null&&e.parentFieldId!==void 0?"Browse books":"Browse subfields";return t.innerHTML=`
    <div class="field-card-accent" style="background: ${n.accent}"></div>
    <div class="field-card-body">
      <div class="field-card-name">${S(e.name)}</div>
      <div class="field-card-hint">${i} →</div>
    </div>
  `,t.addEventListener("click",s),t.addEventListener("keydown",l=>{(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),s())}),t}function S(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function A(e,n,s){const t=(n==null?void 0:n.accent)||"#6B7280",c=document.createElement("div");c.className="book-card",c.innerHTML=`
    <div class="book-card-cover" style="background: ${t}"></div>
    <div class="book-card-body">
      <span class="book-card-level ${b(e.level)}">${b(e.level)}</span>
      <h3 class="book-card-title">${b(e.title)}</h3>
      <p class="book-card-author">by ${b(e.author)}</p>
      ${e.description?`<p class="book-card-description">${b(e.description)}</p>`:""}
    </div>
    <div class="book-card-footer"></div>
  `;const i=c.querySelector(".book-card-footer");return x(i,e,s),c}function x(e,n,s){if(s)if(s.subscriptionStatus!=="paid"){const t=L("Download Book");t.addEventListener("click",()=>{e.innerHTML="";const c=document.createElement("a");c.href="#/account",c.className="upgrade-btn",c.textContent="Upgrade to download this book",e.appendChild(c)}),e.appendChild(t)}else{const t=L("Download Book");t.addEventListener("click",async()=>{t.textContent="Downloading…",t.disabled=!0;try{await T(n.id)}catch(c){console.error("Download error:",c),t.textContent="Download failed",setTimeout(()=>{t.textContent="Download Book",t.disabled=!1},2e3);return}t.textContent="Download Book",t.disabled=!1}),e.appendChild(t)}else{const t=L("Download Book");t.addEventListener("click",()=>{window.location.hash="#/login"}),e.appendChild(t)}}function L(e){const n=document.createElement("button");return n.className="download-btn",n.textContent=e,n}function b(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}async function q(e,n){e.innerHTML=`
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
  `;let s="all",t=[],c=null;const i=e.querySelectorAll(".filter-btn");i.forEach(a=>{a.addEventListener("click",()=>{i.forEach(o=>o.classList.remove("active")),a.classList.add("active"),s=a.dataset.level,t.length>0&&E()})});function l(){return document.getElementById("content-grid")}function u(){return document.getElementById("breadcrumb")}function f(a="Loading…"){l().innerHTML=`<p class="loading">${a}</p>`}function p(a){l().innerHTML=`<p class="error-message">${a}</p>`}async function m(){u().innerHTML="",t=[],c=null,f("Loading fields…");try{const a=await C();if(l().innerHTML="",a.length===0){l().innerHTML='<p class="empty-state">No fields available yet.</p>';return}a.forEach(o=>{const r=M(o.name),d=B(o,r,()=>$(o,r));l().appendChild(d)})}catch{p("Failed to load fields. Please refresh the page.")}}async function $(a,o){f();try{const r=await F(a.id);r.length>0?w(a,r,o):await y(a,null,o)}catch{p("Failed to load content. Please try again.")}}function w(a,o,r){t=[],c=null,u().innerHTML=`
      <button class="breadcrumb-link" id="bc-fields">All Fields</button>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-current">${g(a.name)}</span>
    `,document.getElementById("bc-fields").addEventListener("click",m),l().innerHTML="",o.forEach(d=>{const k=B(d,r,()=>y(d,a,r));l().appendChild(k)})}async function y(a,o,r){c=r,f("Loading books…");try{t=await H(a.id);const d=u();o?(d.innerHTML=`
          <button class="breadcrumb-link" id="bc-fields">All Fields</button>
          <span class="breadcrumb-sep">›</span>
          <button class="breadcrumb-link" id="bc-parent">${g(o.name)}</button>
          <span class="breadcrumb-sep">›</span>
          <span class="breadcrumb-current">${g(a.name)}</span>
        `,document.getElementById("bc-fields").addEventListener("click",m),document.getElementById("bc-parent").addEventListener("click",async()=>{f();try{const k=await F(o.id);w(o,k,r)}catch{p("Failed to load subfields.")}})):(d.innerHTML=`
          <button class="breadcrumb-link" id="bc-fields">All Fields</button>
          <span class="breadcrumb-sep">›</span>
          <span class="breadcrumb-current">${g(a.name)}</span>
        `,document.getElementById("bc-fields").addEventListener("click",m)),E()}catch{p("Failed to load books. Please try again.")}}function E(){const a=s==="all"?t:t.filter(o=>o.level===s);if(l().innerHTML="",a.length===0){l().innerHTML='<p class="empty-state">No books found for this filter.</p>';return}a.forEach(o=>{const r=A(o,c,n);l().appendChild(r)})}await m()}function g(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}export{q as renderLibrary};
