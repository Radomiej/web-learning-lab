// SERVER ONLY: reference implementations must never enter the client bundle.
import {javascriptLessonTemplates} from './lessonCatalog.js';
import {alternativeLessonRecipe} from './lessonRecipeVariants.js';

export function generateLessonAssignment(descriptor, int) {
  const template=javascriptLessonTemplates.find(item=>item.id===descriptor.templateId);
  if(!template)return null;
  const level=['easy','standard','challenge'].indexOf(descriptor.difficulty);
  const modern=descriptor.generatorVersion!=='1';
  const names=modern?['Ola','Janek','Ewa','Leon','Lena','Ada']:['Ola','Jan','Ewa','Leon'];
  const a=int(2,18), b=int(2,9), name=names[int(0,names.length-1)];
  const recipe = modern ? (descriptor.index + int(0,2)) % 3 : 0;
  const params={lessonId:template.lessonId,consoleOnly:template.order<404,a,b,name};
  let prompt,code,expected,body='<output id="result"></output>',action=false;
  let criteria=['Program wykonuje się bez błędów.','Wynik odpowiada poleceniu i powstaje przez opisane operacje; nie wpisuj na sztywno gotowego wyniku.'];
  switch(template.topic){
    case 'error-handling': {
      params.consoleOnly=true;
      const message=`Problem ${name}`;expected=level===2?`${message} true`:message;
      prompt=level===2?`Zadeklaruj let komunikat = "" i let koniec = false. W try rzuć new Error("${message}"). W catch(error) przypisz error.message do komunikat. W finally ustaw koniec = true. Wypisz komunikat i koniec w jednym console.log. Oczekiwany wpis: ${expected}.`:`W try zgłoś throw new Error("${message}"). W catch(error) wypisz error.message przez console.log.${level?' Zgłoszenie umieść wewnątrz funkcji sprawdz(), wywołanej w try.':''} Oczekiwany wpis: ${expected}.`;
      code=level===2?`let komunikat = "";\nlet koniec = false;\ntry { throw new Error("${message}"); } catch(error) { komunikat = error.message; } finally { koniec = true; }\nconsole.log(komunikat, koniec);`:`${level?`function sprawdz() { throw new Error("${message}"); }\n`:''}try { ${level?'sprawdz();':`throw new Error("${message}");`} } catch(error) { console.log(error.message); }`;
      break;
    }
    case 'function-values': {
      params.consoleOnly=true;
      expected=level===2?name:String(a*b);
      prompt=level===2?`Utwórz obiekt profil z imie: "${name}" i metodą przedstaw() zwracającą this.imie. Zapisz profil.przedstaw.bind(profil) w const reakcja. Wywołaj reakcja() i wypisz wynik w konsoli: ${name}.`:`Napisz funkcję pomnoz(n), która zwraca n * ${b}. Przypisz samą funkcję do const operacja, bez wywołania. Wywołaj operacja(${a}) i wypisz ${expected} w konsoli.${level?' Przekaż operacja jako argument do funkcji wykonaj(fn, n), która zwraca fn(n).':''}`;
      code=level===2?`const profil = { imie: "${name}", przedstaw() { return this.imie; } };\nconst reakcja = profil.przedstaw.bind(profil);\nconsole.log(reakcja());`:`function pomnoz(n) { return n * ${b}; }\nconst operacja = pomnoz;\n${level?`function wykonaj(fn, n) { return fn(n); }\nconsole.log(wykonaj(operacja, ${a}));`:`console.log(operacja(${a}));`}`;
      break;
    }
    case 'comparisons': {
      params.consoleOnly=true;expected='false true';
      prompt=level===0?`Zadeklaruj const punkty = ${a}. W jednym console.log porównaj punkty > ${a} oraz punkty >= ${a}. Oczekiwany wpis: false true.`:level===1?`Zadeklaruj const tekst = "${a}". W jednym console.log porównaj tekst === ${a} oraz Number(tekst) === ${a}. Oczekiwany wpis: false true.`:`Zadeklaruj const punkty = ${a} i const zgoda = true. W jednym console.log wypisz punkty > ${a} && zgoda oraz punkty >= ${a} && zgoda. Oczekiwany wpis: false true.`;
      code=level===0?`const punkty = ${a};\nconsole.log(punkty > ${a}, punkty >= ${a});`:level===1?`const tekst = "${a}";\nconsole.log(tekst === ${a}, Number(tekst) === ${a});`:`const punkty = ${a};\nconst zgoda = true;\nconsole.log(punkty > ${a} && zgoda, punkty >= ${a} && zgoda);`;
      break;
    }
    case 'fetch': {
      const raw=level===0?JSON.stringify({title:`Warsztaty ${name}`}):level===1?'{broken}':JSON.stringify({title:a});
      const url='data:application/json,'+encodeURIComponent(raw);
      expected=level===0?`Warsztaty ${name}`:'Błąd pobierania';
      Object.assign(params,{url,async:true});
      prompt=`Użyj przygotowanego adresu ${JSON.stringify(url)} jako const url. To kontrolowane dane data:, a nie zewnętrzny serwer. Napisz async function wczytaj(), ustaw #result na Ładowanie…, potem w try/catch wykonaj await fetch(url), sprawdź response.ok i dla false rzuć Error. Odczytaj await response.json(); sprawdź, że dane.title jest tekstem, i pokaż go w #result. W catch pokaż Błąd pobierania. Wywołaj wczytaj(). ${level===0?'Poprawne dane zawierają tytuł.':level===1?'JSON jest celowo uszkodzony.':'JSON ma poprawną składnię, ale title jest liczbą.'} Oczekiwany wynik: ${expected}.`;
      code=`const url = ${JSON.stringify(url)};\nasync function wczytaj() {\n  const wynik = document.getElementById("result");\n  wynik.textContent = "Ładowanie…";\n  try {\n    const response = await fetch(url);\n    if (!response.ok) throw new Error("HTTP " + response.status);\n    const dane = await response.json();\n    if (!dane || typeof dane.title !== "string") throw new Error("Brak tytułu");\n    wynik.textContent = dane.title;\n  } catch { wynik.textContent = "Błąd pobierania"; }\n}\nwczytaj();`;
      break;
    }
    case 'variables': {
      expected=String(a+b*(level===2?2:1));
      prompt=`Zadeklaruj let punkty = ${a}. Zwiększ punkty o ${b} przez nowe przypisanie${level===2?`, a potem ponownie o ${b}`:''}. Wypisz punkty przez console.log. Oczekiwany wpis: ${expected}.`;
      code=`let punkty = ${a};\npunkty = punkty + ${b};\n${level===2?`punkty = punkty + ${b};\n`:''}console.log(punkty);`;
      if(level===0){prompt=`Zadeklaruj const punkty z liczbą ${a}. Wypisz wartość zmiennej przez console.log. Oczekiwany wpis: ${a}.`;code=`const punkty = ${a};\nconsole.log(punkty);`;expected=String(a);}
      break;
    }
    case 'objects': {
      const value=level?a+b:a;expected=`${name} ${value}`;
      prompt=`Utwórz const uczen jako obiekt z właściwościami imie: "${name}" i punkty: ${a}.${level?` Zmień uczen.punkty na ${level===2?`dotychczasowe punkty + ${b}`:value}.`:''} Odczytaj obie właściwości przez kropkę i wypisz je w jednym console.log. Oczekiwany wpis: ${expected}.`;
      code=`const uczen = { imie: "${name}", punkty: ${a} };\n${level?`uczen.punkty = ${level===2?`uczen.punkty + ${b}`:value};\n`:''}console.log(uczen.imie, uczen.punkty);`;
      break;
    }
    case 'functions': {
      expected=String(a*b);
      prompt=level===2?`Utwórz obiekt kalkulator z metodą pomnoz(a, b), która przez return zwraca iloczyn argumentów. Wywołaj kalkulator.pomnoz(${a}, ${b}) i wypisz zwrócony wynik przez console.log. Oczekiwany wpis: ${expected}.`:`Napisz funkcję ${level?'pomnoz(a, b)':'podwoj(n)'}, która przez return zwraca ${level?'iloczyn argumentów':'n * 2'}. Wywołaj ją z ${level?`argumentami ${a} i ${b}`:`argumentem ${a}`} i wypisz zwrócony wynik przez console.log. Oczekiwany wpis: ${level?expected:a*2}.`;
      if(level===2)code=`const kalkulator = { pomnoz(a, b) { return a * b; } };\nconsole.log(kalkulator.pomnoz(${a}, ${b}));`;
      else if(level)code=`function pomnoz(a, b) { return a * b; }\nconsole.log(pomnoz(${a}, ${b}));`;
      else {code=`function podwoj(n) { return n * 2; }\nconsole.log(podwoj(${a}));`;expected=String(a*2);}
      break;
    }
    case 'dom': {
      expected=`Witaj, ${name}!`;
      prompt=`Znajdź istniejący element #result przez ${level?'querySelector("#result")':'getElementById("result")'} i przypisz jego textContent tekst „${expected}”.${level?' Dodaj mu klasę ready przez classList.add.':''}${level===2?' Ustaw atrybut title na Gotowe przez setAttribute.':''} Nie twórz nowego elementu zamiast istniejącego.`;
      code=`const wynik = document.${level?'querySelector("#result")':'getElementById("result")'};\nwynik.textContent = "${expected}";${level?'\nwynik.classList.add("ready");':''}${level===2?'\nwynik.setAttribute("title", "Gotowe");':''}`;
      break;
    }
    case 'conditions': {
      const score=level===0?a-1:level===1?a:a+1;expected=score>=a?'Zdane':'Powtórz';params.threshold=a;params.score=score;
      prompt=`Napisz funkcję ocen(punkty): dla punkty >= ${a} zwróć tekst "Zdane", w przeciwnym razie "Powtórz". Użyj if i return. Wywołaj ocen(${score}) i pokaż zwrócony tekst w #result. Granica ${a} zalicza wynik. Oczekiwany wynik: ${expected}.`;
      code=`function ocen(punkty) {\n  if (punkty >= ${a}) return "Zdane";\n  return "Powtórz";\n}\ndocument.querySelector("#result").textContent = ocen(${score});`;
      break;
    }
    case 'arrays': {
      const values=[a-1,a,a+1,a];params.values=values;
      expected=(level===0?values:level===1?values.map(n=>n*2):values.filter(n=>n>=a)).join(', ');
      prompt=`Zadeklaruj const liczby = ${JSON.stringify(values)}. ${level===0?'Pokaż elementy tablicy':level===1?'Przez map utwórz nową tablicę z każdą liczbą pomnożoną przez 2':'Przez filter utwórz nową tablicę z liczbami >= '+a+', zachowując kolejność i powtórzenia'}. Połącz wynik przez join(", ") i pokaż w #result. Oczekiwany tekst: ${expected}.`;
      code=`const liczby = ${JSON.stringify(values)};\nconst wynik = ${level===0?'liczby':level===1?'liczby.map(liczba => liczba * 2)':`liczby.filter(liczba => liczba >= ${a})`};\ndocument.querySelector("#result").textContent = wynik.join(", ");`;
      break;
    }
    case 'events': {
      action=true;expected=level===0?`Witaj, ${name}!`:`${name} ${a}`;
      if(level===0){
        body='<button id="action" type="button">Pokaż</button><output id="result"></output>';
        prompt=`Przez addEventListener podłącz click do przycisku #action. Dopiero po kliknięciu pokaż w #result tekst „${expected}”.`;
        code=`document.querySelector("#action").addEventListener("click", () => {\n  document.querySelector("#result").textContent = "${expected}";\n});`;
      }else{
        body=`<form id="form"><label for="name">Imię</label><input id="name" name="student" value="${name}"><label for="count">Liczba</label><input id="count" name="count" type="number" value="${a}" required><button id="action" type="submit">Pokaż</button></form><output id="result"></output>`;
        prompt=`Podłącz zdarzenie submit do form#form i na początku obsługi wywołaj event.preventDefault(). Przy każdym wysłaniu utwórz new FormData(form). Odczytaj imię przez get("student")${level===2?' i usuń skrajne spacje przez trim()':''}. Odczytaj get("count") i zamień tekst na liczbę przez Number(). Pokaż w #result imię i liczbę oddzielone spacją. Początkowo po wysłaniu wynik to „${expected}”. Przycisk #action wysyła formularz; wysłanie klawiszem Enter ma działać tak samo.`;
        code=`const form = document.querySelector("#form");\nform.addEventListener("submit", (event) => {\n  event.preventDefault();\n  const data = new FormData(form);\n  const name = String(data.get("student"))${level===2?'.trim()':''};\n  const count = Number(data.get("count"));\n  document.querySelector("#result").textContent = name + " " + count;\n});`;
      }
      break;
    }
    case 'state': {
      action=true;expected=String(a+b);
      body='<button id="action" type="button">Dodaj punkty</button><output id="result"></output>';
      prompt=`Zadeklaruj stan const state = { punkty: ${a} } i funkcję render(), która pokazuje state.punkty w #result. Wywołaj render na start. Po każdym kliknięciu #action zwiększ state.punkty o ${b} i wywołaj render ponownie. Po pierwszym kliknięciu wynik to ${expected}.${level?' Kolejne kliknięcia mają nadal zwiększać stan.':''}`;
      code=`const state = { punkty: ${a} };\nfunction render() { document.querySelector("#result").textContent = state.punkty; }\ndocument.querySelector("#action").addEventListener("click", () => { state.punkty += ${b}; render(); });\nrender();`;
      break;
    }
    case 'storage': {
      const raw=level===2?'niepoprawny JSON':JSON.stringify({name,points:a});params.raw=raw;expected=level===2?'Błędne dane':`${name} ${a}`;
      prompt=`W ramach przygotowania do zapisu danych zadeklaruj const raw = ${JSON.stringify(raw)}. Parsuj raw przez JSON.parse w try/catch.${level?' Przed użyciem sprawdź, czy name jest tekstem, a points liczbą.':''} Pokaż name i points oddzielone spacją w #result; przy błędzie pokaż „Błędne dane”. Oczekiwany tekst dla tych danych: ${expected}. W izolowanym podglądzie nie używaj localStorage.`;
      code=`const raw = ${JSON.stringify(raw)};\ntry {\n  const data = JSON.parse(raw);\n${level?'  if (typeof data.name !== "string" || typeof data.points !== "number") throw new Error("Dane");\n':''}  document.querySelector("#result").textContent = data.name + " " + data.points;\n} catch { document.querySelector("#result").textContent = "Błędne dane"; }`;
      break;
    }
    case 'planner': {
      action=true;expected=`Spotkanie ${name}`;
      body=`<label for="title">Tytuł</label><input id="title" value="${expected}"><button id="action" type="button">Dodaj wydarzenie</button><ul id="result"></ul>`;
      prompt=`Zbuduj pierwszy etap planera: const events = [] przechowuje obiekty { title }. Po kliknięciu #action odczytaj input#title, dodaj obiekt i odśwież ul#result. Każde wydarzenie pokaż jako li z tytułem ustawionym przez textContent.${level?' Pomiń pusty tytuł po trim().':''}${level===2?' Po dodaniu wyczyść pole; kolejne dodania zachowują poprzednie wydarzenia.':''} Po pierwszym kliknięciu początkowy tytuł to „${expected}”.`;
      code=`const events = [];\nfunction render() {\n  const list = document.querySelector("#result");\n  list.replaceChildren();\n  for (const event of events) { const item = document.createElement("li"); item.textContent = event.title; list.append(item); }\n}\ndocument.querySelector("#action").addEventListener("click", () => {\n  const input = document.querySelector("#title");\n  const title = input.value${level?'.trim()':''};\n${level?'  if (!title) return;\n':''}  events.push({ title });\n  render();${level===2?'\n  input.value = "";':''}\n});\nrender();`;
      break;
    }
  }
  const alternative = modern ? alternativeLessonRecipe(template.topic,recipe,level,{a,b,name},int) : null;
  if(alternative){
    ({prompt,code,expected}=alternative);
    if(template.topic==='storage')delete params.raw;
    if(template.topic==='arrays')delete params.values;
    if(alternative.body)body=alternative.body;
    action=alternative.action ?? false;
    Object.assign(params,alternative.params);
  }
  if(modern)params.recipeId=`${template.topic}-${descriptor.difficulty}-${recipe+1}`;
  if(modern)params.taskKind=alternative?.kind || {
    variables:'Przypisanie i zmiana wartości',objects:'Odczyt profilu',functions:'Obliczenie wyniku funkcji',
    dom:'Zmiana istniejącego elementu','function-values':'Przekazywanie funkcji',comparisons:'Porównanie na granicy',
    conditions:'Próg zaliczenia',arrays:'Przekształcanie tablicy',events:level?'Formularz zgłoszenia':'Komunikat po kliknięciu',
    state:'Licznik punktów','error-handling':'Zgłoszenie i przechwycenie błędu',storage:'Parsowanie profilu',planner:'Dodawanie wydarzenia',
  }[template.topic];
  params.expected=expected;params.action=action?'click':null;
  if(params.consoleOnly){body='<p>Wynik programu odczytasz w konsoli podglądu.</p>';criteria.push('Wypisz jeden wpis w konsoli; bez używania document ani DOM.');}
  const html=`<!doctype html><html lang="pl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${template.name}</title></head><body><main><h1>${template.name}</h1>${body}</main><script src="script.js"></script></body></html>`;
  const starterFiles={'index.html':html,'script.js':`// TODO: ${params.consoleOnly?'Napisz program; wynik wypisz przez console.log.':'Napisz rozwiązanie zgodnie z poleceniem.'}\n`};
  return {title:modern?`${template.name} · ${params.taskKind}`:template.name,prompt,criteria,starterFiles,referenceFiles:{...starterFiles,'script.js':code+'\n'},params};
}
