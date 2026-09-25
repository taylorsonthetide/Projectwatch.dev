(function(){'use strict';
function complete(){try{const d=JSON.parse(localStorage.getItem('pwCevniDone')||'[]');return Array.isArray(d)&&Array.from({length:9},(_,i)=>i).every(i=>d.includes(i))}catch(_){return false}}
function refresh(){const box=document.getElementById('pwMockGate'),button=document.getElementById('pwMockOpen');if(!box||!button)return;const ready=complete();box.classList.toggle('ready',ready);button.disabled=!ready;button.setAttribute('aria-disabled',String(!ready));document.getElementById('pwMockGateState').textContent=ready?'UNLOCKED • READY TO BEGIN':'LOCKED • COMPLETE MODULES 01–09';}
window.pwOpenCevniMock=function(){refresh();if(!complete())return;const win=window.open('cevni-mock-exam.html','_blank');if(win)win.opener=null;else window.location.href='cevni-mock-exam.html'};
const originalShow=window.cevniShow;if(typeof originalShow==='function')window.cevniShow=function(k,b){if(k==='mock'){window.pwOpenCevniMock();return}return originalShow.apply(this,arguments)};
const originalSave=window.cevniSaveDone;if(typeof originalSave==='function')window.cevniSaveDone=function(d){let out=originalSave.apply(this,arguments);refresh();return out};
refresh();window.addEventListener('pageshow',refresh);window.addEventListener('storage',refresh);
})();
