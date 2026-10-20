import {fireEvent,render,screen,waitFor} from '@testing-library/react';
import {vi,test,expect,afterEach} from 'vitest';
import AssignmentWorkspace from './AssignmentWorkspace.jsx';
vi.mock('./CodeEditor.jsx',()=>({default:({fileLabel,value,onChange,onRun})=><div><textarea aria-label={`Edytor ${fileLabel}`} value={value} onChange={event=>onChange(event.target.value)}/><button onClick={onRun}>Uruchom</button></div>}));
afterEach(()=>{vi.unstubAllGlobals();localStorage.clear();history.replaceState(null,'','#/');});
test('generates a seeded task, edits files and requires student ID for an immutable submission',async()=>{
  const task={id:'test-task',templateId:'java-array',generatorVersion:'1',difficulty:'standard',seed:'KLASA-A',index:0,title:'Suma',prompt:'Policz sumę.',criteria:['Obsłuż pustą tablicę.'],starterFiles:{'Main.java':'start'},params:{}};
  vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>({assignment:task})})));
  const submit=vi.fn(async()=> 'submission'),flush=vi.fn(async()=>{});
  render(<AssignmentWorkspace appId="java-lab" onBack={()=>{}} clientFactory={()=>({start(){},stop(){},submit,flush})}/>);
  fireEvent.change(screen.getByLabelText('Seed zestawu'),{target:{value:'KLASA-A'}});
  fireEvent.change(screen.getByLabelText('Liczba zadań'),{target:{value:'1'}});
  fireEvent.click(screen.getByRole('button',{name:'Generuj zestaw'}));
  await screen.findByText('Policz sumę.');
  expect(fetch.mock.calls[0][0]).toBe('/api/assignments');
  fireEvent.change(screen.getByLabelText('Edytor Main.java'),{target:{value:'my solution'}});
  fireEvent.click(screen.getByRole('button',{name:'Oddaj do oceny'}));
  expect(submit).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Twoje ID ucznia'),{target:{value:'3A-12'}});
  fireEvent.click(screen.getByRole('button',{name:'Oddaj do oceny'}));
  await waitFor(()=>expect(submit).toHaveBeenCalledWith(expect.objectContaining({studentId:'3A-12',files:{'Main.java':'my solution'}})));
  expect(screen.queryByText('Rozwiązanie referencyjne')).toBeNull();
});

test('preselects the current lesson and task level, hides details, and generates fresh individual variants',async()=>{
 history.replaceState(null,'','#zadania?lekcja=js-fetch&zadanie=js-fetch-independent-v1&poziom=challenge');
 localStorage.setItem('www-lab-assignment-identity',JSON.stringify({studentId:'3A-12'}));
 const task={id:'fetch-task',templateId:'js-lesson-fetch',generatorVersion:'1',difficulty:'easy',seed:'generated',index:0,title:'Pobierz',prompt:'Wczytaj dane.',criteria:['Pokaż wynik.'],starterFiles:{'index.html':'<output id="result"></output>','script.js':''},params:{}};
 vi.stubGlobal('fetch',vi.fn(async()=>({ok:true,json:async()=>({assignment:task})})));
 render(<AssignmentWorkspace appId="www-lab" onBack={()=>{}} clientFactory={()=>({start(){},stop(){},submit:async()=>'',flush:async()=>{}})}/>);
 expect(screen.getByLabelText('Zagadnienie')).toHaveValue('js-lesson-fetch');
 const slider=screen.getByRole('slider');expect(slider).toHaveValue('2');expect(slider).toHaveAttribute('aria-valuetext','Wyzwanie');
 expect(screen.getByText('Szczegóły zestawu').closest('details')).not.toHaveAttribute('open');
 fireEvent.change(slider,{target:{value:'0'}});fireEvent.change(screen.getByLabelText('Liczba zadań'),{target:{value:'1'}});
 fireEvent.click(screen.getByRole('button',{name:'Generuj zestaw'}));await screen.findByText('Wczytaj dane.');
 const first=JSON.parse(fetch.mock.calls[0][1].body);expect(first).toMatchObject({templateId:'js-lesson-fetch',difficulty:'easy'});expect(first.seed).toContain('3A-12');
 fireEvent.click(screen.getByRole('button',{name:'Generuj zestaw'}));await waitFor(()=>expect(fetch).toHaveBeenCalledTimes(2));
 expect(JSON.parse(fetch.mock.calls[1][1].body).seed).not.toBe(first.seed);
});
