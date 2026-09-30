const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
const script = fs.readFileSync(require('node:path').join(__dirname,'../js/account-storage.js'),'utf8');
function environment(enabled=true, existing={}) {
  class Storage { constructor(data={}) { this.data={...data}; } getItem(k){return this.data[k]??null} setItem(k,v){this.data[k]=String(v)} removeItem(k){delete this.data[k]} }
  const localStorage=new Storage(existing), sessionStorage=new Storage();
  const window={localStorage,PW_ACCOUNT_CONFIG:{enabled},dispatchEvent(){},addEventListener(){}};
  const ctx={window,Storage,location:{pathname:'/accounts.html'},Event:class{},document:{documentElement:{classList:{add(){}}}}};
  vm.runInNewContext(script,ctx); return {store:window.PWAccountStore,localStorage,sessionStorage};
}
const A='11111111-1111-1111-1111-111111111111',B='22222222-2222-2222-2222-222222222222';
const env=environment(true,{'pwCevniDone':'[0,1]','projectWatchVesselProfileV2':'{"id":"watch1"}'}),{store,localStorage,sessionStorage}=env;
store.activate(A); assert.equal(localStorage.getItem('pwCevniDone'),null); assert(store.hasLegacy());
store.importLegacy(); assert.equal(localStorage.getItem('pwCevniDone'),'[0,1]');
localStorage.setItem('pwCevniDone','[0,1,2]'); const old=store.pending();
localStorage.setItem('pwCevniDone','[0,1,2,3]'); store.acknowledge(old); assert.equal(store.pending().pwCevniDone.value,'[0,1,2,3]');
store.hydrate([{state_key:'pwCevniDone',value:'[8]'}]); assert.equal(localStorage.getItem('pwCevniDone'),'[0,1,2,3]');
store.acknowledge(store.pending()); store.hydrate([{state_key:'pwCevniDone',value:'[8]'}]); assert.equal(localStorage.getItem('pwCevniDone'),'[8]');
store.importLegacy(); assert.equal(localStorage.getItem('pwCevniDone'),'[8]');
store.activate(B); assert.equal(localStorage.getItem('pwCevniDone'),null); localStorage.setItem('pwCevniDone','[5]');
sessionStorage.setItem('pwCevniDone','session'); assert.equal(sessionStorage.getItem('pwCevniDone'),'session');
store.activate(A); assert.equal(localStorage.getItem('pwCevniDone'),'[8]');
localStorage.removeItem('pwCevniDone'); assert.equal(store.pending().pwCevniDone.value,null);
localStorage.setItem('pw-auth-v1','TOKEN'); assert(!Object.hasOwn(store.pending(),'pw-auth-v1'));
const reload=environment(true,localStorage.data); assert.equal(reload.store.userId(),A); assert.equal(reload.store.pending().pwCevniDone.value,null);
store.deactivate(); assert.equal(localStorage.getItem('pwCevniDone'),'[0,1]');
const disabled=environment(false,{'pwCevniDone':'[0]'}); disabled.localStorage.setItem('pwCevniDone','[0,1]'); assert.equal(disabled.localStorage.data.pwCevniDone,'[0,1]');
console.log('PASS: user isolation, guest preservation, explicit non-overwriting import, durable journal/reload, pending-write acknowledgement, deletion sync, auth/session exclusion and disabled-mode compatibility.');
