"""Browser acceptance checks; runs against a local build or an explicit live URL."""
from pathlib import Path
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Thread
import json
import os
from playwright.sync_api import sync_playwright, expect

ROOT = Path(os.environ.get('SITE_ROOT', Path(__file__).resolve().parents[2])).resolve()
OUTPUT = Path(os.environ.get('QA_OUTPUT', 'lesson-01-qa')).resolve()
OUTPUT.mkdir(parents=True, exist_ok=True)
server = None
url = os.environ.get('LIVE_URL')
if not url:
    class QuietHandler(SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT)))
    Thread(target=server.serve_forever, daemon=True).start()
    url = f'http://127.0.0.1:{server.server_port}/'

result = {'url': url, 'checks': []}
try:
    with sync_playwright() as playwright:
        kwargs = {'headless': True}
        if os.environ.get('CHROME_BIN'):
            kwargs['executable_path'] = os.environ['CHROME_BIN']
        browser = playwright.chromium.launch(**kwargs)
        page = browser.new_page(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1)
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        response = page.goto(url, wait_until='networkidle', timeout=60000)
        assert response and response.ok
        page.wait_for_function('window.S40 && window.S40Lesson01')
        initial = page.evaluate('JSON.stringify(S40.getState())')
        page.locator('[data-tab="guide"]').click()
        if page.locator('.r1-topic').count() == 0:
            page.locator('button[data-action="guide-lesson"][data-id="start"]').first.click()
        expect(page.locator('.r1-topic')).to_have_count(10)
        assert page.locator('button[data-action="guide-lesson"][data-id="draw-edit"]').count() == 0
        result['checks'].append('Ten foundation-first topics; later lessons remain hidden')
        page.locator('.r1-lesson').screenshot(path=str(OUTPUT / 'lesson-01-overview.png'))

        for topic_id in page.evaluate('S40Lesson01.topicIds'):
            item = page.locator(f'#r1-{topic_id}')
            item.locator(':scope > summary').click()
            expect(item).to_have_attribute('open', '')
            expect(item.locator('.r1-steps')).to_be_visible()
            expect(item.locator('.r1-refs a').first).to_be_visible()
            item.locator('.r1-answer > summary').click()
            expect(item.locator('.r1-answer')).to_have_attribute('open', '')
            item.locator(':scope > summary').click()
        result['checks'].append('All ten disclosures, steps, source links and self-check answers work')

        first_summary = page.locator('#r1-what > summary')
        first_summary.focus()
        first_summary.press('Enter')
        expect(page.locator('#r1-what')).to_have_attribute('open', '')
        first_summary.press('Space')
        assert not page.locator('#r1-what').evaluate('(el) => el.open')
        result['checks'].append('Native keyboard disclosure: Enter and Space')

        search = page.locator('#r1-search')
        search.fill('автосохранение')
        expect(page.locator('.r1-topic:not([hidden])')).to_have_count(1)
        expect(page.locator('#r1-save')).to_be_visible()
        search.fill('zzznothingfound')
        expect(page.locator('.r1-topic:not([hidden])')).to_have_count(0)
        expect(page.locator('.r1-search-status')).to_contain_text('0')
        search.fill('')
        expect(page.locator('.r1-topic:not([hidden])')).to_have_count(10)
        result['checks'].append('Russian/English keyword search, no-results state and reset')

        page.locator('[data-r1-expand]').click()
        expect(page.locator('.r1-topic[open]')).to_have_count(10)
        page.locator('.r1-figure img').evaluate_all('(images) => images.forEach(img => img.loading="eager")')
        page.wait_for_function('Array.from(document.querySelectorAll(".r1-figure img")).every(img => img.complete && img.naturalWidth > 0)', timeout=45000)
        result['images'] = page.locator('.r1-figure img').evaluate_all('(images) => images.map(img => ({src:img.getAttribute("src"),width:img.naturalWidth,height:img.naturalHeight}))')
        assert len(result['images']) >= 10
        page.locator('[data-r1-image]').first.click()
        expect(page.locator('#r1-image-dialog')).to_be_visible()
        page.keyboard.press('Escape')
        expect(page.locator('#r1-image-dialog')).not_to_be_visible()
        result['checks'].append('Lesson diagrams and interface screenshots load; accessible image zoom closes with Escape')

        for width in [360, 390, 768, 1440]:
            page.set_viewport_size({'width': width, 'height': 900})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1'), f'Horizontal overflow at {width}px'
            result['checks'].append(f'No horizontal overflow at {width}px')
        page.locator('[data-r1-collapse]').click()
        expect(page.locator('.r1-topic[open]')).to_have_count(0)
        page.locator('#r1-properties > summary').click()
        page.locator('#r1-properties').screenshot(path=str(OUTPUT / 'lesson-01-properties-desktop.png'))
        page.set_viewport_size({'width': 390, 'height': 900})
        page.locator('#r1-properties > summary').scroll_into_view_if_needed()
        page.screenshot(path=str(OUTPUT / 'lesson-01-mobile.png'))
        page.set_viewport_size({'width': 1440, 'height': 1000})

        page.locator('button[data-action="guide-lesson"][data-id="navigation"]').first.click()
        assert page.locator('.r1-lesson').count() == 0
        assert page.locator('.live-lesson-points li,.guide-plan-points li').count() == 11
        page.locator('[data-tab="route"]').click()
        assert 'Соберём посёлок' not in page.locator('#main').inner_text()
        assert page.locator('[data-action="copy-stage"]').count() == 0
        page.locator('[data-tab="cards"]').click()
        expect(page.locator('#cardsGrid')).to_be_visible()
        page.locator('[data-tab="map"]').click()
        assert page.evaluate('S40.DATA.plots.length') == 40
        assert page.evaluate('S40.selfTest().ok')
        assert page.evaluate('JSON.stringify(S40.getState())') == initial
        result['checks'].append('Lesson 2, route, cards, map, self-test and assignment state preserved')

        page.goto(url.split('#')[0] + '#r1-properties', wait_until='networkidle', timeout=60000)
        expect(page.locator('#r1-properties')).to_have_attribute('open', '')
        expect(page.locator('#r1-properties')).to_be_visible()
        result['checks'].append('Direct topic link opens lesson 1 and the requested topic')
        assert not errors, errors
        result['checks'].append('No JavaScript page errors')
        result['ok'] = True
        browser.close()
finally:
    (OUTPUT / 'report.json').write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    if server:
        server.shutdown()
print(json.dumps(result, ensure_ascii=False, indent=2))
