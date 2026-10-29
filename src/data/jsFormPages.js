const markup = '<form id="form">\n  <label for="name">Imię</label>\n  <input id="name" name="student" required>\n  <button type="submit">Wyślij</button>\n</form>\n<output id="result" aria-live="polite"></output>';
export const jsFormPages = [
  {
    title: 'Co zrobi formularz bez JavaScriptu?',
    text: 'Przycisk submit lub Enter rozpoczyna natywną próbę wysłania formularza. Przeglądarka najpierw sprawdza np. required. Jeśli dane przejdą walidację, wywołuje submit, a nieanulowane zdarzenie prowadzi do wysłania danych według action i method oraz zwykle nawigacji. Domyślna metoda to GET, a pominięte action kieruje do bieżącego adresu. Sam HTML nie zapisuje danych do bazy.',
    code: '// Na tym etapie nie dodajemy obsługi JS.\n// Obserwuj required i standardową próbę wysłania.', markup,
    result: 'Puste pole required blokuje wysłanie. Poprawne pole pozwala na domyślną nawigację; potrzebny jest adres obsługujący żądanie.',
  },
  {
    title: 'Przejmij submit, a nie tylko kliknięcie',
    text: 'Zarejestruj obsługę na form. Parametr event opisuje to zdarzenie. preventDefault() anuluje domyślną akcję przeglądarki, więc formularz nie nawiguje sam do nowej strony. Zdarzenie nadal się odbyło. Kod JS musi teraz wykonać zaplanowaną reakcję. Obsługa submit obejmuje też Enter i pozostawia natywną walidację required.',
    markup,
    code: 'const formularz = document.getElementById("form");\nformularz.addEventListener("submit", event => {\n  event.preventDefault();\n  document.getElementById("result").textContent = "Przejęto formularz";\n});',
    result: 'Po poprawnym wysłaniu zobaczysz Przejęto formularz. Strona nie przeładuje się przez domyślne wysłanie.',
  },
  {
    title: 'FormData zbiera dane według name',
    text: 'event.currentTarget wskazuje formularz, na którym zarejestrowano tę obsługę. new FormData(formularz) zbiera aktualne wartości pól. get("student") odczytuje wartość pola o name="student". id="name" służy do DOM i etykiety, a nie do nazwania wysyłanej wartości. FormData jest kopią wartości w chwili utworzenia; nie aktualizuje się samo po dalszej edycji.',
    markup,
    code: 'const formularz = document.getElementById("form");\nformularz.addEventListener("submit", event => {\n  event.preventDefault();\n  const dane = new FormData(event.currentTarget);\n  const imie = dane.get("student");\n  document.getElementById("result").textContent = imie;\n});',
    result: 'Po wpisaniu Ola i wysłaniu formularza: dane.get("student") zwraca tekst Ola. Samo preventDefault nie wysyła tych danych do serwera.',
    image: 'forms-control', alt: 'Formularz z id name i name student: submit, preventDefault zatrzymuje nawigację, FormData zbiera student=Ola. id odnajduje element, name jest kluczem danych.',
  },
  {
    title: 'Sprawdź dane po ich odczytaniu',
    text: 'required nie zastępuje Twoich reguł: ciąg spacji może wymagać odrzucenia po trim(). FormData.get zwraca null, jeśli klucz nie istnieje; dla pola tekstowego oczekujesz string. Nie wypisuj danych jako HTML. Po poprawnym odczycie możesz pokazać podsumowanie, zmienić stan lub później wysłać żądanie przez fetch. Walidację trzeba powtórzyć po stronie serwera.',
    markup,
    code: 'const formularz = document.getElementById("form");\nformularz.addEventListener("submit", event => {\n  event.preventDefault();\n  const dane = new FormData(event.currentTarget);\n  const imie = dane.get("student");\n  const wynik = document.getElementById("result");\n  if (typeof imie !== "string" || imie.trim() === "") {\n    wynik.textContent = "Podaj imię";\n    return;\n  }\n  wynik.textContent = "Witaj, " + imie.trim();\n});',
    result: 'Dla " Ola " zobaczysz Witaj, Ola. Dla samych spacji Podaj imię. Żadna z tych reakcji nie wysyła danych automatycznie.',
  },
  {
    title: 'Liczby, checkbox i pola pominięte',
    text: 'FormData z pola liczbowego nadal odczytuje tekst. Number wykonuje jawną konwersję; Number.isFinite sprawdza, czy wynik jest skończoną liczbą. Puste dane sprawdź przed konwersją, bo Number("") daje 0. Pole bez name i pole disabled nie trafią do FormData, a niezaznaczony checkbox nie doda swojego klucza. has sprawdza obecność klucza.',
    markup: '<form id="form">\n  <label>Liczba <input name="count" type="number" required></label>\n  <label><input name="consent" type="checkbox"> Zgoda</label>\n  <button type="submit">Wyślij</button>\n</form>',
    code: 'const formularz = document.getElementById("form");\nformularz.addEventListener("submit", event => {\n  event.preventDefault();\n  const dane = new FormData(event.currentTarget);\n  const tekst = dane.get("count");\n  if (typeof tekst !== "string" || tekst.trim() === "") return;\n  const liczba = Number(tekst);\n  console.log(Number.isFinite(liczba));\n  console.log(dane.has("consent"));\n});',
    result: 'Dla 3 i niezaznaczonej zgody konsola pokaże true i false. Dla zaznaczonej zgody drugi wynik to true.',
    question: 'Czy preventDefault() zapisze dane do PHP albo bazy danych?',
    answer: 'Nie. Anuluje domyślne wysłanie. Dalej możesz samodzielnie wysłać dane przez fetch albo zrezygnować z przejęcia submit i pozwolić na standardowy POST do skryptu PHP.',
  },
];
