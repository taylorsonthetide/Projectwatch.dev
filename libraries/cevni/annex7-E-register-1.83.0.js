/* Additional E-family source plate variants in CEVNI Rev.6 Annex 7, pp. 137, 140–141. */
(function(){
  const records=window.PW_CEVNI_VISUAL_CATALOGUES?.signs?.records;
  if(!records)return;
  const groups={
    'E.1':[["E.1a", "Entry permitted — board"], ["E.1b", "Entry permitted — single green light"], ["E.1c", "Entry permitted — two green lights horizontally"], ["E.1d", "Entry permitted — two green lights vertically"]],
    'E.5.6':[["E.5.7", "Reserved berthing — pushing-navigation vessels carrying three blue lights/cones"], ["E.5.8", "Reserved berthing — other vessels, no Article 3.14 marking required"], ["E.5.9", "Reserved berthing — other vessels carrying one blue light/cone"], ["E.5.10", "Reserved berthing — other vessels carrying two blue lights/cones"], ["E.5.11", "Reserved berthing — other vessels carrying three blue lights/cones"], ["E.5.12", "Reserved berthing — all vessels, no Article 3.14 marking required"], ["E.5.13", "Reserved berthing — all vessels carrying one blue light/cone"], ["E.5.14", "Reserved berthing — all vessels carrying two blue lights/cones"], ["E.5.15", "Reserved berthing — all vessels carrying three blue lights/cones"]]
  };
  for(const [parent,variants] of Object.entries(groups)){
    const at=records.findIndex(record=>record.code===parent);
    if(at<0)continue;
    const additions=variants.filter(([code])=>!records.some(record=>record.code===code))
      .map(([code,title])=>({family:'E',code,title,note:'CEVNI Annex 7 visual variant',art:'pending'}));
    records.splice(at+1,0,...additions);
  }
})();
