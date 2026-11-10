import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import StepTrial from './StepTrial.jsx';

afterEach(cleanup);

const trace = {
  steps: [
    { caption: 'PHP wypisuje atrybut.', active: 'php', panels: { php: 'data-name="<?= e($name) ?>"' } },
    { caption: 'HTML z gotową wartością.', active: 'html', panels: { html: 'data-name="Ala"' } },
    { caption: 'Skrypt ustawia #result.', active: 'result', panels: { result: 'Cześć, Ala!' } },
  ],
};

it('renders panels, caption and step counter', () => {
  render(<StepTrial trace={trace} />);
  expect(screen.getByText('index.php')).toBeTruthy();
  expect(screen.getByRole('status').textContent).toBe('PHP wypisuje atrybut.');
  expect(screen.getByText('Krok 1 / 3')).toBeTruthy();
  expect(document.querySelector('.step-trial-panel--php.is-active')).toBeTruthy();
});

it('steps forward, back and resets with disabled ends', () => {
  render(<StepTrial trace={trace} />);
  const back = screen.getByRole('button', { name: /Wstecz/ });
  const next = screen.getByRole('button', { name: /Następny krok/ });
  const reset = screen.getByRole('button', { name: /Od początku/ });
  expect(back.disabled).toBe(true);
  fireEvent.click(next);
  expect(screen.getByRole('status').textContent).toBe('HTML z gotową wartością.');
  // panels carry forward — php still visible from step 1
  expect(screen.getByText('data-name="<?= e($name) ?>"')).toBeTruthy();
  fireEvent.click(next);
  expect(next.disabled).toBe(true);
  fireEvent.click(back);
  expect(screen.getByText('Krok 2 / 3')).toBeTruthy();
  fireEvent.click(reset);
  expect(screen.getByRole('status').textContent).toBe('PHP wypisuje atrybut.');
});
