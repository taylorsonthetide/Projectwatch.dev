(function () {
 'use strict';
 if (window.helmloreHandbookTracking || navigator.webdriver || /bot|crawler|spider|headless/i.test(navigator.userAgent)) return;
 if (!['helmlore.com','www.helmlore.com','helmlore.co.uk','www.helmlore.co.uk','taylorsonthetide.github.io'].includes(location.hostname)) return;
 const links = document.querySelectorAll('#handbookPayhipLink, [data-handbook-payhip]');
 if (!links.length) return;
 window.helmloreHandbookTracking = true;
 function record(event) {
  if (event.defaultPrevented || (event.type === 'auxclick' && event.button !== 1)) return;
  const endpoint = event.currentTarget.dataset.handbookPayhip === 'sales-page' ? 'helmlore_record_handbook_page_click' : 'helmlore_record_handbook_click';
  try {
   fetch('https://rpgjtxdxqcdxwcwmhqfl.supabase.co/rest/v1/rpc/' + endpoint, {
    method:'POST', credentials:'omit', keepalive:true,
    headers:{'Content-Type':'application/json',apikey:'sb_publishable_gupuY4sO_SvPJl5dE7A5cw_Ytx5SkHL'},
    body:'{}'
   }).catch(function () {});
  } catch (_) {} // Never interfere with opening Payhip.
 }
 for (const link of links) {
  link.addEventListener('click', record);
  link.addEventListener('auxclick', record);
 }
})();
