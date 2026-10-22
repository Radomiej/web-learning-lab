import React, {useState} from 'react';
import {render,screen,fireEvent,cleanup} from '@testing-library/react';
import * as BabelNamespace from '@babel/standalone';
import {reactTeachingPages} from './reactTeachingPages.js';

const Babel = BabelNamespace.default ?? BabelNamespace;
const example = (id,title) => reactTeachingPages[id].find(page=>page.title===title).code;
function component(source,name='App') {
  const code=Babel.transform(source,{presets:['react'],sourceType:'script'}).code;
  return new Function('React','useState',`${code}\nreturn ${name};`)(React,useState);
}
afterEach(cleanup);
test('the JSX lesson renders calculated text and props through the actual examples',()=>{
  const App=component(example('react-jsx','Klamry wstawiają wartość JavaScript'));
  render(<App/>);
  expect(screen.getByText('Lena: 4')).toHaveAttribute('title','Lena');
  cleanup();
  const Props=component(example('react-components-props','Props to dane od rodzica'));
  render(<Props/>);expect(screen.getByText('Cześć, Lena!')).toBeVisible();
});
test('replacement updates use the snapshot while functional updates consume the queue',()=>{
  for(const [title,expected] of [['Dwa razy setCount(count + 1) daje tylko +1','1'],['Funkcja w setCount dostaje świeżą wartość','2']]) {
    const App=component(`function App(){const [count,setCount]=useState(0);${example('react-state-events',title)}\nreturn <button onClick={handleClick}>{count}</button>;}`);
    render(<App/>);fireEvent.click(screen.getByRole('button',{name:'0'}));
    expect(screen.getByRole('button',{name:expected})).toBeVisible();cleanup();
  }
});
