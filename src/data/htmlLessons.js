const htmlTags = {
  1: ['html', 'head', 'body', 'div'],
  2: ['doctype', 'html', 'head', 'body', 'meta', 'title'],
  3: ['h1', 'h6', 'p', 'br', 'hr', 'strong', 'em'],
  4: ['ul', 'ol', 'li', 'dl', 'dt', 'dd'],
  5: ['a', 'nav'],
  6: ['img', 'figure', 'figcaption', 'audio', 'video', 'source'],
  7: ['table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'],
  8: ['form', 'label', 'input', 'textarea', 'select', 'option', 'button', 'fieldset', 'legend'],
  9: ['header', 'main', 'section', 'article', 'aside', 'footer', 'time', 'div', 'span'],
};

export const htmlLessons = Object.entries(htmlTags).map(([order, requiredTags]) => ({
  order: Number(order),
  requiredTags,
  requiredPractices: [
    'semantyczny HTML',
    'poprawne zagnieżdżanie',
    'czytelne wcięcia',
    ...(Number(order) >= 5 ? ['dostępność klawiaturą'] : []),
  ],
  assets: Number(order) === 1
    ? ['/course-assets/01-przeplyw-html-css.svg']
    : Number(order) === 2
      ? ['/course-assets/02-drzewo-html.svg']
      : Number(order) === 6
        ? ['/course-assets/06-html-semantyczne-wireframe.png']
        : Number(order) === 8
          ? ['/course-assets/07-formularz-tabela-wireframe.png']
          : [],
}));
