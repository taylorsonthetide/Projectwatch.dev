/* Pure marina lookup helpers. Coordinates describe sites, not navigable entrances. */
(function(root){'use strict';function fold(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();}
function valid(m){return !!m&&typeof m.id==='string'&&typeof m.name==='string'&&Number.isFinite(m.lat)&&Number.isFinite(m.lon)&&m.lat>=49&&m.lat<=61.5&&m.lon>=-9&&m.lon<=2.5;}
function search(records,query){const tokens=fold(query).split(' ').filter(Boolean);return records.filter(m=>{const text=fold([m.name,...(m.aliases||[]),m.locality,m.postcode,String(m.postcode||'').replace(/\s/g,''),m.operator,m.address].join(' '));return tokens.every(t=>text.includes(t));});}
const api={fold,valid,search};if(typeof module==='object'&&module.exports)module.exports=api;else root.HelmloreMarinas=api;})(typeof window==='undefined'?globalThis:window);

