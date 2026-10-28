# Audio — syntezator wspólny dla JS i Javy

Jedna implementacja WebAudio po stronie przeglądarki. Java nie gra samodzielnie: `game.audio` serializuje komendy `audio|` do protokołu ramek i ten sam scheduler odtwarza je identycznie jak w JS. Nuty trafiają na zegar AudioContext, więc tempo nie zależy od FPS.

## Nuty i czas

- Nazwa: `C4`, `C#4`, `Db4` … oktawa `-1`–`9`; `A4` = 440 Hz. Wielkość liter nie ma znaczenia.
- Pauza: `-` (albo `R`).
- Czas trwania w **taktach** (ćwierćnuta = 1); tempo utworu ustawia `Song` w BPM.
- Fale syntezatora: `square` (chiptune), `triangle`, `sine`, `sawtooth`, `noise` (perkusja).

## JavaScript

```js
const song = new GameLab.Song(140);
song.sequencer('square').notes('C4:1 E4:1 -:0.5 G4:2');
song.sequencer('triangle').note('C3', 2).rest(1).note('G2', 1.5);

this.audio.play(song);                  // this.audio na scenie Game
this.audio.play(song, { loop: true });
this.audio.playNote('A4');              // szybki ton, 1 takt square
this.audio.playNote('A4', { beats: 0.5, wave: 'triangle', tempo: 140 });
this.audio.stop();
```

## Java

```java
Song song = new Song(140);
song.sequencer("square").notes("C4:1 E4:1 -:0.5 G4:2");
song.sequencer("triangle").note("C3", 2).rest(1).note("G2", 1.5);

getGame().audio.play(song);             // albo pole game.audio
getGame().audio.play(song, true);       // loop
getGame().audio.playNote("A4", 0.5, "triangle");
getGame().audio.stop();
```

## Reguły

- `Song.sequencer(wave)` dodaje **równoległą ścieżkę**; kilka sekwencerów gra jednocześnie.
- `notes("C4:1 E4:0.5 -:2")` — token `nuta:takty`; brak `:` oznacza 1 takt. Walidacja zgłasza błąd na złej nucie, fali, takcie i tempie.
- Komendy audio wysłane przed `clear()` bufora rysowania (np. w `onCreate`) nie giną — dołączają do najbliższej ramki.
- AudioContext wymaga gestu użytkownika — klik „Uruchom" lub przycisk pada go odblokowuje.
- Brak AudioContext (stare środowisko): jedno ostrzeżenie w konsoli, bez błędu; `dispose()` zatrzymuje grające źródła i zamyka kontekst.
- `play()` z `loop` planuje kolejny przebieg utworu timerem; `stop()` kasuje timer i wszystkie źródła.
