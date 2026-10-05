(() => {
 'use strict';
 const KEY='helmlore-language-v1', names={en:'English',fr:'Français',de:'Deutsch',nl:'Nederlands'};
 const script=document.currentScript, root=new URL('../',script.src), originals=new WeakMap(), imageSources=new WeakMap(), attributes=new WeakMap();
 let preferred='en', language='en', dictionaries={}, observer, bar, select, note, request=0, speechEntries=[];
 const normalize=s=>s.replace(/\s+/g,' ').trim();
 try { const saved=localStorage.getItem(KEY);if(names[saved])preferred=saved; } catch {}
 function translate(source){const key=normalize(source),dict=dictionaries[language]||{};if(language==='en')return source;let value=dict[key];if(!value){const context=key.match(/^CONTEXT (\d+) \/ (\d+)$/);if(context&&dict['CONTEXT {current} / {total}'])value=dict['CONTEXT {current} / {total}'].replace('{current}',context[1]).replace('{total}',context[2]);const q=key.match(/^(\d+\.\s+)(.*)$/);if(q&&dict[q[2]])value=q[1]+dict[q[2]];const correct=key.match(/^Correct\. (.*)$/);if(correct&&dict[correct[1]])value=(dict['Correct.']||'Correct.')+' '+dict[correct[1]];const progress=key.match(/^(\d+) of (\d+) complete\.$/);if(progress)value=language==='fr'?`${progress[1]} sur ${progress[2]} terminées.`:language==='de'?`${progress[1]} von ${progress[2]} abgeschlossen.`:`${progress[1]} van ${progress[2]} voltooid.`;}return value?source.match(/^\s*/)[0]+value+source.match(/\s*$/)[0]:source;}
 function protectedNode(node){return !node.parentElement||!!node.parentElement.closest('script,style,textarea,input,code,pre,[contenteditable],.hl-languagebar,[data-no-translate],#profileEmail');}
 function updateText(node){if(protectedNode(node))return;let item=originals.get(node);if(!item||node.nodeValue!==item.output){item={source:node.nodeValue,output:node.nodeValue};originals.set(node,item);}const output=translate(item.source);if(node.nodeValue!==output)node.nodeValue=output;item.output=output;}
 function walk(node){if(node.nodeType===3){updateText(node);return;}if(!node.querySelectorAll)return;const walker=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);while(walker.nextNode())updateText(walker.currentNode);for(const element of node.querySelectorAll('[alt],[aria-label],[placeholder]')){if(element.closest('.hl-languagebar,[data-no-translate]'))continue;let values=attributes.get(element);if(!values){values={};attributes.set(element,values);}for(const name of ['alt','aria-label','placeholder']){if(!element.hasAttribute(name))continue;const current=element.getAttribute(name);let item=values[name];if(!item||current!==item.output)item=values[name]={source:current,output:current};const output=translate(item.source);if(current!==output)element.setAttribute(name,output);item.output=output;}}for(const image of node.querySelectorAll('img')){const original=imageSources.get(image)||image.getAttribute('src');if(!original?.includes('region-a-channel-premium'))continue;imageSources.set(image,original);const src=language==='en'?original:original.replace('region-a-channel-premium.svg',`region-a-channel-${language}.svg`);if(image.getAttribute('src')!==src)image.setAttribute('src',src);}}
 function connect(){observer.observe(document.body,{childList:true,subtree:true,characterData:true});}
 function rebuildSpeech(){speechEntries=Object.entries(dictionaries[language]||{}).filter(([source,target])=>source.length>2&&typeof target==='string').sort((a,b)=>b[0].length-a[0].length);}
 function speechText(source){
  const text=normalize(String(source||''));
  if(language==='en')return {text,language:'en-GB',translated:false};
  let rest=text, output='', complete=true;
  while(rest){
   const punctuation=rest.match(/^[\s\d.,:;!?…→←—–\-•()[\]\/]+/);
   if(punctuation){output+=punctuation[0];rest=rest.slice(punctuation[0].length);continue;}
   const match=speechEntries.find(([key])=>rest.startsWith(key)&&(!/[\p{L}\p{N}]/u.test(key.slice(-1))||!/[\p{L}\p{N}]/u.test(rest.charAt(key.length))));
   if(!match){complete=false;break;}
   output+=match[1];rest=rest.slice(match[0].length);
  }
  return complete?{text:output,language:{fr:'fr-FR',de:'de-DE',nl:'nl-NL'}[language],translated:true}:{text,language:'en-GB',translated:false};
 }
 function applySpeech(utterance,source){
  const result=speechText(source);
  // An incomplete passage remains wholly in the original language.
  if(result.translated)utterance.text=result.text;
  utterance.lang=result.language;
  const voices=window.speechSynthesis?.getVoices()||[], code=result.language.slice(0,2);
  let saved='';try{saved=localStorage.getItem('pwVoiceName')||''}catch{}
  const matches=voices.filter(v=>(v.lang||'').toLowerCase().replace('_','-').startsWith(code));
  utterance.voice=matches.find(v=>v.name===saved)||matches.find(v=>(v.lang||'').toLowerCase()===result.language.toLowerCase())||matches[0]||null;
  return utterance;
 }
 function refresh(){observer?.disconnect();document.documentElement.lang=language==='en'?'en-GB':language;walk(document.body);walk(document.querySelector('title'));select.value=language;note.textContent=language==='en'?'Translations are being expanded. Untranslated lessons remain in English, including speech.':language==='fr'?'Traductions en cours. Les leçons non traduites restent en anglais, y compris la lecture vocale.':language==='de'?'Übersetzungen werden erweitert. Noch nicht übersetzte Lektionen bleiben auch bei der Sprachausgabe auf Englisch.':'Vertalingen worden uitgebreid. Niet-vertaalde lessen blijven in het Engels, ook bij het voorlezen.';bar.querySelector('label').textContent=language==='fr'?'Langue':language==='de'?'Sprache':language==='nl'?'Taal':'Language';bar.querySelector('button').textContent=language==='fr'?'Original anglais':language==='de'?'Englisches Original':language==='nl'?'Engels origineel':'English original';bar.querySelector('button').hidden=language==='en';connect();}
 async function choose(value){if(!names[value])return;const token=++request;select.disabled=true;try{if(value!=='en'&&!dictionaries[value]){const response=await fetch(new URL(`locales/${value}.json?v=5`,root));if(!response.ok)throw Error('Language unavailable');dictionaries[value]=await response.json();}if(token!==request)return;if(language!==value){try{window.speechSynthesis?.cancel()}catch{}}language=value;rebuildSpeech();try{localStorage.setItem(KEY,value)}catch{}refresh();document.dispatchEvent(new CustomEvent('helmlore:language',{detail:{language}}));}catch{select.value=language;note.textContent='This language could not load. The English original is available; reconnect and try again.';}finally{if(token===request)select.disabled=false;}}
 function start(){bar=document.createElement('div');bar.className='hl-languagebar';bar.setAttribute('role','region');bar.setAttribute('aria-label','Language selection');bar.innerHTML='<div class="hl-language-controls"><label for="hl-language">Language</label><select id="hl-language" aria-describedby="hl-language-note">'+Object.entries(names).map(([code,name])=>`<option value="${code}">${name}</option>`).join('')+'</select><button type="button">English original</button></div><p id="hl-language-note" role="status"></p>';select=bar.querySelector('select');note=bar.querySelector('p');const header=document.querySelector('body>header');if(header)header.after(bar);else document.body.prepend(bar);observer=new MutationObserver(records=>{observer.disconnect();const roots=new Set();for(const r of records){if(r.target.nodeType===3)updateText(r.target);else if(r.type==='childList')for(const n of r.addedNodes)roots.add(n);}for(const n of roots)walk(n);connect();});select.addEventListener('change',()=>choose(select.value));bar.querySelector('button').addEventListener('click',()=>choose('en'));choose(preferred);}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
 window.HelmloreLanguage={get current(){return language},set:choose,translate,speechText,applySpeech};
})();
