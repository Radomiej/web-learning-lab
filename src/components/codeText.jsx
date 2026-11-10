// Tekst ze spanami kodu: `fragment` -> <code class="inline-code">fragment</code>.
// Używany w układzie „pilot" — tytuły, teksty teorii, pytania, podpisy prób i
// kryteria — tam gdzie wcześniej backticki renderowały się jako zwykły tekst.
export function codeText(text) {
  const parts = String(text ?? '').split('`');
  if (parts.length < 3) return parts.join('');
  return parts.map((part, index) =>
    index % 2 === 1
      ? <code key={index} className="inline-code">{part}</code>
      : part,
  );
}
