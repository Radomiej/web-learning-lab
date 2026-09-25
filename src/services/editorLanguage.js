const LANGUAGE_BY_EXTENSION = Object.freeze({
  html: 'html',
  css: 'css',
  js: 'javascript',
  jsx: 'javascript',
  php: 'php',
});

export function getEditorLanguage(filePath = '') {
  const extension = String(filePath).toLowerCase().split('.').pop();
  return LANGUAGE_BY_EXTENSION[extension] || 'plaintext';
}

export function createEditorUri(workspaceKey = 'lesson', filePath = 'untitled') {
  return `inmemory://web-learning-lab/${encodeURIComponent(workspaceKey)}/${encodeURIComponent(filePath)}`;
}
