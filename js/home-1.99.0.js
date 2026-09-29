/* Homepage and platform overview. Course progress, assessments and storage are unchanged. */
(function () {
 'use strict';
 const pathways = window.PW_HOME_PATHWAYS;
 const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const actions = {
  bridge: () => showCoursePage(), cevni: () => showModule('cevni'),
  safety: () => pwSafetyOpen(), tides: () => pwTidesOpen(), systems: () => pwSystemsOpen(),
  compass: () => pwCompassOpen(), chartwork: () => pwChartOpen(),
  passage: () => pwPassageOpen(), diesel: () => pwDieselOpen()
 };
 window.pwHomeOpen = function (id) {
  if (!Object.prototype.hasOwnProperty.call(actions,id)) return;
  pwLibraryContext = false;
  actions[id]();
 };
 function card(course, detailed) {
  return `<article class="pwPathwayCard ${escape(course.id)} ${detailed?'pwMapCard':''}">
   <div class="pwPathwayArt"><img loading="lazy" src="${escape(course.image)}" alt="${escape(course.alt)}"></div>
   <div class="pwPathwayCopy"><span class="pwPathwayState">${escape(course.group)}</span><h3>${escape(course.title)}</h3><p>${escape(course.description)}</p>
   ${detailed?`<div class="pwMapTopics"><h4>What you will learn</h4><ul>${course.topics.map(t=>`<li>${escape(t)}</li>`).join('')}</ul></div>`:''}
   <button type="button" onclick="pwHomeOpen('${escape(course.id)}')">Open course <span aria-hidden="true">→</span><span class="pwHomeSrOnly">: ${escape(course.title)}</span></button></div>
  </article>`;
 }
 function render() {
  const home=document.getElementById('pwHomePathways');
  if(home) home.innerHTML=pathways.map(c=>card(c,false)).join('');
  const map=document.getElementById('pwAllCourseGroups');
  const groups=[['Rules & navigation','pwMapNavigation','Understand the rules, find your position and plan the journey.'],['Safety & seamanship','pwMapSafety','Prepare the boat and crew, recognise hazards and respond calmly.'],['Boat knowledge','pwMapBoats','Understand the systems that keep your boat safe and reliable.']];
  if(map)map.innerHTML=groups.map(([name,id,description],i)=>`<section class="pwCourseMapGroup" id="${id}" aria-labelledby="${id}Title"><div class="pwMapGroupHead"><span aria-hidden="true">0${i+1}</span><div><h2 id="${id}Title">${escape(name)}</h2><p>${description}</p></div></div><div class="pwCourseMapGrid">${pathways.filter(c=>c.group===name).map(c=>card(c,true)).join('')}</div></section>`).join('');
 }
 window.pwShowAllCourses = function () {
  pwLibraryContext=false;
  document.querySelectorAll('.appPage.active,.screen.active').forEach(p=>p.classList.remove('active'));
  updateHeaderNav('allCourses');
  document.getElementById('allCoursesPage').classList.add('active');
  window.scrollTo({top:0,behavior:'instant'});
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
})();
