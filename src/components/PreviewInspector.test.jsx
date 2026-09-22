import { render, screen } from '@testing-library/react';
import PreviewInspector from './PreviewInspector.jsx';

test('keeps one iframe element while replacing the preview document', () => {
  const { rerender } = render(
    <PreviewInspector previewDocument="<main>one</main>" previewKey={1} />,
  );
  const firstFrame = screen.getByTitle('Podgląd strony ucznia');

  rerender(<PreviewInspector previewDocument="<main>two</main>" previewKey={2} />);

  expect(screen.getByTitle('Podgląd strony ucznia')).toBe(firstFrame);
});
