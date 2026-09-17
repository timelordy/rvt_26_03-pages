(() => {
  'use strict';

  const LIVE_LESSONS = [
    {
      id: 'start',
      number: 1,
      stageId: 1,
      title: 'Revit с нуля: модель, виды и интерфейс',
      practice: 'Сначала разберитесь, что делает Revit и как устроена одна модель, затем создайте и сохраните учебный проект.',
      points: [
        'Что такое Revit и зачем он нужен.',
        'Модель, объекты, параметры, виды и листы.',
        'Что делаем на курсе и какой результат нужен.',
        'Стартовый экран: проекты и семейства.',
        'Параметры Revit: сохранение и основные настройки.',
        'Шаблон проекта: создание проекта и понятие шаблона.',
        'Интерфейс: вкладки, внешний вид при разном разрешении, сворачивание ленты.',
        'Панель быстрого доступа, сочетания клавиш, строка параметров.',
        'Диспетчер проекта и свойства: назначение, расположение окон, интерфейс пользователя.',
        'Семейства: системные и загружаемые.'
      ]
    },
    {
      id: 'navigation',
      number: 2,
      stageId: 2,
      title: 'Осмотр и навигация модели',
      practice: 'Откройте Basic Sample Project и научитесь уверенно находить нужный вид и элемент.',
      points: [
        'Осмотр и навигация модели.',
        'Basic Sample Project.',
        'Видовые окна: перетаскивание, режимы расположения окон, вписывание вида в окно.',
        '3D-вид: базовая навигация мышью и выбор центра вращения.',
        'Видовой куб и суперштурвал.',
        '3D-разрез: механика работы и ориентирование по виду.',
        'Плоский разрез: механика работы и перемещение разреза.',
        'Выделение элементов: опции выделения на вкладке и панели.',
        'Выделение рамкой и фильтр.',
        'Временное скрытие и изоляция.',
        'Масштаб.'
      ]
    },
    {id:'draw-edit',number:3,stageId:3,title:'Рисование и редактирование',locked:true},
    {id:'groups-sketch',number:4,stageId:4,title:'Группы, размеры и эскиз',locked:true},
    {id:'grids',number:5,stageId:5,title:'Оси',locked:true},
    {id:'levels',number:6,stageId:6,title:'Уровни',locked:true},
    {id:'walls',number:7,stageId:7,title:'Стены',locked:true},
    {id:'floors-columns',number:8,stageId:8,title:'Перекрытия и колонны',locked:true},
    {id:'roof-canopy',number:9,stageId:9,title:'Кровля и козырёк',locked:true},
    {id:'openings',number:10,stageId:10,title:'Двери, окна и проёмы',locked:true},
    {id:'stairs-railings',number:11,stageId:11,title:'Лестницы, ограждения и потолки',locked:true}
  ];

  let liveLessonId = LIVE_LESSONS[0].id;

  const lessonById = id => LIVE_LESSONS.find(x => x.id === id) || LIVE_LESSONS[0];
  const stageForLesson = lesson => (window.S40CourseStages || DATA.stages || []).find(stage => stage.id === lesson.stageId);

  function projectStageBlock(lesson) {
    const stage = stageForLesson(lesson);
    if (!stage) return '';
    const pair = String(lesson.number).padStart(2, '0');
    const step = String(stage.id).padStart(2, '0');
    return `<section class="live-project-stage"><header class="live-project-stage-head"><span>Пара ${pair} → этап ${step}</span><h3>Этап проекта после этой пары: ${esc(stage.title)}</h3></header><div class="live-project-stage-grid"><div><b>Перед парой</b><p>${esc(stage.asyncWork)}</p></div><div><b>На паре</b><p>${esc(stage.live)}</p></div><div><b>Результат</b><p>${esc(stage.deliverable)}</p></div><div><b>Готово, если</b><p>${esc(stage.accept)}</p></div></div></section>`;
  }

  function lessonButton(lesson) {
    const active = lesson.id === liveLessonId;
    const locked = Boolean(lesson.locked);
    const number = String(lesson.number).padStart(2, '0');
    const attrs = locked ? 'disabled aria-disabled="true"' : `data-action="guide-lesson" data-id="${lesson.id}"`;
    return `<button class="live-lesson-link${active ? ' active' : ''}${locked ? ' locked' : ''}" ${attrs} aria-current="${active ? 'page' : 'false'}"><span>Пара ${number} → этап ${String(lesson.stageId).padStart(2, '0')}${locked ? ' · закрыто' : ''}</span><b>${esc(lesson.title)}</b></button>`;
  }

  function lessonPager(lesson) {
    const openLessons = LIVE_LESSONS.filter(item => !item.locked);
    const at = openLessons.findIndex(x => x.id === lesson.id);
    const prev = openLessons[at - 1];
    const next = openLessons[at + 1];
    return `<nav class="live-lesson-pager" aria-label="Переход между открытыми парами">${prev ? `<button data-action="guide-lesson" data-id="${prev.id}"><span>← Предыдущая пара</span><b>${esc(prev.title)}</b></button>` : '<span></span>'}${next ? `<button data-action="guide-lesson" data-id="${next.id}"><span>Следующая пара →</span><b>${esc(next.title)}</b></button>` : '<span></span>'}</nav>`;
  }

  function liveGuidePage() {
    const lesson = lessonById(liveLessonId);
    if (lesson.id === 'start' && window.S40Lesson01) {
      return `<article class="live-lessons"><header class="live-lessons-hero"><div><span class="eyebrow">Первый семестр</span><h2>Пары и этапы проекта</h2><p>Каждая пара связана с этапом того же номера: на занятии разбираем инструменты, а ниже сразу видно, что должно остаться в вашем RVT.</p></div><div class="live-lessons-count"><b>Открыто: 2 пары из 11</b><br><span class="muted">остальные видны заранее и откроются по ходу курса</span></div></header><div class="live-lessons-layout"><nav class="live-lessons-nav" aria-label="Пары первого семестра">${LIVE_LESSONS.map(lessonButton).join('')}</nav><section class="live-lessons-panel">${window.S40Lesson01.render({assets:'assets/lesson-01/'})}${projectStageBlock(lesson)}${lessonPager(lesson)}</section></div></article>`;
    }
    const points = lesson.points.length;
    return `<article class="live-lessons">
      <header class="live-lessons-hero">
        <div><span class="eyebrow">Первый семестр</span><h2>Пары и этапы проекта</h2><p>Каждая пара связана с этапом того же номера: на занятии разбираем инструменты, а ниже сразу видно, что должно остаться в вашем RVT.</p></div>
        <div class="live-lessons-count"><b>Открыто: 2 пары из 11</b><br><span class="muted">остальные видны заранее и откроются по ходу курса</span></div>
      </header>
      <div class="live-lessons-layout">
        <nav class="live-lessons-nav" aria-label="Пары первого семестра">${LIVE_LESSONS.map(lessonButton).join('')}</nav>
        <section class="live-lessons-panel" aria-live="polite">
          <header class="live-lesson-head"><span class="live-lesson-number">${String(lesson.number).padStart(2, '0')}</span><div><span class="eyebrow">Пара ${lesson.number} → этап ${String(lesson.stageId).padStart(2, '0')}</span><h2 id="guide-title" tabindex="-1">${esc(lesson.title)}</h2><p>${esc(lesson.practice)}</p></div></header>
          <div class="live-lesson-summary"><b>${points} ${points === 1 ? 'пункт' : points < 5 ? 'пункта' : 'пунктов'} на занятии</b><span>Эта пара закрывает этап ${String(lesson.stageId).padStart(2, '0')} проекта.</span></div>
          <ol class="live-lesson-points">${lesson.points.map(point => `<li>${esc(point)}</li>`).join('')}</ol>
          ${projectStageBlock(lesson)}
          ${lessonPager(lesson)}
        </section>
      </div>
    </article>`;
  }

  try {
    guidePage = liveGuidePage;
    actions['guide-lesson'] = id => {
      const lesson = LIVE_LESSONS.find(x => x.id === id);
      if (!lesson || lesson.locked) return;
      liveLessonId = id;
      render();
      requestAnimationFrame(() => document.querySelector('#guide-title')?.focus());
    };
  } catch (error) {
    console.warn('Two-lesson guide compatibility layer failed:', error);
  }
})();

// Pages deploy marker: first two Revit pairs only.
