import {render,screen} from '@testing-library/react';
import {htmlCssTeachingPages} from '../data/htmlCssTeachingPages.js';
import HtmlLessonExample from './HtmlLessonExample.jsx';
test('all 39 HTML steps provide a visual example without starting an iframe runtime',()=>{
 for(const [id,pages] of Object.entries(htmlCssTeachingPages).filter(([id])=>id.startsWith('html-')))for(const page of pages){
  const {container,unmount}=render(<HtmlLessonExample page={page}/>);
  expect(screen.getByRole('figure',{name:`Wizualny przykład: ${page.title}`})).toBeInTheDocument();
  expect(container.querySelector('iframe')).toBeNull();
  unmount();
 }
});
test('renders actual HTML hierarchy in an isolated visual example',()=>{
 const {container}=render(<HtmlLessonExample page={htmlCssTeachingPages['html-text'][0]}/>);
 const root=[...container.querySelectorAll('div')].find(node=>node.shadowRoot)?.shadowRoot;
 expect(root.querySelector('h1').textContent).toBe('Rośliny');
 expect([...root.querySelectorAll('h3')].map(node=>node.textContent)).toEqual(['Mięta','Bazylia']);
});
