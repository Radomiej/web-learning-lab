import { courseManifest } from '../../shared/lab-game-v2/course/manifest.js';
import { buildCourseProject } from './labGameV2Course.js';
import { createLesson } from './lessonFactories.js';
import { courseWebChecks } from './labGameV2Checks.js';
const pointerTheory='Pozycja wskaźnika jest ekranowa i przed pierwszym zdarzeniem może być null. Camera2D.screenToWorld przelicza ją na świat. InputManager.isMouseDown śledzi przytrzymanie, isMousePressed nowe wciśnięcie, a isMouseReleased zwolnienie. Stała MOUSE_LEFT oznacza lewy przycisk; interakcja UI powinna zużyć wejście przed akcją świata.';
export const gameLessons = courseManifest.chapters.map(chapter => {
  const tasks = chapter.tasks.map(task => {
    const key = chapter.id.slice(4);
    const starter = buildCourseProject('js', key, task.mode, false);
    const solution = buildCourseProject('js', key, task.mode);
    return { ...task, track:'game-dev', starter:{entry:'index.html', files:starter.files,runtime:{kind:'game-js'}}, solution:{entry:'index.html',files:solution.files,runtime:{kind:'game-js'}}, solutionReady:solution.ready, checks:solution.ready?courseWebChecks(key,task.mode,task.id,solution.files):[], hint:task.mode==='guided'?'Twórz obiekt, pozycję i komponenty w oddzielnych instrukcjach. Sprawdź każde kryterium akceptacji.':undefined };
  });
  const result=createLesson({ ...chapter, track:'game-dev', order:700+chapter.order, summary:chapter.objectives.join(' '), objectives:chapter.objectives, focus:chapter.title, file:'game.js',runtime:'game-js',starter:tasks[0].starter,solution:tasks[0].solution,tasks,theory:[...chapter.objectives,...(chapter.id==='g2d.camera'?[pointerTheory]:[])] });
  result.tasks=result.tasks.map((task,index)=>({...task,starter:{...task.starter,engineApiVersion:'2.0.0'},solution:{...task.solution,engineApiVersion:'2.0.0'},objective:tasks[index].objective,criteria:tasks[index].criteria,solutionReady:tasks[index].solutionReady}));
  result.starter.engineApiVersion='2.0.0';result.solution.engineApiVersion='2.0.0';
  return result;
});
