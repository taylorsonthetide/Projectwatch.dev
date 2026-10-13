import test from 'node:test';
import assert from 'node:assert/strict';
import {tidePlot,datumLabel,createTideView} from '../tide-view.mjs';
import {HOUR} from '../tides.mjs';
const start=Date.UTC(2026,9,13),model={lat:54.553,lon:-3.597,times:Array.from({length:60},(_,i)=>start+i*HOUR),heights:Array.from({length:60},(_,i)=>2*Math.sin(i*Math.PI/6)),downloadedAt:new Date().toISOString()},port={id:'whitehaven',name:'Whitehaven',model};
test('Filled tide curves preserve missing gaps and never convert MSL to chart datum',()=>{
 assert.equal(datumLabel(model),'Mean sea level · MSL');assert.equal(datumLabel({...model,datum:'CD'}),'Chart datum');
 const plot=tidePlot({...model,heights:model.heights.map((h,i)=>i===12?null:h)},start);assert.equal(plot.segments.length,2);assert.ok(plot.segments.every(s=>s.every(p=>p.time!==start+12*HOUR)));assert.equal(tidePlot(null,start),null);
});
test('Actual card opens full graph, scrubs independently, retains cursor on redraw, follows weather changes and closes',()=>{
 const old=globalThis.document;const el=(tag)=>({tag,children:[],attributes:{},value:'',textContent:'',append(...v){this.children.push(...v);},replaceChildren(...v){this.children=v;},setAttribute(k,v){this.attributes[k]=String(v);},addEventListener(k,v){this['on'+k]=v;},showModal(){this.open=true;},close(){this.open=false;},remove(){this.removed=true;},focus(){},querySelector(t){return walk(this).find(e=>e.tag===t);}});const walk=e=>[e,...e.children.flatMap(walk)],text=e=>walk(e).map(x=>x.textContent).join(' ');const body=el('body');
 try{globalThis.document={body,createElement:el,createElementNS:(ns,t)=>el(t)};const view=createTideView(),time=start+13*HOUR,card=view.card(port,time);assert.match(text(card),/Mean sea level/);assert.match(text(card),/Next tide/);assert.ok(walk(card).some(e=>e.tag==='path'&&e.attributes.fill==='#195ac4'));walk(card).find(e=>e.textContent==='Open tide graph').onclick();const dialog=body.children.at(-1);assert.equal(dialog.open,true);assert.match(text(dialog),/Whitehaven · tides/);const slider=dialog.querySelector('input');slider.onchange({target:{value:time+2*HOUR}});assert.equal(Number(dialog.querySelector('input').value),time+2*HOUR);view.update(port,time);assert.equal(Number(dialog.querySelector('input').value),time+2*HOUR);view.update(port,time+HOUR);assert.equal(Number(dialog.querySelector('input').value),time+HOUR);walk(dialog).find(e=>e.textContent==='Next day ›').onclick();assert.ok(Number(dialog.querySelector('input').value)>time+HOUR);walk(dialog).find(e=>e.textContent==='Close graph').onclick();assert.equal(dialog.open,false);assert.equal(dialog.removed,true);}
 finally{if(old===undefined)delete globalThis.document;else globalThis.document=old;}
});
