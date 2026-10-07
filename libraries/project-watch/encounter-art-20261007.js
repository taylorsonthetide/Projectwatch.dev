/* Helmlore encounter artwork: initial geometry, not prescribed avoiding action. */
window.PW_ENCOUNTER_ART = function(s, r) {
  const rad = n => n * Math.PI / 180;
  const a = -rad(s.ownH);
  const rx = r.x * Math.cos(a) + r.y * Math.sin(a);
  const ry = -r.x * Math.sin(a) + r.y * Math.cos(a);
  const distance = Math.hypot(rx, ry) || 1;
  const dx = rx / distance * 78, dy = -ry / distance * 78;
  const ox = 90 - dx / 2, oy = 82 - dy / 2;
  const tx = 90 + dx / 2, ty = 82 + dy / 2;
  const heading = ((s.tgtH - s.ownH) % 360 + 360) % 360;
  function boat(x, y, h, type, tack, color) {
    const sailSide = tack === 'port' ? 1 : -1;
    const detail = type === 'sail'
      ? '<path d="M0,-8 L' + (sailSide * 9) + ',7 L0,5 Z" fill="#fff" stroke="#173d52" stroke-width="1"/><path d="M0,-10 V9" stroke="#173d52" stroke-width="1.6"/>'
      : '<rect x="-4" y="-3" width="8" height="11" rx="2" fill="#fff" opacity=".9"/><path d="M-3,0 H3" stroke="#173d52" stroke-width="1.2"/>';
    return '<g transform="translate(' + x.toFixed(2) + ' ' + y.toFixed(2) + ') rotate(' + h.toFixed(2) + ')">' +
      '<path d="M-5,22 Q0,17 5,22 M-7,28 Q0,22 7,28" fill="none" stroke="' + color + '" stroke-width="1.5" opacity=".3"/>' +
      '<path d="M0,-18 V-36 M-4,-31 L0,-37 L4,-31" fill="none" stroke="' + color + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M0,-15 C5,-11 8,-3 7,11 Q0,16 -7,11 C-8,-3 -5,-11 0,-15 Z" fill="' + color + '" stroke="#173d52" stroke-width="1.4"/>' + detail + '</g>';
  }
  let wind = '';
  if(typeof s.windFrom === 'number') {
    const wf = typeof s.windFrom === 'number' ? s.windFrom : 90;
    const angle = ((wf - s.ownH + 180) % 360 + 360) % 360;
    wind = '<g transform="translate(27 157) rotate(' + angle + ')"><path d="M-3,13 V-12 M3,13 V-12 M-8,-8 L0,-17 L8,-8" fill="none" stroke="#477c9b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></g>';
  }
  return '<span class="scenarioChart scenarioChartClean"><svg viewBox="0 0 180 180" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
    '<rect width="180" height="180" fill="#e5f1f4"/>' +
    '<path d="M12,36 Q30,30 48,36 M130,148 Q148,142 166,148" fill="none" stroke="#bfd8e1" stroke-width="1.2"/>' +
    wind + boat(ox,oy,0,s.ownType,s.ownTack,'#c44a45') + boat(tx,ty,heading,s.tgtType,s.tgtTack,'#299b93') + '</svg></span>';
};
