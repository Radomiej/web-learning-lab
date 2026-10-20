import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import LearningModule from './LearningModule.jsx';

test('shows learning first, exposes quiz and task in sequence, and keeps an edited task when returning', () => {
  function Fixture() {
    const [stage, setStage] = useState('learn');
    return <LearningModule stage={stage} onChange={setStage} learning={<p>Treść lekcji</p>} quiz={<p>Pytania lekcji</p>}><input aria-label="Kod ucznia" defaultValue="" /></LearningModule>;
  }
  render(<Fixture />);
  expect(screen.getByText('Treść lekcji')).toBeVisible();
  expect(screen.queryByRole('textbox', {name:'Kod ucznia'})).toBeNull();
  fireEvent.click(screen.getByRole('button', {name:'Sprawdź się w quizie →'}));
  expect(screen.getByText('Pytania lekcji')).toBeVisible();
  expect(screen.getByText('Treść lekcji')).not.toBeVisible();
  fireEvent.click(screen.getByRole('button', {name:'Zadanie',exact:true}));
  fireEvent.change(screen.getByRole('textbox',{name:'Kod ucznia'}),{target:{value:'const n = 3;'}});
  fireEvent.click(screen.getByRole('button', {name:'Nauka',exact:true}));
  fireEvent.click(screen.getByRole('button', {name:'Zadanie',exact:true}));
  expect(screen.getByRole('textbox',{name:'Kod ucznia'})).toHaveValue('const n = 3;');
});
