const slides = [...document.querySelectorAll('.slide')];
const counter = document.getElementById('counter');
const bar = document.getElementById('bar');
let current = 0;
let timers = [];

// Mostra os elementos [data-anim] do slide um por vez (efeito cascata)
function animateIn(slide) {
  timers.forEach(clearTimeout);
  timers = [];
  slide.querySelectorAll('[data-anim]').forEach((el, i) => {
    el.classList.remove('in');
    timers.push(setTimeout(() => el.classList.add('in'), 150 + i * 160));
  });
  slide.querySelectorAll('.count').forEach(el => {
    timers.push(setTimeout(() => countUp(el), 900));
  });
}

// Contador numérico animado (usado na inflação)
function countUp(el) {
  const to = parseFloat(el.dataset.to);
  const dec = parseInt(el.dataset.dec || 0, 10);
  const duration = 1600;
  const start = performance.now();
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (to * eased).toLocaleString('pt-BR', {
      minimumFractionDigits: dec,
      maximumFractionDigits: dec
    });
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function go(index) {
  index = Math.max(0, Math.min(slides.length - 1, index));
  slides.forEach((s, i) => {
    s.classList.toggle('active', i === index);
    s.classList.toggle('past', i < index);
  });
  current = index;
  counter.textContent = `${index + 1} / ${slides.length}`;
  bar.style.width = `${((index + 1) / slides.length) * 100}%`;
  history.replaceState(null, '', `#${index + 1}`);
  animateIn(slides[index]);
}

const next = () => go(current + 1);
const prev = () => go(current - 1);

document.getElementById('next').addEventListener('click', next);
document.getElementById('prev').addEventListener('click', prev);
document.getElementById('fs').addEventListener('click', toggleFullscreen);

function toggleFullscreen() {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
  else document.exitFullscreen?.();
}

document.addEventListener('keydown', e => {
  if (['ArrowRight', 'PageDown', ' ', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
  else if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); prev(); }
  else if (e.key === 'Home') go(0);
  else if (e.key === 'End') go(slides.length - 1);
  else if (e.key.toLowerCase() === 'f') toggleFullscreen();
});

// Deslizar no celular/tablet
let touchX = null;
document.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
document.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
  touchX = null;
});

// Se alguma foto não carregar (sem internet), mostra as iniciais no lugar
document.querySelectorAll('img').forEach(img => {
  img.addEventListener('error', () => {
    const initials = img.alt.split(' ').filter(w => w.length > 2).map(w => w[0]).join('').slice(0, 3);
    const box = document.createElement('div');
    box.className = 'img-fallback';
    box.textContent = initials;
    img.replaceWith(box);
  });
});

go((parseInt(location.hash.slice(1), 10) || 1) - 1);
