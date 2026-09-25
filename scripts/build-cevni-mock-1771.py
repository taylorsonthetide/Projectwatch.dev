"""Build the original, source-labelled Project Watch CEVNI mock bank."""
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
old = json.loads((root / 'libraries/cevni/mock-exam-bank-1.77.0.json').read_text())
by_id = {q['id']: q for q in old['questions']}
questions = []

def add(id, section, prompt, answers, correct, explanation, refs, visual=None, concept=None):
    assert len(answers) == 4 and len(set(answers)) == 4
    questions.append(dict(id=id, section=section, concept=concept or id, prompt=prompt,
                          answers=answers, correct=correct, explanation=explanation,
                          sourceRefs=refs, visual=visual))

for number in (1, 3, 5, 7, 9, 11, 13, 15):
    q = by_id[f'PW-MOCK-{number:03d}'].copy()
    q['section'] = 1
    q['group'] = 'sign'
    q['concept'] = q['visual'].rsplit('/', 1)[-1]
    q['prompt'] = 'What does this waterway sign mean?'
    questions.append(q)

marks = [
('1-a','right-hand fairway limit','The right-hand limit of the fairway','The left-hand limit of the fairway','An isolated danger','A prohibited anchorage'),
('2-a','left-hand fairway limit','The left-hand limit of the fairway','The right-hand limit of the fairway','An isolated danger','A compulsory stop'),
('3-a','fairway bifurcation','A division of the fairway','The end of a waterway','An overhead obstruction','A no-entry channel'),
('4-c','cross-over at right bank','The fairway crosses from the right bank towards the left','The fairway crosses towards the right bank','A lock is closed','Anchoring is compulsory'),
('5-c','cross-over at left bank','The fairway crosses from the left bank towards the right','The fairway crosses towards the left bank','An isolated danger','The fairway ends'),
('n-cardinal','north cardinal','Pass to the north of the mark','Pass to the south of the mark','Pass to the east of the mark','Pass to the west of the mark'),
('e-cardinal','east cardinal','Pass to the east of the mark','Pass to the west of the mark','Pass to the north of the mark','Pass to the south of the mark'),
('s-cardinal','south cardinal','Pass to the south of the mark','Pass to the north of the mark','Pass to the east of the mark','Pass to the west of the mark'),
('w-cardinal','west cardinal','Pass to the west of the mark','Pass to the east of the mark','Pass to the south of the mark','Pass to the north of the mark'),
('8-d','isolated danger','A danger with navigable water around it','The right-hand fairway limit','A compulsory crossing point','A lock approach')]
for i,(slug,concept,*answers) in enumerate(marks,1):
    add(f'PW-MOCK-MARK-{i:02d}',1,'What does this waterway mark indicate?',answers,0,
        f'Annex 8: {concept}.',['CEVNI Rev.6 Annex 8'],
        f'assets/cevni/module03/annex8-{slug}.svg',concept)
    questions[-1]['group']='mark'

lights = [
('A vessel displays a black cone with its point downwards while under sail. What does it indicate?',
 ['It is also using machinery','It is at anchor','It is engaged in fishing','It is restricted in ability to manoeuvre'], 'CEVNI Rev.6 art. 3.12'),
('Viewed directly ahead at night, which lights identify an ordinary motorized vessel?',
 ['A white masthead light and red and green sidelights','Only a white stern light','Two red lights in a vertical line','A yellow flashing light alone'], 'CEVNI Rev.6 art. 3.08'),
('A vessel is seen from astern at night. Which ordinary navigation light may be visible?',
 ['A white stern light','Both sidelights','The forward masthead light alone','A red all-round light'], 'CEVNI Rev.6 art. 3.08'),
('Which additional light identifies a towing motorized vessel from astern at night?',
 ['A yellow stern light','A blue flashing light','A red masthead light','A green anchor light'], 'CEVNI Rev.6 art. 3.09'),
('A tow leader is viewed from ahead at night. What distinctive masthead arrangement may be shown?',
 ['Two white masthead lights one above the other','Two red masthead lights side by side','One green all-round light','One yellow stern light only'], 'CEVNI Rev.6 art. 3.09'),
('A craft is under sail but starts using its engine. Which navigation-light rules then become relevant?',
 ['Those for a motorized vessel','Only those for a vessel at anchor','Only those for a ferry','No navigation lights are required'], 'CEVNI Rev.6 arts. 1.01, 3.08, 3.12'),
('Why might a vessel’s lights look different when seen from ahead and then from astern?',
 ['The lights have different visibility sectors','All lights automatically change colour','The vessel has changed its legal identity','The fairway marks switch them off'], 'CEVNI Rev.6 art. 3.01 and Annex 3')]
for i,(prompt,answers,ref) in enumerate(lights,1):
    add(f'PW-MOCK-LIGHT-{i:02d}',2,prompt,answers,0,answers[0]+'.',[ref],concept=f'light-{i}')
    questions[-1]['group']='light'

for id in ('037','038','039','040','041','042','043','044','046'):
    q=by_id['PW-MOCK-'+id].copy();q['section']=2;q['group']='sound';q['concept']='sound-'+id;questions.append(q)

# One operational decision from each of the other signed-off modules.
for module,id in ((1,'023'),(2,'027'),(6,'051'),(7,'062'),(8,'072'),(9,'078')):
    q=by_id['PW-MOCK-'+id].copy();q['section']=2;q['group']='rule';q['concept']='rule-'+str(module);q['module']=module;questions.append(q)

bank=dict(version='1.77.1',length=30,minutes=20,passMark=22,
          sections=[dict(id=1,count=15,minimum=11,title='Signs and buoyage',groups={'sign':7,'mark':8}),
                    dict(id=2,count=15,minimum=11,title='Lights, sounds and applied rules',groups={'light':5,'sound':4,'rule':6})],questions=questions)
assert len(questions)==40 and len({q['id'] for q in questions})==40
folder=root/'libraries/cevni'
(folder/'mock-exam-bank-1.77.1.json').write_text(json.dumps(bank,indent=2,ensure_ascii=False)+'\n')
(folder/'mock-exam-bank-1.77.1.js').write_text('/* Original Project Watch training questions; see adjacent JSON. */\nwindow.PW_CEVNI_MOCK_BANK='+json.dumps(bank,ensure_ascii=False,separators=(',',':'))+';\n')
