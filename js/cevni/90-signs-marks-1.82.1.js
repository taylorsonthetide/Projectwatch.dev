/* Reuse approved Module 3 art in the separate Signs & Marks school. */
(function(){
  'use strict';
  const approvedSigns=window.PW_CEVNI_SIGN_LIBRARY||[];
  const approvedMarks=Object.values(window.PW_CEVNI_ANNEX8||{});
  const signByCode=new Map(approvedSigns.map(x=>[x.code,x]));
  const official=window.PW_CEVNI_ANNEX7_OFFICIAL_PLATES||{};
  const sourceAligned=new Set(['A.1','E.1']);
  function plate(r){
    if(official[r.code])return '<img src="'+official[r.code].asset+'" alt="'+official[r.code].label+'">';
    const drawing=signByCode.get(r.code);
    if(sourceAligned.has(r.code)&&drawing)return drawing.svg;
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
      const status=card.querySelector('.pw1540Status');const displayable=!!official[row.code]||sourceAligned.has(row.code);
      if(status&&displayable)status.remove();
      else if(status)status.textContent='ARTWORK NOT YET VERIFIED';
    });
  }
  function marks(){
    const out=document.getElementById('pw1540Content');if(!out)return;
    document.querySelectorAll('#pw1540SignSchool .pw1540Tabs button').forEach(b=>b.classList.toggle('on',b.dataset.fam==='MARKS'));
    out.innerHTML='<div class="pw1540FamilyIntro"><b>Annex 8 waterway marking</b> — Read the mark, its position and the direction of the fairway together. These ten approved teaching illustrations are shared with Module 3.</div><div class="pw1570MarkGrid">'+approvedMarks.map(m=>'<article class="pw1570MarkCard"><div class="pw1570MarkArt">'+m.svg+'</div><h3>'+m.label+'</h3><span class="pw1570Verified">APPROVED TEACHING ART</span></article>').join('')+'</div>';
  }
  function enrichOverview(){
    const section=document.getElementById('cevniSigns');
    const grid=document.getElementById('cevniSignGrid');
    if(!section||!grid||section.querySelector('.pw178Marks'))return;
    const heading=document.createElement('h3');heading.className='pw178MarkHeading';heading.textContent='Annex 8 • waterway marks';
    const markGrid=document.createElement('div');markGrid.className='pw178Marks';
    markGrid.innerHTML=approvedMarks.map(m=>'<article class="pw178Mark">'+m.svg+'<b>'+m.label+'</b></article>').join('');
    grid.after(heading,markGrid);
    grid.querySelectorAll('.cevniSign').forEach(card=>{
      const code=(card.querySelector('.cevniSignCode')?.textContent||'').split('•').pop().trim();
      if(code==='D.1'){card.remove();return;}
      const art=card.querySelector('.cevniPlate');
      if(art&&official[code])art.innerHTML='<img src="'+official[code].asset+'" alt="'+official[code].label+'">';
    });
    Object.keys(official).filter(code=>code.startsWith('D.1')).forEach(code=>{
      const item=official[code],card=document.createElement('div');card.className='cevniSign';
      card.innerHTML='<div class="cevniPlate"><img src="'+item.asset+'" alt="'+item.label+'"></div><span class="cevniSignCode">ANNEX 7 • '+code+'</span><span class="cevniSignMeaning">'+item.label+'</span>';
      grid.appendChild(card);
    });
    const panel=section.querySelector('.cevniPanel');
    if(panel){const button=document.createElement('button');button.className='pw1540Btn';button.textContent='EXPLORE ALL ANNEX 7 SIGN RECORDS →';button.onclick=()=>{
      const school=document.getElementById('pw1540SignSchool');if(!school)return;
      document.querySelectorAll('#cevniPage .cevniSection').forEach(s=>{s.classList.remove('active');s.style.display='none'});
      school.style.display='block';school.classList.add('active');window.pw1540Render?.('ALL');school.scrollIntoView({block:'start'});
    };panel.appendChild(button)}
  }
  let quizIndex=0;
  function verifiedQuiz(){
    const lib=window.PW_CEVNI_ANNEX7_SIGN_LIBRARY;
    const rows=lib.records.filter(r=>official[r.code]);
    const box=document.getElementById('pw1540Content');
    if(!box||!rows.length)return;
    document.querySelectorAll('#pw1540SignSchool .pw1540Tabs button').forEach(b=>b.classList.toggle('on',b.dataset.fam==='QUIZ'));
    const row=rows[quizIndex%rows.length];
    const others=rows.filter(r=>r.family===row.family&&r.code!==row.code);
    const a=others[(quizIndex*7+1)%others.length];
    const b=others[(quizIndex*11+3)%others.length];
    const choices=[row,a,b].filter((r,i,arr)=>arr.findIndex(x=>x.code===r.code)===i);
    if(choices.length<3)choices.push(rows.find(r=>r.code!==row.code&&r.code!==a.code));
    const answerAt=quizIndex%3;
    const arranged=choices.filter(r=>r.code!==row.code);
    arranged.splice(answerAt,0,row);
    box.replaceChildren();
    const panel=document.createElement('div');panel.className='pw1540Quiz';
    const meta=document.createElement('div');meta.className='pw1540Meta';meta.textContent='SOURCE-PLATE RECOGNITION • '+(quizIndex%rows.length+1)+' / '+rows.length;
    const art=document.createElement('div');art.className='pw1540Art';
    const img=document.createElement('img');img.src=official[row.code].asset;img.alt='CEVNI sign '+row.code;art.append(img);
    const heading=document.createElement('h3');heading.textContent='What does this sign mean?';
    const feedback=document.createElement('div');feedback.id='pw1540Fb';
    panel.append(meta,art,heading);
    arranged.forEach((choice,i)=>{
      const button=document.createElement('button');button.className='pw1540Answer';
      button.textContent=String.fromCharCode(65+i)+' · '+choice.title;
      button.onclick=()=>{
        feedback.replaceChildren();
        const message=document.createElement('div');message.className='pw1540Feedback';
        if(choice.code===row.code){button.classList.add('good');message.textContent='Correct — '+row.code+' · '+row.title+'. ';
          const next=document.createElement('button');next.className='pw1540Btn';next.textContent='NEXT SIGN →';next.onclick=()=>{quizIndex++;verifiedQuiz()};message.append(next);
        }else message.textContent='Try again. Compare the symbol with the meanings.';
        feedback.append(message);
      };
      panel.append(button);
    });
    panel.append(feedback);box.append(panel);
  }
  function install(){
    if(!window.PW_CEVNI_ANNEX7_SIGN_LIBRARY||!document.getElementById('pw1540SignSchool'))return false;
    window.pw1550SignArt=plate;
    const previous=window.pw1540Render;
    window.pw1540Render=function(f){if(f==='QUIZ')return verifiedQuiz();previous(f);if(f!=='MARKS')setTimeout(refreshSigns,30)};
    window.pw1570RenderMarks=marks;
    const tab=document.querySelector('#pw1540SignSchool [data-fam="MARKS"]');if(tab)tab.onclick=marks;
    const coverage=document.getElementById('pw1550Coverage');
    if(coverage){const metrics=coverage.querySelectorAll('.pw1550Cov b');
      const count=window.PW_CEVNI_ANNEX7_SIGN_LIBRARY.records.filter(r=>!plate(r).includes('pw1540CodePlate')).length;
      if(metrics[1])metrics[1].textContent=count;
      if(metrics[2])metrics[2].textContent=window.PW_CEVNI_ANNEX7_SIGN_LIBRARY.records.length-count;
    }
    const stats=document.querySelectorAll('#pw1540SignSchool .pw1540Head .pw1540Stat');
    if(stats[3])stats[3].textContent='SOURCE PLATES IN REVIEW';
    const notice=document.querySelector('#pw1540SignSchool .pw1540Notice');
    if(notice)notice.textContent='Sign images are separate source-plate files. Cards without checked artwork remain code-only and are excluded from recognition practice.';
    refreshSigns();
    enrichOverview();
    return true;
  }
  setTimeout(()=>{let attempts=0;const timer=setInterval(()=>{if(install()||++attempts>30)clearInterval(timer)},100)},2300);
})();
