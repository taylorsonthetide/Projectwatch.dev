/* Render a partner handoff only after a practice pass and explicit partner activation. */
(function () {
  'use strict';
  window.PW_CEVNI_SHOW_REFERRAL = function (passed) {
    const slot = document.getElementById('cevniReferral');
    if (!slot) return;
    slot.replaceChildren();
    slot.hidden = true;
    const config = window.PW_CEVNI_REFERRAL;
    if (!passed || !config || config.enabled !== true || !config.partnerName || !config.bookingUrl) return;
    let url;
    try { url = new URL(config.bookingUrl); } catch (_) { return; }
    if (url.protocol !== 'https:' || url.username || url.password) return;
    const heading = document.createElement('h2');
    heading.textContent = 'Continue with ' + config.partnerName;
    const details = document.createElement('p');
    details.textContent = config.description;
    const link = document.createElement('a');
    link.href = url.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = config.buttonLabel;
    slot.append(heading, details, link);
    slot.hidden = false;
  };
})();
