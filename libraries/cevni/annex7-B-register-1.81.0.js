/* B.12 is present in CEVNI Revision 6 Annex 7, printed page 134. */
(function(){
  const records=window.PW_CEVNI_VISUAL_CATALOGUES?.signs?.records;
  if(!records || records.some(record=>record.code==='B.12'))return;
  const at=records.findIndex(record=>record.code==='B.11b');
  if(at<0)return;
  records.splice(at+1,0,{family:'B',code:'B.12',title:'Obligation to use onshore power supply point',note:'See CEVNI article 7.06, paragraph 2',art:'pending'});
})();
