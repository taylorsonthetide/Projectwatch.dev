/* Keep CEVNI lesson controls in a consistent place across modules 1–9. */
(()=>{
  'use strict';
  const style=document.createElement('style');
  style.textContent=`
    #cevniLessonArea .cvLessonShell{display:flex;flex-direction:column;min-height:calc(100dvh - 110px)}
    #cevniLessonArea{overflow-anchor:none}
    #cevniLessonArea .cvBriefingCard{flex:1 0 auto}
    #cevniLessonArea .m05Question,#cevniLessonArea .m06Question,#cevniLessonArea .m07Question,#cevniLessonArea .m08Question,#cevniLessonArea .m09Question{display:flex;flex-direction:column}
    #cevniLessonArea .m05Question .cevniAnswers,#cevniLessonArea .m06Question .cevniAnswers,#cevniLessonArea .m07Question .cevniAnswers,#cevniLessonArea .m08Question .cevniAnswers,#cevniLessonArea .m09Question .cevniAnswers{margin-top:auto}
    #cevniLessonArea .cvLessonNav{position:sticky;bottom:12px;z-index:40;display:flex;align-items:center;flex-wrap:wrap;gap:9px;margin-top:auto;padding:10px 12px;border:1px solid #3e9ab477;border-radius:12px;background:#063246f2;box-shadow:0 8px 26px #001923aa;backdrop-filter:blur(8px)}
    #cevniLessonArea .cvLessonNav > span{flex:1;color:#a9cbd7;font-size:12px}
    #cevniLessonArea .cvLessonNav button{min-height:44px;width:auto;white-space:normal}
    #cevniLessonArea .cvLessonNav .cvBack{margin-left:auto}
    #cevniLessonArea .cvLessonNav .cvNext,#cevniLessonArea .cvLessonNav .pwFlowNext{margin-left:auto}
    #cevniLessonArea .cvLessonNav .pwFlowNext{background:#168bcf;color:#fff;border-color:#6ce0ff77}
    @media(max-width:520px){#cevniLessonArea .cvLessonNav{bottom:8px;display:grid;grid-template-columns:1fr 1fr}#cevniLessonArea .cvLessonNav button{width:100%}#cevniLessonArea .cvLessonNav .cvClose{grid-column:auto}#cevniLessonArea .cvLessonNav > span{display:none}#cevniLessonArea .cvLessonNav .cvNext,#cevniLessonArea .cvLessonNav .pwFlowNext{margin-left:0}}
  `;
  document.head.append(style);

  function install(){
    const area=document.getElementById('cevniLessonArea');
    if(!area)return false;
    // A renderer may rebuild the lesson and call scrollIntoView on every Next.
    // The lesson is already in view; suppress that one call for in-lesson steps.
    area.addEventListener('click',event=>{
      const button=event.target.closest('button');
      if(!button||!area.contains(button)||!/NEXT|PREVIOUS|LAST BRIEFING|RETRY|REVIEW MODULE/i.test(button.textContent))return;
      const noScroll=()=>{};
      area.scrollIntoView=noScroll;
      setTimeout(()=>{if(area.scrollIntoView===noScroll)delete area.scrollIntoView},0);
    },true);
    const dockNext=()=>{
      const nav=area.querySelector('.cvLessonNav');
      if(!nav)return;
      const feedbackNext=area.querySelector('.m05Feedback .m05Next,.m06Feedback .m06Next,.m07Feedback .m07Next,.m08Feedback .m08Next,.m09Feedback .m09Next');
      const legacyNext=area.querySelector('#cevniLessonFeedback button:only-child');
      const next=feedbackNext||legacyNext;
      if(next&&!nav.contains(next)){
        next.classList.add('pwFlowNext');
        nav.append(next);
      }
    };
    new MutationObserver(dockNext).observe(area,{subtree:true,childList:true});
    dockNext();
    return true;
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
