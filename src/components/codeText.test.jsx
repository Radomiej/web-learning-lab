import { afterEach, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { codeText } from './codeText.jsx';

afterEach(cleanup);

it('renders backtick spans as code elements, keeping code literals intact', () => {
  const { container } = render(<p>{codeText('Znacznik `?>` kończy blok PHP, a `<?=` wypisuje wartość.')}</p>);
  const codes = [...container.querySelectorAll('code.inline-code')];
  expect(codes.map((code) => code.textContent)).toEqual(['?>', '<?=']);
  expect(container.textContent).toBe('Znacznik ?> kończy blok PHP, a <?= wypisuje wartość.');
});

it('leaves text without backticks unchanged', () => {
  const { container } = render(<p>{codeText('Zwykły tekst bez kodu.')}</p>);
  expect(container.querySelector('code')).toBeNull();
  expect(container.textContent).toBe('Zwykły tekst bez kodu.');
});
