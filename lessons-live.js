(() => {
  'use strict';

  const LIVE_LESSONS = [
    {
      id: 'start',
      number: 1,
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
    }
  ];

  let liveLessonId = LIVE_LESSONS[0].id;

  const lessonById = id => LIVE_LESSONS.find(x => x.id === id) || LIVE_LESSONS[0];

  function lessonButton(lesson) {
    const active = lesson.id === liveLessonId;
    return `<button class="live-lesson-link${active ? ' active' : ''}" data-action="guide-lesson" data-id="${lesson.id}" aria-current="${active ? 'page' : 'false'}"><span>Пара ${String(lesson.number).padStart(2, '0')}</span><b>${esc(lesson.title)}</b></button>`;
  }

  function lessonPager(lesson) {
    const at = LIVE_LESSONS.findIndex(x => x.id === lesson.id);
    const prev = LIVE_LESSONS[at - 1];
    const next = LIVE_LESSONS[at + 1];
    return `<nav class="live-lesson-pager" aria-label="Переход между парами">${prev ? `<button data-action="guide-lesson" data-id="${prev.id}"><span>← Предыдущая пара</span><b>${esc(prev.title)}</b></button>` : '<span></span>'}${next ? `<button data-action="guide-lesson" data-id="${next.id}"><span>Следующая пара →</span><b>${esc(next.title)}</b></button>` : '<span></span>'}</nav>`;
  }

  function liveGuidePage() {
    const lesson = lessonById(liveLessonId);
    if (lesson.id === 'start' && window.S40Lesson01) {
      return `<article class="live-lessons"><div class="live-lessons-layout"><nav class="live-lessons-nav" aria-label="Открытые пары">${LIVE_LESSONS.map(lessonButton).join('')}</nav><section class="live-lessons-panel">${window.S40Lesson01.render({assets:'assets/lesson-01/'})}${lessonPager(lesson)}</section></div></article>`;
    }
    const points = lesson.points.length;
    return `<article class="live-lessons">
      <header class="live-lessons-hero">
        <div><span class="eyebrow">Первый семестр</span><h2>Уроки Revit</h2><p>Сейчас открыты только первые две пары. Остальные темы остаются скрыты до следующих занятий.</p></div>
        <div class="live-lessons-count"><b>Открыто: 2 пары</b><br><span class="muted">остальные скрыты</span></div>
      </header>
      <div class="live-lessons-layout">
        <nav class="live-lessons-nav" aria-label="Открытые пары">${LIVE_LESSONS.map(lessonButton).join('')}</nav>
        <section class="live-lessons-panel" aria-live="polite">
          <header class="live-lesson-head"><span class="live-lesson-number">${String(lesson.number).padStart(2, '0')}</span><div><span class="eyebrow">Пара ${lesson.number} из 2</span><h2 id="guide-title" tabindex="-1">${esc(lesson.title)}</h2><p>${esc(lesson.practice)}</p></div></header>
          <div class="live-lesson-summary"><b>${points} ${points === 1 ? 'пункт' : points < 5 ? 'пункта' : 'пунктов'} на занятии</b><span>Темы взяты из плана курса.</span></div>
          <ol class="live-lesson-points">${lesson.points.map(point => `<li>${esc(point)}</li>`).join('')}</ol>
          ${lessonPager(lesson)}
        </section>
      </div>
    </article>`;
  }

  try {
    guidePage = liveGuidePage;
    actions['guide-lesson'] = id => {
      if (!LIVE_LESSONS.some(x => x.id === id)) return;
      liveLessonId = id;
      render();
      requestAnimationFrame(() => document.querySelector('#guide-title')?.focus());
    };
  } catch (error) {
    console.warn('Two-lesson guide compatibility layer failed:', error);
  }
})();

// Pages deploy marker: first two Revit pairs only.
