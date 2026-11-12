import { lessonNumber } from './lessonNumbers.js';

// Ścieżka CSS GD ćwiczy te same właściwości i praktyki co lekcje 201–206
// ścieżki CSS — zmieniają się przykłady: uczeń dostaje gotowy HTML
// interfejsu gry i sam pisze arkusz w klimacie gamedev.
export const cssGdLessons = [
  { order: lessonNumber('css-gd', 1), requiredProperties: ['color', 'background-color', 'selector'], requiredPractices: ['oddzielenie struktury od prezentacji', 'kaskada w styles.css'] },
  { order: lessonNumber('css-gd', 2), requiredProperties: ['class', 'id', '[attribute]', ':hover', ':focus', 'specificity'], requiredPractices: ['najmniejsza potrzebna specyficzność', 'bez przypadkowego !important'] },
  { order: lessonNumber('css-gd', 3), requiredProperties: ['px', '%', 'rem', 'em', 'vw', 'vh', 'font-family', 'font-size', 'font-weight', 'line-height', 'text-align', 'text-decoration', '--custom-property'], requiredPractices: ['czytelna typografia', 'kontrast tekstu', 'zmienne CSS'] },
  { order: lessonNumber('css-gd', 4), requiredProperties: ['content', 'padding', 'border', 'margin', 'width', 'height', 'box-sizing', 'border-box', 'gap'], requiredPractices: ['box-sizing border-box', 'świadomy rytm odstępów'] },
  { order: lessonNumber('css-gd', 5), requiredProperties: ['display', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'background', 'border-radius', 'overflow'], requiredPractices: ['normal flow przed position', 'overflow nie maskuje błędu'] },
  { order: lessonNumber('css-gd', 6), requiredProperties: ['transition', ':hover', ':focus', '@keyframes', 'animation', 'prefers-reduced-motion'], requiredPractices: ['ruch wspiera informację zwrotną', 'reduced motion'] },
];

// Identyfikatory lekcji CSS GD → id lekcji CSS, z której przejmujemy
// strony teoretyczne (te same pojęcia, inne przykłady w zadaniach).
export const cssGdTheorySource = {
  'css-gd-title-screen': 'css-intro',
  'css-gd-menu-selectors': 'css-selectors',
  'css-gd-quest-type': 'css-type-colors',
  'css-gd-inventory-box': 'css-box-model',
  'css-gd-hud-position': 'css-display-position',
  'css-gd-menu-motion': 'css-motion-project',
};
