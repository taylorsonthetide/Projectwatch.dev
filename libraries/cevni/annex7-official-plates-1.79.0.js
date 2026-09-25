/* Crops from CEVNI Revision 6 Annex 7. Source and page details live in the artwork audit. */
(function(){
  const root='assets/cevni/annex7/rev6/';
  const plates={
    'A.2':{file:'annex7-a-2.png',label:'No overtaking',page:125},
    'D.1a':{file:'annex7-d-1a.png',label:'Recommended opening — both directions (diamond)',page:136},
    'D.1b':{file:'annex7-d-1b.png',label:'Recommended opening — both directions (circle)',page:136},
    'D.1c':{file:'annex7-d-1c.png',label:'Recommended opening — indicated direction only (two diamonds across)',page:136},
    'D.1d':{file:'annex7-d-1d.png',label:'Recommended opening — indicated direction only (two diamonds vertically)',page:136},
    'D.1e':{file:'annex7-d-1e.png',label:'Recommended opening — indicated direction only (two circles across)',page:136},
    'D.1f':{file:'annex7-d-1f.png',label:'Recommended opening — indicated direction only (two circles vertically)',page:136},
    'E.2':{file:'annex7-e-2.png',label:'Overhead cable crossing',page:137}
  };
  for(const [code,plate] of Object.entries(plates))plate.asset=root+plate.file;
  window.PW_CEVNI_ANNEX7_OFFICIAL_PLATES=plates;
  const keep=new Set(['A.1','B.7','E.1']);
  for(const sign of window.PW_CEVNI_SIGN_LIBRARY||[]){
    const source=plates[sign.code];
    if(source){sign.svg='<img src="'+source.asset+'" alt="'+source.label+'">';sign.asset=source.asset;}
    else if(!keep.has(sign.code))sign.svg='<div class="pw1540CodePlate '+sign.code[0]+'">'+sign.code+'</div>';
  }
})();
