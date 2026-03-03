(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))u(r);new MutationObserver(r=>{for(const t of r)if(t.type==="childList")for(const n of t.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&u(n)}).observe(document,{childList:!0,subtree:!0});function a(r){const t={};return r.integrity&&(t.integrity=r.integrity),r.referrerPolicy&&(t.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?t.credentials="include":r.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function u(r){if(r.ep)return;r.ep=!0;const t=a(r);fetch(r.href,t)}})();const y="modulepreload",b=function(e){return"/"+e},h={},l=function(i,a,u){let r=Promise.resolve();if(a&&a.length>0){document.getElementsByTagName("link");const n=document.querySelector("meta[property=csp-nonce]"),o=(n==null?void 0:n.nonce)||(n==null?void 0:n.getAttribute("nonce"));r=Promise.allSettled(a.map(s=>{if(s=b(s),s in h)return;h[s]=!0;const d=s.endsWith(".css"),v=d?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${s}"]${v}`))return;const c=document.createElement("link");if(c.rel=d?"stylesheet":y,d||(c.as="script"),c.crossOrigin="",c.href=s,o&&c.setAttribute("nonce",o),document.head.appendChild(c),d)return new Promise((_,g)=>{c.addEventListener("load",_),c.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${s}`)))})}))}function t(n){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=n,window.dispatchEvent(o),!o.defaultPrevented)throw n}return r.then(n=>{for(const o of n||[])o.status==="rejected"&&t(o.reason);return i().catch(t)})};function L(e,i){const a=document.createElement("nav");a.className="navbar";const r=[{href:"#/library",label:"Library",route:"/library"},{href:"#/roadmap",label:"Roadmap",route:"/roadmap"},{href:"#/fiqhtool",label:"Fiqh Tool",route:"/fiqhtool"}].map(({href:n,label:o,route:s})=>`<a href="${n}" class="nav-link${e===s?" active":""}">${o}</a>`).join(""),t=i?`<a href="#/account" class="nav-link${e==="/account"?" active":""}">Account</a>`:`<a href="#/login"   class="nav-link nav-link-cta${e==="/login"?" active":""}">Login</a>`;return a.innerHTML=`
    <div class="navbar-inner">
      <a href="#/library" class="navbar-logo">
        <span class="logo-text">Maktabah</span>
        <span class="logo-arabic">مكتبة</span>
      </a>
      <div class="navbar-links">
        ${r}
      </div>
      <div class="navbar-auth">
        ${t}
      </div>
    </div>
  `,a}let f=null,m=!1;async function E(){if(m)return f;try{const e=await fetch("/api/auth/me",{credentials:"include"});f=e.ok?await e.json():null}catch{f=null}return m=!0,f}const P={"/":()=>l(()=>import("./library-BLfrOFkk.js"),[]).then(e=>e.renderLibrary),"/library":()=>l(()=>import("./library-BLfrOFkk.js"),[]).then(e=>e.renderLibrary),"/roadmap":()=>l(()=>import("./roadmap-DBVR0moM.js"),[]).then(e=>e.renderRoadmap),"/fiqhtool":()=>l(()=>import("./fiqhtool-CX_2OXxR.js"),[]).then(e=>e.renderFiqhTool),"/login":()=>l(()=>import("./login-9E8VOm15.js"),[]).then(e=>e.renderLogin),"/register":()=>l(()=>import("./register-DsPcMPMV.js"),[]).then(e=>e.renderRegister),"/account":()=>l(()=>import("./account-DGqLyfp_.js"),[]).then(e=>e.renderAccount)};function w(){const e=window.location.hash;return!e||e==="#"||e==="#/"?"/":e.slice(1)}async function p(){const e=w(),i=document.getElementById("app"),a=await E();i.innerHTML="";const r=L(e==="/"?"/library":e,a);i.appendChild(r);const t=document.createElement("main");t.className="page-content",i.appendChild(t);const n=P[e];if(!n){t.innerHTML=`
      <div class="error-page">
        <h2>Page not found</h2>
        <a href="#/library">Go to Library</a>
      </div>
    `;return}try{await(await n())(t,a)}catch(o){console.error("Page render error:",o),t.innerHTML=`
      <div class="error-page">
        <h2>Something went wrong</h2>
        <a href="#/library">Go to Library</a>
      </div>
    `}}window.addEventListener("hashchange",p);p();
