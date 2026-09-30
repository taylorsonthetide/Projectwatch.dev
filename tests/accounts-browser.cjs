const {chromium}=require('playwright'), fs=require('node:fs'), http=require('node:http'), path=require('node:path'), assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
const A='11111111-1111-1111-1111-111111111111';
(async()=>{
 const server=http.createServer((req,res)=>{const file=path.join(root,new URL(req.url,'http://localhost').pathname); if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end()} fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);res.end();return}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':file.endsWith('.svg')?'image/svg+xml':file.endsWith('.png')?'image/png':file.endsWith('.jpg')?'image/jpeg':'text/html');res.end(data)})});
 await new Promise(r=>server.listen(0,'127.0.0.1',r)); const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,executablePath:process.env.PW_CHROMIUM_PATH||undefined,args:['--no-sandbox']});
 try {
  const page=await browser.newPage(); const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/accounts.html'); await page.waitForSelector('#accountStatus');
  assert((await page.locator('#accountStatus').innerText()).includes('not connected'));
  assert(await page.locator('#accountSubmit').isDisabled());
  await page.setViewportSize({width:390,height:844});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await page.screenshot({path:path.join(root,'preview/accounts-mobile.png'),fullPage:true});
  await page.setViewportSize({width:1440,height:1000}); await page.screenshot({path:path.join(root,'preview/accounts-desktop.png'),fullPage:true});
  await page.goto(base+'/index.html'); await page.waitForTimeout(1200);
  assert(await page.locator('#vesselSetupModal.show').count());
  assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('pw-account-checking')),false);
  // Mock the external service, while exercising real account page/storage code.
  await page.route('**/js/account-config.js',r=>r.fulfill({contentType:'text/javascript',body:"window.PW_ACCOUNT_CONFIG={enabled:true,supabaseUrl:'https://test.supabase.co',publishableKey:'public-test'}"}));
  await page.route('**/js/vendor/supabase-2.102.0.js',r=>r.fulfill({contentType:'text/javascript',body:`
    let current=null,callback;window.calls=[];window.failSync=false;
    const user={id:'${A}',email:'cliff@example.test'};
    const client={auth:{onAuthStateChange(fn){callback=fn},async getUser(){if(location.hash==='#recovery'){current=user;callback('PASSWORD_RECOVERY')}return {data:{user:current},error:current?null:{name:'AuthSessionMissingError'}}},async getSession(){return {data:{session:current?{user:current}:null}}},async signInWithPassword(v){calls.push(['login',v.email]);if(v.password==='wrong')return {error:{message:'Invalid login credentials'}};current=user;return {data:{user,session:{user}}}},async signUp(v){calls.push(['signup',v.email]);return {data:{user,session:null}}},async resetPasswordForEmail(email,options){calls.push(['reset',email,options.redirectTo]);return {}},async updateUser(v){calls.push(['update']);return {data:{user:current}}},async signOut(){current=null;return {}}},from(){return {select(){return {eq:async()=>({data:[]})}}}},async rpc(name,options){calls.push([name,options]);if(name==='pw_save_state'&&failSync)return {error:{message:'offline'}};if(name==='pw_is_owner')return {data:false};if(name==='pw_owner_dashboard')return {error:{message:'Owner access required'}};return {data:null}}};window.supabase={createClient:()=>client};` }));
  await page.goto(base+'/accounts.html');await page.waitForSelector('#accountSubmit:not(:disabled)');
  await page.click('#signupTab');await page.fill('#accountEmail','cliff@example.test');await page.fill('#accountPassword','long-password-for-tests');await page.click('#accountSubmit');await page.waitForFunction(()=>document.getElementById('accountStatus').textContent.includes('confirmation'));
  await page.click('#loginTab');await page.fill('#accountPassword','wrong');await page.click('#accountSubmit');await page.waitForFunction(()=>document.getElementById('accountStatus').textContent.includes('Invalid login'));
  await page.click('#forgotPassword');await page.click('#accountSubmit');await page.waitForFunction(()=>document.getElementById('accountStatus').textContent.includes('reset link will'));
  await page.click('#backToLogin');await page.fill('#accountPassword','long-password-for-tests');await page.click('#accountSubmit');await page.waitForSelector('#profilePanel:not([hidden])');
  assert.equal(await page.locator('#profileEmail').innerText(),'cliff@example.test');assert(await page.locator('#adminLink').isHidden());
  await page.evaluate(()=>{localStorage.setItem('pwCevniDone','[0,1]'); window.failSync=true});
  await page.click('#signOut');await page.waitForFunction(()=>localStorage.getItem('pw-account-active-v1')===null);
  assert(await page.evaluate(id=>Boolean(PWAccountStore.getRaw('pw-account:'+id+':pending')),A));
  await page.goto('about:blank');await page.goto(base+'/accounts.html#recovery');await page.waitForFunction(()=>document.getElementById('formTitle').textContent==='Choose a new password');
  await page.fill('#accountPassword','a-new-secure-password');await page.click('#accountSubmit');await page.waitForFunction(()=>document.getElementById('accountStatus').textContent.includes('Password updated'));
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PASS: desktop/mobile preview, unchanged vessel welcome, signup confirmation, login errors/success, reset email/recovery callback, owner link protection and offline logout with preserved pending progress.');
 } finally {await browser.close();await new Promise(r=>server.close(r));}
})().catch(error=>{console.error(error);process.exit(1)});
