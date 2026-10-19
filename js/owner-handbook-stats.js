(async function () {
 'use strict';
 const $ = id => document.getElementById(id), service = window.PWAccounts;
 if (!service?.configured) return;
 const owner = await service.client.rpc('pw_is_owner');
 if (owner.error || owner.data !== true) return;
 $('handbookStats').hidden = false; $('handbookStatsLink').hidden = false;
 let request = 0;
 async function refresh() {
  const current = ++request;
  $('handbookRefresh').disabled = true;
  $('handbookStatus').textContent = 'Loading saved handbook clicks…';
  try {
   const {data,error} = await service.client.rpc('helmlore_handbook_summary',{range_days:Number($('handbookRange').value)});
   if (current !== request) return;
   service.check(error);
   for (const [id,value] of [['handbookToday',data.today],['handbookTotal',data.total],['handbookAll',data.all_time],['handbookHome',data.homepage],['handbookSales',data.sales_page]]) $(id).textContent = Number(value).toLocaleString();
   $('handbookStatus').textContent = 'Updated '+new Date().toLocaleTimeString()+'.';
  } catch (error) {
   if (current !== request) return;
   for (const id of ['handbookToday','handbookTotal','handbookAll','handbookHome','handbookSales']) $(id).textContent='—';
   $('handbookStatus').textContent='Could not load handbook clicks. '+error.message+' Try Refresh.';
  } finally { if (current === request) $('handbookRefresh').disabled=false; }
 }
 $('handbookRefresh').onclick=refresh; $('handbookRange').onchange=refresh;
 await refresh();
})();
