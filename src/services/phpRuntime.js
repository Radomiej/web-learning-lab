import { loadPHPRuntime, PHP, PHPRequestHandler } from '@php-wasm/universal';
import { getPHPLoaderModule } from '@php-wasm/web-8-4';

export const PHP_VERSION = '8.4';
export const PHP_RUN_TIMEOUT = 5000;

const PROJECT_ROOT = '/wll-php';
const ROOT_URL = 'http://web-learning-lab.local';

let runtimePromise = null;
let phpInstance = null;
let requestHandler = null;
let runSequence = 0;
let executionQueue = Promise.resolve();

function asRecord(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function safeProjectPath(path) {
  const value = String(path || '').replaceAll('\\', '/');
  if (!value || value.startsWith('/') || value.includes('\0')) {
    throw new Error(`Nieprawidłowa ścieżka pliku PHP: ${path}`);
  }
  const parts = value.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..')) {
    throw new Error(`Nieprawidłowa ścieżka pliku PHP: ${path}`);
  }
  return parts.join('/');
}

function toScalar(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return JSON.stringify(value);
}

function encodeParams(values) {
  const params = new URLSearchParams();
  Object.entries(asRecord(values)).forEach(([key, value]) => {
    params.set(key, toScalar(value));
  });
  return params.toString();
}

function requestKey(request = {}) {
  const normalized = {
    method: String(request.method || 'GET').toUpperCase(),
    query: asRecord(request.query),
    form: asRecord(request.form),
    body: request.body == null ? '' : String(request.body),
  };
  return JSON.stringify(normalized);
}

function prepareRequest(request, urlPath) {
  const method = String(request.method || 'GET').toUpperCase();
  const query = encodeParams(request.query);
  const url = `${urlPath}${query ? `?${query}` : ''}`;
  const form = encodeParams(request.form);
  const body = request.body == null ? (form || undefined) : String(request.body);
  const headers = { ...asRecord(request.headers) };
  if (body && !Object.keys(headers).some((key) => key.toLowerCase() === 'content-type')) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
  }
  return { method, url, headers, ...(body === undefined ? {} : { body }) };
}

function describeError(error) {
  if (!error) return 'Nieznany błąd PHP.';
  if (typeof error === 'string') return error;
  return String(error.message || error);
}

function disposeRuntime() {
  try {
    const disposer = requestHandler?.[Symbol.asyncDispose];
    if (typeof disposer === 'function') void disposer.call(requestHandler).catch(() => {});
  } catch {}
  try {
    const disposer = phpInstance?.[Symbol.dispose];
    if (typeof disposer === 'function') disposer.call(phpInstance);
  } catch {}
  requestHandler = null;
  phpInstance = null;
  runtimePromise = null;
}

export function resetPhpRuntime() {
  disposeRuntime();
}

async function getRuntime() {
  if (!runtimePromise) {
    runtimePromise = (async () => {
      const loaderModule = await getPHPLoaderModule();
      const runtimeId = await loadPHPRuntime(loaderModule);
      const php = new PHP(runtimeId);
      const handler = new PHPRequestHandler({
        php,
        documentRoot: PROJECT_ROOT,
        absoluteUrl: ROOT_URL,
      });
      phpInstance = php;
      requestHandler = handler;
      return { php, handler };
    })().catch((error) => {
      disposeRuntime();
      throw error;
    });
  }
  return runtimePromise;
}

function ensureDirectory(php, filePath) {
  const directory = filePath.slice(0, filePath.lastIndexOf('/'));
  if (directory) php.mkdir(directory);
}

async function withTimeout(promise, timeout = PHP_RUN_TIMEOUT) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('PHP przekroczył limit czasu wykonania.')), timeout);
  });
  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timer);
  }
}

async function executePhpProject({ files = {}, entry = 'index.php', request = {} } = {}) {
  const projectFiles = asRecord(files);
  const entryPath = safeProjectPath(entry || 'index.php');
  if (!Object.hasOwn(projectFiles, entryPath)) {
    throw new Error(`Nie znaleziono pliku wejściowego ${entryPath}.`);
  }

  const { php, handler } = await getRuntime();
  const runRoot = `${PROJECT_ROOT}/run-${++runSequence}`;
  php.mkdir(runRoot);
  Object.entries(projectFiles).forEach(([path, contents]) => {
    const relativePath = safeProjectPath(path);
    if (typeof contents !== 'string') throw new Error(`Nieprawidłowa zawartość ${relativePath}.`);
    const absolutePath = `${runRoot}/${relativePath}`;
    ensureDirectory(php, absolutePath);
    php.writeFile(absolutePath, contents);
  });

  const hasRequest = Object.keys(asRecord(request)).length > 0;
  const requestPath = `/run-${runSequence}/${entryPath}`;
  const response = hasRequest
    ? await withTimeout(handler.request(prepareRequest(request, requestPath)))
    : await withTimeout(php.run({ scriptPath: `${runRoot}/${entryPath}` }));
  const stderr = String(response?.errors || '');
  return {
    html: String(response?.text || ''),
    errors: stderr ? [stderr] : [],
    stderr,
    exitCode: Number(response?.exitCode ?? 0),
    requestKey: requestKey(request),
  };
}

export function runPhpProject(options = {}) {
  const job = executionQueue.then(async () => {
    try {
      return await executePhpProject(options);
    } catch (error) {
      if (/limit czasu|przekroczył/i.test(describeError(error))) resetPhpRuntime();
      throw error;
    }
  });
  executionQueue = job.catch(() => undefined);
  return job;
}
