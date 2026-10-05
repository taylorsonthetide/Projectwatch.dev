(function () {
 'use strict';
 if (window.helmloreViewSent || navigator.webdriver || /bot|crawler|spider|headless/i.test(navigator.userAgent)) return;
 const allowed = ['helmlore.com','www.helmlore.com','helmlore.co.uk','www.helmlore.co.uk','taylorsonthetide.github.io'];
 if (!allowed.includes(location.hostname)) return;
 let page = location.pathname.replace(/^\/Projectwatch\.dev\//, '/');
 if (page === '/') page = '/index.html';
 if (page === '/account-admin.html') return;
 window.helmloreViewSent = true;
 // A single view per document load, no cookies, visitor IDs, query strings or fragments.
 function send() {
  if (document.visibilityState === 'hidden') return;
  document.removeEventListener('visibilitychange',send);
  fetch('https://rpgjtxdxqcdxwcwmhqfl.supabase.co/rest/v1/rpc/helmlore_record_view', {
   method:'POST', credentials:'omit', keepalive:true,
   headers:{'Content-Type':'application/json',apikey:'sb_publishable_gupuY4sO_SvPJl5dE7A5cw_Ytx5SkHL'},
   body:JSON.stringify({page_path:page})
  }).catch(function () {}); // Analytics must never interrupt training or login.
 }
 if (document.visibilityState === 'hidden') document.addEventListener('visibilitychange',send); else send();
})();
