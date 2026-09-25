import { createMonacoEnvironment, registerPhpLanguage } from './monacoRuntime.js';

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

test('routes language workers to their local Monaco worker bundles', () => {
  class EditorWorker {}
  class CssWorker {}
  class HtmlWorker {}
  class JsonWorker {}
  class TypeScriptWorker {}

  const environment = createMonacoEnvironment({
    EditorWorker,
    CssWorker,
    HtmlWorker,
    JsonWorker,
    TypeScriptWorker,
  });

  expect(environment.getWorker('worker', 'editorWorkerService')).toBeInstanceOf(EditorWorker);
  expect(environment.getWorker('worker', 'css')).toBeInstanceOf(CssWorker);
  expect(environment.getWorker('worker', 'scss')).toBeInstanceOf(CssWorker);
  expect(environment.getWorker('worker', 'html')).toBeInstanceOf(HtmlWorker);
  expect(environment.getWorker('worker', 'json')).toBeInstanceOf(JsonWorker);
  expect(environment.getWorker('worker', 'javascript')).toBeInstanceOf(TypeScriptWorker);
  expect(environment.getWorker('worker', 'typescript')).toBeInstanceOf(TypeScriptWorker);
});
