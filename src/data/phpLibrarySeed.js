// Zestaw biblioteka z databases/src/data/datasets.js.
export default `PRAGMA foreign_keys = ON;
CREATE TABLE autorzy (
  id INTEGER PRIMARY KEY,
  imie TEXT NOT NULL,
  nazwisko TEXT NOT NULL,
  kraj TEXT NOT NULL
);
CREATE TABLE ksiazki (
  id INTEGER PRIMARY KEY,
  tytul TEXT NOT NULL,
  rok_wydania INTEGER NOT NULL,
  autor_id INTEGER NOT NULL,
  cena REAL NOT NULL,
  FOREIGN KEY (autor_id) REFERENCES autorzy(id)
);
CREATE TABLE wypozyczenia (
  id INTEGER PRIMARY KEY,
  ksiazka_id INTEGER NOT NULL,
  czytelnik TEXT NOT NULL,
  data_wypozyczenia DATE NOT NULL,
  data_zwrotu DATE,
  FOREIGN KEY (ksiazka_id) REFERENCES ksiazki(id)
);
INSERT INTO autorzy (id, imie, nazwisko, kraj) VALUES
  (1, 'Adam', 'Mickiewicz', 'Polska'),
  (2, 'Bolesław', 'Prus', 'Polska'),
  (3, 'Henryk', 'Sienkiewicz', 'Polska'),
  (4, 'Juliusz', 'Słowacki', 'Polska'),
  (5, 'Olga', 'Tokarczuk', 'Polska');
INSERT INTO ksiazki (id, tytul, rok_wydania, autor_id, cena) VALUES
  (1, 'Pan Tadeusz', 1834, 1, 29.99),
  (2, 'Lalka', 1890, 2, 39.90),
  (3, 'Quo vadis', 1896, 3, 34.50),
  (4, 'Kordian', 1834, 4, 27.00),
  (5, 'Bieguni', 2007, 5, 44.90),
  (6, 'Solaris', 1961, 5, 36.80),
  (7, 'Faraon', 1897, 2, 41.20),
  (8, 'Krzyżacy', 1900, 3, 32.00);
INSERT INTO wypozyczenia (id, ksiazka_id, czytelnik, data_wypozyczenia, data_zwrotu) VALUES
  (1, 1, 'Anna Nowak', '2026-01-12', '2026-01-26'),
  (2, 2, 'Piotr Kowalski', '2026-02-03', NULL),
  (3, 3, 'Maria Wójcik', '2026-02-11', '2026-02-25'),
  (4, 5, 'Tomasz Zieliński', '2026-02-18', NULL),
  (5, 7, 'Anna Nowak', '2026-03-02', '2026-03-16');\n`;
