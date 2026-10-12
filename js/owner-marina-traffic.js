(async function(){
'use strict';const $=id=>document.getElementById(id),service=window.PWAccounts;
if(!service?.configured)return;
const owner=await service.client.rpc('pw_is_owner');if(owner.error||owner.data!==true)return;
$('marinaTrafficPanel').hidden=false;let rows=[],names,request=0;
async function refresh(){const current=++request;$('marinaRefresh').disabled=true;$('marinaReportStatus').textContent='Loading saved marina clicks…';try{
if(!names){const response=await fetch('data/marina-prices.json');if(!response.ok)throw Error('Marina directory unavailable');names=Object.fromEntries((await response.json()).records.map(r=>[r.id,r.name]));}
const {data,error}=await service.client.auth.getSession();if(error||!data.session)throw Error('Please sign in again');
const response=await fetch('https://helmlore-marina-price-guide.sappytide8.chatgpt.site/api/report?days='+$('marinaDays').value+'&test='+$('marinaTest').value,{headers:{'X-Helmlore-Session':data.session.access_token}});const report=await response.json();if(current!==request)return;if(!response.ok)throw Error(report.error||'Report unavailable');
let groups={},calls=0,websites=0;for(const item of report.summary){const group=groups[item.marina_id]||=( {call:0,website:0});group[item.action]=Number(item.clicks);if(item.action==='call')calls+=Number(item.clicks);else websites+=Number(item.clicks);}
rows=Object.entries(groups).map(([id,g])=>[names[id]||id,g.call,g.website]);$('marinaCallTotal').textContent=calls.toLocaleString();$('marinaWebsiteTotal').textContent=websites.toLocaleString();$('marinaClickRows').replaceChildren();for(const values of rows){const tr=document.createElement('tr');for(const value of values){const td=document.createElement('td');td.textContent=value;tr.append(td)}$('marinaClickRows').append(tr)}$('marinaReportStatus').textContent=rows.length?'Updated '+new Date().toLocaleTimeString()+'.':'No '+($('marinaTest').value==='1'?'test':'visitor')+' clicks recorded in this period yet.';
}catch(error){if(current===request)$('marinaReportStatus').textContent='Could not load marina clicks. '+error.message;}finally{if(current===request)$('marinaRefresh').disabled=false}}
$('marinaRefresh').onclick=refresh;$('marinaDays').onchange=refresh;$('marinaTest').onchange=refresh;$('marinaExport').onclick=()=>{const csv=[['Marina','Call clicks','Website clicks'],...rows].map(row=>row.map(value=>'"'+String(value).replaceAll('"','""')+'"').join(',')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const a=document.createElement('a');a.href=url;a.download='Helmlore_Marina_Referrals.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};await refresh();
})();
