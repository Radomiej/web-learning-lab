let monacoPromise;

export function createMonacoEnvironment({
  EditorWorker,
  CssWorker = EditorWorker,
  HtmlWorker = EditorWorker,
  JsonWorker = EditorWorker,
  TypeScriptWorker = EditorWorker,
}) {
  return {
    ...(globalThis.MonacoEnvironment ?? {}),
    getWorker(_workerId, label) {
      switch (String(label).toLowerCase()) {
        case 'css':
        case 'scss':
        case 'less':
          return new CssWorker();
        case 'html':
        case 'handlebars':
        case 'razor':
          return new HtmlWorker();
        case 'json':
          return new JsonWorker();
        case 'javascript':
        case 'typescript':
          return new TypeScriptWorker();
        default:
          return new EditorWorker();
      }
    },
  };
}

export function registerPhpLanguage(monaco, phpLanguage) {
  const alreadyRegistered = monaco.languages
    .getLanguages()
    .some((language) => language.id === 'php');

  if (alreadyRegistered) {
    return false;
  }

  monaco.languages.register({
    id: 'php',
    aliases: ['PHP', 'php'],
    extensions: ['.php'],
  });
  monaco.languages.setMonarchTokensProvider('php', phpLanguage.language);
  monaco.languages.setLanguageConfiguration('php', phpLanguage.conf);

  return true;
}

export function loadMonaco() {
  if (!monacoPromise) {
    monacoPromise = Promise.all([
      import('monaco-editor'),
      import('monaco-editor/esm/vs/editor/editor.worker?worker'),
      import('monaco-editor/esm/vs/language/css/css.worker?worker'),
      import('monaco-editor/esm/vs/language/html/html.worker?worker'),
      import('monaco-editor/esm/vs/language/json/json.worker?worker'),
      import('monaco-editor/esm/vs/language/typescript/ts.worker?worker'),
      import('monaco-editor/esm/vs/basic-languages/php/php.js'),
    ]).then(([
      monacoModule,
      workerModule,
      cssWorkerModule,
      htmlWorkerModule,
      jsonWorkerModule,
      typeScriptWorkerModule,
      phpLanguageModule,
    ]) => {
      const monaco = monacoModule.default ?? monacoModule;
      const EditorWorker = workerModule.default ?? workerModule;
      const CssWorker = cssWorkerModule.default ?? cssWorkerModule;
      const HtmlWorker = htmlWorkerModule.default ?? htmlWorkerModule;
      const JsonWorker = jsonWorkerModule.default ?? jsonWorkerModule;
      const TypeScriptWorker = typeScriptWorkerModule.default ?? typeScriptWorkerModule;
      const phpLanguage = phpLanguageModule.default ?? phpLanguageModule;

      globalThis.MonacoEnvironment = createMonacoEnvironment({
        EditorWorker,
        CssWorker,
        HtmlWorker,
        JsonWorker,
        TypeScriptWorker,
      });

      registerPhpLanguage(monaco, phpLanguage);

      return { monaco, EditorWorker };
    });
  }

  return monacoPromise;
}
