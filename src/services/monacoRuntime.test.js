import { registerPhpLanguage } from './monacoRuntime.js';

function createFakeMonaco() {
  return {
    languages: {
      registered: [],
      registrations: [],
      getLanguages() {
        return this.registered;
      },
      register(value) {
        this.registrations.push(value);
        this.registered.push({ id: value.id });
      },
      setMonarchTokensProvider: vi.fn(),
      setLanguageConfiguration: vi.fn(),
    },
  };
}

test('registers PHP syntax and configuration only once', () => {
  const monaco = createFakeMonaco();
  const phpLanguage = { language: { tokenizer: {} }, conf: { brackets: [] } };

  expect(registerPhpLanguage(monaco, phpLanguage)).toBe(true);
  expect(registerPhpLanguage(monaco, phpLanguage)).toBe(false);
  expect(monaco.languages.registrations).toEqual([
    { id: 'php', aliases: ['PHP', 'php'], extensions: ['.php'] },
  ]);
  expect(monaco.languages.setMonarchTokensProvider).toHaveBeenCalledWith(
    'php',
    phpLanguage.language,
  );
  expect(monaco.languages.setLanguageConfiguration).toHaveBeenCalledWith(
    'php',
    phpLanguage.conf,
  );
});
