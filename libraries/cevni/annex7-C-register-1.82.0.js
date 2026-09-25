/* Distinct C.1, C.2, C.3 and C.5 sign forms in Rev.6 Annex 7, page 135. */
(function(){
  const records=window.PW_CEVNI_VISUAL_CATALOGUES?.signs?.records;
  if(!records)return;
  const groups={
    'C.1':[['C.1a','Depth of water limited — plain board'],['C.1b','Depth of water limited — indicated figure']],
    'C.2':[['C.2a','Headroom limited — plain board'],['C.2b','Headroom limited — indicated figure']],
    'C.3':[['C.3a','Width of passage limited — plain board'],['C.3b','Width of passage limited — indicated figure']],
    'C.5':[['C.5a','Channel distance from bank — left-facing board'],['C.5b','Channel distance from bank — right-facing board']]
  };
  for(const [parent,variants] of Object.entries(groups)){
    const at=records.findIndex(record=>record.code===parent);
    if(at<0)continue;
    const additions=variants.filter(([code])=>!records.some(record=>record.code===code))
      .map(([code,title])=>({family:'C',code,title,note:'CEVNI Annex 7 visual variant; displayed figures are examples',art:'pending'}));
    records.splice(at+1,0,...additions);
  }
})();
