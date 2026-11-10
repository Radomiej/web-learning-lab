import librarySeed from './phpLibrarySeed.js';

const adapter = String.raw`<?php
function connectMysqlStyle(string $dsn, string $sqlitePath): PDO {
  if (!preg_match('/^mysql:host=localhost;dbname=([a-z0-9_]+);charset=utf8mb4$/i', $dsn, $match)) {
    throw new InvalidArgumentException('Użyj DSN mysql:host=localhost;dbname=biblioteka;charset=utf8mb4.');
  }
  if (strtolower($match[1]) !== 'biblioteka') {
    throw new InvalidArgumentException('Dostępna baza w symulatorze: biblioteka.');
  }
  $db = new PDO('sqlite:' . $sqlitePath);
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  return $db;
}
`;
const shell = String.raw`<?php
header('Content-Type: application/json; charset=utf-8');

function reply(array $value): never {
  echo json_encode($value, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
  exit;
}

$sql = $_POST['sql'] ?? '';
$requestedDatabase = strtolower(trim($_POST['database'] ?? 'biblioteka'));
if (!is_string($sql) || !preg_match('/\A.{0,2000}\z/us', $sql)) {
  reply(['database' => $requestedDatabase, 'columns' => [], 'rows' => [], 'message' => '', 'error' => 'Polecenie może mieć najwyżej 2000 znaków.']);
}
$sql = trim($sql);
if ($sql === '') reply(['database' => $requestedDatabase, 'columns' => [], 'rows' => [], 'message' => 'Wpisz polecenie SQL.']);
if (str_ends_with($sql, ';')) $sql = rtrim(substr($sql, 0, -1));
$unquoted = preg_replace("~'(?:''|[^'])*'|\"(?:\"\"|[^\"])*\"|\\x60(?:\\x60\\x60|[^\\x60])*\\x60~", '', $sql);
if (str_contains($unquoted ?? $sql, ';')) reply(['database' => $requestedDatabase, 'columns' => [], 'rows' => [], 'message' => '', 'error' => 'Wpisz jedno polecenie naraz.']);

$database = 'biblioteka';
if (preg_match('/^USE\s+([a-z0-9_]+)$/i', $sql, $match)) {
  $database = strtolower($match[1]);
  if ($database !== 'biblioteka') reply(['database' => $database, 'columns' => [], 'rows' => [], 'message' => '', 'error' => 'Dostępna baza w symulatorze: biblioteka.']);
  reply(['database' => $database, 'columns' => [], 'rows' => [], 'message' => 'Aktywna baza: biblioteka.']);
}
if ($requestedDatabase !== 'biblioteka') reply(['database' => $requestedDatabase, 'columns' => [], 'rows' => [], 'message' => '', 'error' => 'Dostępna baza w symulatorze: biblioteka.']);

try {
  $db = require __DIR__ . '/db.php';
  if (preg_match('/^SHOW\s+TABLES$/i', $sql)) {
    $statement = $db->query("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    $rows = [];
    foreach ($statement->fetchAll(PDO::FETCH_COLUMN) as $table) $rows[] = [$table];
    reply(['database' => $database, 'columns' => ['Tables_in_biblioteka'], 'rows' => $rows, 'message' => count($rows) . ' tabel.']);
  }

  if (preg_match('/^(?:DESCRIBE|DESC)\s+([a-z0-9_]+)$/i', $sql, $match)) {
    $table = strtolower($match[1]);
    if (!in_array($table, ['autorzy', 'ksiazki', 'wypozyczenia'], true)) reply(['database' => $database, 'columns' => [], 'rows' => [], 'message' => '', 'error' => 'Nie znaleziono tabeli ' . $table . '.']);
    $statement = $db->query('PRAGMA table_info(' . $table . ')');
    $rows = [];
    foreach ($statement->fetchAll(PDO::FETCH_ASSOC) as $column) {
      $rows[] = [$column['name'], strtoupper($column['type']), $column['notnull'] || $column['pk'] ? 'NO' : 'YES', $column['pk'] ? 'PRI' : '', $column['dflt_value'], ''];
    }
    reply(['database' => $database, 'columns' => ['Field', 'Type', 'Null', 'Key', 'Default', 'Extra'], 'rows' => $rows, 'message' => count($rows) . ' kolumn.']);
  }

  if (!preg_match('/^(?:SELECT|WITH)\b/i', $sql)) {
    reply(['database' => $database, 'columns' => [], 'rows' => [], 'message' => '', 'error' => 'Symulator przyjmuje SELECT, USE, SHOW TABLES oraz DESCRIBE. Zmiany danych i definicji tabel są wyłączone.']);
  }

  $db->exec('PRAGMA query_only = ON');
  $statement = $db->prepare($sql);
  $statement->execute();
  $columns = [];
  $types = [];
  for ($index = 0; $index < $statement->columnCount(); $index++) {
    $meta = $statement->getColumnMeta($index) ?: [];
    $columns[] = (string) ($meta['name'] ?? 'kolumna_' . ($index + 1));
    $types[] = strtolower((string) ($meta['native_type'] ?? ''));
  }
  $rows = [];
  $hasMore = false;
  while (($row = $statement->fetch(PDO::FETCH_NUM)) !== false) {
    if (count($rows) >= 50) { $hasMore = true; break; }
    foreach ($row as $index => $value) {
      if ($value === null) continue;
      if (in_array($types[$index] ?? '', ['integer', 'int', 'long'], true) && is_numeric($value)) $row[$index] = (int) $value;
      elseif (in_array($types[$index] ?? '', ['real', 'float', 'double'], true) && is_numeric($value)) $row[$index] = (float) $value;
      else $row[$index] = (string) $value;
    }
    $rows[] = $row;
  }
  reply([
    'database' => $database,
    'columns' => $columns,
    'rows' => $rows,
    'message' => $hasMore ? 'Pokazano pierwsze 50 wierszy.' : (count($rows) === 1 ? '1 wiersz.' : count($rows) . ' wierszy.'),
  ]);
} catch (Throwable $error) {
  reply(['database' => $database, 'columns' => [], 'rows' => [], 'message' => '', 'error' => 'Błąd SQL: ' . $error->getMessage()]);
}
`;
export function createMysqlDatabaseFile(connection = '$db = connectMysqlStyle($dsn, $path);') {
  return `<?php
require_once __DIR__ . '/mysql-adapter.php';
$database = 'biblioteka';
$dsn = 'mysql:host=localhost;dbname=' . $database . ';charset=utf8mb4';
$path = __DIR__ . '/biblioteka.sqlite';
$initialize = !is_file($path);
${connection}
if (!isset($db)) {
  return null;
}
$db->exec('PRAGMA foreign_keys = ON');
if ($initialize) {
  $db->exec(file_get_contents(__DIR__ . '/biblioteka.sql'));
}
return $db;
`;
}

const database = createMysqlDatabaseFile();

export const mysqlAdapterFile = adapter;
export const shellDatabaseFile = database;
export const phpMysqlShellProject = {
  entry: 'shell.php',
  files: {
    'shell.php': shell,
    'db.php': database,
    'mysql-adapter.php': adapter,
    'biblioteka.sql': librarySeed,
  },
};
