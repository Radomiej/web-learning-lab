import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import PlaygroundTools from './PlaygroundTools.jsx';
import { playgroundProject } from '../data/playground.js';
import { serializeGameProject } from '../services/gameProjectTransfer.js';

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
