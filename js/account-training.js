(async function () {
  'use strict';
  const service = window.PWAccounts;
  if (!window.PW_ACCOUNT_CONFIG.enabled) return;
  const login = new URL('accounts.html', location.href).href;
  if (!service.configured) { location.replace(login); return; }
  try {
    const { data, error } = await service.client.auth.getUser();
    if (error || !data.user || data.user.id !== PWAccountStore.userId()) { location.replace(login); return; }
    const bar = document.createElement('nav'); bar.className = 'account-bar'; bar.setAttribute('aria-label', 'Account');
    const email = document.createElement('span'); email.textContent = data.user.email;
    const saved = document.createElement('span'); saved.textContent = 'Checking saved progress…';
    const account = document.createElement('a'); account.href = login; account.textContent = 'My account / log out';
    bar.append(email, saved, account); document.body.prepend(bar);
    document.documentElement.classList.remove('pw-account-checking');
    async function sync() {
      try { await service.flush(); saved.textContent = Object.keys(PWAccountStore.pending()).length ? 'Saving progress…' : 'Progress saved'; }
      catch (_) { saved.textContent = 'Saved on this device · sync pending'; }
    }
    let timer;
    window.addEventListener('pw-account-dirty', () => { saved.textContent = 'Saving progress…'; clearTimeout(timer); timer = setTimeout(sync, 700); });
    window.addEventListener('online', sync);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') sync(); });
    service.client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || (session && session.user.id !== PWAccountStore.userId())) location.replace(login);
    });
    setInterval(sync, 15000);
    service.client.rpc('pw_touch_account').then(() => {});
    setInterval(() => service.client.rpc('pw_touch_account').then(() => {}), 300000);
    await sync();
  } catch (_) { location.replace(login); }
})();
