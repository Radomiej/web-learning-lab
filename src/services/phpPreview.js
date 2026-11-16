import { createRuntimeBridge, normalizeHtmlDocument } from './previewDocument.js';

function escapeInlineScript(source = '') {
  return String(source).replace(/<\/?script/gi, (match) => match.replace('<', '\\x3c'));
}

function escapeStyle(source = '') {
  return String(source).replace(/<\/?style/gi, (match) => match.replace('<', '\\x3c'));
}

function escapeHtml(source = '') {
  return String(source)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function inlineStyles(files = {}) {
  return Object.entries(files.files || {})
    .filter(([path]) => path.toLowerCase().endsWith('.css'))
    .map(([, source]) => `<style data-file="styles.css">${escapeStyle(source)}</style>`)
    .join('');
}

export function buildPhpPreviewDocument(output = '', files = {}, options = {}) {
  const normalized = normalizeHtmlDocument(String(output).replace(/<link\b[^>]*href=["'](?:\.\/)?styles\.css["'][^>]*>/gi, ''));
  const bridge = createRuntimeBridge({
    requestedSignals: options.requestedSignals || [],
    runId: options.runId,
  }).replace('TRACK_PLACEHOLDER', String(options.track || 'php'));
  const bridgeScript = `<script data-runtime="bridge">${escapeInlineScript(bridge)}</script>`;
  return `${normalized.doctype}<html ${normalized.htmlAttributes}><head>${normalized.headMarkup}${inlineStyles(files)}</head><body ${normalized.bodyAttributes || ''}>${normalized.bodyMarkup}${bridgeScript}</body></html>`;
}

export function buildPhpErrorDocument(message, files = {}, options = {}) {
  const safeMessage = escapeHtml(message || 'Nie udało się uruchomić kodu PHP.');
  return buildPhpPreviewDocument(
    `<main><h1>Nie udało się uruchomić PHP</h1><pre>${safeMessage}</pre></main>`,
    files,
    options,
  );
}

// Signały DOM z odpowiedzi PHP bez renderowania jej w iframe — dla checków
// phpRequest każde żądanie dostaje własny snapshot. Kształt `dom` zgodny
// z describeElement z mostka podglądu (exists/text/attrs).
export function describePhpResponse(html = '', selectors = []) {
  const dom = {};
  if (typeof DOMParser !== 'function') return { text: String(html), dom };
  const doc = new DOMParser().parseFromString(String(html), 'text/html');
  for (const selector of selectors) {
    let element = null;
    try { element = doc.querySelector(selector); } catch { /* nieprawidłowy selektor */ }
    dom[selector] = element
      ? {
        exists: true,
        text: element.textContent || '',
        attrs: Array.from(element.attributes).reduce((result, attribute) => {
          result[attribute.name] = attribute.value;
          return result;
        }, {}),
      }
      : { exists: false, text: '', attrs: {} };
  }
  // Odpowiednik body.innerText: bez kodu script/style/template.
  const body = doc.body ? doc.body.cloneNode(true) : null;
  body?.querySelectorAll('script,style,template,noscript').forEach((node) => node.remove());
  return { text: body ? body.textContent || '' : '', dom };
}
