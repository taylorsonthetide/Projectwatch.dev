/* Shared device-local vessel editor. Never activates depth alarms. */
(()=>{'use strict';const P=window.HelmlorePlanning,form=document.getElementById('vesselForm'),status=document.getElementById('vesselStatus');if(!form)return;
try{const saved=JSON.parse(localStorage.getItem(P.PROFILE)||'null');if(saved){const p=P.profile(saved);for(const key of ['name','draught','cruise','maximum','shallow'])form.elements[key].value=p[key]??'';status.textContent=p.name+' · saved in this browser.';}}catch{status.textContent='Saved vessel settings could not be read. Enter them again.';}
form.onsubmit=e=>{e.preventDefault();try{const p=P.profile(Object.fromEntries(new FormData(form)));localStorage.setItem(P.PROFILE,JSON.stringify(p));status.textContent=p.name+' saved · '+p.cruise+' kn cruising · depth alerts unavailable.';window.dispatchEvent(new CustomEvent('vessel-profile-saved',{detail:p}));}catch(error){status.textContent=error.message;}};
})();
