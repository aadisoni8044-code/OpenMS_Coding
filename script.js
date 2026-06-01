/* ═══════════════════════════════════════════════════════════════
   OpenMS 1.1 — Landing Page Scripts
   Features:
     1. Nav scroll effect (glass morphism on scroll)
     2. Mobile hamburger menu
     3. Hero terminal typing animation
     4. Intersection Observer — scroll-reveal for feature cards
     5. Smooth active-section highlighting
   ═══════════════════════════════════════════════════════════════ */

/* ── 1. Nav scroll effect ─────────────────────────────────────── */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}, { passive: true });


/* ── 2. Mobile hamburger ──────────────────────────────────────── */
const hamburger   = document.getElementById('hamburger');
const mobileMenu  = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const open = mobileMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', open);
  // Animate the three bars into an X shape
  const spans = hamburger.querySelectorAll('span');
  if (open) {
    spans[0].style.transform = 'translateY(6px) rotate(45deg)';
    spans[1].style.opacity   = '0';
    spans[2].style.transform = 'translateY(-6px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity   = '';
    spans[2].style.transform = '';
  }
});

// Close mobile menu on any link click
mobileMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.querySelectorAll('span').forEach(s => {
      s.style.transform = '';
      s.style.opacity   = '';
    });
  });
});


/* ── 3. Hero terminal typing animation ───────────────────────── */
const heroLines = [
  { text: '# Dynamic Game Logic in OpenMS 1.1', cls: 'c-comment' },
  { text: '', cls: '' },
  { text: 'function start_game(player_name)', cls: '', parts: [
    { text: 'function ', cls: 'c-kw' },
    { text: 'start_game', cls: 'c-fn' },
    { text: '(player_name)', cls: '' },
  ]},
  { text: '    machine("Welcome, ", player_name)', cls: '', parts: [
    { text: '    ', cls: '' },
    { text: 'machine', cls: 'c-fn' },
    { text: '(', cls: '' },
    { text: '"Welcome, "', cls: 'c-str' },
    { text: ', player_name)', cls: '' },
  ]},
  { text: '    enemy_damage = random_number(10, 50)', cls: '', parts: [
    { text: '    enemy_damage = ', cls: '' },
    { text: 'random_number', cls: 'c-fn' },
    { text: '(', cls: '' },
    { text: '10', cls: 'c-num' },
    { text: ', ', cls: '' },
    { text: '50', cls: 'c-num' },
    { text: ')', cls: '' },
  ]},
  { text: '    machine("Enemy attacked! Damage: ", enemy_damage)', cls: '', parts: [
    { text: '    ', cls: '' },
    { text: 'machine', cls: 'c-fn' },
    { text: '(', cls: '' },
    { text: '"Enemy attacked! Damage: "', cls: 'c-str' },
    { text: ', enemy_damage)', cls: '' },
  ]},
];

const heroCodeEl = document.getElementById('heroCode');
let   lineIdx    = 0;
let   charIdx    = 0;
let   rendered   = [];  // built HTML per line

/**
 * Build the highlighted HTML for a single line spec.
 * Only characters up to `charCount` are included.
 */
function buildLineHTML(lineSpec, charCount) {
  if (!lineSpec.parts) {
    // plain coloured line
    const text = lineSpec.text.slice(0, charCount);
    if (!lineSpec.cls) return escapeHTML(text);
    return `<span class="${lineSpec.cls}">${escapeHTML(text)}</span>`;
  }

  // multi-part line
  let html      = '';
  let remaining = charCount;
  for (const part of lineSpec.parts) {
    if (remaining <= 0) break;
    const slice = part.text.slice(0, remaining);
    remaining  -= slice.length;
    html += part.cls
      ? `<span class="${part.cls}">${escapeHTML(slice)}</span>`
      : escapeHTML(slice);
  }
  return html;
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function tick() {
  if (lineIdx >= heroLines.length) return; // done

  const currentLine = heroLines[lineIdx];
  const lineLength  = currentLine.text.length;

  charIdx++;

  if (charIdx > lineLength) {
    // Finished current line — push it to rendered array
    rendered[lineIdx] = buildLineHTML(currentLine, lineLength);
    lineIdx++;
    charIdx = 0;

    // Pause slightly longer between lines
    redraw(true); // show cursor on blank new line
    setTimeout(tick, currentLine.text === '' ? 60 : 120);
    return;
  }

  rendered[lineIdx] = buildLineHTML(currentLine, charIdx);
  redraw(false);
  setTimeout(tick, currentLine.text === '' ? 0 : 22);
}

function redraw(showCursorOnNewLine) {
  const lines = rendered.map((html, i) => {
    if (i === lineIdx && !showCursorOnNewLine) {
      return html + '<span class="cursor">▌</span>';
    }
    return html;
  });

  // If we just finished a line and are on a blank new line, show cursor
  if (showCursorOnNewLine && lineIdx < heroLines.length) {
    lines.push('<span class="cursor">▌</span>');
  }

  heroCodeEl.innerHTML = lines.join('\n');
}

// CSS for blinking cursor (injected once)
const cursorStyle   = document.createElement('style');
cursorStyle.textContent = `
  .cursor {
    display: inline-block;
    color: #00f2fe;
    animation: blink .85s step-start infinite;
  }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
`;
document.head.appendChild(cursorStyle);

// Kick off typing after hero animates in
setTimeout(tick, 1200);


/* ── 4. Scroll-reveal for feature cards ──────────────────────── */
const featCards = document.querySelectorAll('.feat-card');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const card  = entry.target;
      const delay = (parseInt(card.dataset.index) || 0) * 120;
      setTimeout(() => card.classList.add('visible'), delay);
      revealObserver.unobserve(card);
    }
  });
}, { threshold: 0.15 });

featCards.forEach(card => revealObserver.observe(card));


/* ── 5. Active nav link highlight ────────────────────────────── */
const sections  = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navAnchors.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${id}`
          ? 'var(--text-primary)'
          : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(sec => sectionObserver.observe(sec));
