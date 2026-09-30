(function () {
  'use strict';
  const keys = Object.freeze([
    'projectWatchVesselProfileV2', 'projectWatchVesselSetupSeenV2',
    'projectWatchCustomVesselV1', 'projectWatchOperationalStateV1', 'projectWatchCustomHeroFrameV1',
    'projectWatchCourseProgressV1', 'projectWatchAisTasksV1', 'pwAisStage8Reviewed',
    'pwCevniDone', 'pwCevniProgressV2', 'pwCevniMock177',
    'pw-safety-awareness-reviewed-v1', 'pw-tides-reviewed-v1', 'pw-boat-systems-reviewed-v1',
    'pw-compass-reviewed-v1', 'pw-chartwork-reviewed-v1', 'pw-passage-reviewed-v1',
    'pw-passage-plan-v1', 'pw-passage-log-v1', 'pw-diesel-reviewed-v1'
  ]);
  const storage = window.localStorage, proto = Storage.prototype;
  const nativeGet = proto.getItem, nativeSet = proto.setItem, nativeRemove = proto.removeItem;
  const get = k => nativeGet.call(storage, k);
  const set = (k, v) => nativeSet.call(storage, k, String(v));
  const remove = k => nativeRemove.call(storage, k);
  const activeKey = 'pw-account-active-v1';
  let scope = null;
  const enabled = window.PW_ACCOUNT_CONFIG?.enabled === true;
  const validId = id => typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id);
  if (enabled) { const id = get(activeKey); if (validId(id)) scope = id; }
  const prefix = id => 'pw-account:' + id + ':';
  const mapped = k => scope && keys.includes(String(k)) ? prefix(scope) + k : String(k);
  function mark(k, value) {
    if (!scope || !keys.includes(String(k))) return;
    const journalKey = prefix(scope) + 'pending';
    const journal = JSON.parse(get(journalKey) || '{}');
    journal[k] = { value, revision: Date.now() + ':' + Math.random() };
    set(journalKey, JSON.stringify(journal));
    window.dispatchEvent(new Event('pw-account-dirty'));
  }
  if (enabled) {
    proto.getItem = function (k) { return nativeGet.call(this, this === storage ? mapped(k) : k); };
    proto.setItem = function (k, v) {
      nativeSet.call(this, this === storage ? mapped(k) : k, v);
      if (this === storage) mark(String(k), String(v));
    };
    proto.removeItem = function (k) {
      nativeRemove.call(this, this === storage ? mapped(k) : k);
      if (this === storage) mark(String(k), null);
    };
  }
  window.PWAccountStore = {
    keys, activeKey, getRaw: get,
    userId: () => scope,
    activate(id) {
      if (!enabled || !validId(id)) throw new Error('Invalid account identifier');
      scope = id; set(activeKey, id);
    },
    deactivate() { remove(activeKey); scope = null; },
    pending() { return scope ? JSON.parse(get(prefix(scope) + 'pending') || '{}') : {}; },
    acknowledge(batch) {
      const pending = this.pending();
      for (const [k, v] of Object.entries(batch)) if (pending[k]?.revision === v.revision) delete pending[k];
      set(prefix(scope) + 'pending', JSON.stringify(pending));
    },
    hydrate(rows) {
      if (!scope) throw new Error('Sign in first');
      const pending = this.pending();
      // Server values replace local caches, except unsent changes from this device.
      const remote = new Map(rows.map(row => [row.state_key, row.value]));
      for (const k of keys) {
        if (Object.hasOwn(pending, k)) continue;
        const value = remote.get(k);
        if (typeof value === 'string') set(prefix(scope) + k, value);
        else remove(prefix(scope) + k);
      }
    },
    hasLegacy() { return keys.some(k => get(k) !== null); },
    importLegacy() {
      if (!scope) throw new Error('Sign in first');
      for (const k of keys) {
        const value = get(k);
        // Import only missing keys; never overwrite existing account progress.
        if (value !== null && get(prefix(scope) + k) === null) storage.setItem(k, value);
      }
    }
  };
  const page = location.pathname.split('/').pop();
  if (enabled && page !== 'accounts.html' && page !== 'account-admin.html') {
    document.documentElement.classList.add('pw-account-checking');
    if (!scope) location.replace(new URL('accounts.html', location.href).href);
    window.addEventListener('storage', e => {
      if (e.key === activeKey && e.newValue !== scope) location.replace(new URL('accounts.html', location.href).href);
    });
  }
})();
