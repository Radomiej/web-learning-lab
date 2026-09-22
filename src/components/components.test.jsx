import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

test('shows the first lesson, three editor files, preview status, and track navigation', () => {
  render(<App />);
  expect(screen.getByText('Web Learning Lab')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Pierwszy dokument HTML5', level: 1 })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'index.html' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'styles.css' })).toBeInTheDocument();
  expect(screen.queryByRole('tab', { name: 'theme.css' })).not.toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'script.js' })).toBeInTheDocument();
  expect(screen.getByText('Podgląd na żywo')).toBeInTheDocument();
  expect(screen.getByText('39 lekcji')).toBeInTheDocument();
});

test('changes the active editor file and opens the mobile sidebar', async () => {
  const user = userEvent.setup();
  render(<App />);
  await user.click(screen.getByRole('tab', { name: 'styles.css' }));
  expect(screen.getByLabelText('Edytor styles.css')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Otwórz menu' }));
  expect(screen.getByRole('navigation', { name: 'Nawigacja kursu' })).toHaveAttribute('data-open', 'true');
});

test('adds a component, restores it after reload and confirms reset',async()=>{
  const user=userEvent.setup();
  const view=render(<App/>);
  await user.click(screen.getByRole('button',{name:'Dodaj plik'}));
  await user.selectOptions(screen.getByLabelText('Typ pliku'),'react');
  await user.type(screen.getByLabelText('Nazwa pliku'),'components/Card');
  await user.click(screen.getByRole('button',{name:'Utwórz plik'}));
  expect(screen.getByLabelText('Edytor components/Card.jsx').value).toContain('export default function Card');
  view.unmount();
  render(<App/>);
  expect(screen.getByRole('tab',{name:'components/Card.jsx'})).toBeInTheDocument();
  await user.click(screen.getByRole('button',{name:'Wyczyść'}));
  expect(screen.getByRole('dialog',{name:'Przywrócić pliki zadania?'})).toBeInTheDocument();
  await user.click(screen.getByRole('button',{name:'Anuluj'}));
  expect(screen.getByRole('tab',{name:'components/Card.jsx'})).toBeInTheDocument();
  await user.click(screen.getByRole('tab',{name:'components/Card.jsx'}));
  await user.click(screen.getByRole('button',{name:'Wyczyść'}));
  await user.click(screen.getByRole('button',{name:'Przywróć starter'}));
  expect(screen.queryByRole('tab',{name:'components/Card.jsx'})).not.toBeInTheDocument();
  expect(screen.getByLabelText('Edytor index.html')).toHaveFocus();
});

test('collapses and restores the lesson panel without remounting the sandbox or losing editor content', async () => {
  const user = userEvent.setup();
  const { container } = render(<App />);
  const frame = container.querySelector('iframe');
  const editor = screen.getByLabelText('Edytor index.html');
  const value = editor.value;
  await user.click(screen.getByRole('button', { name: 'Schowaj panel lekcji' }));
  expect(container.querySelector('.app-shell')).toHaveClass('app-shell--sidebar-collapsed');
  expect(screen.getByRole('button', { name: 'Pokaż panel lekcji' })).toHaveAttribute('aria-expanded', 'false');
  expect(container.querySelector('iframe')).toBe(frame);
  expect(editor.value).toBe(value);
  await user.click(screen.getByRole('button', { name: 'Pokaż panel lekcji' }));
  expect(container.querySelector('.app-shell')).not.toHaveClass('app-shell--sidebar-collapsed');
  expect(screen.getByRole('button', { name: 'Schowaj panel lekcji' })).toHaveAttribute('aria-expanded', 'true');
});

test('only example exercises expose a solution button', async () => {
  const user = userEvent.setup();
  render(<App />);
  expect(screen.getByRole('button', { name: 'Pokaż rozwiązanie' })).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: /Samodzielnie/i }));
  expect(screen.queryByRole('button', { name: 'Pokaż rozwiązanie' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('tab', { name: /Layout/ }));
  await user.click(screen.getByRole('button', { name: /Wyzwanie/i }));
  expect(screen.queryByRole('button', { name: 'Pokaż rozwiązanie' })).not.toBeInTheDocument();
});
