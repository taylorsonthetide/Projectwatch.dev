(async function () {
 'use strict';
 const $ = id => document.getElementById(id), service = window.PWAccounts;
 if (!service || !service.configured) return;
 const user = await service.client.auth.getUser();
 if (user.error || !user.data.user) return;
 const owner = await service.client.rpc('pw_is_owner');
 if (owner.error || owner.data !== true) return;
 $('trafficPanel').hidden = false;
 let request = 0;
 async function refresh() {
  const current = ++request;
  $('trafficRefresh').disabled = true;
  $('trafficStatus').textContent = 'Loading page views…';
  try {
   const {data,error} = await service.client.rpc('helmlore_website_traffic',{range_days:Number($('trafficRange').value)});
   if (current !== request) return;
   service.check(error);
   for (const [id,value] of [['trafficToday',data.today],['trafficTotal',data.total],['trafficAll',data.all_time]]) $(id).textContent = Number(value).toLocaleString();
   $('trafficDays').replaceChildren(); $('trafficPages').replaceChildren();
   const max = Math.max(1,...data.daily.map(d=>Number(d.views)));
   for (const day of data.daily) {
    const item = document.createElement('div'); item.className='traffic-bar';
    item.title = day.day+' (UTC): '+day.views+' views';
    item.setAttribute('aria-label',item.title);
    const fill = document.createElement('span'); fill.style.height=(Number(day.views)/max*100)+'%'; item.append(fill); $('trafficDays').append(item);
   }
   for (const page of data.pages) {
    const row=document.createElement('tr');
    for (const value of [page.page === '/index.html' ? 'Home page' : page.page,Number(page.views).toLocaleString()]) { const cell=document.createElement('td'); cell.textContent=value; row.append(cell); }
    $('trafficPages').append(row);
   }
   $('trafficStatus').textContent = data.started ? 'Updated '+new Date().toLocaleTimeString()+'. First recorded views: '+data.started+'.' : 'Tracking is ready. No page views recorded yet.';
  } catch (error) { if(current === request) $('trafficStatus').textContent='Could not load traffic. '+error.message+' Try Refresh.'; }
  finally { if(current === request) $('trafficRefresh').disabled=false; }
 }
 $('trafficRefresh').onclick=refresh; $('trafficRange').onchange=refresh;
 await refresh();
})();
