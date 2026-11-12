// Gotowy motyw „interfejsu gry" dla ścieżki HTML GD — ciemne fantasy w stylu
// menu gier AAA. Stylowane są wyłącznie selektory elementów i atrybutów,
// bo uczeń nie zna jeszcze klas CSS. Pliki fontów (Cinzel, Cinzel Decorative)
// są serwowane lokalnie z public/course-assets/html-gd/fonts/.
export const gameUiThemeCss = `/* Motyw interfejsu gry — gotowy. Nie musisz go zmieniać; CSS poznasz w kolejnych lekcjach. */
@font-face {
  font-family: 'Cinzel';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/course-assets/html-gd/fonts/cinzel-latin-ext-400-normal.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'Cinzel';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/course-assets/html-gd/fonts/cinzel-latin-400-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Cinzel';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/course-assets/html-gd/fonts/cinzel-latin-ext-700-normal.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'Cinzel';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/course-assets/html-gd/fonts/cinzel-latin-700-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Cinzel Decorative';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/course-assets/html-gd/fonts/cinzel-decorative-latin-ext-400-normal.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'Cinzel Decorative';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('/course-assets/html-gd/fonts/cinzel-decorative-latin-400-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
@font-face {
  font-family: 'Cinzel Decorative';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/course-assets/html-gd/fonts/cinzel-decorative-latin-ext-700-normal.woff2') format('woff2');
  unicode-range: U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
@font-face {
  font-family: 'Cinzel Decorative';
  font-style: normal;
  font-weight: 700;
  font-display: swap;
  src: url('/course-assets/html-gd/fonts/cinzel-decorative-latin-700-normal.woff2') format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}

* { box-sizing: border-box; }
html { scrollbar-color: #6b5326 #07090d; }
body {
  margin: 0;
  min-height: 100vh;
  padding: 24px 16px;
  font-family: system-ui, 'Segoe UI', sans-serif;
  font-size: 16px;
  line-height: 1.6;
  color: #d8d2c4;
  background:
    radial-gradient(1200px 600px at 50% -10%, rgba(224, 176, 74, 0.10), transparent 60%),
    radial-gradient(900px 500px at 85% 110%, rgba(120, 40, 30, 0.12), transparent 60%),
    radial-gradient(140% 120% at 50% 50%, #0b0e14 55%, #07090d 100%),
    #07090d;
}
/* W podglądzie teorii (shadow DOM) nie ma <body> — :host daje to samo tło. */
:host {
  background:
    radial-gradient(1200px 600px at 50% -10%, rgba(224, 176, 74, 0.10), transparent 60%),
    radial-gradient(140% 120% at 50% 50%, #0b0e14 55%, #07090d 100%),
    #07090d !important;
  color: #d8d2c4 !important;
  font-family: system-ui, 'Segoe UI', sans-serif !important;
}

/* ---------- Panele ---------- */
main, section, article, aside, form, fieldset, figure, table, details, nav {
  position: relative;
  padding: 18px 20px;
  border: 1px solid #6b5326;
  border-radius: 8px;
  background: linear-gradient(160deg, #1a1f2b 0%, #0e1118 100%);
  box-shadow:
    inset 0 0 0 1px rgba(232, 199, 106, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 0 24px rgba(224, 176, 74, 0.08),
    0 8px 24px rgba(0, 0, 0, 0.55);
  animation: gd-panel-in 0.6s ease-out both;
}
main {
  max-width: 720px;
  margin: 0 auto;
}
section, article, aside, fieldset, figure, details {
  margin: 14px 0;
}
nav { margin: 0 0 14px 0; }
main::before, main::after, section::before, section::after {
  content: '';
  position: absolute;
  width: 14px;
  height: 14px;
  pointer-events: none;
}
main::before, section::before {
  top: -1px;
  left: -1px;
  border-top: 2px solid #e0b04a;
  border-left: 2px solid #e0b04a;
  border-top-left-radius: 8px;
}
main::after, section::after {
  bottom: -1px;
  right: -1px;
  border-bottom: 2px solid #e0b04a;
  border-right: 2px solid #e0b04a;
  border-bottom-right-radius: 8px;
}
@keyframes gd-panel-in {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ---------- Typografia ---------- */
h1, h2, h3, h4, h5, h6, legend, caption, summary {
  font-family: 'Cinzel', 'Trajan Pro', 'Palatino Linotype', Georgia, serif;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #e8c76a;
  text-shadow: 0 0 18px rgba(224, 176, 74, 0.35), 0 2px 6px rgba(0, 0, 0, 0.8);
}
h1 {
  font-family: 'Cinzel Decorative', 'Cinzel', 'Trajan Pro', Georgia, serif;
  font-size: clamp(1.9rem, 5.5vw, 2.9rem);
  line-height: 1.15;
  text-align: center;
  margin: 8px 0 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid transparent;
  border-image: linear-gradient(90deg, transparent, #6b5326, transparent) 1;
  position: relative;
}
@supports ((-webkit-background-clip: text) or (background-clip: text)) {
  h1, h2, h3, h4, h5, h6 {
    background-image: linear-gradient(180deg, #f6e3a1 15%, #e0b04a 55%, #c08a2c 95%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  h1 {
    background-image: linear-gradient(100deg, #c08a2c 0%, #f6e3a1 30%, #e0b04a 50%, #f6e3a1 70%, #c08a2c 100%);
    background-size: 250% 100%;
    animation: gd-shimmer 7s linear infinite;
  }
}
@keyframes gd-shimmer {
  from { background-position: 120% 0; }
  to { background-position: -130% 0; }
}
h2 { font-size: 1.25rem; margin: 4px 0 10px; }
h3 { font-size: 1.05rem; margin: 4px 0 8px; }
h4, h5, h6 { font-size: 0.95rem; }
p { margin: 8px 0; }
strong { color: #f0d48a; font-weight: 700; }
em { color: #8fb8ff; font-style: italic; }
small { color: #a49b86; }
time {
  font-variant: small-caps;
  letter-spacing: 0.08em;
  color: #a49b86;
}
a {
  color: #e8c76a;
  text-decoration: none;
  border-bottom: 1px solid rgba(224, 176, 74, 0.35);
  transition: color 0.2s, border-color 0.2s, text-shadow 0.2s, padding-left 0.2s;
}
a:hover, a:focus-visible {
  color: #f6e3a1;
  border-bottom-color: #f6e3a1;
  text-shadow: 0 0 12px rgba(224, 176, 74, 0.7);
}
a:focus-visible, button:focus-visible, summary:focus-visible,
input:focus-visible, select:focus-visible, textarea:focus-visible {
  outline: 2px solid #e0b04a;
  outline-offset: 2px;
  box-shadow: 0 0 14px rgba(224, 176, 74, 0.45);
}
hr {
  height: 24px;
  margin: 22px 0;
  border: 0;
  background:
    linear-gradient(90deg, transparent, #6b5326 20%, #e0b04a 50%, #6b5326 80%, transparent) center 45% / 100% 1px no-repeat;
  position: relative;
}
hr::after {
  content: '◆';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  color: #e0b04a;
  font-size: 12px;
  text-shadow: 0 0 10px rgba(224, 176, 74, 0.8);
}
code {
  font-family: 'Consolas', 'Menlo', 'DejaVu Sans Mono', monospace;
  font-size: 0.9em;
  color: #7fd4c9;
  background: #0a1418;
  border: 1px solid #1f3a3a;
  border-radius: 4px;
  padding: 1px 6px;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.6);
}
pre {
  padding: 14px 16px;
  margin: 12px 0;
  overflow-x: auto;
  background: #0a1418;
  border: 1px solid #1f3a3a;
  border-left: 3px solid #2c7a72;
  border-radius: 6px;
  box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.7);
}
pre code {
  padding: 0;
  border: 0;
  background: transparent;
  box-shadow: none;
  color: #8fe0d5;
}
blockquote {
  margin: 14px 0;
  padding: 14px 18px 14px 20px;
  font-style: italic;
  color: #cfc5a8;
  background: linear-gradient(160deg, #211d14 0%, #14100a 100%);
  border: 1px solid #57451f;
  border-left: 4px solid #e0b04a;
  border-radius: 0 8px 8px 0;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
}
blockquote p { margin: 0; }
cite { color: #a49b86; font-style: italic; }
abbr[title] {
  text-decoration: underline dotted #e0b04a;
  text-underline-offset: 3px;
  cursor: help;
}
sub, sup { color: #a8c7ff; }

/* ---------- Nawigacja i elementy interaktywne ---------- */
nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
nav li { margin: 0; }
nav a {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 18px;
  border: 1px solid #6b5326;
  border-radius: 6px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #d8d2c4;
  background: linear-gradient(160deg, #1f2534 0%, #12161f 100%);
  box-shadow: inset 0 0 0 1px rgba(232, 199, 106, 0.12), 0 2px 8px rgba(0, 0, 0, 0.5);
}
nav a::before {
  content: '◆';
  font-size: 0.65em;
  color: #8a6d33;
  transition: color 0.2s, text-shadow 0.2s;
}
nav a:hover, nav a:focus-visible {
  color: #f6e3a1;
  border-color: #e0b04a;
  transform: translateX(2px);
  text-shadow: 0 0 12px rgba(224, 176, 74, 0.7);
  box-shadow: inset 0 0 0 1px rgba(232, 199, 106, 0.3), 0 0 18px rgba(224, 176, 74, 0.35);
}
nav a:hover::before, nav a:focus-visible::before { color: #e0b04a; text-shadow: 0 0 8px #e0b04a; }
button {
  position: relative;
  overflow: hidden;
  display: inline-block;
  margin: 10px 0 4px;
  padding: 12px 30px;
  border: 1px solid #8a6d33;
  border-radius: 6px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: #fff2cf;
  background: linear-gradient(160deg, #a03a2c 0%, #7a2517 45%, #c08a2c 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 0 20px rgba(160, 58, 44, 0.4), 0 4px 14px rgba(0, 0, 0, 0.6);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.2s, filter 0.2s;
}
button::after {
  content: '';
  position: absolute;
  top: 0;
  left: -80%;
  width: 50%;
  height: 100%;
  background: linear-gradient(100deg, transparent, rgba(255, 240, 200, 0.35), transparent);
  transform: skewX(-20deg);
  transition: left 0.5s ease;
}
button:hover { filter: brightness(1.15); transform: translateY(-1px); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 0 28px rgba(224, 176, 74, 0.5), 0 4px 14px rgba(0, 0, 0, 0.6); }
button:hover::after { left: 130%; }
button:active { transform: translateY(1px); }

/* ---------- Listy ---------- */
ul { list-style: none; padding-left: 6px; }
ul li {
  position: relative;
  padding-left: 22px;
  margin: 6px 0;
}
ul li::before {
  content: '◆';
  position: absolute;
  left: 0;
  top: 0.1em;
  font-size: 0.7em;
  color: #e0b04a;
  text-shadow: 0 0 8px rgba(224, 176, 74, 0.7);
}
ul ul, ol ul { margin: 4px 0 4px 10px; }
ul ul li::before { color: #8a6d33; text-shadow: none; }
ol {
  list-style: none;
  padding-left: 6px;
  counter-reset: gd-step;
}
ol > li {
  position: relative;
  padding-left: 34px;
  margin: 8px 0;
  counter-increment: gd-step;
}
ol > li::before {
  content: counter(gd-step);
  position: absolute;
  left: 0;
  top: 0.1em;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 0.75rem;
  font-weight: 700;
  color: #0e1118;
  background: linear-gradient(160deg, #f6e3a1, #c08a2c);
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(224, 176, 74, 0.5);
}
dl {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 18px;
  margin: 10px 0;
}
dt {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #e0b04a;
}
dd { margin: 0; font-weight: 600; color: #f0e9d8; }
address { font-style: normal; }
address a { display: inline-block; margin: 4px 12px 4px 0; }

/* ---------- Tabele ---------- */
table {
  width: 100%;
  border-collapse: collapse;
  padding: 0;
  margin: 16px 0;
  overflow: hidden;
}
caption {
  padding: 10px;
  font-size: 1rem;
  letter-spacing: 0.14em;
}
th, td {
  padding: 10px 14px;
  text-align: left;
  border: 0;
}
thead th {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #0e1118;
  background: linear-gradient(160deg, #f6e3a1, #c08a2c);
  text-shadow: none;
}
thead tr { border-bottom: 2px solid #e0b04a; }
tbody tr { border-bottom: 1px solid rgba(107, 83, 38, 0.4); }
tbody tr:nth-of-type(odd) { background: rgba(255, 240, 200, 0.03); }
tbody tr:nth-of-type(1) { border-left: 4px solid #e0b04a; box-shadow: inset 0 0 14px rgba(224, 176, 74, 0.12); }
tbody tr:nth-of-type(2) { border-left: 4px solid #b8bcc4; }
tbody tr:nth-of-type(3) { border-left: 4px solid #a06a3a; }
tbody tr:nth-of-type(1) th, tbody tr:nth-of-type(1) td { color: #f6e3a1; }
tbody th {
  font-family: 'Cinzel', Georgia, serif;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #e8c76a;
}
tfoot td, tfoot th {
  font-family: 'Cinzel', Georgia, serif;
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #e0b04a;
  border-top: 2px solid #6b5326;
  background: rgba(224, 176, 74, 0.06);
}

/* ---------- Media ---------- */
figure { text-align: center; }
figure img {
  max-width: 100%;
  height: auto;
  border: 1px solid #6b5326;
  border-radius: 6px;
  box-shadow: 0 0 18px rgba(224, 176, 74, 0.15), 0 6px 18px rgba(0, 0, 0, 0.6);
}
figcaption {
  margin-top: 8px;
  font-variant: small-caps;
  letter-spacing: 0.1em;
  color: #a49b86;
}
video, audio {
  display: block;
  width: 100%;
  max-width: 480px;
  margin: 10px auto;
  border: 1px solid #6b5326;
  border-radius: 6px;
  background: #000;
}
img { max-width: 100%; }

/* ---------- Formularze ---------- */
form { max-width: 560px; margin: 0 auto; }
fieldset {
  margin: 0;
  padding: 24px 20px 20px;
}
legend {
  padding: 6px 22px;
  font-size: 0.9rem;
  letter-spacing: 0.16em;
  color: #0e1118;
  background: linear-gradient(160deg, #f6e3a1, #c08a2c);
  border: 1px solid #8a6d33;
  border-radius: 3px;
  box-shadow: 0 0 16px rgba(224, 176, 74, 0.4), 0 3px 8px rgba(0, 0, 0, 0.5);
  text-shadow: none;
}
label {
  display: block;
  margin: 14px 0 4px;
  font-family: 'Cinzel', Georgia, serif;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #d0b878;
}
input, select, textarea {
  display: block;
  width: 100%;
  margin: 0;
  padding: 10px 12px;
  font: 15px system-ui, 'Segoe UI', sans-serif;
  color: #f0e9d8;
  background: #0a0d13;
  border: 1px solid #4a3d22;
  border-radius: 5px;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.7);
}
input:focus, select:focus, textarea:focus {
  border-color: #e0b04a;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.7), 0 0 14px rgba(224, 176, 74, 0.35);
}
input[type="checkbox"], input[type="radio"] {
  display: inline-block;
  width: auto;
  margin-right: 8px;
  accent-color: #e0b04a;
  transform: scale(1.3);
}
input[type="checkbox"] + label, input[type="radio"] + label,
label:has(input[type="checkbox"]), label:has(input[type="radio"]) {
  display: inline-block;
  text-transform: none;
  letter-spacing: 0.04em;
  font-family: system-ui, sans-serif;
  font-size: 0.95rem;
  color: #d8d2c4;
}
textarea { min-height: 90px; resize: vertical; }
select {
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, #e0b04a 50%), linear-gradient(135deg, #e0b04a 50%, transparent 50%);
  background-position: calc(100% - 18px) 55%, calc(100% - 12px) 55%;
  background-size: 6px 6px;
  background-repeat: no-repeat;
}

/* ---------- Rozwijane bloki ---------- */
details { padding: 0; overflow: hidden; }
summary {
  position: relative;
  padding: 12px 16px 12px 40px;
  font-size: 0.95rem;
  letter-spacing: 0.08em;
  cursor: pointer;
  list-style: none;
  transition: background 0.2s, color 0.2s;
}
summary::-webkit-details-marker { display: none; }
summary::before {
  content: '◆';
  position: absolute;
  left: 16px;
  top: 50%;
  font-size: 0.7em;
  color: #e0b04a;
  transform: translateY(-50%) rotate(0deg);
  transition: transform 0.25s ease;
}
details[open] summary::before { transform: translateY(-50%) rotate(90deg); }
summary:hover { background: rgba(224, 176, 74, 0.07); color: #f6e3a1; }
details[open] summary { border-bottom: 1px solid rgba(107, 83, 38, 0.5); }
details > p, details > ul, details > ol, details > div { margin: 12px 16px; }

/* ---------- Ramy strony ---------- */
header {
  position: relative;
  max-width: 720px;
  margin: 0 auto 18px;
  padding: 14px 20px;
  text-align: center;
  border: 1px solid #6b5326;
  border-radius: 8px;
  background: linear-gradient(160deg, #232a3c 0%, #12161f 100%);
  box-shadow: inset 0 -3px 0 rgba(224, 176, 74, 0.35), 0 0 24px rgba(224, 176, 74, 0.1);
}
header nav { margin: 0; padding: 0; border: 0; background: none; box-shadow: none; animation: none; }
header nav ul { justify-content: center; }
footer {
  max-width: 720px;
  margin: 18px auto 0;
  padding: 14px 20px;
  text-align: center;
  font-size: 0.85rem;
  color: #8a8272;
  border-top: 1px solid rgba(107, 83, 38, 0.5);
}
aside h2, aside h3 { font-size: 1rem; }
address { margin: 10px 0; }

/* ---------- Dostępność i responsywność ---------- */
@media (max-width: 480px) {
  body { padding: 12px 8px; }
  main, section, article, aside, form, fieldset, figure, table, details, nav { padding: 12px 14px; }
  nav ul { flex-direction: column; }
  nav a { width: 100%; }
  h1 { font-size: 1.7rem; }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation: none !important;
    transition: none !important;
  }
}
`;
