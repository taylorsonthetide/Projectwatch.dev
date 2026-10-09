(() => {
'use strict';
const host = document.getElementById('sample-quiz');
const progress = document.getElementById('sample-progress');
const reset = document.getElementById('sample-reset');
if (!host) return;
const recorded = new Set();
function recordActivity(eventName) {
 if (recorded.has(eventName) || navigator.webdriver || /bot|crawler|spider|headless/i.test(navigator.userAgent)) return;
 if (!['helmlore.com','www.helmlore.com','helmlore.co.uk','www.helmlore.co.uk','taylorsonthetide.github.io'].includes(location.hostname)) return;
 recorded.add(eventName);
 // Anonymous counts only; once per event per page load, including quiz retries.
 fetch('https://rpgjtxdxqcdxwcwmhqfl.supabase.co/rest/v1/rpc/helmlore_record_sample', {
  method:'POST', credentials:'omit', keepalive:true,
  headers:{'Content-Type':'application/json',apikey:'sb_publishable_gupuY4sO_SvPJl5dE7A5cw_Ytx5SkHL'},
  body:JSON.stringify({event_name:eventName})
 }).catch(() => {});
}
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
    recordActivity('started');
    if (Number(selected.value) === q.correct) {
     solved.add(q.id);
     if (solved.size === questions.length) recordActivity('completed'); form.dataset.result = 'correct'; feedback.textContent = 'Correct. ' + q.explanation;
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