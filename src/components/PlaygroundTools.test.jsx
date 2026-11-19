import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import PlaygroundTools from './PlaygroundTools.jsx';
import { playgroundProject } from '../data/playground.js';
import { serializeGameProject } from '../services/gameProjectTransfer.js';

vi.mock('../services/orbitPlayground.js', () => ({
  buildPlaygroundOrbit: vi.fn(async () => new Uint8Array([1, 2])),
  runPlaygroundOnLan: vi.fn(),
}));

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); });

test('imports the complete project and reports invalid JSON without invoking the updater', async () => {
  const onImport = vi.fn();
  render(<PlaygroundTools project={playgroundProject} onImport={onImport} />);
  const input = screen.getByLabelText('Plik JSON projektu gry');
  fireEvent.change(input, { target: { files: [{ name: 'gra.json', size: 100, text: async () => serializeGameProject(playgroundProject) }] } });
  await waitFor(() => expect(onImport).toHaveBeenCalledWith(playgroundProject));
  expect(screen.getByRole('status')).toHaveTextContent('Wczytano gra.json');
  onImport.mockClear();
  fireEvent.change(input, { target: { files: [{ name: 'broken.json', size: 5, text: async () => '{' }] } });
  await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Nie zaimportowano'));
  expect(onImport).not.toHaveBeenCalled();
});

test('downloads a JSON Blob with all files', () => {
  vi.useFakeTimers();
  const createObjectURL = vi.fn(() => 'blob:test'), revokeObjectURL = vi.fn();
  vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  try {
    render(<PlaygroundTools project={playgroundProject} onImport={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Eksportuj JSON' }));
    expect(createObjectURL).toHaveBeenCalledWith(expect.any(Blob));
    expect(click).toHaveBeenCalledOnce();
    expect(screen.getByRole('status')).toHaveTextContent('moja-gra.json');
    vi.runOnlyPendingTimers();
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test');
  } finally { vi.useRealTimers(); }
});

test('explains accountless temporary access for an unclaimed console and owner pairing', () => {
  render(<PlaygroundTools project={playgroundProject} onImport={() => {}} />);
  fireEvent.click(screen.getByRole('button', { name: 'Uruchom na Orbit' }));
  expect(screen.getByText(/pięciogodzinną sesję tymczasową bez konta dla nieprzypisanej konsoli/)).toBeInTheDocument();
  expect(screen.getByText(/zalogować się na konto, do którego chcesz ją przypisać/)).toBeInTheDocument();
  expect(screen.getByText(/Konsola już przypisana wymaga konta jej właściciela/)).toBeInTheDocument();
});

test('explains temporary access and owner login when the online handoff times out', async () => {
  vi.useFakeTimers();
  const popup = { postMessage: vi.fn() };
  vi.spyOn(window, 'open').mockReturnValue(popup);
  vi.stubGlobal('crypto', { randomUUID: vi.fn().mockReturnValueOnce('request-id').mockReturnValueOnce('project-id') });
  try {
    render(<PlaygroundTools project={playgroundProject} onImport={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Uruchom na Orbit' }));
    fireEvent.click(screen.getByRole('button', { name: 'Przygotuj grę do uruchomienia online' }));
    await act(async () => { await Promise.resolve(); await Promise.resolve(); });
    expect(screen.getByRole('status')).toHaveTextContent(/W Nekko wybierz sesję tymczasową bez konta dla nieprzypisanej konsoli albo zaloguj się, aby przypisać konsolę do swojego konta/);
    await act(async () => { await vi.advanceTimersByTimeAsync(180000); });
    expect(screen.getByRole('status')).toHaveTextContent(/Nekko nie odebrało gry/);
    expect(screen.getByRole('status')).toHaveTextContent(/Bez konta.*nieprzypisaną konsolę/);
    expect(screen.getByRole('status')).toHaveTextContent(/zaloguj się na konto właściciela/);
    expect(screen.getByRole('status')).toHaveTextContent(/pobrać paczkę \.orbit/);
  } finally { vi.useRealTimers(); }
});
