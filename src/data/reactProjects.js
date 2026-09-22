import { fullDocument } from './fullDocument.js';

const main = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
`;

const styles = `
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; color: #17324d; background: #f3f7fa; }
main, #root > section, #root > article { max-width: 760px; margin: 0 auto; padding: 32px 20px; }
button, input { font: inherit; }
button { cursor: pointer; }
`;

const lessonTitles = {
  32: 'React i JSX',
  33: 'Komponenty i props',
  34: 'Stan i zdarzenia',
  35: 'Listy i renderowanie warunkowe',
  36: 'Formularze kontrolowane',
  37: 'Efekty',
  38: 'Własne hooki i kompozycja',
  39: 'Projekt końcowy React',
};

const guidedSolutions = {
  32: {
    'App.jsx': `import React from 'react';

export default function App() {
  return <h1 id="result">GOTOWE</h1>;
}
`,
  },
  33: {
    'App.jsx': `import React from 'react';
import Card from './components/Card.jsx';

export default function App() {
  return <Card name="GOTOWE"><p>Opis karty</p></Card>;
}
`,
    'components/Card.jsx': `import React from 'react';

export default function Card({ name, children }) {
  return <article id="result"><h2>{name}</h2>{children}</article>;
}
`,
  },
  34: {
    'App.jsx': `import React, { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  return <button id="result" onClick={() => setCount((value) => value + 1)}>{count}</button>;
}
`,
  },
  35: {
    'App.jsx': `import React from 'react';

export default function App() {
  const items = [{ id: 1, name: 'GOTOWE' }, { id: 2, name: 'CSS' }];
  return <ul id="result">{items.length ? items.map((item) => <li key={item.id}>{item.name}</li>) : <li>Brak wyników</li>}</ul>;
}
`,
  },
  36: {
    'App.jsx': `import React, { useState } from 'react';

export default function App() {
  const [name, setName] = useState('');
  return <form onSubmit={(event) => event.preventDefault()}><label htmlFor="name">Imię</label><input id="name" value={name} onChange={(event) => setName(event.target.value)} /><output id="result">{name}</output></form>;
}
`,
  },
  37: {
    'App.jsx': `import React, { useEffect, useState } from 'react';

export default function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 20);
    return () => clearTimeout(timer);
  }, []);
  return <p id="result">{ready ? 'GOTOWE' : 'Czekam'}</p>;
}
`,
  },
  38: {
    'App.jsx': `import React from 'react';
import Counter from './components/Counter.jsx';
import { useCounter } from './hooks/useCounter.js';

export default function App() {
  const [count, add] = useCounter();
  return <Counter count={count} onAdd={add} />;
}
`,
    'components/Counter.jsx': `import React from 'react';

export default function Counter({ count, onAdd }) {
  return <button id="result" onClick={onAdd}>{count}</button>;
}
`,
    'hooks/useCounter.js': `import { useState } from 'react';

export function useCounter() {
  const [count, setCount] = useState(0);
  return [count, () => setCount((value) => value + 1)];
}
`,
  },
  39: {
    'App.jsx': `import React, { useState } from 'react';
import TaskItem from './components/TaskItem.jsx';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const addTask = () => setTasks((items) => [...items, { id: items.length, title: 'GOTOWE' }]);
  return <main><button id="add" onClick={addTask}>Dodaj zadanie</button><ul id="result">{tasks.map((task) => <TaskItem key={task.id} task={task} />)}</ul></main>;
}
`,
    'components/TaskItem.jsx': `import React from 'react';

export default function TaskItem({ task }) {
  return <li>{task.title}</li>;
}
`,
  },
};

const independentSolutions = {
  32: {
    'App.jsx': `import React from 'react';

const name = 'Ola';
export default function App() {
  return <article id="profile"><h1>{name}</h1><p>Uczę się Reacta.</p><img src="/course-assets/04-flexbox-grid.svg" alt="Układy stron" /></article>;
}
`,
  },
  33: {
    'App.jsx': `import React from 'react';
import Course from './components/Course.jsx';

export default function App() {
  return <section id="courses"><Course title="HTML"><p>Struktura</p></Course><Course title="CSS"><p>Wygląd</p></Course></section>;
}
`,
    'components/Course.jsx': `import React from 'react';

export default function Course({ title, children }) {
  return <article><h2>{title}</h2>{children}</article>;
}
`,
  },
  34: {
    'App.jsx': `import React, { useState } from 'react';

export default function App() {
  const [dark, setDark] = useState(false);
  return <button id="theme" aria-pressed={dark} onClick={() => setDark((value) => !value)}>{dark ? 'Noc' : 'Dzień'}</button>;
}
`,
  },
  35: {
    'App.jsx': `import React from 'react';

export default function App() {
  const tasks = [{ id: 1, title: 'HTML', done: true }, { id: 2, title: 'CSS', done: false }];
  return <ul id="pending">{tasks.filter((task) => !task.done).map((task) => <li key={task.id}>{task.title}</li>)}</ul>;
}
`,
  },
  36: {
    'App.jsx': `import React, { useState } from 'react';

export default function App() {
  const [name, setName] = useState('');
  return <form onSubmit={(event) => event.preventDefault()}><label htmlFor="name">Imię</label><input id="name" value={name} onChange={(event) => setName(event.target.value)} /><output id="length">{name.trim().length}</output></form>;
}
`,
  },
  37: {
    'App.jsx': `import React, { useEffect, useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);
  useEffect(() => { document.title = \`Kliknięcia: \${count}\`; }, [count]);
  return <button id="add" onClick={() => setCount((value) => value + 1)}>Dodaj kliknięcie</button>;
}
`,
  },
  38: {
    'App.jsx': `import React from 'react';
import Details from './components/Details.jsx';
import { useToggle } from './hooks/useToggle.js';

export default function App() {
  const [open, toggle] = useToggle();
  return <Details open={open} onToggle={toggle} />;
}
`,
    'components/Details.jsx': `import React from 'react';

export default function Details({ open, onToggle }) {
  return <section><button id="toggle" onClick={onToggle}>Przełącz opis</button><p id="details">{open ? 'Opis kursu' : 'Zamknięte'}</p></section>;
}
`,
    'hooks/useToggle.js': `import { useState } from 'react';

export function useToggle() {
  const [open, setOpen] = useState(false);
  return [open, () => setOpen((value) => !value)];
}
`,
  },
  39: {
    'App.jsx': `import React, { useState } from 'react';
import TaskItem from './components/TaskItem.jsx';

export default function App() {
  const [tasks, setTasks] = useState([{ id: 1, title: 'HTML' }]);
  const removeTask = (id) => setTasks((items) => items.filter((item) => item.id !== id));
  return <main><ul id="tasks">{tasks.map((task) => <TaskItem key={task.id} task={task} onRemove={removeTask} />)}</ul><p id="status">{tasks.length ? '1 zadanie' : 'Brak zadań'}</p></main>;
}
`,
    'components/TaskItem.jsx': `import React from 'react';

export default function TaskItem({ task, onRemove }) {
  return <li>{task.title}<button id="remove" onClick={() => onRemove(task.id)}>Usuń</button></li>;
}
`,
  },
};

function starterFiles(order, mode) {
  if (order === 33) {
    const component = mode === 'guided' ? 'Card' : 'Course';
    return {
      'App.jsx': `import React from 'react';\nimport ${component} from './components/${component}.jsx';\n\nexport default function App() {\n  return <${component}>Uzupełnij komponent</${component}>;\n}\n`,
      [`components/${component}.jsx`]: `import React from 'react';\n\nexport default function ${component}({ children }) {\n  return <article>{children}</article>;\n}\n`,
    };
  }
  if (order === 38) {
    const hook = mode === 'guided' ? 'useCounter' : 'useToggle';
    const component = mode === 'guided' ? 'Counter' : 'Details';
    return {
      'App.jsx': `import React from 'react';\nimport ${component} from './components/${component}.jsx';\nimport { ${hook} } from './hooks/${hook}.js';\n\nexport default function App() {\n  const state = ${hook}();\n  return <${component} state={state} />;\n}\n`,
      [`components/${component}.jsx`]: `import React from 'react';\n\nexport default function ${component}() {\n  return <section>Uzupełnij komponent</section>;\n}\n`,
      [`hooks/${hook}.js`]: `export function ${hook}() {\n  return [];\n}\n`,
    };
  }
  if (order === 39) {
    return {
      'App.jsx': `import React from 'react';\nimport TaskItem from './components/TaskItem.jsx';\n\nexport default function App() {\n  const tasks = [];\n  return <main><h1>Tablica zadań</h1>{tasks.map((task) => <TaskItem key={task.id} task={task} />)}</main>;\n}\n`,
      'components/TaskItem.jsx': `import React from 'react';\n\nexport default function TaskItem({ task }) {\n  return <li>{task.title}</li>;\n}\n`,
    };
  }
  return {
    'App.jsx': `import React from 'react';\n\nexport default function App() {\n  return <main><h1>${lessonTitles[order]}</h1><p>Uzupełnij rozwiązanie w App.jsx.</p></main>;\n}\n`,
  };
}

export function reactProjectFor(order, mode, kind) {
  if (!lessonTitles[order]) throw new Error(`Nieznana lekcja React: ${order}.`);
  if (!['guided', 'independent'].includes(mode)) throw new Error(`Nieznany tryb zadania React: ${mode}.`);
  if (!['starter', 'solution'].includes(kind)) throw new Error(`Nieznany rodzaj projektu React: ${kind}.`);

  const exerciseFiles = kind === 'starter'
    ? starterFiles(order, mode)
    : (mode === 'guided' ? guidedSolutions : independentSolutions)[order];

  return {
    entry: 'index.html',
    files: {
      'index.html': fullDocument('<div id="root"></div>', lessonTitles[order], { script: 'main.jsx' }),
      'styles.css': styles,
      'main.jsx': main,
      ...exerciseFiles,
    },
  };
}
