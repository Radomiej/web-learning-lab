import { fireEvent, render, screen } from '@testing-library/react';
import GameCoursePdf, { gameCoursePdfUrl } from './GameCoursePdf.jsx';

test('opens PDF preview with download and restores focus after Escape', () => {
  render(<GameCoursePdf />);
  const trigger = screen.getByRole('button', { name: 'Kurs GameDev · PDF' });
  expect(screen.getByRole('link', { name: 'Pobierz PDF' })).toHaveAttribute('download', 'kurs-gamedev-js.pdf');
  fireEvent.click(trigger);
  const dialog = screen.getByRole('dialog', { name: 'Podstawy GameDev JS' });
  expect(screen.getByRole('img')).toHaveAttribute('src', '/courses/previews/kurs-gamedev-js/page-1.webp');
  expect(screen.getByRole('link', { name: 'Otwórz w nowej karcie' })).toHaveAttribute('href', gameCoursePdfUrl);
  expect(screen.getAllByRole('link', { name: 'Pobierz PDF' })).toHaveLength(2);
  fireEvent.change(screen.getByLabelText('Kurs'), { target: { value: '2' } });
  expect(screen.getByRole('img')).toHaveAttribute('src', '/courses/previews/kurs-gamedev-js-tweeny/page-1.webp');
  expect(screen.getByRole('dialog', { name: 'Tweeny, PingPong i FadeOut' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Strona 7', exact: true }));
  expect(screen.getByRole('button', { name: 'Następna strona' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Poprzednia strona' }));
  expect(screen.getByRole('button', { name: 'Strona 6', exact: true })).toHaveAttribute('aria-current', 'page');
  fireEvent.click(screen.getByRole('button', { name: 'Następna strona' }));
  expect(screen.getByRole('img')).toHaveAttribute('src', '/courses/previews/kurs-gamedev-js-tweeny/page-7.webp');
  fireEvent.change(screen.getByLabelText('Kurs'), { target: { value: '1' } });
  expect(screen.getByRole('button', { name: 'Strona 1', exact: true })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('button', { name: 'Poprzednia strona' })).toBeDisabled();
  fireEvent.keyDown(dialog, { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(trigger).toHaveFocus();
});
