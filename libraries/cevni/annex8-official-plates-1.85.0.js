/* Source figure crops from CEVNI Revision 6 Annex 8. See asset provenance note. */
(function(){
  const root='assets/cevni/annex8/rev6/';
  const plates={
    'PW-CEVNI-ANNEX8-1-A':{file:'annex8-1-a.png',page:153},
    'PW-CEVNI-ANNEX8-2-A':{file:'annex8-2-a.png',page:154},
    'PW-CEVNI-ANNEX8-3-A':{file:'annex8-3-a.png',page:155},
    'PW-CEVNI-ANNEX8-4-C':{file:'annex8-4-c.png',page:159},
    'PW-CEVNI-ANNEX8-5-C':{file:'annex8-5-c.png',page:160},
    'PW-CEVNI-ANNEX8-N-CARDINAL':{file:'annex8-north-cardinal.png',page:170},
    'PW-CEVNI-ANNEX8-E-CARDINAL':{file:'annex8-east-cardinal.png',page:170},
    'PW-CEVNI-ANNEX8-S-CARDINAL':{file:'annex8-south-cardinal.png',page:170},
    'PW-CEVNI-ANNEX8-W-CARDINAL':{file:'annex8-west-cardinal.png',page:170},
    'PW-CEVNI-ANNEX8-8-D':{file:'annex8-8-d.png',page:172},
  };
  for(const [id,plate] of Object.entries(plates)){
    plate.asset=root+plate.file;
    const mark=window.PW_CEVNI_ANNEX8?.[id];
    if(mark){mark.asset=plate.asset;mark.svg='<img src="'+plate.asset+'" alt="'+mark.label+' — Annex 8 source figure">';}
  }
  window.PW_CEVNI_ANNEX8_OFFICIAL_PLATES=plates;
})();
