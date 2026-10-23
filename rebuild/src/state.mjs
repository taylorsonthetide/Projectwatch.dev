export const STORAGE_KEY='helmlore-rebuild-v2';
export function emptyState(){return{version:1,read:[],attempts:{},lastLesson:null};}
export function loadState(storage){try{const v=JSON.parse(storage.getItem(STORAGE_KEY));if(v?.version===1&&Array.isArray(v.read)&&v.attempts&&typeof v.attempts==='object')return v;}catch{}return emptyState();}
export function saveState(storage,state){try{storage.setItem(STORAGE_KEY,JSON.stringify(state));return true;}catch{return false;}}
export function recordAttempt(state,q,correct){const prev=state.attempts[q.id]||{attempts:0,correct:0,course:q.course};state.attempts[q.id]={...prev,attempts:prev.attempts+1,correct:prev.correct+(correct?1:0),lastCorrect:correct};return state;}
export function questionReady(q){return Boolean(q.image)||!/(?:shown|diagram|illustration|this chart|chart shows|image|listen|hear the)/i.test(q.prompt);}
