/* ═══════════════════════════════════════════════
   MINERALIS – main.js
   Menu interactions & effects
   ═══════════════════════════════════════════════ */

// ── Element refs ──
const frame      = document.getElementById('frame');
const titleBlock = document.getElementById('titleBlock');
const menuBlock  = document.getElementById('menuBlock');
const tooltip    = document.getElementById('tooltip');

// ════════════════════════════════
// MENU TOGGLE
// ════════════════════════════════

/**
 * Opens the menu: hides title block, reveals menu buttons.
 */
function openMenu() {
  titleBlock.style.display = 'none';
  menuBlock.classList.add('visible');
}

/**
 * Closes the menu: hides buttons, restores title block.
 */
function closeMenu() {
  menuBlock.classList.remove('visible');
  titleBlock.style.display = '';
}

// ════════════════════════════════
// MENU ACTIONS
// ════════════════════════════════

function menuAction(action) {
  // Flash feedback
  const flash = document.createElement('div');
  Object.assign(flash.style, {
    position: 'absolute', inset: '0',
    background: 'rgba(255,210,80,.12)',
    zIndex: '999', pointerEvents: 'none',
    animation: 'menuFlash .4s forwards'
  });
  frame.appendChild(flash);
  flash.addEventListener('animationend', () => flash.remove());

  switch (action) {
    case 'nova':
      console.log('[Mineralis] Nova Jornada iniciada');
      break;
    case 'explorar':
      console.log('[Mineralis] Abrindo mapa de exploração');
      break;
    case 'diario':
      console.log('[Mineralis] Diário de Bordo aberto');
      break;
    case 'opcoes':
      console.log('[Mineralis] Menu de Opções');
      break;
    case 'sair':
      console.log('[Mineralis] Saindo...');
      break;
  }
}

// ════════════════════════════════
// CARD SELECTION
// ════════════════════════════════

function selectCard(el) {
  if (el.classList.contains('locked')) return;
  document.querySelectorAll('.phase-card').forEach(c => c.classList.remove('selected'));
  el.classList.add('selected');
}

// ════════════════════════════════
// TOOLTIP
// ════════════════════════════════

document.querySelectorAll('.phase-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    tooltip.textContent = card.dataset.tip;
    tooltip.classList.add('visible');
  });
  card.addEventListener('mousemove', e => {
    const r = frame.getBoundingClientRect();
    let x = e.clientX - r.left + 12;
    let y = e.clientY - r.top  + 12;
    // prevent tooltip from going off right edge
    if (x + tooltip.offsetWidth > r.width - 10) x = e.clientX - r.left - tooltip.offsetWidth - 8;
    tooltip.style.left = x + 'px';
    tooltip.style.top  = y + 'px';
  });
  card.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
});

// ════════════════════════════════
// FLOATING DUST PARTICLES
// ════════════════════════════════

(function spawnParticles() {
  for (let i = 0; i < 24; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 2;
    Object.assign(p.style, {
      width:  size + 'px',
      height: size + 'px',
      left:   Math.random() * 100 + '%',
      bottom: Math.random() * 35  + '%',
      animationDuration: (Math.random() * 9 + 5) + 's',
      animationDelay:    (Math.random() * 8)      + 's',
    });
    frame.appendChild(p);
  }
})();

// ════════════════════════════════
// INJECT KEYFRAMES NOT IN CSS
// ════════════════════════════════

(function injectKeyframes() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes menuFlash {
      0%   { opacity: 1; }
      100% { opacity: 0; }
    }
  `;
  document.head.appendChild(style);
})();
