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
