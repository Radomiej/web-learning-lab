// Public course metadata; implementations remain in the server-only generator.
export const javascriptLessonTemplates = [
  ['variables','js-browser','Zmienne i wartości'],
  ['objects','js-objects','Obiekty i właściwości'],
  ['functions','js-functions','Funkcje i metody'],
  ['dom','js-dom','document i DOM'],
  ['function-values','js-function-values','Funkcje i metody w zmiennych'],
  ['comparisons','js-comparisons','Porównania i wartości logiczne'],
  ['conditions','js-conditions-functions','Warunki'],
  ['arrays','js-data-loops','Tablice i pętle'],
  ['events','js-events-forms','Zdarzenia i formularze'],
  ['state','js-small-state','Stan aplikacji'],
  ['error-handling','js-error-handling','Błędy i obsługa wyjątków'],
  ['storage','js-validation-storage','Walidacja i zapis danych'],
  ['fetch','js-fetch','fetch i obsługa błędów'],
  ['planner','js-event-planner','Planer wydarzenia'],
].map(([topic,lessonId,title],index)=>({id:`js-lesson-${topic}`,appId:'www-lab',name:`JS ${index+1} · ${title}`,lessonId,order:401+index,topic}));
