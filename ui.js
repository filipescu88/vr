'use strict';
const menu = document.querySelector('#mission-menu');
const compactScreen = window.matchMedia('(max-width: 650px), (max-height: 500px) and (pointer: coarse)');
const adaptMenu = () => { menu.open = !compactScreen.matches; };
adaptMenu();
compactScreen.addEventListener('change', adaptMenu);
document.querySelector('#reset').addEventListener('click', () => {
  if (compactScreen.matches) menu.open = false;
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.open) {
    menu.open = false;
    menu.querySelector('summary').focus();
  }
});
