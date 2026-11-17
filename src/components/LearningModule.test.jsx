import { render, screen } from '@testing-library/react';
import LearningModule from './LearningModule.jsx';

test('keeps theory, quick check and the task visible in one continuous lesson page', () => {
  render(<LearningModule learning={<p>Treść lekcji</p>} quiz={<button type="button">Pytania lekcji</button>}>
    <input aria-label="Kod ucznia" defaultValue="const n = 3;" />
  </LearningModule>);

  expect(screen.getByRole('region', { name: 'Teoria i przykład' })).toHaveTextContent('Treść lekcji');
  expect(screen.getByRole('region', { name: 'Krótka próba' })).toHaveTextContent('Pytania lekcji');
  expect(screen.getByRole('region', { name: 'Zadanie do wykonania' })).toContainElement(screen.getByRole('textbox', { name: 'Kod ucznia' }));
  expect(screen.queryByRole('button', { name: 'Nauka' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Zadanie', exact: true })).not.toBeInTheDocument();
  expect(screen.getByRole('textbox', { name: 'Kod ucznia' })).toHaveValue('const n = 3;');
});

test('omits the optional quick-check section when a lesson has no quiz', () => {
  render(<LearningModule learning={<p>Treść lekcji</p>}><p>Edytor</p></LearningModule>);
  expect(screen.queryByRole('region', { name: 'Krótka próba' })).not.toBeInTheDocument();
  expect(screen.getByRole('region', { name: 'Zadanie do wykonania' })).toHaveTextContent('Edytor');
});
