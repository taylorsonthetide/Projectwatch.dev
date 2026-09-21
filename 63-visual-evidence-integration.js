
(function(){
'use strict';
const EVIDENCE=[
 {id:'PW-PHOTO-RHINE-LOCK-0058',title:'Iffezheim Lock — upstream side',place:'Germany • Rhine',file:'Upstream side Iffezheim Lock.jpg',creator:'Llez',license:'CC BY-SA 3.0',status:'COURSE APPROVED • STRUCTURE CONTEXT',use:'Read the scale, approach geometry and physical lock environment. Do not infer entry permission or signal meaning from the photograph.',source:'https://commons.wikimedia.org/wiki/File:Upstream_side_Iffezheim_Lock.jpg'},
 {id:'PW-PHOTO-RHINE-LOCK-0059',title:'Iffezheim Lock — upstream view',place:'Germany • Rhine',file:'Lock Iffezheim Upriver View.jpg',creator:'Ingolfson',license:'Public domain',status:'COURSE APPROVED • STRUCTURE CONTEXT',use:'Compare chamber layout and approach orientation. The scene is context, not an answer-bearing signal plate.',source:'https://commons.wikimedia.org/wiki/File:Lock_Iffezheim_Upriver_View.jpg'},
 {id:'PW-PHOTO-RHINE-LOCK-0242',title:'Iffezheim Lock — downstream side',place:'Germany • Rhine',file:'Lock Iffezheim Downriver Side.jpg',creator:'Ingolfson',license:'Public domain',status:'COURSE APPROVED • STRUCTURE CONTEXT',use:'Use the paired upstream/downstream views to build a real-world mental model of the installation.',source:'https://commons.wikimedia.org/wiki/File:Lock_Iffezheim_Downriver_Side.jpg'},
 {id:'PW-PHOTO-FR-LOCK-0045',title:'Fessenheim Lock',place:"France • Grand Canal d'Alsace",file:'Fessenheim, Écluse.jpg',creator:'Rauenstein',license:'Public domain',status:'COURSE APPROVED • STRUCTURE CONTEXT',use:'Recognise a continental lock as an operating environment before interpreting separate signs and signals.',source:'https://commons.wikimedia.org/wiki/File:Fessenheim,_Écluse.jpg'},
 {id:'PW-PHOTO-BE-LANAYE-0080',title:'Lanaye Locks — downstream view',place:'Belgium • Meuse',file:'20190721 314 lanaye.jpg',creator:'Jean Housen',license:'CC BY-SA 4.0',status:'COURSE APPROVED • STRUCTURE CONTEXT',use:'Study chamber scale, multiple openings and the wider lock complex. Do not infer a traffic-light state from incidental detail.',source:'https://commons.wikimedia.org/wiki/File:20190721_314_lanaye.jpg'},
 {id:'PW-PHOTO-MD-LOCK-0060',title:'GMS Mirela entering Strullendorf lock',place:'Germany • Main–Danube Canal',file:'GMS Mirela-20190523-RM-173820.jpg',creator:'Reinhold Möller',license:'CC BY-SA 4.0',status:'COURSE APPROVED • LOCK-ENTRY CONTEXT',use:'Observe the relationship between an inland vessel and the lock environment. Vessel movement is not used as proof of signal permission.',source:'https://commons.wikimedia.org/wiki/File:GMS_Mirela-20190523-RM-173820.jpg'}
];
window.PW_CEVNI_VISUAL_EVIDENCE=EVIDENCE;

function photoURL(file){return 'https://commons.wikimedia.org/wiki/Special:Redirect/file/'+encodeURIComponent(file)+'?width=1280'}
function card(a){
 return `<article class="pwEvCard">
   <div class="pwEvPhoto"><img loading="lazy" src="${photoURL(a.file)}" alt="${a.title}" onerror="this.closest('.pwEvPhoto').classList.add('pwEvMissing')"><span class="pwEvStatus">${a.status}</span></div>
   <div class="pwEvBody"><div class="pwEvId">${a.id}</div><h3>${a.title}</h3><div class="pwEvPlace">${a.place}</div><p>${a.use}</p>
   <div class="pwEvMeta"><span>${a.creator}</span><span>${a.license}</span></div>
   <a class="pwEvSource" href="${a.source}" target="_blank" rel="noopener">SOURCE / LICENCE RECORD ↗</a></div>
 </article>`;
}
function mount(){
 const page=document.getElementById('cevniPage'); if(!page||document.getElementById('pwEvidenceSchool')) return;
 const host=document.createElement('section'); host.id='pwEvidenceSchool'; host.className='pwEvidenceSchool';
 host.innerHTML=`<div class="pwEvHero"><div><div class="ver">BUILD 1.62.0 • REAL-WORLD VISUAL EVIDENCE</div><h2>See the waterway before you answer the question.</h2><p>Verified photographs are used for context and operational recognition. Exact signs, lights and marks stay with the clean regulatory artwork. A photograph is never allowed to smuggle an unverified rule answer into the course.</p></div><div class="pwEvBadge">6<br><small>QUALIFIED<br>CONTEXT SCENES</small></div></div>
 <div class="pwEvRule"><b>PROJECT WATCH VISUAL METHOD</b><span>TEACH with exact diagrams → RECOGNISE the object → SEE it in a real waterway → APPLY the rule separately.</span></div>
 <div class="pwEvGrid">${EVIDENCE.map(card).join('')}</div>
 <div class="pwEvFoot"><b>Evidence boundary:</b> these scenes teach structure, scale, approach and operating context only. Signal permission, sign meaning, light identity and dangerous-goods status remain controlled by separately verified regulatory assets.</div>`;
 const anchor=document.getElementById('cevniLibraryHardening')||page.querySelector('.cvVisualSchool')||page.lastElementChild;
 if(anchor&&anchor.parentNode) anchor.parentNode.insertBefore(host,anchor); else page.appendChild(host);
}
const css=document.createElement('style'); css.id='pw1620EvidenceStyle'; css.textContent=`
.pwEvidenceSchool{margin:18px 0;padding:18px;border:1px solid #56d6ff45;border-radius:18px;background:linear-gradient(145deg,#062b3c,#041d2a);box-shadow:0 18px 50px #0004}
.pwEvHero{display:grid;grid-template-columns:1fr 150px;gap:18px;align-items:center}.pwEvHero h2{font-size:30px;margin:6px 0}.pwEvHero p{max-width:900px;color:#c9dce5;line-height:1.55}.pwEvBadge{border:1px solid #55dbff66;background:#073b50;border-radius:16px;text-align:center;font-size:44px;font-weight:900;padding:16px;color:#7be5ff}.pwEvBadge small{display:block;font-size:10px;line-height:1.25;color:#d9f7ff}
.pwEvRule{margin:16px 0;display:flex;gap:14px;align-items:center;padding:12px 14px;border-radius:12px;background:#082432;border-left:4px solid #56d6ff}.pwEvRule b{color:#7be5ff;white-space:nowrap}.pwEvRule span{color:#d5e5ec}
.pwEvGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}.pwEvCard{overflow:hidden;border:1px solid #ffffff20;border-radius:16px;background:#062532}.pwEvPhoto{height:250px;position:relative;background:#03131c}.pwEvPhoto img{width:100%;height:100%;object-fit:cover;display:block}.pwEvPhoto.pwEvMissing:after{content:'PHOTO UNAVAILABLE — SOURCE RECORD RETAINED';position:absolute;inset:0;display:grid;place-items:center;color:#9fc5d4;font-weight:800;padding:20px;text-align:center}
.pwEvStatus{position:absolute;left:12px;bottom:12px;background:#073a2cdd;border:1px solid #4de39a77;color:#8dffc0;border-radius:999px;padding:6px 9px;font-size:10px;font-weight:900}.pwEvBody{padding:14px}.pwEvId{font-size:10px;color:#78dfff;font-weight:900;letter-spacing:.04em}.pwEvBody h3{margin:5px 0 2px;font-size:20px}.pwEvPlace{font-size:12px;color:#9dc0ce}.pwEvBody p{color:#d0e0e6;line-height:1.45}.pwEvMeta{display:flex;gap:8px;flex-wrap:wrap}.pwEvMeta span{font-size:10px;background:#0b4053;border-radius:7px;padding:5px 7px;color:#d8f6ff}.pwEvSource{display:inline-block;margin-top:10px;color:#74ddff;font-size:11px;font-weight:900;text-decoration:none}.pwEvFoot{margin-top:16px;padding:12px 14px;border:1px dashed #ffcb5555;border-radius:12px;color:#d7e4e9;background:#2b241533}
@media(max-width:760px){.pwEvHero{grid-template-columns:1fr}.pwEvBadge{display:none}.pwEvGrid{grid-template-columns:1fr}.pwEvPhoto{height:210px}.pwEvRule{display:block}.pwEvRule b{display:block;margin-bottom:5px}}
`; document.head.appendChild(css);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,900),{once:true});else setTimeout(mount,400);
setTimeout(mount,2200);
})();
