"""Exact diagrams: lesson code, state transitions and resulting UI, with no AI text."""
import json
import subprocess
from pathlib import Path
from html import escape

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/course-assets/react-teaching'
OUT.mkdir(parents=True, exist_ok=True)
data = json.loads(subprocess.check_output([
    'node', '--input-type=module', '-e',
    'import {reactTeachingPages as p} from "./src/data/reactTeachingPages.js"; process.stdout.write(JSON.stringify(p));'
], cwd=ROOT, encoding='utf-8'))

def t(x,y,value,size=23,color='#16324f',extra=''):
    return f'<text x="{x}" y="{y}" fill="{color}" font-size="{size}" {extra}>{escape(value)}</text>'
def r(x,y,w,h,fill='#fff',extra=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}" {extra}/>'
def row(y,label,value=None,color='#e0f2fe'):
    a=r(578,y,468,54,color,'rx="7"')+t(593,y+35,label,23)
    return a+(t(930,y+35,value,23) if value else '')
def note(y,value): return t(582,y,value,21)

views={
 'component-dom': row(163,'Funkcja App zwraca JSX')+note(249,'↓ React oblicza opis i aktualizuje DOM')+t(590,330,'Pracownia',40,extra='font-weight="700"')+note(425,'Widoczny wynik: element h1.'),
 'jsx-values': row(163,'name = "Lena" · count = 3')+note(249,'↓ {name} i {count + 1}')+t(590,330,'Lena: 4',36)+note(425,'title akapitu zawiera tekst Lena.'),
 'props-flow': row(163,'App: <Hello name="Lena" />')+note(249,'↓ props = { name: "Lena" }')+row(285,'Hello odczytuje props.name')+t(590,410,'Cześć, Lena!',36),
 'state-cycle': row(155,'Render 1: count = 0')+row(225,'Przycisk: Punkty: 0')+note(315,'↓ klik → setCount(1) → kolejny render')+row(355,'Render 2: count = 1')+row(425,'Przycisk: Punkty: 1',color='#dcf3df'),
 'state-snapshot': row(155,'Handler ma migawkę count = 0')+row(225,'setCount(0 + 1): kolejny stan = 1')+row(295,'console.log(count): wypisze 0')+note(382,'↓ dopiero kolejny render otrzyma count = 1')+row(425,'Nowy stan: 1',color='#dcf3df'),
 'state-queue': row(155,'Początek kolejki: 0')+row(225,'previous => previous + 1 : 0 → 1')+row(295,'previous => previous + 1 : 1 → 2')+note(385,'↓ React użyje wyniku kolejki')+row(425,'Następny stan: 2',color='#dcf3df'),
 'strict-render': row(155,'Development + StrictMode')+row(225,'Render → dodatkowe wywołanie kontrolne')+note(320,'Czysty render nie dodaje punktów.')+row(355,'To nie podwaja handlera kliknięcia.')+note(465,'Produkcja nie ma tych kontroli dev.'),
 'list-map': row(155,'Tablica danych: Mięta · Bazylia')+note(235,'↓ map → nowa tablica opisów JSX')+row(267,'[ <li>Mięta</li>, <li>Bazylia</li> ]')+note(352,'↓ React renderuje listę w DOM')+t(600,405,'• Mięta',30)+t(600,452,'• Bazylia',30)+note(510,'map nie tworzy węzłów DOM.'),
 'list-keys': note(175,'Przed usunięciem pierwszej pozycji:')+row(195,'key=7 · Mięta')+row(265,'key=9 · Bazylia')+note(355,'↓ usunięcie id=7; id=9 pozostaje')+row(390,'key=9 · Bazylia',color='#dcf3df')+note(489,'Tożsamość Bazylii to nadal 9, nie indeks 0.'),
 'immutable-list': row(155,'Przed: id=7 · done=false')+note(249,'↓ map + nowy obiekt {...task}')+row(285,'Po: id=7 · done=true',color='#dcf3df')+row(355,'Inne zadania: te same dane')+note(465,'Stary obiekt id=7 nie jest mutowany.'),
 'controlled-input': row(155,'1. Stan name = "" → puste pole')+row(225,'2. Uczeń wpisuje L')+row(295,'3. onChange → setName("L")')+row(365,'4. Nowy render → value="L"')+r(582,445,445,50,'#fff','rx="5" stroke="#1d4ed8" stroke-width="2"')+t(597,479,'L│',25),
 'effect-commit': row(155,'1. Render: JSX s name="Lena"')+row(225,'2. Commit: DOM jest zaktualizowany')+row(295,'3. Setup efektu: document.title = …')+r(582,390,445,60,'#dbe7f1','rx="7"')+t(599,429,'Profil: Lena',29)+note(492,'Efekt synchronizuje tytuł karty.'),
 'effect-dependencies': row(155,'Bez tablicy: po każdym commicie')+row(225,'[]: brak reaktywnych zależności')+row(295,'[name]: zmiana name przez Object.is')+note(395,'"Lena" → "Lena": zależność jest ta sama.')+note(440,'"Lena" → "Jan": nowy setup efektu.')+note(484,'StrictMode może dodać kontrolę dev.'),
 'effect-cleanup': row(155,'Setup: timer A · delay=1000')+note(249,'↓ prop delay zmienia się na 500')+row(285,'Cleanup: clearInterval(A)')+row(355,'Setup: timer B · delay=500',color='#dcf3df')+note(465,'Po odmontowaniu: clearInterval(B).'),
 'strict-effect': row(155,'Development · StrictMode na korzeniu')+row(225,'1. Konsola: setup')+row(295,'2. Konsola: cleanup')+row(365,'3. Konsola: setup')+note(475,'Próba poprawności setup i cleanup.'),
 'effect-stale': row(155,'Żądanie A: userId=Lena')+row(225,'Zmiana na Jan → cleanup A: ignore=true')+row(295,'Żądanie B: userId=Jan')+row(365,'A wraca późno → ignoruj jego zapis')+row(435,'B wraca → pokaż Jana',color='#dcf3df'),
 'shared-state': row(155,'App jest właścicielem: count=0')+note(249,'↓ ten sam count do obojga dzieci')+row(285,'Widok: Suma: 0')+row(355,'Przycisk → callback → setter w App')+row(425,'Nowy count=1 → Suma: 1',color='#dcf3df'),
 'hook-instances': note(177,'Dwa użycia komponentu Counter:' )+r(582,205,205,70,'#e0f2fe','rx="8"')+r(822,205,205,70,'#e0f2fe','rx="8"')+t(675,250,'0',32)+t(915,250,'0',32)+note(330,'↓ klik tylko w pierwszy')+r(582,365,205,70,'#dcf3df','rx="8"')+r(822,365,205,70,'#e0f2fe','rx="8"')+t(675,410,'1',32)+t(915,410,'0',32)+note(489,'Ten sam hook nie daje wspólnego stanu.'),
 'board-data': row(155,'id=7 · Podlej miętę · done=false')+row(225,'id=9 · Dodaj etykietę · done=true')+note(320,'↓ widok obliczony z tych samych danych')+t(590,378,'☐ Podlej miętę',28)+t(590,425,'☑ Dodaj etykietę',28)+note(489,'Gotowe: 1 z 2. Bez drugiej kopii stanu.'),
}

overrides={
 'effect-stale': 'let ignore = false;\nasync function load() {\n  // fetch i odczyt JSON z kodu lekcji\n  if (!ignore) setProfile(data);\n}\nload();\nreturn () => { ignore = true; };',
 'list-map': 'const plants = [\n  { id: 7, name: "Mięta" },\n  { id: 9, name: "Bazylia" }\n];\nreturn <ul>{plants.map(p =>\n  <li key={p.id}>{p.name}</li>\n)}</ul>;',
 'component-dom': 'function App() {\n  return <h1>Pracownia</h1>;\n}',
}
for pages in data.values():
    for p in pages:
        if not p.get('image'): continue
        stem=Path(p['image']).stem
        code=overrides.get(stem,p['code'])
        lines=code.splitlines()
        font=min(20, 440/(max(map(len,lines))*.61))
        line_height=min(29,330/max(len(lines)-1,1))
        svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1100 650" role="img" aria-labelledby="title desc">'
        svg+=f'<title id="title">{escape(p["title"])}</title><desc id="desc">{escape(p["result"])}</desc>'
        svg+='<g font-family="Arial, sans-serif">'+r(0,0,1100,650,'#edf4fa')+t(32,50,p['title'],29,extra='font-weight="700"')
        svg+=r(28,80,494,450,'#16324f','rx="14"')+r(550,80,522,450,'#fff','rx="14" stroke="#b4c9da"')
        svg+=t(50,120,'1. KOD / FRAGMENT KOMPONENTU',18,'#9bdcf5')+t(575,120,'2. PRZEBIEG I EFEKT',18)
        for i,line in enumerate(lines): svg+=t(50,165+i*line_height,line,font,'#fff','font-family="Consolas, Courier New, monospace" xml:space="preserve"')
        svg+=views[stem]
        wrapped=[];current=''
        for word in p['result'].split():
            if len(current+' '+word)>89:wrapped.append(current);current=word
            else:current=(current+' '+word).strip()
        wrapped.append(current)
        for i,line in enumerate(wrapped):svg+=t(32,566+i*26,line,20)
        svg+='</g></svg>'
        (OUT/f'{stem}.svg').write_text(svg,encoding='utf-8')
print(f'Generated {len(list(OUT.glob("*.svg")))} React diagrams')
