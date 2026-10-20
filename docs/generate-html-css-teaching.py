"""Generate exact, accessible SVG lesson diagrams without rasterized code text."""
from pathlib import Path
from html import escape

OUT = Path(__file__).resolve().parents[1] / 'public/course-assets/html-css-teaching'
OUT.mkdir(parents=True, exist_ok=True)

def text(x, y, value, size=24, color='#16324f', extra=''):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" {extra}>{escape(value)}</text>'

def rect(x, y, w, h, fill='#ffffff', extra=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" {extra}/>'

def diagram(id, title, code, preview, caption, css=False, php=False):
    svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 650" role="img" aria-labelledby="title desc">'
    svg += f'<title id="title">{escape(title)}</title><desc id="desc">{escape(caption)}</desc>'
    svg += '<g font-family="Arial, sans-serif">' + rect(0, 0, 1100, 650, '#edf4fa')
    svg += text(32, 52, title, 30, extra='font-weight="700"')
    svg += rect(28, 84, 494, 448, '#16324f', 'rx="14"')
    svg += text(50, 124, '1. KOD PHP' if php else ('1. REGUŁA CSS' if css else '1. ZAPIS HTML'), 19, '#9bdcf5')
    code_size = min(20, 438 / (max(map(len, code.splitlines())) * 0.61))
    for i, line in enumerate(code.splitlines()):
        svg += text(50, 174+i*30, line, code_size, '#ffffff', 'font-family="Consolas, Courier New, monospace" xml:space="preserve"')
    svg += rect(550, 84, 522, 448, '#ffffff', 'rx="14" stroke="#b4c9da"')
    svg += text(572, 124, '2. WIDOCZNY EFEKT', 19)
    svg += preview
    words, lines, current = caption.split(), [], ''
    for word in words:
        if len(current + ' ' + word) > 87:
            lines.append(current); current = word
        else: current = (current + ' ' + word).strip()
    lines.append(current)
    for i, line in enumerate(lines): svg += text(32, 572+i*28, line, 21)
    svg += '</g></svg>'
    folder = OUT.parent / 'php-teaching' if php else OUT
    folder.mkdir(parents=True, exist_ok=True)
    (folder / f'{id}.svg').write_text(svg, encoding='utf-8')

diagram('html-three-layers', 'Znacznik określa rolę treści', '<h1>Ogród</h1>\n<p>Posiejmy zioła.</p>',
    text(582,205,'Ogród',42,extra='font-weight="700"')+text(582,258,'Posiejmy zioła.',24),
    'h1 tworzy główny nagłówek, p osobny akapit. Znaczniki nie są wyświetlane. Pokazano przykładowy domyślny wygląd bez CSS autora.')
diagram('html-document', 'Tytuł karty i nagłówek to dwa miejsca', '<head>\n <title>Pracownia — kontakt</title>\n</head>\n<body>\n <h1>Napisz do nas</h1>\n</body>',
    rect(570,150,480,54,'#dbe7f1','rx="8"')+text(584,184,'Pracownia — kontakt',21)+text(582,278,'Napisz do nas',38,extra='font-weight="700"')+text(582,345,'↑ Treść dokumentu',21),
    'title zmienia nazwę karty przeglądarki. h1 zmienia nagłówek wewnątrz strony. Zmiana title nie zmienia treści h1.')
diagram('html-text', 'Enter w pliku a br w akapicie', '<p>Mięta\nrośnie szybko.</p>\n\n<p>ul. Leśna 2<br>\n80-001 Gdańsk</p>',
    text(582,200,'Mięta rośnie szybko.',26)+text(582,285,'ul. Leśna 2',26)+text(582,320,'80-001 Gdańsk',26)+text(582,420,'br rozpoczyna nową linię.',20),
    'Zwykły Enter między słowami daje odstęp. br wymusza przełamanie wiersza; drugi p zaczyna osobny akapit.')
diagram('html-lists', 'Podlista należy do konkretnej pozycji', '<ul>\n <li>Zioła\n  <ul><li>Mięta</li></ul>\n </li>\n <li>Drzewa</li>\n</ul>',
    text(585,205,'• Zioła',29)+text(630,253,'◦ Mięta',27)+text(585,305,'• Drzewa',29),
    'Wewnętrzne ul znajduje się przed zamknięciem li Zioła. Dlatego Mięta jest dzieckiem tej pozycji, a Drzewa jej sąsiadem.')
diagram('html-links', 'Fragment adresu wskazuje id', '<a href="#podlewanie">\n Podlewanie\n</a>\n\n<h2 id="podlewanie">\n Jak podlewać?\n</h2>',
    text(582,188,'Podlewanie',26,'#1d4ed8','text-decoration="underline"')+text(582,246,'↓ aktywuj link',22)+rect(576,282,476,130,'#eef5ff')+text(590,330,'Jak podlewać?',33,extra='font-weight="700"')+text(590,377,'cel: id="podlewanie"',20),
    'href zawiera #podlewanie; id zawiera podlewanie bez #. Aktywacja linku przechodzi do tego nagłówka w tym samym dokumencie.')
diagram('html-media', 'Obraz i widoczny podpis', '<figure>\n <img src="mieta.jpg"\n  alt="Ząbkowane liście mięty">\n <figcaption>\n  Mięta w szkolnym ogrodzie.\n </figcaption>\n</figure>',
    rect(582,155,450,215,'#dcf3df')+'<path d="M800 345 Q720 245 660 190 Q790 170 805 300 Q830 175 965 195 Q900 290 805 320" fill="#287548" stroke="#16324f" stroke-width="3"/>'+text(582,413,'Mięta w szkolnym ogrodzie.',24)+text(582,470,'Schemat zastępujący zdjęcie.',19),
    'figure grupuje obraz i figcaption. Podpis widać pod obrazem. alt opisuje jego sens, ale nie jest drugim podpisem. Plik src musi istnieć.')
diagram('html-tables', 'Komórki tworzą wiersze i kolumny', '<table>\n <tr>\n  <th>Zioło</th>\n  <th>Doniczki</th>\n </tr>\n <tr><td>Mięta</td>\n     <td>3</td></tr>\n</table>',
    text(595,209,'Zioło',28,extra='font-weight="700"')+text(810,209,'Doniczki',28,extra='font-weight="700"')+text(595,270,'Mięta',28)+text(855,270,'3',28)+text(582,370,'2 wiersze × 2 kolumny',22)+text(582,410,'Bez automatycznej ramki.',21),
    'Pierwszy tr zawiera nagłówki, drugi dane. Liczba 3 znajduje się w kolumnie Doniczki, obok nazwy Mięta. Domyślna tabela nie ma ramki.')
diagram('html-forms', 'for łączy etykietę z id pola', '<label for="roslina">\n Nazwa rośliny\n</label>\n<input id="roslina"\n name="plant" type="text">',
    text(582,206,'Nazwa rośliny',28)+rect(582,235,445,58,'#fff','rx="5" stroke="#1d4ed8" stroke-width="3"')+text(598,275,'│',30,'#1d4ed8')+text(582,356,'Kliknięcie etykiety → fokus pola',22)+text(582,411,'Nazwa wysyłanych danych: plant',21),
    'for="roslina" wskazuje input id="roslina". Kliknięcie napisu ustawia kursor w polu. name="plant" nazywa wartość podczas wysyłania.')
diagram('html-semantics', 'Semantyka opisuje rolę regionu', '<header><h1>Zielnik</h1></header>\n<main>\n <p>Opis roślin.</p>\n</main>\n<footer>\n <p>Szkolna pracownia</p>\n</footer>',
    text(582,207,'Zielnik',40,extra='font-weight="700"')+text(582,272,'Opis roślin.',26)+text(582,345,'Szkolna pracownia',26)+text(582,426,'Region główny: Opis roślin.',21),
    'Treść jest widoczna w kolejności header, main, footer. Ich znaczenie pomaga nawigacji; semantyczne tagi same nie dodają kolorów ani kolumn.')
diagram('css-intro', 'color zmienia tekst, nie jego treść', '/* HTML: <p>Mięta</p> */\np { color: navy; }',
    text(582,180,'PRZED',19)+text(582,233,'Mięta',36,'#202020')+text(582,325,'PO: color: navy',19)+text(582,380,'Mięta',36,'#000080'),
    'Selektor p wybiera akapit. Właściwość color zmienia jego tekst na navy (#000080). Napis Mięta i struktura dokumentu pozostają takie same.',True)
diagram('css-selectors', 'Klasa zmienia tylko pasujące elementy', '/* HTML: */\n/* <p class="notice">Uwaga</p>\n   <p>Opis</p> */\n.notice { color: darkred; }',
    text(582,170,'PRZED',19)+text(582,214,'Uwaga',28,'#202020')+text(582,254,'Opis',28,'#202020')+text(582,320,'PO',19)+text(582,360,'Uwaga',28,'#8b0000')+text(582,400,'Opis',28,'#202020')+text(582,475,'Tylko Uwaga ma klasę notice.',21),
    'Kropkę zapisujemy w selektorze .notice. W HTML jest class="notice" bez kropki. Akapit bez tej klasy zachowuje swój kolor.',True)
diagram('css-type-colors', 'rem mnoży rozmiar fontu html', 'html { font-size: 16px; }\np { font-size: 1.5rem; }',
    text(582,180,'PRZED: 1rem = 16px',21)+text(582,225,'Mięta w doniczce',16)+text(582,320,'PO: 1.5rem = 24px',21)+text(582,370,'Mięta w doniczce',24)+text(582,445,'1.5 × 16px = 24px',26),
    'Obie linie pokazano w tej samej skali. Przy font-size html równym 16px zmiana p z 1rem na 1.5rem powiększa litery z 16px do 24px.',True)
diagram('css-box-model', 'border-box wlicza padding i ramkę', '.card {\n width: 200px;\n padding: 12px;\n border: 2px solid navy;\n box-sizing: border-box;\n}',
    text(582,178,'PRZED: content-box → 228px',21)+rect(582,195,456,78,'#b9e5f8','stroke="navy" stroke-width="4"')+rect(610,223,400,22,'#fff')+text(582,326,'PO: border-box → 200px',21)+rect(582,345,400,78,'#b9e5f8','stroke="navy" stroke-width="4"')+rect(610,373,344,22,'#fff')+text(582,475,'Treść: 200 − 24 − 4 = 172px',23),
    'Rysunek ma skalę 2:1. Zmienia się tylko box-sizing. Pudełko z ramką maleje z 228px do 200px. Padding 12px i border 2px z każdej strony pozostają.',True)
diagram('css-display-position', 'display:block rozpoczyna nowy wiersz', '/* HTML: */\n/* <span>A</span><span>B</span> */\nspan { display: block; }',
    text(582,179,'PRZED: inline',21)+text(582,230,'AB',34)+text(582,320,'PO: block',21)+text(582,370,'A',34)+text(582,418,'B',34),
    'Dwa span domyślnie uczestniczą w tym samym wierszu. display:block powoduje rozpoczęcie osobnych wierszy. Nie dopisujemy br ani nowych liter.',True)
diagram('css-motion-project', 'transition wygładza zmianę tła', 'button {\n background-color: #e0f2fe;\n transition: background-color\n   200ms ease;\n}\nbutton:hover {\n background-color: #bae6fd;\n}',
    text(582,180,'PRZED: bez najechania',21)+rect(582,203,240,64,'#e0f2fe','rx="8" stroke="#16324f"')+text(609,246,'Pokaż',26)+text(582,322,'200ms po najechaniu',21)+rect(582,346,240,64,'#bae6fd','rx="8" stroke="#16324f"')+text(609,389,'Pokaż',26)+text(582,469,'Ten sam przycisk, nowy kolor tła.',21),
    'transition samo nie zmienia koloru. Dopiero hover podaje nową wartość. W ciągu 200ms kolor przechodzi od #e0f2fe do #bae6fd; po zejściu wraca.',True)

diagram('html-form-required', 'required zatrzymuje pusty formularz', '<form>\n <label for="email">E-mail</label>\n <input id="email" name="email"\n  type="email" required>\n <button type="submit">Zapisz</button>\n</form>',
    text(582,172,'E-mail',25)+rect(582,190,445,54,'#fff','rx="5" stroke="#c2410c" stroke-width="3"')+rect(582,263,170,52,'#e0f2fe','rx="6" stroke="#16324f"')+text(612,298,'Zapisz',25)+rect(582,340,445,88,'#fff7ed','rx="8" stroke="#c2410c"')+text(598,376,'Puste pole → wysyłanie zatrzymane',21)+text(598,407,'Przykładowy komunikat walidacji.',18)+text(582,481,'kot → błąd formatu e-mail',22),
    'Zapisz uruchamia sprawdzenie. required odrzuca pustą wartość, type=email sprawdza format. Wygląd i tekst komunikatu zależą od przeglądarki; serwer nadal musi walidować dane.')
diagram('html-form-name', 'name jest kluczem danych, id nim nie jest', '<form action="profil.php" method="post">\n <label for="person">Imię</label>\n <input id="person" name="name"\n  value="Ala">\n <button type="submit">Wyślij</button>\n</form>',
    text(582,176,'Imię',25)+rect(582,194,445,54,'#fff','rx="5" stroke="#16324f"')+text(598,231,'Ala',26)+text(582,302,'↓ Wyślij bez zmiany wartości',22)+rect(582,330,445,70,'#dcf3df','rx="8"')+text(602,375,'name=Ala',30,extra='font-family="Consolas, monospace"')+text(582,464,'person łączy label z input.',22),
    'Wartość pola to Ala. Nazwa danych pochodzi z name="name", więc serwer otrzyma name=Ala. id="person" służy etykiecie; nie tworzy klucza person.')
diagram('html-form-action', 'action prowadzi do odbiornika na serwerze', '<form action="profil.php" method="post">\n <label for="nick">Pseudonim</label>\n <input id="nick" name="nick"\n  value="Luna">\n <button type="submit">Wyślij</button>\n</form>',
    text(582,171,'1. Przeglądarka: Wyślij',25)+rect(582,192,445,70,'#e0f2fe','rx="8"')+text(600,235,'POST profil.php · nick=Luna',24)+text(582,304,'↓ nowe żądanie HTTP',22)+text(582,353,'2. Serwer uruchamia profil.php',24)+text(582,396,'$_POST["nick"] → "Luna"',23)+text(582,459,'3. Odpowiedź HTML → przeglądarka',22),
    'Schemat dotyczy działającego hostingu PHP. action wskazuje odbiornik, a nie tworzy serwera. Odczyt żądania nie oznacza automatycznego zapisu do bazy.')
diagram('css-content-box', 'content-box: szerokość treści plus otoczenie', '.card {\n box-sizing: content-box;\n width: 200px;\n padding: 12px;\n border: 2px solid navy;\n}',
    text(582,172,'width: 200px → sama treść',23)+rect(582,208,456,110,'#b9e5f8','stroke="navy" stroke-width="4"')+rect(610,236,400,54,'#fff')+text(681,270,'treść 200px',23)+text(582,371,'200 + 12 + 12 + 2 + 2',26)+text(582,416,'= 228px z obramowaniem',26)+text(582,476,'Margines jest poza tym pomiarem.',21),
    'Rysunek w skali 2:1. width nie obejmuje paddingu i border przy content-box. Treść ma 200px, a cała szerokość pudełka z ramką 228px; margin jest osobno.',True)
diagram('css-gap-padding', 'padding od brzegu, gap między dziećmi', '.list {\n display: flex;\n gap: 16px;\n padding: 12px;\n}',
    text(582,178,'Kontener flex, schemat w skali 2:1',21)+rect(582,223,448,146,'#e0f2fe','stroke="#16324f" stroke-width="2"')+rect(606,247,184,98,'#fff','stroke="#16324f"')+rect(822,247,184,98,'#fff','stroke="#16324f"')+text(682,308,'A',28)+text(901,308,'B',28)+text(582,410,'Od brzegu do A: 12px padding',22)+text(582,455,'Od A do B: 16px gap',22),
    'Na rysunku padding 12px to 24 jednostki, gap 16px to 32 jednostki. Padding otacza zawartość, gap oddziela dzieci; nie dodaje odstępu przed A ani za B.',True)
diagram('types', 'Wartość i typ to dwie informacje', '$age = 18;\n$price = 12.50;\n$active = true;\n$code = "018";',
    text(582,187,'$age → 18 · int',27)+text(582,257,'$price → 12.5 · float',27)+text(582,327,'$active → true · bool',27)+text(582,397,'$code → "018" · string',27)+text(582,472,'Tekst zachowuje początkowe zero.',21),
    '18 bez cudzysłowów jest liczbą całkowitą. "018" jest tekstem, nie liczbą; zachowuje 0. Wartość logiczna true nie jest napisem "true".',php=True)
diagram('strict-comparison', '=== porównuje także typ', '$age = 18;\nvar_dump($age === 18);\nvar_dump($age === "18");\nvar_dump($age == "18");',
    text(582,183,'18 === 18',26)+text(862,183,'true',27,'#166534')+text(582,260,'18 === "18"',26)+text(862,260,'false',27,'#9f1239')+text(582,337,'18 == "18"',26)+text(862,337,'true',27,'#166534')+text(582,431,'===: ta sama wartość i typ',23)+text(582,473,'==: może przeliczyć typy',23),
    'Wyniki tych trzech var_dump to bool(true), bool(false), bool(true). Liczba 18 i tekst "18" nie są identyczne. == w tym przypadku konwertuje tekst liczbowy.',php=True)
diagram('return-echo', 'return oddaje wynik, echo go wypisuje', 'function price($count) {\n return $count * 5;\n}\n$total = price(3);\necho "<p>Koszt: $total zł</p>";',
    text(582,177,'price(3) → $count = 3',26)+text(582,229,'3 × 5 → return 15',26)+text(582,281,'$total = 15',26)+text(582,339,'Samo return: brak napisu w HTML',21)+rect(582,370,445,92,'#eef5ff','rx="8"')+text(601,426,'Koszt: 15 zł',30)+text(582,495,'Dopiero echo wypisuje akapit.',21),
    'Argument 3 trafia do $count. Funkcja zwraca liczbę 15 do zmiennej $total. echo wstawia wynik do HTML i dopiero wtedy podgląd pokazuje Koszt: 15 zł.',php=True)
diagram('post-fields', 'Odczyt $_POST nie gwarantuje tekstu', '$raw = $_POST["name"] ?? "";\nif (!is_string($raw)) {\n echo "Niepoprawny format imienia";\n} else {\n $name = trim($raw);\n if ($name === "") {\n  echo "Wpisz imię";\n }\n}',
    text(582,177,'name=Ala → "Ala"',25)+text(582,241,'Brak name → ""',25)+text(582,305,'Same spacje → trim → ""',24)+text(582,369,'name[]=Ala → tablica',25)+text(582,432,'↓ is_string daje false',23,'#9f1239')+text(582,478,'Odrzuć tablicę przed trim.',23),
    '?? daje pusty tekst dla brakującego klucza. Nie zmienia tablicy na tekst. is_string odrzuca name[]=Ala przed trim, a pusty tekst po trim wymaga komunikatu.',php=True)
diagram('integer-validation', 'Poprawne zero nie jest błędem', '$raw = $_POST["age"] ?? "";\n$age = is_string($raw)\n ? filter_var($raw, FILTER_VALIDATE_INT)\n : false;\nif ($age === false || $age < 0\n    || $age > 120) {\n echo "Podaj wiek od 0 do 120";\n}',
    text(582,182,'TEKST → WALIDACJA → WYNIK',20)+text(582,248,'"18" → int 18 → poprawny',25,'#166534')+text(582,315,'"abc" → false → błąd',25,'#9f1239')+text(582,382,'"0" → int 0 → poprawny',25,'#166534')+text(582,463,'0 === false daje false.',25),
    'FILTER_VALIDATE_INT zwraca liczbę albo false. Ścisłe === false odróżnia poprawne 0 od błędu. Następnie sprawdzamy zakres 0–120; samo rzutowanie na int nie waliduje danych.',php=True)
diagram('html-escaping', 'htmlspecialchars zachowuje dane jako tekst', '$name = "<b>Ala</b>";\n$safe = htmlspecialchars(\n $name, ENT_QUOTES, "UTF-8"\n);\necho "<p>Witaj, " . $safe . "!</p>";',
    text(582,176,'Dane: <b>Ala</b>',26)+text(582,235,'↓ kodowanie znaków < i >',22)+text(582,287,'&lt;b&gt;Ala&lt;/b&gt;',23,extra='font-family="Consolas, monospace"')+text(582,347,'Podgląd HTML:',22)+rect(582,369,445,85,'#eef5ff','rx="8"')+text(600,421,'Witaj, <b>Ala</b>!',28)+text(582,494,'Ala pozostaje zwykłym tekstem.',21),
    'Encje &lt; i &gt; są interpretowane jako znaki tekstu, nie jako tagi. Użytkownik widzi dosłownie <b>Ala</b>. Kodowanie wyjścia HTML nie jest ochroną zapytań SQL.',php=True)

print(f'Generated {len(list(OUT.glob("*.svg")))} HTML/CSS diagrams and 6 extra PHP diagrams')
