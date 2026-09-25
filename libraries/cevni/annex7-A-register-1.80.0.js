/* Distinct visual variants from CEVNI Revision 6 Annex 7, family A. */
(function(){
  const records=window.PW_CEVNI_VISUAL_CATALOGUES?.signs?.records;
  if(!records)return;
  const groups={
    'A.1':[
      ['A.1a','No entry — board'],['A.1b','No entry — two red lights vertically'],
      ['A.1c','No entry — one red light'],['A.1d','No entry — two red lights horizontally'],
      ['A.1e','No entry — two red flags'],['A.1f','No entry — one red flag']],
    'A.9':[['A.9a','Do not create wash — board'],['A.9b','Do not create wash — red over white light']],
    'A.11':[['A.11a','Entry prohibited, prepare to get under way — horizontal lights'],
      ['A.11b','Entry prohibited, prepare to get under way — vertical lights'],
      ['A.11c','Entry prohibited, prepare to get under way — extinguished light']]
  };
  for(const [parent,variants] of Object.entries(groups)){
    const at=records.findIndex(record=>record.code===parent);
    if(at<0)continue;
    const additions=variants.filter(([code])=>!records.some(record=>record.code===code))
      .map(([code,title])=>({family:'A',code,title,note:'CEVNI Annex 7 visual variant',art:'pending'}));
    records.splice(at+1,0,...additions);
  }
})();
