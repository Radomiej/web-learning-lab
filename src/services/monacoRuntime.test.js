import { createMonacoEnvironment, phpIndentationConfiguration, registerPhpLanguage } from './monacoRuntime.js';

function createFakeMonaco() {
  return {
    languages: {
      IndentAction: { None: 0, Indent: 1, IndentOutdent: 2, Outdent: 3 },
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
    expect.objectContaining({ brackets: [], onEnterRules: expect.any(Array), indentationRules: expect.any(Object) }),
  );
});

test('php indentation rules cover HTML tags and nested PHP blocks', () => {
  const monaco = createFakeMonaco();
  const { onEnterRules, indentationRules } = phpIndentationConfiguration(monaco);
  const { increaseIndentPattern, decreaseIndentPattern } = indentationRules;

  const indents = (line) => onEnterRules.some((rule) => rule.beforeText.test(line));

  expect(indents('      <ul id="result">')).toBe(true);
  expect(indents('        <?php for ($i = 1; $i <= 3; $i++): ?>')).toBe(true);
  expect(indents('        <?php if ($view === \'card\'): ?>')).toBe(true);
  expect(indents('  <?php')).toBe(true);
  expect(indents('if ($ok) {')).toBe(true);
  expect(indents('      <input name="skills">')).toBe(false);
  expect(indents('        <?php endforeach; ?>')).toBe(false);

  expect(increaseIndentPattern.test('      <ul>')).toBe(true);
  expect(increaseIndentPattern.test('<?php foreach ($skills as $skill): ?>')).toBe(true);
  expect(decreaseIndentPattern.test('        <?php endforeach; ?>')).toBe(true);
  expect(decreaseIndentPattern.test('        <?php endif; ?>')).toBe(true);
  expect(decreaseIndentPattern.test('      </ul>')).toBe(true);
  expect(decreaseIndentPattern.test('  ?>')).toBe(true);
  expect(decreaseIndentPattern.test('    }')).toBe(true);
  expect(decreaseIndentPattern.test('        <?php else: ?>')).toBe(true);
  expect(decreaseIndentPattern.test('      <p id="result">tekst</p>')).toBe(false);
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
