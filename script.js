// Mobile nav
const toggle = document.querySelector('.nav-toggle');
const list = document.getElementById('nav-list');
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', open);
  list.classList.toggle('open', open);
});
list.addEventListener('click', e => {
  if (e.target.closest('a')) { toggle.setAttribute('aria-expanded', 'false'); list.classList.remove('open'); }
});

// Headline words rise one by one
document.querySelectorAll('.split').forEach(el => {
  let i = 0;
  el.innerHTML = el.innerHTML.split(/<br\s*\/?>/).map(line => line.trim().split(/\s+/)
    .map(w => `<span class="w" style="animation-delay:${i++ * 70}ms">${w}</span>`).join(' ')).join('<br>');
});

// Section drawing: draws itself once in view
const drawing = document.querySelector('.drawing');
drawing.querySelectorAll('path, rect').forEach(el => el.setAttribute('pathLength', '1'));

// Reveal on scroll
const io = new IntersectionObserver(entries => entries.forEach(e => {
  if (!e.isIntersecting) return;
  e.target.classList.add(e.target === drawing ? 'is-drawn' : 'is-in');
  io.unobserve(e.target);
}), { threshold: .2 });
[drawing, ...document.querySelectorAll('[data-reveal], [data-door]')].forEach(el => io.observe(el));

// Scope list <-> drawing highlight
const items = document.querySelectorAll('.scope-list li');
const setActive = n => {
  drawing.classList.toggle('has-active', !!n);
  drawing.querySelectorAll('[data-part]').forEach(g => g.classList.toggle('is-active', g.dataset.part === n));
  items.forEach(li => li.classList.toggle('is-active', li.dataset.part === n));
};
items.forEach(li => {
  li.addEventListener('mouseenter', () => setActive(li.dataset.part));
  li.addEventListener('click', () => setActive(li.dataset.part));
});
document.querySelector('.scope-list').addEventListener('mouseleave', () => setActive(null));
drawing.querySelectorAll('.tag').forEach(t => t.addEventListener('click', () => {
  setActive(t.dataset.part);
  document.querySelector(`.scope-list li[data-part="${t.dataset.part}"]`).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}));

// Touch screens: highlight the scope that scrolls past the middle of the screen
if (matchMedia('(hover: none)').matches) {
  const spy = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && setActive(e.target.dataset.part)),
    { rootMargin: '-60% 0px -35% 0px' });
  items.forEach(li => spy.observe(li));
}

// Quote form: opens the device's mail app (Gmail on Android, Mail on iOS, Outlook/Gmail on PC) with the enquiry filled in
const form = document.querySelector('.form');
form.addEventListener('submit', e => {
  e.preventDefault();
  const d = Object.fromEntries(new FormData(form));
  if (d._gotcha) return;
  const body = [
    `Name: ${d.name}`,
    d.company ? `Company: ${d.company}` : null,
    `Mobile: ${d.phone}`,
    `Email: ${d.email}`,
    `Scope: ${d.scope}`,
    d.location ? `Project location: ${d.location}` : null,
    '', 'Project details:', d.message
  ].filter(l => l !== null).join('\n');
  location.href = 'mailto:' + form.dataset.to
    + '?subject=' + encodeURIComponent(`Quotation request: ${d.scope}${d.location ? ' – ' + d.location : ''}`)
    + '&body=' + encodeURIComponent(body);
});

document.getElementById('yr').textContent = new Date().getFullYear();
