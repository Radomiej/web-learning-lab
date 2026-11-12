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
test('appends themeCss to the shadow style but keeps the default look without it',()=>{
 const {container}=render(<HtmlLessonExample page={{title:'T',code:'<p>x</p>',themeCss:'h1{color:gold}'}}/>);
 const root=[...container.querySelectorAll('div')].find(node=>node.shadowRoot)?.shadowRoot;
 const themed=root.querySelector('style').textContent;
 expect(themed).toContain('h1{color:gold}');
 const {container:plain}=render(<HtmlLessonExample page={{title:'T',code:'<p>x</p>'}}/>);
 const root2=[...plain.querySelectorAll('div')].find(node=>node.shadowRoot)?.shadowRoot;
 const unthemed=root2.querySelector('style').textContent;
 expect(unthemed).not.toContain('h1{color:gold}');
 expect(unthemed).toBe(themed.replace('\nh1{color:gold}',''));
});
test('renders actual HTML hierarchy in an isolated visual example',()=>{
 const {container}=render(<HtmlLessonExample page={htmlCssTeachingPages['html-text'][0]}/>);
 const root=[...container.querySelectorAll('div')].find(node=>node.shadowRoot)?.shadowRoot;
 expect(root.querySelector('h1').textContent).toBe('Rośliny');
 expect([...root.querySelectorAll('h3')].map(node=>node.textContent)).toEqual(['Mięta','Bazylia']);
});
