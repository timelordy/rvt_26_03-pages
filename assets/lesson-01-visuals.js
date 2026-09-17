(() => {
  'use strict';
  if (window.S40Lesson01Visuals) return;

  const VISUALS = {
    what: {
      file: 'what-is-revit.svg',
      alt: 'Учебная схема: Revit собирает модель здания из строительных объектов',
      caption: 'Revit хранит не просто линии, а объекты здания и их данные. Это учебная схема курса.'
    },
    model: {
      file: 'model-logic.svg',
      alt: 'Учебная схема логики Revit: объект, параметры, виды и листы',
      caption: 'Один объект модели имеет параметры и показывается на разных видах. Это учебная схема курса.'
    },
    course: {
      file: 'course-roadmap.svg',
      alt: 'Учебная схема курса Revit: основа проекта, модель дома и итоговые листы',
      caption: 'Весь семестр постепенно доводим один дом до рабочего RVT и двух листов PDF.'
    },
    home: {
      file: 'file-types.svg?v=4',
      alt: 'Схема: RVT открывают и редактируют; из RTE создают новый проект RVT; RFA загружают в открытый RVT',
      caption: 'Коротко: .RVT открываем и редактируем; из .RTE создаём новый .RVT; .RFA загружаем в открытый .RVT.'
    },
    save: {
      file: 'save-flow.svg',
      alt: 'Учебная схема сохранения проекта Revit: рабочий RVT, копия и резервное хранилище',
      caption: 'Нормальная схема сохранения. Один файл в загрузках на компьютере аудитории резервной копией не считается.'
    },
    template: {
      file: 'template-flow.svg',
      alt: 'Учебная схема: шаблон RTE используется для создания отдельного проекта RVT',
      caption: 'Шаблон задаёт стартовые настройки, а работа продолжается уже в отдельном проекте RVT.'
    },
    ribbon: {
      file: 'context-ribbon.png',
      alt: 'Контекстная вкладка ленты Autodesk Revit',
      caption: 'Реальный фрагмент интерфейса Autodesk Revit: состав ленты меняется вместе с выбранным объектом.'
    },
    shortcuts: {
      file: 'quick-access.png',
      alt: 'Панель быстрого доступа Autodesk Revit',
      caption: 'Реальная панель быстрого доступа Autodesk Revit. Она узкая, потому что это именно панель, а не обрезанная случайным человеком картинка.'
    },
    properties: {
      file: 'browser.png',
      alt: 'Диспетчер проекта Autodesk Revit',
      caption: 'Реальный Диспетчер проекта Autodesk Revit: здесь открывают планы, 3D-виды, разрезы и листы.'
    },
    families: {
      file: 'family-types.svg',
      alt: 'Учебная схема семейств Revit: системные и загружаемые, семейство, типоразмер и экземпляр',
      caption: 'Системные и загружаемые семейства плюс связь «семейство → типоразмер → экземпляр».'
    }
  };

  const GALLERY = [
    {file: 'interface.png', alt: 'Общий интерфейс Autodesk Revit', label: 'Весь интерфейс'},
    {file: 'browser.png', alt: 'Диспетчер проекта Autodesk Revit', label: 'Диспетчер проекта'},
    {file: 'properties.png', alt: 'Палитра свойств Autodesk Revit', label: 'Свойства'}
  ];

  let firstTopicOpened = false;

  function assetBase(root) {
    const existing = root.querySelector('.r1-figure img[src*="lesson-01/"]');
    if (existing) {
      const src = existing.getAttribute('src');
      return src.slice(0, src.lastIndexOf('/') + 1);
    }
    return document.documentElement.dataset.mode === 'public' ? 'assets/lesson-01/' : '/site/assets/lesson-01/';
  }

  function imageButton(base, item, className = '') {
    return `<button type="button" class="r1-image-button ${className}" data-r1-image aria-label="Увеличить: ${item.alt}"><img src="${base}${item.file}" alt="${item.alt}" loading="lazy" decoding="async"><span>Увеличить изображение ↗</span></button>`;
  }

  function enhance(root) {
    if (!root || root.dataset.r1Visuals === '2') return;
    root.dataset.r1Visuals = '2';
    const base = assetBase(root);

    const header = root.querySelector('.r1-header');
    if (header && !header.querySelector('.r1-visible-gallery')) {
      header.insertAdjacentHTML('beforeend', `<section class="r1-visible-gallery" aria-label="Примеры интерфейса Revit"><div class="r1-visible-gallery-copy"><b>Картинки теперь не надо искать внутри километра текста</b><span>Нажми на любую, чтобы увеличить. Дальше у каждого пункта тоже есть свой пример.</span></div><div class="r1-visible-gallery-grid">${GALLERY.map(item => `<figure>${imageButton(base, item, 'r1-gallery-image')}<figcaption>${item.label}</figcaption></figure>`).join('')}</div></section>`);
    }

    const topics = Array.from(root.querySelectorAll('[data-r1-topic]'));
    topics.forEach((details, index) => {
      const id = details.dataset.r1Topic;
      const item = VISUALS[id];
      if (!item) return;
      const summary = details.querySelector(':scope > summary');
      const label = summary?.querySelector('.r1-topic-label');
      if (summary && label && !summary.querySelector('.r1-summary-thumb')) {
        label.insertAdjacentHTML('beforebegin', `<span class="r1-summary-thumb" aria-hidden="true"><img src="${base}${item.file}" alt="" loading="lazy" decoding="async"></span>`);
      }
      const body = details.querySelector('.r1-body');
      if (body && !body.querySelector('.r1-topic-visual')) {
        const permalink = body.querySelector('.r1-permalink');
        const figure = document.createElement('figure');
        figure.className = 'r1-figure r1-topic-visual';
        figure.innerHTML = `${imageButton(base, item)}<figcaption>${item.caption}</figcaption>`;
        if (permalink) permalink.insertAdjacentElement('afterend', figure);
        else body.prepend(figure);
      }
      details.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', () => {
          img.closest('.r1-image-button,.r1-summary-thumb')?.classList.add('r1-image-failed');
        }, {once: true});
      });
      if (index === 0 && !firstTopicOpened && !location.hash.startsWith('#r1-')) {
        details.open = true;
        firstTopicOpened = true;
      }
    });
  }

  function scan() {
    document.querySelectorAll('.r1-lesson:not([data-r1-visuals="2"])').forEach(enhance);
  }

  const observer = new MutationObserver(scan);
  const start = () => {
    observer.observe(document.body, {childList: true, subtree: true});
    scan();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once: true});
  else start();

  window.S40Lesson01Visuals = Object.freeze({version: '3.0.0', enhance});
})();
