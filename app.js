/* ============================================================
   RONIN.SYS — shared utilities (loaded by every page)
   ============================================================ */

/* ---- AI agent collapsible block ---- */
function initAIAgent() {
  document.querySelectorAll('.aab-toggle').forEach(toggle => {
    toggle.addEventListener('click', () => {
      const content = toggle.nextElementSibling;
      const isOpen = toggle.classList.toggle('open');
      content.classList.toggle('open', isOpen);
    });
  });
}

/* ---- Letter glitch (for any element with .glitch-text + data-text) ---- */
const GLITCH_SPECIALS = ['@', '$', '?'];
function initLetterGlitch(targetEl, opts = {}) {
  if (!targetEl) return;
  const text = targetEl.dataset.text || targetEl.textContent;
  targetEl.innerHTML = '';
  const letters = [];
  text.split('').forEach(ch => {
    const s = document.createElement('span');
    s.className = 'letter';
    if (ch === ' ') s.innerHTML = '&nbsp;';
    else s.textContent = ch;
    s.dataset.c = ch === ' ' ? ' ' : ch;
    targetEl.appendChild(s);
    if (ch !== ' ') letters.push(s);
  });

  const minDelay = opts.minDelay || 1500;
  const maxDelay = opts.maxDelay || 3000;
  const tickMs = opts.tickMs || 120;

  function fire() {
    const delay = minDelay + Math.random() * (maxDelay - minDelay);
    setTimeout(() => {
      if (!letters.length) return;
      const target = letters[Math.floor(Math.random() * letters.length)];
      const original = target.dataset.c;
      target.classList.add('glitch');
      let i = 0;
      const tk = setInterval(() => {
        if (i < GLITCH_SPECIALS.length) {
          target.textContent = GLITCH_SPECIALS[i];
          i++;
        } else {
          target.textContent = original;
          target.classList.remove('glitch');
          clearInterval(tk);
          fire();
        }
      }, tickMs);
    }, delay);
  }
  setTimeout(fire, 1500);
}

/* ---- Looping typewriter for .typewriter elements with data-text ---- */
async function loopTypewriter(el, text, opts = {}) {
  if (!el) return;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const pause = opts.pause || 4000;
  const eraseMs = opts.eraseMs || 28;

  while (true) {
    el.innerHTML = '';
    for (const ch of text) {
      const t = document.createTextNode(ch);
      el.appendChild(t);
      const d = /[，。、？！,.!?]/.test(ch) ? 240 : (55 + Math.random() * 55);
      await wait(d);
    }
    const c = document.createElement('span');
    c.className = 'cursor';
    el.appendChild(c);
    await wait(pause);
    // erase
    const nodes = Array.from(el.childNodes);
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      if (n.nodeType === Node.TEXT_NODE) {
        el.removeChild(n);
        await wait(eraseMs);
      }
    }
    await wait(500);
  }
}

/* ---- Apply common init on DOM ready ---- */
document.addEventListener('DOMContentLoaded', () => {
  initAIAgent();
});
