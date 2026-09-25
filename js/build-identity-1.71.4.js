/* One public build identity. Older lesson scripts retain their historical version metadata. */
(function () {
  'use strict';
  const version = '1.71.4';
  const label = 'BUILD ' + version;
  const title = 'Project Watch ' + version;
  window.PW_BUILD_IDENTITY = Object.freeze({version, label});
  try {
    Object.defineProperty(window, 'PROJECT_WATCH_BUILD', {
      configurable: false, enumerable: true,
      get: () => version,
      set: () => {} // Historical module callbacks may still assign their own version.
    });
  } catch (_) { window.PROJECT_WATCH_BUILD = version; }

  let syncing = false;
  function sync() {
    if (syncing) return;
    syncing = true;
    try {
      const header = document.getElementById('pwVisibleBuild');
      if (header && header.textContent !== label) header.textContent = label;
      const page = document.getElementById('cevniPage');
      if (page) {
        if (page.dataset.pwBuild !== version) page.dataset.pwBuild = version;
        page.querySelectorAll('.pwBuild,.build').forEach(node => {
          if (/\bBUILD\s+1\./i.test(node.textContent || '') && node.textContent !== label) node.textContent = label;
        });
      }
      if (document.title !== title) document.title = title;
    } finally { syncing = false; }
  }
  const header = document.getElementById('pwVisibleBuild');
  if (header) new MutationObserver(sync).observe(header, {childList:true,characterData:true,subtree:true});
  const titleNode = document.querySelector('title');
  if (titleNode) new MutationObserver(sync).observe(titleNode, {childList:true,characterData:true,subtree:true});
  const page = document.getElementById('cevniPage');
  if (page) new MutationObserver(sync).observe(page, {childList:true,characterData:true,subtree:true,attributes:true,attributeFilter:['data-pw-build']});
  document.addEventListener('DOMContentLoaded', sync);
  window.addEventListener('pageshow', sync);
  sync();
  document.documentElement.classList.add('pw-build-ready');
})();
