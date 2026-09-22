const FILE_KEYS = {
  html: 'html',
  'index.html': 'html',
  baseCss: 'baseCss',
  'base.css': 'baseCss',
  themeCss: 'themeCss',
  'theme.css': 'themeCss',
  js: 'js',
  'script.js': 'js',
};

function safeString(value) {
  return value == null ? '' : String(value);
}

function checkLabel(check) {
  return check.label || check.id || 'Warunek';
}

function resultFor(check, passed, message, hint = check.hint) {
  return {
    id: check.id || `check-${Math.random().toString(36).slice(2)}`,
    label: checkLabel(check),
    passed,
    message,
    hint: hint || 'Sprawdź cel zadania i uruchom podgląd ponownie.',
  };
}

function getFile(files = {}, file) {
  return safeString(files[FILE_KEYS[file] || file]);
}

function getDomSignal(signals = {}, selector) {
  if (!selector) return null;
  const dom = signals.dom || {};
  if (Array.isArray(dom)) {
    return dom.find((item) => item && item.selector === selector) || null;
  }
  return dom[selector] || null;
}

function getStyleSignal(signals = {}, selector, property) {
  const styles = signals.styles || {};
  const key = `${selector}|${property}`;
  if (typeof styles[key] === 'string') return styles[key];
  if (styles[selector] && typeof styles[selector] === 'object') return styles[selector][property];
  if (Array.isArray(styles)) {
    return styles.find((item) => item.selector === selector && item.property === property)?.value;
  }
  return undefined;
}

function normalizeCssValue(value) {
  return safeString(value)
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*!important\s*$/i, '')
    .toLowerCase();
}

function stripCssComments(source) {
  return safeString(source).replace(/\/\*[\s\S]*?\*\//g, '');
}

function escapeRegExp(value) {
  return safeString(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readCssDeclaration(source, selector, property) {
  const cleanSource = stripCssComments(source);
  const selectorPattern = escapeRegExp(selector).replace(/\\\s+/g, '\\s*');
  const rule = new RegExp(`(?:^|})\\s*${selectorPattern}\\s*\\{([^{}]*)\\}`, 'im').exec(cleanSource);
  if (!rule) return null;

  const declarationPattern = new RegExp(`(?:^|;)\\s*${escapeRegExp(property)}\\s*:\\s*([^;]+)`, 'i');
  return declarationPattern.exec(rule[1])?.[1]?.trim() || null;
}

function expectedValue(check, fallback = '') {
  return check.expected ?? check.value ?? check.needle ?? fallback;
}

function evaluateOne(check = {}, context = {}) {
  const files = context.files || {};
  const signals = context.signals || {};

  try {
    switch (check.type) {
      case 'sourceIncludes': {
        const source = getFile(files, check.file);
        const needle = safeString(expectedValue(check));
        return source.includes(needle)
          ? resultFor(check, true, 'Znaleziono wymagany fragment kodu.')
          : resultFor(check, false, `Brak fragmentu „${needle}” w ${check.file || 'pliku'}.`);
      }
      case 'sourceDeclaration': {
        const property = safeString(check.property).trim();
        const selector = safeString(check.selector).trim();
        const actual = readCssDeclaration(getFile(files, check.file), selector, property);
        const expected = normalizeCssValue(expectedValue(check));
        const passed = Boolean(actual) && (expected === '' || normalizeCssValue(actual) === expected);
        return passed
          ? resultFor(check, true, `Znaleziono deklarację ${property}: ${actual}.`)
          : resultFor(check, false, `Brak poprawnej deklaracji ${property} w regule ${selector || '(brak selektora)'}${expected ? ` — oczekiwano „${expected}”.` : '.'}`);
      }
      case 'elementExists': {
        const signal = getDomSignal(signals, check.selector);
        return signal?.exists
          ? resultFor(check, true, `Element ${check.selector} istnieje.`)
          : resultFor(check, false, `Missing selector: ${check.selector || '(brak selektora)'}.`);
      }
      case 'attributeEquals': {
        const signal = getDomSignal(signals, check.selector);
        const actual = signal?.attrs?.[check.attribute];
        const expected = safeString(expectedValue(check));
        return safeString(actual) === expected
          ? resultFor(check, true, `Atrybut ${check.attribute} ma poprawną wartość.`)
          : resultFor(check, false, `Atrybut ${check.attribute} dla ${check.selector} ma wartość „${safeString(actual)}”, oczekiwano „${expected}”.`);
      }
      case 'textContains': {
        const signal = check.selector ? getDomSignal(signals, check.selector) : null;
        const actual = safeString(signal?.text ?? signals.text);
        const expected = safeString(expectedValue(check));
        return actual.includes(expected)
          ? resultFor(check, true, 'Tekst jest widoczny.')
          : resultFor(check, false, `Nie znaleziono tekstu „${expected}”.`);
      }
      case 'computedStyle': {
        const actual = getStyleSignal(signals, check.selector, check.property);
        const expected = safeString(expectedValue(check));
        return safeString(actual) === expected
          ? resultFor(check, true, `Właściwość ${check.property} ma wartość „${expected}”.`)
          : resultFor(check, false, `Właściwość ${check.property} ma wartość „${safeString(actual)}”, oczekiwano „${expected}”.`);
      }
      case 'interaction': {
        const interaction = signals.interactions?.[check.id];
        if (!interaction) {
          return resultFor(check, false, `missing interaction signal: ${check.id}.`);
        }
        if (interaction.ok === false) {
          return resultFor(check, false, `Interakcja nie znalazła selektora ${check.selector || ''}.`);
        }
        const expected = check.expected || {};
        const actualText = safeString(interaction.text);
        const textPasses = expected.text == null || actualText.includes(safeString(expected.text));
        const classPasses = expected.class == null || safeString(interaction.className).includes(safeString(expected.class));
        const visiblePasses = expected.visible == null || Boolean(interaction.visible) === Boolean(expected.visible);
        const attributePasses = !expected.attribute
          || safeString((interaction.attrs || interaction.attributes)?.[expected.attribute.name]) === safeString(expected.attribute.value);
        return textPasses && classPasses && visiblePasses && attributePasses
          ? resultFor(check, true, 'Interakcja zmieniła widok zgodnie z oczekiwaniem.')
          : resultFor(check, false, 'Interakcja zadziałała, ale wynik nie spełnia oczekiwania.');
      }
      case 'noHorizontalOverflow': {
        const viewport = signals.viewport || {};
        const scrollWidth = Number(viewport.scrollWidth);
        const clientWidth = Number(viewport.clientWidth ?? viewport.width);
        const passed = Number.isFinite(scrollWidth) && Number.isFinite(clientWidth) && scrollWidth <= clientWidth;
        return passed
          ? resultFor(check, true, 'Układ nie ma poziomego overflow.')
          : resultFor(check, false, `Poziomy overflow: scrollWidth ${scrollWidth || '?'} > clientWidth ${clientWidth || '?'}.`);
      }
      case 'reactRendered': {
        const rootReady = Boolean(signals.react?.rootReady);
        const domSignal = check.selector ? getDomSignal(signals, check.selector) : { exists: true };
        const textExpected = check.text ?? check.expectedText;
        const textPasses = textExpected == null || safeString(domSignal?.text).includes(safeString(textExpected));
        return rootReady && Boolean(domSignal?.exists) && textPasses
          ? resultFor(check, true, 'Komponent React został wyrenderowany.')
          : resultFor(check, false, 'React nie wyrenderował oczekiwanego elementu lub tekstu.');
      }
      case 'runtimeError': {
        const errors = Array.isArray(signals.runtimeErrors) ? signals.runtimeErrors : [];
        return errors.length === 0
          ? resultFor(check, true, 'Brak błędów runtime.')
          : resultFor(check, false, `Preview zgłosił ${errors.length} błąd runtime.`);
      }
      default:
        return resultFor(check, false, `Unknown check type: ${safeString(check.type)}.`);
    }
  } catch (error) {
    return resultFor(check, false, `Nie udało się sprawdzić warunku: ${safeString(error?.message || error)}.`);
  }
}

export function evaluateChecks(checks = [], context = {}) {
  const results = Array.isArray(checks) ? checks.map((check) => evaluateOne(check, context)) : [];
  return {
    passed: results.filter((result) => result.passed).length,
    total: results.length,
    results,
  };
}
