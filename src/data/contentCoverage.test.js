import { lessons } from './lessons.js';

test('HTML lessons cover the required tags from the source course', () => {
  const tags = new Set(
    lessons
      .filter((lesson) => lesson.track === 'html')
      .flatMap((lesson) => lesson.requiredTags),
  );
  [
    'doctype', 'html', 'head', 'body', 'meta', 'title', 'h1', 'h6', 'p',
    'br', 'hr', 'strong', 'em', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'a',
    'nav', 'img', 'figure', 'figcaption', 'audio', 'video', 'source',
    'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    'form', 'label', 'input', 'textarea', 'select', 'option', 'button',
    'fieldset', 'legend', 'header', 'main', 'section', 'article', 'aside',
    'footer', 'time', 'div', 'span',
  ].forEach((tag) => expect(tags).toContain(tag));
});

test('layout lessons cover the properties needed for 24 tasks', () => {
  const properties = new Set(
    lessons
      .filter((lesson) => lesson.track === 'layout')
      .flatMap((lesson) => lesson.requiredProperties),
  );
  [
    'display', 'flex-direction', 'justify-content', 'align-items', 'gap',
    'flex-wrap', 'flex-basis', 'flex-grow', 'flex-shrink', 'order',
    'align-self', 'grid-template-columns', 'grid-template-areas',
    'grid-area', '@media', 'max-width', 'overflow',
  ].forEach((property) => expect(properties).toContain(property));
});

test('React lessons cover JSX, state, events, effects, and custom hooks', () => {
  const apis = new Set(
    lessons
      .filter((lesson) => lesson.track === 'react')
      .flatMap((lesson) => lesson.requiredApis),
  );
  ['React.createElement', 'React.useState', 'React.useEffect',
    'ReactDOM.createRoot', 'props', 'onClick', 'onChange'].forEach((api) => {
    expect(apis).toContain(api);
  });
});
