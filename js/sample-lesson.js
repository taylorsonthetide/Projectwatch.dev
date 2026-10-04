(() => {
'use strict';
const host = document.getElementById('sample-quiz');
const progress = document.getElementById('sample-progress');
const reset = document.getElementById('sample-reset');
if (!host) return;
fetch('../banks/public/buoyage-sample.json').then(r => { if (!r.ok) throw new Error('Unavailable'); return r.json(); }).then(questions => {
 const solved = new Set();
 function render() {
  host.replaceChildren(); host.setAttribute('aria-busy', 'false');
  questions.forEach((q, index) => {
   const form = document.createElement('form'); form.className = 'quiz-question';
   const fieldset = document.createElement('fieldset');
   const legend = document.createElement('legend'); legend.textContent = `${index + 1}. ${q.prompt}`; fieldset.append(legend);
   q.options.forEach((answer, n) => {
    const label = document.createElement('label'); const input = document.createElement('input');
    input.type = 'radio'; input.name = q.id; input.value = String(n);
    const text = document.createElement('span'); text.textContent = answer; label.append(input, text); fieldset.append(label);
   });
   const button = document.createElement('button'); button.type = 'submit'; button.textContent = 'Check answer';
   const feedback = document.createElement('p'); feedback.className = 'quiz-feedback'; feedback.setAttribute('role', 'status'); feedback.setAttribute('aria-live', 'polite');
   form.append(fieldset, button, feedback);
   form.addEventListener('submit', event => {
    event.preventDefault(); const selected = form.querySelector('input:checked');
    if (!selected) { feedback.textContent = 'Choose an answer first.'; return; }
    if (Number(selected.value) === q.correct) {
     solved.add(q.id); form.dataset.result = 'correct'; feedback.textContent = 'Correct. ' + q.explanation;
     fieldset.disabled = true; button.disabled = true; button.textContent = 'Completed ✓';
     progress.textContent = solved.size === questions.length ? 'All three complete. Region A: red to port and green to starboard when travelling with the conventional direction of buoyage.' : `${solved.size} of ${questions.length} complete.`;
    } else { form.dataset.result = 'incorrect'; feedback.textContent = 'Not quite. Look back at the marks and direction of buoyage and try again.'; }
   }); host.append(form);
  });
  progress.textContent = '0 of 3 complete.'; reset.hidden = false;
 }
 reset.addEventListener('click', () => { solved.clear(); render(); host.querySelector('input').focus(); }); render();
}).catch(() => { host.setAttribute('aria-busy', 'false'); host.textContent = 'The practice check could not load. Refresh to try again; the full lesson is available above.'; });
})();