/* Reuse approved Module 3 art in the separate Signs & Marks school. */
(function(){
  'use strict';
  const approvedSigns=window.PW_CEVNI_SIGN_LIBRARY||[];
  const approvedMarks=Object.values(window.PW_CEVNI_ANNEX8||{});
  const signByCode=new Map(approvedSigns.map(x=>[x.code,x]));
  function plate(r){
    const approved=signByCode.get(r.code);
    if(approved)return approved.svg;
    try{const old=window.PW1490_SIGNS?.find(x=>x.code===r.code);
      if(old&&old.art!==null&&window.CEVNI_SIGNS?.[old.art])return '<div class="cv1490Sign">'+CEVNI_SIGNS[old.art].svg+'</div>';
    }catch(_){}
    return '<div class="pw1540CodePlate '+r.family+'">'+r.code+'</div>';
  }
  function refreshSigns(){
    const lib=window.PW_CEVNI_ANNEX7_SIGN_LIBRARY;
    const grid=document.getElementById('pw1540Grid');
    if(!lib||!grid)return;
    const active=document.querySelector('#pw1540SignSchool .pw1540Tabs button.on');
    const family=active?.dataset.fam||'ALL';
    const rows=family==='ALL'?lib.records:lib.records.filter(x=>x.family===family);
    grid.querySelectorAll('.pw1540Card').forEach((card,i)=>{
      const row=rows[i];if(!row)return;
      const art=card.querySelector('.pw1540Art');if(art)art.innerHTML=plate(row);
      const status=card.querySelector('.pw1540Status');const approved=signByCode.has(row.code);
      if(status&&approved){status.textContent='APPROVED TEACHING ART';status.classList.remove('pw1540Pending');}
    });
  }
  function marks(){
    const out=document.getElementById('pw1540Content');if(!out)return;
    document.querySelectorAll('#pw1540SignSchool .pw1540Tabs button').forEach(b=>b.classList.toggle('on',b.dataset.fam==='MARKS'));
    out.innerHTML='<div class="pw1540FamilyIntro"><b>Annex 8 waterway marking</b> — Read the mark, its position and the direction of the fairway together. These ten approved teaching illustrations are shared with Module 3.</div><div class="pw1570MarkGrid">'+approvedMarks.map(m=>'<article class="pw1570MarkCard"><div class="pw1570MarkArt">'+m.svg+'</div><h3>'+m.label+'</h3><span class="pw1570Verified">APPROVED TEACHING ART</span></article>').join('')+'</div>';
  }
  function install(){
    if(!window.PW_CEVNI_ANNEX7_SIGN_LIBRARY||!document.getElementById('pw1540SignSchool'))return false;
    window.pw1550SignArt=plate;
    const previous=window.pw1540Render;
    window.pw1540Render=function(f){previous(f);if(f!=='MARKS')setTimeout(refreshSigns,30)};
    window.pw1570RenderMarks=marks;
    const tab=document.querySelector('#pw1540SignSchool [data-fam="MARKS"]');if(tab)tab.onclick=marks;
    const coverage=document.getElementById('pw1550Coverage');
    if(coverage){const metrics=coverage.querySelectorAll('.pw1550Cov b');
      const count=window.PW_CEVNI_ANNEX7_SIGN_LIBRARY.records.filter(r=>!plate(r).includes('pw1540CodePlate')).length;
      if(metrics[1])metrics[1].textContent=count;
      if(metrics[2])metrics[2].textContent=window.PW_CEVNI_ANNEX7_SIGN_LIBRARY.records.length-count;
    }
    refreshSigns();
    return true;
  }
  setTimeout(()=>{let attempts=0;const timer=setInterval(()=>{if(install()||++attempts>30)clearInterval(timer)},100)},2300);
})();
