const themeBtn = document.getElementById('themeBtn');
const menuBtn = document.getElementById('menuBtn');
const mnav = document.getElementById('mnav');

let theme = localStorage.getItem('theme') || 'dark';
document.documentElement.setAttribute('data-theme', theme);

themeBtn.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
});

menuBtn.addEventListener('click', () => {
  const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
  menuBtn.setAttribute('aria-expanded', !isOpen);
  mnav.hidden = isOpen;
});

document.getElementById('year').textContent = new Date().getFullYear();
