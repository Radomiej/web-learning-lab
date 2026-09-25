let monacoPromise;

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
      import('monaco-editor/esm/vs/basic-languages/php/php.js'),
    ]).then(([monacoModule, workerModule, phpLanguageModule]) => {
      const monaco = monacoModule.default ?? monacoModule;
      const EditorWorker = workerModule.default ?? workerModule;
      const phpLanguage = phpLanguageModule.default ?? phpLanguageModule;

      globalThis.MonacoEnvironment = {
        ...(globalThis.MonacoEnvironment ?? {}),
        getWorker() {
          return new EditorWorker();
        },
      };

      registerPhpLanguage(monaco, phpLanguage);

      return { monaco, EditorWorker };
    });
  }

  return monacoPromise;
}
