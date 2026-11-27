import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import GameTutor from './GameTutor.jsx';

const project = { files: { 'game.js': 'student' } };
const loadConfig = async () => ({ enabled: true, configured: true, provider: 'openai', model: 'gpt-6-luna', modelLabel: 'GPT-6 Luna' });

test('shows GPT-6 Luna without a model picker and lets the student enable code proposals', async () => {
  const send = vi.fn(async () => ({ message: 'Gotowe', proposals: [] }));
  render(<GameTutor project={project} projectRevision={0} onApply={() => {}} loadConfig={loadConfig} sendMessage={send} />);
  fireEvent.click(screen.getByRole('button', { name: 'Pomoc AI' }));
  await screen.findByText('GPT-6 Luna');
  expect(screen.queryByRole('button', { name: 'Wybierz model' })).not.toBeInTheDocument();
  expect(screen.queryByText('Co chcesz zbudować?')).not.toBeInTheDocument();
  expect(screen.queryByPlaceholderText('Napisz wiadomość…')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('checkbox', { name: 'Edytuj kod' }));
  fireEvent.change(screen.getByLabelText('Twoje pytanie'), { target: { value: 'Sprawdź kod' } });
  fireEvent.click(screen.getByRole('button', { name: 'Wyślij pytanie' }));
  await screen.findByText('Gotowe');
  expect(send.mock.calls[0][0].project.files).toEqual(project.files);
  expect(send.mock.calls[0][0].model).toBe('gpt-6-luna');
  expect(send.mock.calls[0][0].allowEdits).toBe(true);
});

test('keeps file proposals off by default and applies only after an explicit click', async () => {
  let payload;
  const apply = vi.fn();
  render(<GameTutor project={project} projectRevision={0} onApply={apply} loadConfig={loadConfig} sendMessage={async value => {
    payload = value;
    return { message: 'Wyjaśnienie', proposals: value.allowEdits ? [{ path: 'components/Move.js', content: 'export class Move {}', reason: 'ruch' }] : [] };
  }} />);
  fireEvent.click(screen.getByRole('button', { name: 'Pomoc AI' }));
  await screen.findByText('GPT-6 Luna');
  fireEvent.change(screen.getByLabelText('Twoje pytanie'), { target: { value: 'Pomóż z ruchem' } });
  fireEvent.click(screen.getByRole('button', { name: 'Wyślij pytanie' }));
  await screen.findByText('Wyjaśnienie');
  expect(payload.project).toEqual(project);
  expect(payload.allowEdits).toBe(false);
  expect(payload.model).toBe('gpt-6-luna');
  expect(apply).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: /Zastosuj/ })).not.toBeInTheDocument();
});

test('hides the tutor when TUTOR_ENABLED is false', async () => {
  render(<GameTutor project={project} projectRevision={0} onApply={() => {}} loadConfig={async () => ({ enabled: false, configured: false })} />);
  await waitFor(() => expect(screen.queryByRole('button', { name: 'Pomoc AI' })).not.toBeInTheDocument());
});
