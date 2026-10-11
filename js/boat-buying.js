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
(() => {
  const region = document.getElementById('buy-region');
  if (!region) return;
  const service = document.getElementById('buy-service');
  const search = document.getElementById('buy-contact-search');
  const cards = [...document.querySelectorAll('[data-contact-region]')];
  const count = document.getElementById('buy-contact-count');
  function filter() {
    const term = search.value.trim().toLowerCase();
    let shown = 0;
    for (const card of cards) {
      const visible = (region.value === 'all' || card.dataset.contactRegion === region.value)
        && (service.value === 'all' || card.dataset.contactType === service.value)
        && (!term || card.dataset.contactSearch.includes(term));
      card.hidden = !visible;
      if (visible) shown++;
    }
    count.textContent = `${shown} ${shown === 1 ? 'contact' : 'contacts'} shown. Select the boat’s area to narrow the list.`;
    document.getElementById('buy-contact-empty').hidden = shown !== 0;
  }
  region.addEventListener('change', filter);
  service.addEventListener('change', filter);
  search.addEventListener('input', filter);
  filter();
})();
