/* CEVNI learner landing: course path first, optional visual context below. */
(()=>{
  'use strict';
  const style=document.createElement('style');
  style.textContent=`
    body:has(#cevniPage.active) #moduleContext{display:none!important}
    #cevniPage > #pwEvidenceSchool,#cevniPage > #pw1622VisualPractice{display:none}
    #cevniPage .cevniHero{padding:18px 20px;gap:12px}
    #cevniPage .cevniHero h1{font-size:clamp(27px,3vw,40px);line-height:1.13}
    #cevniPage .cevniHero p{max-width:820px;margin-bottom:0}
    #cevniPage .cevniNav{margin:12px 0}
    #cevniPage .cvLibraryBar{display:none}
    #cevniPage .cvStageRail{grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}
    #cevniPage .cvStage{min-height:84px;padding:12px;overflow:visible}
    #cevniPage .cvStage:after{display:none}
    #cevniPage .cvStage b{font-size:clamp(15px,1.5vw,19px)}
    #cevniPage .cvStage.locked{opacity:.74}
    #cevniPage .cevniProgress{margin-top:4px}
    #cevniPage .cevniProgress button{background:#0b4156;border:1px solid #4a9bb277;color:#d5edf4}
    #cevniPage .pw1860Details{margin:14px 0;border:1px solid #28718a77;border-radius:14px;background:#062b3b;overflow:hidden}
    #cevniPage .pw1860Details summary{cursor:pointer;list-style:none;padding:16px 18px;color:#e8faff;font-weight:900;font-size:17px}
    #cevniPage .pw1860Details summary::-webkit-details-marker{display:none}
    #cevniPage .pw1860Details summary:after{content:'＋';float:right;color:#80dff3}
    #cevniPage .pw1860Details[open] summary:after{content:'−'}
    #cevniPage .pw1860Details summary small{display:block;margin-top:4px;font-size:13px;font-weight:500;color:#a9cbd7}
    #cevniPage .pw1860Details > .cevniBasis{margin:0 16px 16px}
    #cevniPage .pw1860Details > #pwEvidenceSchool,#cevniPage .pw1860Details > #pw1622VisualPractice{margin:0 16px 16px}
    @media(max-width:650px){#cevniPage .cvStageRail{grid-template-columns:repeat(2,minmax(0,1fr))}#cevniPage .cevniHero{grid-template-columns:1fr}#cevniPage .cevniBadge{min-width:0;padding:10px}}
    @media(max-width:420px){#cevniPage .cvStageRail{grid-template-columns:1fr}}
  `;
  document.head.append(style);

  function install(){
    const page=document.getElementById('cevniPage');
    const course=document.getElementById('cevniCourse');
    const photos=document.getElementById('pwEvidenceSchool');
    const practice=document.getElementById('pw1622VisualPractice');
    const map=course?.querySelector('.cvCourseMap');
    if(!page||!course||!photos||!practice||!map)return false;
    if(document.getElementById('pw1860VisualContext'))return true;

    const intro=page.querySelector('.cevniHero p');
    if(intro)intro.textContent='Nine modules of inland navigation teaching and practice. Follow the course, use the reference libraries when needed, then unlock the mock exam.';

    const source=course.querySelector('.cevniSource');
    if(source)map.after(source);
    const basis=page.querySelector('.cevniBasis');
    if(basis){
      const details=document.createElement('details');
      details.id='pw1860Source';details.className='pw1860Details';
      details.innerHTML='<summary>Source and scope <small>CEVNI Revision 6, amendments, signs and training status</small></summary>';
      details.append(basis);
      (source||map).after(details);
    }

    const visual=document.createElement('details');
    visual.id='pw1860VisualContext';visual.className='pw1860Details';
    visual.innerHTML='<summary>Real waterway photos and guided observation <small>Six context scenes and an optional visual exercise</small></summary>';
    visual.append(photos,practice);
    course.append(visual);
    return true;
  }
  let attempts=0;
  const timer=setInterval(()=>{if(install()||++attempts>=40)clearInterval(timer)},100);
})();
