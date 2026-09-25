// Check the separately stored Annex 7 and Annex 8 artwork against the catalogue.
const fs = require('node:fs');
const vm = require('node:vm');
const context = {window: {}};
vm.createContext(context);
for (const file of [
  'libraries/cevni/visual-catalogues-1.71.2.js',
  'libraries/cevni/annex7-signs-1.70.0.js',
  'libraries/cevni/annex8-marks-1.70.0.js'
]) vm.runInContext(fs.readFileSync(file, 'utf8'), context, {filename: file});
const catalog = context.window.PW_CEVNI_VISUAL_CATALOGUES.signs.records;
const signs = context.window.PW_CEVNI_SIGN_LIBRARY;
const marks = Object.values(context.window.PW_CEVNI_ANNEX8);
const codes = new Set(catalog.map(record => record.code));
const missing = catalog.filter(record => !signs.some(sign => sign.code === record.code));
const invalid = [...signs, ...marks].filter(item => !item.asset || !fs.existsSync(item.asset) || !item.svg.includes(item.asset));
const unknown = signs.filter(item => !codes.has(item.code));
console.log(JSON.stringify({annex7Records: catalog.length, annex7SeparateAssets: signs.length,
  annex7AwaitingArtwork: missing.map(({code, title}) => ({code, title})),
  annex8SeparateAssets: marks.length, invalidAssets: invalid.map(item => item.code || item.id),
  unregisteredSigns: unknown.map(item => item.code)}, null, 2));
if (invalid.length || unknown.length) process.exitCode = 1;
