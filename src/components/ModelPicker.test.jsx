import { fireEvent, render, screen } from '@testing-library/react';
import ModelPicker, { matchesModel } from './ModelPicker.jsx';
test('fuzzy search supports non-contiguous letters and exposes the full catalog', () => {
  const models = [{ id: 'openrouter/free', name: 'Free Models Router' }, { id: 'vendor/llama', name: 'Llama model' }];
  expect(matchesModel(models[0], 'fmr')).toBe(true);
  expect(matchesModel(models[1], 'xyz')).toBe(false);
  let chosen;
  render(<ModelPicker models={models} value="openrouter/free" onChange={value => { chosen = value; }} />);
  fireEvent.click(screen.getByRole('button', { name: 'Wybierz model' }));
  expect(screen.getAllByRole('option')).toHaveLength(2);
  fireEvent.change(screen.getByLabelText('Szukaj modelu'), { target: { value: 'llm' } });
  expect(screen.getAllByRole('option')).toHaveLength(1);
  fireEvent.change(screen.getByLabelText('Darmowy model OpenRouter'), { target: { value: 'vendor/llama' } });
  expect(chosen).toBe('vendor/llama');
});
