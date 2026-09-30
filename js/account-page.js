(async function () {
  'use strict';
  const $ = id => document.getElementById(id), service = window.PWAccounts;
  let mode = 'login', busy = false, recovery = false;
  function status(message, error = false) { $('accountStatus').textContent = message; $('accountStatus').classList.toggle('error', error); }
  function setBusy(value) { busy = value; document.querySelectorAll('button').forEach(b => { b.disabled = value || (!service.configured && ['accountSubmit','signOut','importProgress'].includes(b.id)); }); }
  function switchMode(next) {
    mode = next; $('accountPassword').value = '';
    const signup = mode === 'signup', reset = mode === 'reset', update = mode === 'update';
    $('nameLabel').hidden = !signup; $('emailLabel').hidden = update;
    $('accountEmail').required = !update;
    $('passwordLabel').hidden = reset; $('accountPassword').required = !reset;
    // Existing passwords should not be rejected by a new signup policy.
    $('accountPassword').minLength = signup || update ? 12 : 1;
    $('accountPassword').autocomplete = signup || update ? 'new-password' : 'current-password';
    $('passwordHelp').hidden = !(signup || update); $('signupNote').hidden = !signup;
    $('forgotPassword').hidden = reset || update; $('backToLogin').hidden = !reset;
    $('loginTab').setAttribute('aria-pressed', String(mode === 'login'));
    $('signupTab').setAttribute('aria-pressed', String(signup));
    document.querySelector('.account-tabs').hidden = update;
    $('formTitle').textContent = signup ? 'Join the crew' : reset ? 'Reset your password' : update ? 'Choose a new password' : 'Welcome aboard';
    $('formIntro').textContent = signup ? 'Create your free learning account.' : reset ? 'We’ll send you a link to choose a new password.' : update ? 'Set a password with at least 12 characters.' : 'Log in to continue your learning.';
    $('accountSubmit').textContent = signup ? 'Create free account' : reset ? 'Send reset link' : update ? 'Save new password' : 'Log in';
  }
  const callback = new URL('accounts.html', location.href).href;
  async function showProfile(user) {
    await service.prepare(user);
    $('authPanel').hidden = true; $('profilePanel').hidden = false;
    $('profileEmail').textContent = user.email || '';
    $('importProgress').hidden = $('importNote').hidden = !PWAccountStore.hasLegacy();
    const { data, error } = await service.client.rpc('pw_is_owner');
    $('adminLink').hidden = Boolean(error) || data !== true;
    status('Your account is ready. Continue to choose your vessel and learn.');
  }
  $('loginTab').onclick = () => switchMode('login'); $('signupTab').onclick = () => switchMode('signup');
  $('forgotPassword').onclick = () => switchMode('reset'); $('backToLogin').onclick = () => switchMode('login');
  $('accountForm').onsubmit = async e => {
    e.preventDefault(); if (busy || !service.configured) return;
    setBusy(true); status('Please wait…');
    const email = $('accountEmail').value.trim(), password = $('accountPassword').value;
    try {
      if (mode === 'reset') {
        const result = await service.client.auth.resetPasswordForEmail(email, { redirectTo: callback }); service.check(result.error);
        status('If an account uses that email address, a reset link will be sent. Check your inbox and spam folder.');
      } else if (mode === 'update') {
        if (!recovery) throw new Error('Open the password reset link from your email first.');
        const result = await service.client.auth.updateUser({ password }); service.check(result.error);
        recovery = false; await showProfile(result.data.user); status('Password updated. You can continue to training.');
      } else if (mode === 'signup') {
        const result = await service.client.auth.signUp({ email, password, options: { emailRedirectTo: callback, data: { display_name: $('accountName').value.trim() } } }); service.check(result.error);
        if (result.data.session) await showProfile(result.data.user);
        else status('Check your email for a confirmation link. If you already have an account, use Log in or reset your password.');
      } else {
        const result = await service.client.auth.signInWithPassword({ email, password }); service.check(result.error);
        await showProfile(result.data.user);
      }
    } catch (error) { status(error.message || 'Unable to connect. Please try again.', true); }
    finally { $('accountPassword').value = ''; setBusy(false); }
  };
  $('signOut').onclick = async () => {
    setBusy(true);
    try { await service.signOut(); location.replace(callback); }
    catch (error) { status('Your latest changes could not be saved. Please reconnect and try logging out again. ' + error.message, true); setBusy(false); }
  };
  $('importProgress').onclick = async () => {
    if (!confirm('Add missing vessel details and progress from this browser to your signed-in account?')) return;
    setBusy(true);
    try { PWAccountStore.importLegacy(); await service.flush(); status('Existing browser progress imported. Your original data is preserved.'); }
    catch (error) { status('Import is saved on this device but could not sync yet. ' + error.message, true); }
    finally { setBusy(false); }
  };
  switchMode('login');
  if (!service.configured) {
    setBusy(false); document.querySelectorAll('input').forEach(input => input.disabled = true);
    status('Development preview: the account database is not connected yet. Registration and login will become available after setup.');
    return;
  }
  $('developmentReturn').hidden = true;
  service.client.auth.onAuthStateChange(event => {
    // Supabase callbacks remain synchronous; SDK work happens outside its auth lock.
    if (event === 'PASSWORD_RECOVERY') { recovery = true; $('authPanel').hidden = false; $('profilePanel').hidden = true; switchMode('update'); status('Reset link accepted. Choose your new password.'); }
  });
  setBusy(true);
  try {
    const { data, error } = await service.client.auth.getUser();
    if (error && error.name !== 'AuthSessionMissingError') throw error;
    if (data.user && !recovery) await showProfile(data.user);
    else if (!data.user) PWAccountStore.deactivate();
  } catch (error) { status('Unable to load your account. Please log in or try again. ' + error.message, true); }
  finally { setBusy(false); }
})();
