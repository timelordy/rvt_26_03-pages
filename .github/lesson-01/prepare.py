"""Fetch only official illustrations, then wire the standalone lesson renderer."""
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urljoin, urlparse
from html.parser import HTMLParser
import hashlib
import io
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'assets' / 'lesson-01'
OUT.mkdir(parents=True, exist_ok=True)
BASE = 'https://help.autodesk.com/cloudhelp/2024/ENU/Revit-GetStarted/'


def get(url):
    if urlparse(url).hostname != 'help.autodesk.com':
        raise ValueError('Only official Autodesk illustration URLs are allowed')
    request = Request(url, headers={'User-Agent': 'Mozilla/5.0 Revit-course-illustrations'})
    with urlopen(request, timeout=45) as response:
        data = response.read(8_000_001)
    if len(data) > 8_000_000:
        raise ValueError('Illustration response is too large')
    return data


class Images(HTMLParser):
    def __init__(self):
        super().__init__()
        self.sources = []

    def handle_starttag(self, tag, attrs):
        if tag == 'img':
            src = dict(attrs).get('src')
            if src and src not in self.sources:
                self.sources.append(src)


def choose(page, mode):
    parser = Images()
    parser.feed(get(page).decode('utf-8'))
    candidates = []
    for src in parser.sources:
        url = urljoin(page, src)
        if urlparse(url).hostname != 'help.autodesk.com':
            continue
        try:
            raw = get(url)
            with Image.open(io.BytesIO(raw)) as image:
                width, height = image.size
                if width < 120 or height < 20:
                    continue
                if mode == 'toolbar' and width / height < 3:
                    continue
                candidates.append((width * height, url, raw))
                if mode == 'toolbar':
                    break
        except Exception as error:
            print('Skip non-illustration:', type(error).__name__)
    if not candidates:
        raise RuntimeError(f'No suitable {mode} illustration in {page}')
    _, url, raw = max(candidates)
    return url, raw


manifest = []
illustrations = [
    ('interface.png', BASE + 'images/GUID-453F6BD3-DC8C-4142-9996-F7BCEB6CEB46.png', BASE + 'files/GUID-7793667D-5657-4382-9BEC-F7CB6AC8F53E.htm', None),
    ('context-ribbon.png', BASE + 'images/GUID-5407BAF8-94D7-488D-83A5-AB3CBE2E044D.png', BASE + 'files/GUID-1CA04013-04CE-4F55-9B0C-68FD7E7FF80B.htm', None),
    ('browser.png', BASE + 'images/GUID-F8AEA1A2-D97F-427E-83D1-15EAEA73BAC7.png', BASE + 'files/GUID-C8D3E5A6-02A5-43A9-AFFC-D49DD27398B1.htm', None),
    ('properties.png', None, BASE + 'files/GUID-A764EA7A-FE26-469B-857C-F3A70812FC34.htm', 'palette'),
    ('quick-access.png', None, BASE + 'files/GUID-762F3BFE-2508-4255-936D-3BDFE45F1885.htm', 'toolbar'),
]
for name, url, page, mode in illustrations:
    if url:
        raw = get(url)
    else:
        url, raw = choose(page, mode)
    with Image.open(io.BytesIO(raw)) as image:
        image.load()
        if image.width < 120 or image.height < 20:
            raise ValueError(f'Unexpected dimensions: {name}')
        image.save(OUT / name, format='PNG')
        record = {'file': name, 'source': page, 'image_url': url, 'width': image.width,
                  'height': image.height, 'sha256': hashlib.sha256((OUT / name).read_bytes()).hexdigest(),
                  'credit': 'Autodesk screen shots reprinted courtesy of Autodesk, Inc.'}
        manifest.append(record)
        print(name, image.size)
(OUT / 'sources.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

index_path = ROOT / 'index.html'
text = index_path.read_text(encoding='utf-8')
css = '<link rel="stylesheet" href="assets/lesson-01.css?v=1">'
module = '<script src="assets/lesson-01.js?v=1"></script>'
if css not in text:
    # The application contains additional </head> strings in HTML export templates.
    # The first closing head belongs to the actual document.
    if '</head>' not in text:
        raise RuntimeError('Public HTML head is missing')
    text = text.replace('</head>', css + '</head>', 1)
if module not in text:
    marker = '<script src="lessons-live.js"></script>'
    if text.count(marker) != 1:
        raise RuntimeError('Existing lesson script is missing or duplicated')
    text = text.replace(marker, module + '<script src="lessons-live.js?v=lesson01"></script>', 1)
index_path.write_text(text, encoding='utf-8')

path = ROOT / 'lessons-live.js'
script = path.read_text(encoding='utf-8')
old = '    const lesson = lessonById(liveLessonId);\n    const points = lesson.points.length;'
new = '''    const lesson = lessonById(liveLessonId);
    if (lesson.id === 'start' && window.S40Lesson01) {
      return `<article class="live-lessons"><div class="live-lessons-layout"><nav class="live-lessons-nav" aria-label="Открытые пары">${LIVE_LESSONS.map(lessonButton).join('')}</nav><section class="live-lessons-panel">${window.S40Lesson01.render({assets:'assets/lesson-01/'})}${lessonPager(lesson)}</section></div></article>`;
    }
    const points = lesson.points.length;'''
if 'window.S40Lesson01.render' not in script:
    if script.count(old) != 1:
        raise RuntimeError('Existing guide renderer changed; manual reconciliation is required')
    script = script.replace(old, new, 1)
path.write_text(script, encoding='utf-8')

css_path = ROOT / 'assets' / 'lesson-01.css'
css_path.write_text(css_path.read_text(encoding='utf-8').replace('font:400 16px/1.4 inherit;', 'font:400 16px/1.4 system-ui,sans-serif;'), encoding='utf-8')
