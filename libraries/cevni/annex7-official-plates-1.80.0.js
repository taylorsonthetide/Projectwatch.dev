/* Crops from CEVNI Revision 6 Annex 7. Source and page details live in the artwork audit. */
(function(){
  const root='assets/cevni/annex7/rev6/';
  const plates={
    'A.2':{file:'annex7-a-2.png',label:'No overtaking',page:125},
    'A.1a':{file:'annex7-a-1a.png',label:'No entry — board',page:124},
    'A.1b':{file:'annex7-a-1b.png',label:'No entry — two red lights vertically',page:124},
    'A.1c':{file:'annex7-a-1c.png',label:'No entry — one red light',page:124},
    'A.1d':{file:'annex7-a-1d.png',label:'No entry — two red lights horizontally',page:124},
    'A.1e':{file:'annex7-a-1e.png',label:'No entry — two red flags',page:124},
    'A.1f':{file:'annex7-a-1f.png',label:'No entry — one red flag',page:124},
    'A.1.1':{file:'annex7-a-1-1.png',label:'No entry except non-motorized small craft',page:124},
    'A.3':{file:'annex7-a-3.png',label:'No overtaking of convoys by convoys',page:125},
    'A.4':{file:'annex7-a-4.png',label:'No passing or overtaking',page:125},
    'A.4.1':{file:'annex7-a-4-1.png',label:'No passing or overtaking of convoys by convoys',page:125},
    'A.5':{file:'annex7-a-5.png',label:'No berthing on this side',page:126},
    'A.5.1':{file:'annex7-a-5-1.png',label:'No berthing within the indicated breadth',page:126},
    'A.6':{file:'annex7-a-6.png',label:'No anchoring or trailing anchors, cables or chains',page:126},
    'A.7':{file:'annex7-a-7.png',label:'No making fast to the bank',page:126},
    'A.8':{file:'annex7-a-8.png',label:'No turning',page:126},
    'A.9a':{file:'annex7-a-9a.png',label:'Do not create wash — board',page:127},
    'A.9b':{file:'annex7-a-9b.png',label:'Do not create wash — red over white light',page:127},
    'A.11a':{file:'annex7-a-11a.png',label:'Entry prohibited, prepare to get under way — horizontal lights',page:127},
    'A.11b':{file:'annex7-a-11b.png',label:'Entry prohibited, prepare to get under way — vertical lights',page:127},
    'A.11c':{file:'annex7-a-11c.png',label:'Entry prohibited, prepare to get under way — extinguished light',page:127},
    'A.12':{file:'annex7-a-12.png',label:'Motorized craft prohibited',page:128},
    'A.13':{file:'annex7-a-13.png',label:'Sports or pleasure craft prohibited',page:128},
    'A.14':{file:'annex7-a-14.png',label:'Water skiing prohibited',page:128},
    'A.15':{file:'annex7-a-15.png',label:'Sailing vessels prohibited',page:128},
    'A.16':{file:'annex7-a-16.png',label:'Other craft prohibited',page:128},
    'A.17':{file:'annex7-a-17.png',label:'Sailboards prohibited',page:129},
    'A.18':{file:'annex7-a-18.png',label:'End of high speed zone',page:129},
    'A.19':{file:'annex7-a-19.png',label:'Launching or beaching prohibited',page:129},
    'A.20':{file:'annex7-a-20.png',label:'Water bikes prohibited',page:129},
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
