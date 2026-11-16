import { lessonNumber } from './lessonNumbers.js';

// Ścieżka HTML GD ćwiczy te same elementy i praktyki co lekcje 101–109
// ścieżki HTML — zmieniają się tylko przykłady (interfejs gry) i motyw.
const htmlGdTags = {
  1: ['html', 'head', 'body', 'div'],
  2: ['doctype', 'html', 'head', 'body', 'meta', 'title'],
  3: ['h1', 'h6', 'p', 'br', 'hr', 'strong', 'em'],
  4: ['ul', 'ol', 'li', 'dl', 'dt', 'dd'],
  5: ['a', 'nav'],
  6: ['img', 'figure', 'figcaption', 'audio', 'video', 'source'],
  7: ['table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'],
  8: ['form', 'label', 'input', 'textarea', 'select', 'option', 'button', 'fieldset', 'legend'],
  9: ['header', 'main', 'section', 'article', 'aside', 'footer', 'time', 'div', 'span'],
  10: ['div', 'span', 'class', 'id'],
};

// Identyfikatory lekcji HTML GD → id lekcji HTML, z której przejmujemy
// strony teoretyczne (te same pojęcia, inne przykłady w zadaniach).
export const htmlGdTheorySource = {
  'html-gd-title-screen': 'html-three-layers',
  'html-gd-game-page': 'html-document',
  'html-gd-quest-log': 'html-text',
  'html-gd-inventory': 'html-lists',
  'html-gd-main-menu': 'html-links',
  'html-gd-gallery': 'html-media',
  'html-gd-leaderboard': 'html-tables',
  'html-gd-character': 'html-forms',
  'html-gd-launch-page': 'html-semantics',
  'html-gd-hud-slots': 'html-semantics',
};

export const htmlGdLessons = Object.entries(htmlGdTags).map(([order, requiredTags]) => ({
  order: lessonNumber('html-gd', Number(order)),
  requiredTags,
  requiredPractices: [
    'semantyczny HTML',
    'poprawne zagnieżdżanie',
    'czytelne wcięcia',
    ...(Number(order) >= 5 ? ['dostępność klawiaturą'] : []),
  ],
  assets: Number(order) === 6 ? ['/course-assets/html-gd/key-art.svg'] : [],
}));
