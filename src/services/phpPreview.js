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
  // The loading placeholder must not emit ready/signals: a snapshot of it
  // would grade the task against "Uruchamiam PHP.wasm…" before the real
  // output arrives and consume the pending check.
  const bridgeScript = options.bridge === false ? '' : `<script data-runtime="bridge">${escapeInlineScript(createRuntimeBridge({
    requestedSignals: options.requestedSignals || [],
    runId: options.runId,
  }).replace('TRACK_PLACEHOLDER', String(options.track || 'php')))}</script>`;
  return `${normalized.doctype}<html ${normalized.htmlAttributes}><head>${normalized.headMarkup}${inlineStyles(files)}</head><body>${normalized.bodyMarkup}${bridgeScript}</body></html>`;
}

export function buildPhpErrorDocument(message, files = {}, options = {}) {
  const safeMessage = escapeHtml(message || 'Nie udało się uruchomić kodu PHP.');
  return buildPhpPreviewDocument(
    `<main><h1>Nie udało się uruchomić PHP</h1><pre>${safeMessage}</pre></main>`,
    files,
    options,
  );
}
