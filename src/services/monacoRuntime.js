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

// basic-languages/php nie ma reguł wcinania — plik .php to u nas HTML z
// wplatanymi blokami PHP, więc reguły łączą oba światy: klamry i składnię
// z dwukropkiem (if: … endif, foreach: … endforeach) oraz tagi HTML.
export function phpIndentationConfiguration(monaco) {
  const { Indent, IndentOutdent } = monaco.languages.IndentAction;
  const empty = 'area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr|menuitem';
  const openTag = new RegExp(`<(?!(?:${empty})\\b|\\/|\\?|!)[\\w:-]+(\\s[^>]*[^/\\s>])?\\s*>\\s*$`, 'i');
  const phpBlockOpen = /(\{[^'"}]*|(if|elseif|foreach|for|while|switch)\s*\([^)]*\)\s*:|else\s*:|case\s+[^:]+:|default\s*:)\s*(\?>)?\s*$/;
  const phpTagOpen = /<\?(php|=)?\s*$/;
  return {
    onEnterRules: [
      {
        // <tag>\n</tag> — wciśnięta zawartość między znacznikami (jak w HTML).
        beforeText: new RegExp(`<(?!(?:${empty})\\b)([_:\\w][_:\\w-.\\d]*)([^/>]*(?!/)>)[^<]*$`, 'i'),
        afterText: /^<\/([_:\w][_:\w-.\d]*)\s*>$/i,
        action: { indentAction: IndentOutdent },
      },
      { beforeText: openTag, action: { indentAction: Indent } },
      { beforeText: phpBlockOpen, action: { indentAction: Indent } },
      { beforeText: phpTagOpen, action: { indentAction: Indent } },
    ],
    indentationRules: {
      increaseIndentPattern: new RegExp(
        `\\{[^'"}]*\\s*(\\?>)?\\s*$` +
        `|(if|elseif|foreach|for|while|switch)\\s*\\([^)]*\\)\\s*:\\s*(\\?>)?\\s*$` +
        `|(else|default)\\s*:\\s*(\\?>)?\\s*$` +
        `|case\\s+[^:]+:\\s*(\\?>)?\\s*$` +
        `|<\\?(php|=)?\\s*$` +
        `|<(?!(?:${empty})\\b|\\/|\\?|!)[\\w:-]+(\\s[^>]*[^/\\s>])?\\s*>\\s*$`,
        'i',
      ),
      decreaseIndentPattern: /^\s*(\}|\?>|<\/|end(if|for|foreach|while|switch)\b|(else|elseif|case|default)\b|<\?(php)?\s*(\}|\b(end(if|for|foreach|while|switch)|else|elseif)\b))/,
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
  monaco.languages.setLanguageConfiguration('php', {
    ...phpLanguage.conf,
    ...phpIndentationConfiguration(monaco),
  });

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
