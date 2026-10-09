import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './GameCoursePdf.css';

export const gameCoursePdfUrl = `${import.meta.env.BASE_URL}courses/kurs-gamedev-js.pdf`;
const courses = [
  { title: 'Podstawy GameDev JS', file: 'kurs-gamedev-js.pdf', pages: 8 },
  { title: 'Kamera, viewport i UI', file: 'kurs-gamedev-js-kamera-ui.pdf', pages: 5 },
  { title: 'Tweeny, PingPong i FadeOut', file: 'kurs-gamedev-js-tweeny.pdf', pages: 7 },
];

export default function GameCoursePdf() {
  const [open, setOpen] = useState(false);
  const [courseIndex, setCourseIndex] = useState(0);
  const [page, setPage] = useState(1);
  const course = courses[courseIndex];
  const pdfUrl = `${import.meta.env.BASE_URL}courses/${course.file}`;
  const triggerRef = useRef(null);
  const dialogRef = useRef(null);
  const previewRef = useRef(null);
  useEffect(() => { if (previewRef.current) previewRef.current.scrollTop = 0; }, [page, courseIndex]);

  useEffect(() => {
    if (!open) return;
    const dialog = dialogRef.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (dialog.showModal) dialog.showModal();
    else dialog.setAttribute('open', '');
    dialog.querySelector('button')?.focus();
    return () => {
      dialog.close?.();
      document.body.style.overflow = overflow;
      triggerRef.current?.focus();
    };
  }, [open]);

  return <>
    <div className="game-course-actions">
      <button ref={triggerRef} className="button button--ghost" type="button" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 5v15M12 5C9 3 5 3 2 4v15c3-1 7-1 10 1 3-2 7-2 10-1V4c-3-1-7-1-10 1Z" /></svg>
        Kurs GameDev · PDF
      </button>
      <a className="button button--ghost" href={gameCoursePdfUrl} download="kurs-gamedev-js.pdf">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></svg>
        Pobierz PDF
      </a>
    </div>
    {open && createPortal(<dialog ref={dialogRef} className="game-guide-modal game-course-modal" aria-labelledby="game-course-title" onCancel={event => { event.preventDefault(); setOpen(false); }} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); setOpen(false); } }} onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <header className="game-guide-heading">
        <h2 id="game-course-title">{course.title}</h2>
        <button className="button button--ghost" type="button" aria-label="Zamknij kurs PDF" onClick={() => setOpen(false)}>Zamknij ×</button>
      </header>
      <div className="game-course-toolbar">
        <label className="game-course-selector">Kurs<select aria-label="Kurs" value={courseIndex} onChange={event => { setCourseIndex(Number(event.target.value)); setPage(1); }}>{courses.map((item, index) => <option key={item.file} value={index}>{item.title}</option>)}</select></label>

        <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Otwórz w nowej karcie</a>
        <a href={pdfUrl} download={course.file}>Pobierz PDF</a>
      </div>
      <div ref={previewRef} className="game-course-preview" tabIndex={0} aria-label="Podgląd strony kursu">
        <img key={`${course.file}-${page}`} src={`${import.meta.env.BASE_URL}courses/previews/${course.file.replace('.pdf', '')}/page-${page}.webp`} alt={`${course.title} — strona ${page} z ${course.pages}. Pełny tekst dostępny w pliku PDF.`} />
      </div>
      <nav className="game-course-pagination" aria-label="Strony kursu PDF">
        <button type="button" aria-label="Poprzednia strona" title="Poprzednia strona" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
        <div className="game-course-page-numbers">{Array.from({ length: course.pages }, (_, index) => index + 1).map(number => <button key={number} type="button" aria-label={`Strona ${number}`} aria-current={page === number ? 'page' : undefined} onClick={() => setPage(number)}>{number}</button>)}</div>
        <button type="button" aria-label="Następna strona" title="Następna strona" disabled={page === course.pages} onClick={() => setPage(page + 1)}>›</button>
        <span className="game-course-page-status" aria-live="polite">{page} / {course.pages}</span>
      </nav>
    </dialog>, document.body)}
  </>;
}
