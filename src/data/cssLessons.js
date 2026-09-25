import { lessonNumber } from './lessonNumbers.js';

export const cssLessons = [
  { order: lessonNumber('css', 1), requiredProperties: ['color', 'background-color', 'selector'], requiredPractices: ['oddzielenie struktury od prezentacji', 'kaskada w styles.css'] },
  { order: lessonNumber('css', 2), requiredProperties: ['class', 'id', '[attribute]', ':hover', ':focus', 'specificity'], requiredPractices: ['najmniejsza potrzebna specyficzność', 'bez przypadkowego !important'] },
  { order: lessonNumber('css', 3), requiredProperties: ['px', '%', 'rem', 'em', 'vw', 'vh', 'font-family', 'font-size', 'font-weight', 'line-height', 'text-align', 'text-decoration', '--custom-property'], requiredPractices: ['czytelna typografia', 'kontrast tekstu', 'zmienne CSS'] },
  { order: lessonNumber('css', 4), requiredProperties: ['content', 'padding', 'border', 'margin', 'width', 'height', 'box-sizing', 'border-box', 'gap'], requiredPractices: ['box-sizing border-box', 'świadomy rytm odstępów'] },
  { order: lessonNumber('css', 5), requiredProperties: ['display', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'background', 'border-radius', 'overflow'], requiredPractices: ['normal flow przed position', 'overflow nie maskuje błędu'] },
  { order: lessonNumber('css', 6), requiredProperties: ['transition', ':hover', ':focus', '@keyframes', 'animation', 'prefers-reduced-motion'], requiredPractices: ['ruch wspiera informację zwrotną', 'reduced motion'] },
];
