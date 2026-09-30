(async function () {
  'use strict';
  const $ = id => document.getElementById(id), service = PWAccounts;
  let offset = 0;
  const date = value => value ? new Date(value).toLocaleString() : '—';
  async function load() {
    $('previousPage').disabled = $('nextPage').disabled = true;
    try {
      const { data, error } = await service.client.rpc('pw_owner_dashboard', { page_offset: offset }); service.check(error);
      $('totalAccounts').textContent = data.total; $('confirmedAccounts').textContent = data.confirmed; $('activeAccounts').textContent = data.active30;
      $('learnerRows').replaceChildren();
      for (const learner of data.learners) {
        const row = document.createElement('tr');
        for (const value of [learner.email + (learner.display_name ? ' · ' + learner.display_name : '') + (learner.confirmed ? '' : ' (unconfirmed)'), date(learner.registered_at), date(learner.last_sign_in_at), date(learner.last_seen_at), learner.cevni_modules + ' / 9']) {
          const cell = document.createElement('td'); cell.textContent = value; row.append(cell);
        }
        $('learnerRows').append(row);
      }
      $('adminData').hidden = false; $('adminStatus').textContent = data.total ? '' : 'No learners have registered yet.';
      $('pageNumber').textContent = 'Page ' + (offset / 50 + 1);
      $('previousPage').disabled = offset === 0; $('nextPage').disabled = offset + 50 >= data.total;
    } catch (error) { $('adminData').hidden = true; $('adminStatus').textContent = 'Dashboard unavailable: ' + error.message; $('adminStatus').classList.add('error'); }
  }
  if (!service.configured) { $('adminStatus').textContent = 'Development preview: connect the account database and assign the owner account to activate this dashboard.'; return; }
  const { data, error } = await service.client.auth.getUser();
  if (error || !data.user) { location.replace('accounts.html'); return; }
  $('previousPage').onclick = () => { offset = Math.max(0, offset - 50); load(); };
  $('nextPage').onclick = () => { offset += 50; load(); };
  await load();
})();
