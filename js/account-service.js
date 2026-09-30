(function () {
  'use strict';
  const config = window.PW_ACCOUNT_CONFIG || {};
  const configured = config.enabled === true && /^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(config.supabaseUrl || '') && Boolean(config.publishableKey);
  const client = configured ? window.supabase.createClient(config.supabaseUrl, config.publishableKey, { auth: { storageKey: 'pw-auth-v1', detectSessionInUrl: true, persistSession: true, autoRefreshToken: true } }) : null;
  let flushing = null;
  function check(error) { if (error) throw error; }
  async function flush() {
    if (!client || !PWAccountStore.userId()) return;
    if (flushing) return flushing;
    const batch = PWAccountStore.pending();
    if (!Object.keys(batch).length) return;
    const uid = PWAccountStore.userId();
    flushing = (async () => {
      const { data, error } = await client.auth.getSession(); check(error);
      if (data.session?.user.id !== uid) throw new Error('Please log in again before saving.');
      const changes = Object.entries(batch).map(([state_key, entry]) => ({ state_key, value: entry.value }));
      const result = await client.rpc('pw_save_state', { changes }); check(result.error);
      // Do not acknowledge a different account's journal after a tab/account switch.
      if (PWAccountStore.userId() === uid) PWAccountStore.acknowledge(batch);
    })().finally(() => { flushing = null; });
    return flushing;
  }
  async function prepare(user) {
    PWAccountStore.activate(user.id);
    const { data, error } = await client.from('pw_account_state').select('state_key,value').eq('user_id', user.id);
    check(error); PWAccountStore.hydrate(data || []);
    await flush();
  }
  async function signOut() {
    // A failed sync must never prevent someone logging out of a shared device.
    // The per-user journal remains available when that account signs back in.
    try { await flush(); } catch (_) {}
    try { await client.auth.signOut({ scope: 'local' }); }
    finally {
      localStorage.removeItem('pw-auth-v1');
      PWAccountStore.deactivate();
    }
  }
  window.PWAccounts = { configured, client, prepare, flush, signOut, check };
})();
