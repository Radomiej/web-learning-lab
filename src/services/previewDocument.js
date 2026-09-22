const BRIDGE_SOURCE = 'web-learning-lab';
import { compileJsx, getReactRuntimeScripts } from './reactRuntimeAssets.js';

function escapeInlineScript(source = '') {
  return String(source)
    .replace(/<\/script/gi, '\\x3c/script')
    .replace(/<script/gi, '\\x3cscript');
}

function extractAttributeText(openingTag = '') {
  return openingTag
    .replace(/^<html\b/i, '')
    .replace(/>\s*$/, '')
    .trim();
}

export function normalizeHtmlDocument(html = '') {
  // The editor shows ordinary file references. The sandbox supplies their
  // current contents inline, so they must not also load from the Vite server.
  const source = String(html).trim()
    .replace(/<link\b[^>]*href=["'](?:\.\/)?(?:base|theme)\.css["'][^>]*>/gi, '')
    .replace(/<script\b[^>]*src=["'](?:\.\/)?script\.js["'][^>]*>\s*<\/script>/gi, '');
  const isFullDocument = /<!doctype\s+html/i.test(source)
    || /<html\b/i.test(source)
    || /<head\b/i.test(source)
    || /<body\b/i.test(source);

  if (!isFullDocument) {
    return {
      doctype: '<!doctype html>',
      htmlAttributes: 'lang="pl"',
      headMarkup: '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">',
      bodyMarkup: source,
    };
  }

  const doctype = source.match(/<!doctype[^>]*>/i)?.[0] ?? '<!doctype html>';
  const htmlOpeningTag = source.match(/<html\b[^>]*>/i)?.[0] ?? '<html lang="pl">';
  const headMarkup = source.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  const bodyMarkup = source.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? '';

  return {
    doctype,
    htmlAttributes: extractAttributeText(htmlOpeningTag) || 'lang="pl"',
    headMarkup,
    bodyMarkup,
  };
}

function selectorMatches(element, selector) {
  if (!selector) return false;
  try {
    return element.matches(selector);
  } catch {
    return false;
  }
}

export function createRuntimeBridge({ requestedSignals = [] } = {}) {
  const serializedSignals = JSON.stringify(requestedSignals);

  return `
(function webLearningLabBridge() {
  const source = ${JSON.stringify(BRIDGE_SOURCE)};
  const requestedSignals = ${serializedSignals};

  function send(type, payload) {
    window.parent.postMessage({ source, type, payload }, '*');
  }

  function stringify(value) {
    try {
      return String(value);
    } catch (error) {
      return '[unstringifiable value]';
    }
  }

  function selectorMatches(element, selector) {
    if (!element || !selector) return false;
    try { return element.matches(selector); } catch { return false; }
  }

  function describeElement(element) {
    if (!element) return { exists: false, text: '', attrs: {} };
    return {
      exists: true,
      text: element.textContent || '',
      className: typeof element.className === 'string' ? element.className : '',
      visible: Boolean(element.getClientRects().length),
      attrs: Array.from(element.attributes).reduce((result, attribute) => {
        result[attribute.name] = attribute.value;
        return result;
      }, {}),
    };
  }

  function snapshot() {
    const elements = Array.from(document.querySelectorAll('*')).map((element) => ({
      tagName: element.tagName.toLowerCase(),
      id: element.id,
      className: typeof element.className === 'string' ? element.className : '',
      text: element.textContent || '',
      attributes: Array.from(element.attributes).reduce((result, attribute) => {
        result[attribute.name] = attribute.value;
        return result;
      }, {}),
    }));
    const styles = requestedSignals
      .filter((signal) => signal && signal.type === 'computedStyle' && signal.selector && signal.property)
      .map((signal) => {
        let element = null;
        try { element = document.querySelector(signal.selector); } catch {}
        return {
          selector: signal.selector,
          property: signal.property,
          value: element ? getComputedStyle(element).getPropertyValue(signal.property).trim() : null,
        };
      });
    const dom = requestedSignals.reduce((result, signal) => {
      if (!signal || !signal.selector || !['elementExists', 'attributeEquals', 'textContains', 'textEquals', 'reactRendered'].includes(signal.type)) return result;
      let element = null;
      try { element = document.querySelector(signal.selector); } catch {}
      result[signal.selector] = describeElement(element);
      return result;
    }, {});
    const reactSignal = requestedSignals.find((signal) => signal && signal.type === 'reactRendered');
    let reactTarget = null;
    try { reactTarget = document.querySelector(reactSignal?.selector || '#root'); } catch {}

    send('signals', {
      html: document.documentElement.outerHTML,
      text: document.body ? document.body.innerText : '',
      elements,
      dom,
      styles,
      react: {
        rootReady: Boolean(window.React && window.ReactDOM && reactTarget && reactTarget.childElementCount > 0 && Object.keys(document.querySelector('#root') || {}).some(key => key.startsWith('__reactContainer'))),
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        clientWidth: document.documentElement.clientWidth || window.innerWidth,
        scrollWidth: Math.max(document.documentElement.scrollWidth, document.body ? document.body.scrollWidth : 0),
      },
    });
  }

  ['log', 'warn', 'error'].forEach((level) => {
    const original = typeof console[level] === 'function' ? console[level].bind(console) : function noop() {};
    console[level] = function bridgedConsole(...args) {
      original(...args);
      send('console', { level, args: args.map(stringify) });
    };
  });

  window.addEventListener('error', (event) => {
    send('runtime-error', { message: stringify(event.error || event.message), source: event.filename || '', line: event.lineno || 0 });
  });
  window.addEventListener('unhandledrejection', (event) => {
    send('runtime-error', { message: stringify(event.reason) });
  });

  window.addEventListener('message', (event) => {
    const message = event.data;
    if (!message || message.source !== source) return;
    if (message.type === 'collect-signals') {
      snapshot();
      return;
    }
    if (message.type !== 'run-action') return;
    const action = message.payload || {};
    let element = null;
    try { element = document.querySelector(action.selector); } catch {}
    if (!element) {
      send('signals', { interactions: { [action.checkId || action.id || action.selector]: { ok: false, selector: action.selector, reason: 'missing-selector' } }, action: { ok: false, selector: action.selector, reason: 'missing-selector' } });
      snapshot();
      return;
    }
    const before = describeElement(action.resultSelector ? document.querySelector(action.resultSelector) : element);
    if (action.action === 'click') element.click();
    if (action.action === 'input') {
      const setter = Object.getOwnPropertyDescriptor(element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, 'value')?.set;
      if (setter) setter.call(element, action.value == null ? '' : String(action.value));
      else element.value = action.value == null ? '' : String(action.value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }
    const interactionId = action.checkId || action.id || action.selector;
    window.setTimeout(() => {
      const target = action.resultSelector ? document.querySelector(action.resultSelector) : element;
      const interaction = describeElement(target);
      send('signals', { interactions: { [interactionId]: { ...interaction, before, ok: Boolean(target) } } });
      snapshot();
    }, 50);
  });

  window.addEventListener('load', () => {
    window.setTimeout(() => {
      send('ready', { track: ${JSON.stringify('TRACK_PLACEHOLDER')} });
      snapshot();
    }, 100);
  });
})();
`;
}

export function buildPreviewDocument(files = {}, options = {}) {
  const normalized = normalizeHtmlDocument(files.html ?? '');
  const baseCss = String(files.baseCss ?? '');
  const themeCss = String(files.themeCss ?? '');
  const isReactTrack = options.track === 'react';
  const compilation = isReactTrack ? compileJsx(files.js ?? '') : null;
  const compiledStudentCode = compilation?.warnings.length ? 'throw new Error(' + JSON.stringify(compilation.warnings.join('\n')) + ');' : isReactTrack ? compilation.code : String(files.js ?? '');
  const studentJavaScript = escapeInlineScript(compiledStudentCode);
  const bridge = createRuntimeBridge({ requestedSignals: options.requestedSignals ?? [] })
    .replace('TRACK_PLACEHOLDER', String(options.track ?? 'html'));
  const reactRuntime = isReactTrack ? getReactRuntimeScripts() : null;
  const localRuntimeScripts = reactRuntime ? [reactRuntime.react, reactRuntime.reactDom] : [];
  const runtimeScripts = localRuntimeScripts
    .concat(options.runtimeScripts ?? [])
    .map((script) => `<script data-runtime="true">${escapeInlineScript(script)}</script>`)
    .join('');
  const bridgeScript = `<script data-runtime="bridge">${escapeInlineScript(bridge)}</script>`;
  const styleMarkup = [
    `<style data-file="base.css">${baseCss}</style>`,
    `<style data-file="theme.css">${themeCss}</style>`,
  ].join('');

  return `${normalized.doctype}<html ${normalized.htmlAttributes}><head>${normalized.headMarkup}${styleMarkup}</head><body>${normalized.bodyMarkup}${bridgeScript}${runtimeScripts}<script data-file="script.js">${studentJavaScript}</script></body></html>`;
}
