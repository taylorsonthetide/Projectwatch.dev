/* Reuse approved Module 3 art in the separate Signs & Marks school. */
(function(){
  'use strict';
  const approvedSigns=window.PW_CEVNI_SIGN_LIBRARY||[];
  const approvedMarks=Object.values(window.PW_CEVNI_ANNEX8||{});
  const signByCode=new Map(approvedSigns.map(x=>[x.code,x]));
  const official=window.PW_CEVNI_ANNEX7_OFFICIAL_PLATES||{};
  const sourceAligned=new Set();
  const umbrella=new Map([['A.9','A.9a / A.9b'],['A.11','A.11a / A.11b / A.11c'],['C.1','C.1a / C.1b'],['C.2','C.2a / C.2b'],['C.3','C.3a / C.3b'],['C.5','C.5a / C.5b']]);
  function plate(r){
    if(official[r.code])return '<img src="'+official[r.code].asset+'" alt="'+official[r.code].label+'">';
    if(umbrella.has(r.code))return '<div class="pw1540CodePlate '+r.family+'">SEE VARIANTS '+umbrella.get(r.code)+'</div>';
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
      if(status&&(displayable||umbrella.has(row.code)))status.remove();
      else if(status)status.textContent='ARTWORK NOT YET VERIFIED';
    });
  }
  function marks(){
    const out=document.getElementById('pw1540Content');if(!out)return;
    document.querySelectorAll('#pw1540SignSchool .pw1540Tabs button').forEach(b=>b.classList.toggle('on',b.dataset.fam==='MARKS'));
    out.innerHTML='<div class="pw1540FamilyIntro"><b>Annex 8 waterway marking</b> — Read the mark, its position and the direction of the fairway together. These ten examples are individual figure crops from CEVNI Revision 6 Annex 8.</div><div class="pw1570MarkGrid">'+approvedMarks.map(m=>'<article class="pw1570MarkCard"><div class="pw1570MarkArt">'+m.svg+'</div><h3>'+m.label+'</h3></article>').join('')+'</div>';
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
      document.querySelectorAll('#cevniPage .cevniSection').forEach(s=>{s.classList.remove('active');s.style.removeProperty('display')});
      school.classList.add('active');window.pw1540Render?.('ALL');school.scrollIntoView({block:'start'});
    };panel.appendChild(button)}
  }
  function auxExamples(){
    const box=document.getElementById('pw1540Content');if(!box)return;
    const examples=window.PW_CEVNI_ANNEX7_AUX_EXAMPLES||{};
    const lib=window.PW_CEVNI_ANNEX7_SIGN_LIBRARY;
    document.querySelectorAll('#pw1540SignSchool .pw1540Tabs button').forEach(b=>b.classList.toggle('on',b.dataset.fam==='AUX'));
    box.replaceChildren();
    const intro=document.createElement('div');intro.className='pw1540FamilyIntro';
    intro.textContent='Auxiliary signs supplement the main sign. These are examples reproduced from Annex 7, Part II, pages 149–150.';
    const grid=document.createElement('div');grid.className='pw1540Grid';
    for(const [code,title,note] of lib.auxiliary){
      const card=document.createElement('div');card.className='pw1540Card';
      const art=document.createElement('div');art.className='pw1540Art';
      const img=document.createElement('img');img.src=examples[code];img.alt=title+' — source examples';art.append(img);
      const heading=document.createElement('h3');heading.textContent=title;
      const detail=document.createElement('div');detail.textContent=note;
      card.append(art,heading,detail);grid.append(card);
    }
    box.append(intro,grid);
  }
  let quizIndex=0;
  function verifiedQuiz(){
    const lib=window.PW_CEVNI_ANNEX7_SIGN_LIBRARY;
    const rows=lib.records.filter(r=>official[r.code] && r.code!=='A.1' && r.code!=='E.1');
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
    // Retire early catalogue/prototype and source-audit screens from learner navigation.
    // Keep their source data available for continued verification.
    document.querySelectorAll('#cevniPage > .cevniNav button').forEach(button=>{
      if(['VISUAL SCHOOL','DEEP TRAINING','VERIFIED LIBRARIES'].includes(button.textContent.trim()))button.remove();
    });
    if(typeof window.cevniScenarioAnswer==='function'){
      const answer=window.cevniScenarioAnswer;
      window.cevniScenarioAnswer=function(...args){
        const result=answer.apply(this,args);
        const debrief=document.getElementById('cevniScenarioDebrief');
        const oldRoute=debrief?.querySelector('button[onclick*="cv1500Open"]');
        if(oldRoute){
          oldRoute.remove();
          debrief.querySelectorAll('p').forEach(p=>{
            if(p.textContent.includes('larger operational block'))p.textContent='This practice block ends here. Replay the four situations whenever you want another run.';
          });
        }
        return result;
      };
    }
    // Legacy school routes set inline display on sections. Reset those overrides
    // before any top navigation handler runs so the active section can be shown.
    document.querySelector('#cevniPage > .cevniNav')?.addEventListener('click',event=>{
      if(!event.target.closest('button'))return;
      document.querySelectorAll('#cevniPage .cevniSection').forEach(s=>s.style.removeProperty('display'));
    },true);
    window.pw1550SignArt=plate;
    const previous=window.pw1540Render;
    window.pw1540Render=function(f){if(f==='QUIZ')return verifiedQuiz();if(f==='AUX')return auxExamples();previous(f);if(f!=='MARKS')setTimeout(refreshSigns,30)};
    window.pw1570RenderMarks=marks;
    const tab=document.querySelector('#pw1540SignSchool [data-fam="MARKS"]');if(tab)tab.onclick=marks;
    const coverage=document.getElementById('pw1550Coverage');
    if(coverage){const metrics=coverage.querySelectorAll('.pw1550Cov b');
      const count=window.PW_CEVNI_ANNEX7_SIGN_LIBRARY.records.filter(r=>!plate(r).includes('pw1540CodePlate')).length;
      if(metrics[1])metrics[1].textContent=count;
      if(metrics[2])metrics[2].textContent=window.PW_CEVNI_ANNEX7_SIGN_LIBRARY.records.length-count-umbrella.size;
      if(metrics[3])metrics[3].textContent=umbrella.size;
    }
    const stats=document.querySelectorAll('#pw1540SignSchool .pw1540Head .pw1540Stat');
    if(stats[3])stats[3].textContent='SOURCE PLATES IN REVIEW';
    const metricsLabel=document.querySelectorAll('#pw1550Coverage .pw1550Cov span');
    if(metricsLabel[1])metricsLabel[1].textContent='SOURCE-PLATE IMAGES DISPLAYED';
    if(metricsLabel[2])metricsLabel[2].textContent='CORRECTED PLATE PENDING';
    if(metricsLabel[3])metricsLabel[3].textContent='UMBRELLA MEANINGS';
    const centralNote=document.querySelector('#pw1550Coverage + .pw1550Note, #pw1550Coverage .pw1550Note, .pw1550Note');
    if(centralNote)centralNote.textContent='Unified library: each displayed Annex 7 sign image links to a checked source plate file. Six umbrella meanings point to their illustrated variants; only A.10 awaits its corrected source figure.';
    const notice=document.querySelector('#pw1540SignSchool .pw1540Notice');
    if(notice)notice.textContent='Sign images are separate source-plate files. Cards without checked artwork remain code-only and are excluded from recognition practice.';
    refreshSigns();
    enrichOverview();
    return true;
  }
  setTimeout(()=>{let attempts=0;const timer=setInterval(()=>{if(install()||++attempts>30)clearInterval(timer)},100)},2300);
})();
