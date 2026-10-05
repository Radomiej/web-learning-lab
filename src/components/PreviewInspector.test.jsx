import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PreviewInspector from './PreviewInspector.jsx';

test('keeps one iframe element while replacing the preview document', () => {
  const { rerender } = render(
    <PreviewInspector previewDocument="<main>one</main>" previewKey={1} />,
  );
  const firstFrame = screen.getByTitle('Podgląd strony ucznia');

  rerender(<PreviewInspector previewDocument="<main>two</main>" previewKey={2} />);

  expect(screen.getByTitle('Podgląd strony ucznia')).toBe(firstFrame);
});

test('exposes an accessible auto-preview toggle', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(
    <PreviewInspector
      previewDocument="<main>one</main>"
      previewKey={1}
      autoPreview={false}
      onAutoPreviewChange={onChange}
    />,
  );

  const toggle = screen.getByRole('checkbox', { name: 'Auto-podgląd' });
  expect(toggle).not.toBeChecked();
  await user.click(toggle);
  expect(onChange).toHaveBeenCalledWith(true);
});
test('game fullscreen keeps the same iframe and Escape restores focus', async () => {
  const user = userEvent.setup();
  const { container } = render(<PreviewInspector gameMode previewDocument="<canvas></canvas>" previewKey={1} />);
  const frame = container.querySelector('iframe');
  const button = screen.getByRole('button', { name: 'Pełny ekran gry' });
  await user.click(button);
  expect(screen.getByRole('dialog', { name: 'Podgląd gry' })).toBeInTheDocument();
  expect(container.querySelector('iframe')).toBe(frame);
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(button).toHaveFocus();
});
