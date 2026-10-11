(() => {
  const checks = [...document.querySelectorAll('[data-buy-check]')];
  const progress = document.getElementById('buy-progress');
  const key = 'helmlore-first-boat-checklist-v1';
  let storageAvailable = true;
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    if (Array.isArray(saved)) checks.forEach(c => { c.checked = saved.includes(c.dataset.buyCheck); });
  } catch { storageAvailable = false; }
  function update(save) {
    const done = checks.filter(c => c.checked).map(c => c.dataset.buyCheck);
    if (save) try { localStorage.setItem(key, JSON.stringify(done)); } catch { storageAvailable = false; }
    progress.textContent = `${done.length} of ${checks.length} reminders ticked. ` + (storageAvailable ? 'Saved on this browser only.' : 'Saving is unavailable; ticks last for this visit.');
  }
  checks.forEach(c => c.addEventListener('change', () => update(true)));
  document.getElementById('buy-reset').addEventListener('click', () => { checks.forEach(c => { c.checked = false; }); update(true); });
  document.getElementById('buy-print').addEventListener('click', () => window.print());
  update(false);
})();
