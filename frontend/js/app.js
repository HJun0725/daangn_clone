// 앱 시작: 해시 라우터, 화면 전환, 누름 피드백
(function () {
  const App = window.App;
  const ui = App.ui;
  const { html } = ui;

  /* ---------- 라우트 등록 ----------
     '/buy-sell/:id' 처럼 쓴다. 고정 경로('/buy-sell/new')가 변수 경로보다 먼저 맞춰지도록 정렬한다.
     :id 는 숫자만 받는다. */
  const routes = [];
  App.route = function (pattern, handler) {
    const keys = [];
    const parts = pattern.split('/').filter(Boolean);
    const regex = new RegExp(`^/${parts.map((p) => {
      if (p[0] === ':') { keys.push(p.slice(1)); return '(\\d+)'; }
      return p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }).join('/')}$`);
    routes.push({ pattern, regex, keys, handler, staticCount: parts.filter((p) => p[0] !== ':').length, size: parts.length });
  };
  const sortRoutes = () => routes.sort((a, b) => b.staticCount - a.staticCount || a.size - b.size);

  /* ---------- 주소 다루기 ---------- */
  function parseHash() {
    const raw = location.hash.replace(/^#/, '') || '/';
    const [pathPart, queryPart = ''] = raw.split('?');
    const path = '/' + pathPart.split('/').filter(Boolean).join('/');
    const query = {};
    new URLSearchParams(queryPart).forEach((value, key) => { query[key] = value; });
    return { path, query };
  }
  function href(path, query) {
    const qs = new URLSearchParams();
    Object.entries(query || {}).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') qs.set(k, v); });
    const s = qs.toString();
    return `#${path}${s ? `?${s}` : ''}`;
  }

  let navId = 0;
  let leaveHandlers = [];
  let lastPath = null;

  async function render() {
    leaveHandlers.forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
    leaveHandlers = [];
    const id = ++navId;
    const { path, query } = parseHash();
    const root = document.getElementById('app');

    let match = null;
    const params = {};
    for (const r of routes) {
      const m = r.regex.exec(path);
      if (m) {
        match = r;
        r.keys.forEach((k, i) => { params[k] = Number(m[i + 1]); });
        break;
      }
    }

    const ctx = {
      path, query, params, root, title: '',
      isCurrent: () => id === navId,
      onLeave: (fn) => leaveHandlers.push(fn),
    };
    App.layout.renderHeader(ctx);

    // 화면이 바뀌면 맨 위로, 같은 화면에서 필터만 바뀌면 스크롤 유지
    const samePage = lastPath === path;
    lastPath = path;
    if (!samePage) window.scrollTo(0, 0);

    // 이전 화면 내용과 이벤트를 지우려고 #app 을 새 요소로 바꾼다
    const fresh = root.cloneNode(false);
    root.replaceWith(fresh);
    ctx.root = fresh;
    fresh.setAttribute('aria-busy', 'true');
    if (!samePage) fresh.innerHTML = html`<div class="container page"><div class="skeleton" style="height:32px; width:240px"></div><div class="skeleton" style="height:320px; margin-top:24px"></div></div>`.s;

    try {
      if (!match) throw new App.ApiError(404, '페이지를 찾을 수 없어요.');
      await match.handler(ctx);
    } catch (err) {
      if (id !== navId) return;
      if (err && err.status === 401) { App.actions.showError(err); return; }
      if (!(err instanceof App.ApiError)) console.error(err);
      const notFound = err && err.status === 404;
      fresh.innerHTML = html`<div class="container page">${ui.empty(
        notFound ? '찾을 수 없는 페이지예요' : '화면을 불러오지 못했어요',
        err instanceof App.ApiError ? err.detail : '잠시 후 다시 시도해 주세요.',
        html`<a class="btn btn--neutral-weak pressable" href="#/">홈으로</a>`)}</div>`.s;
      ctx.title = notFound ? '찾을 수 없음' : '오류';
    } finally {
      if (id === navId) {
        fresh.removeAttribute('aria-busy');
        document.title = ctx.title && ctx.title.indexOf('당근') === -1 ? `${ctx.title} | 당근` : (ctx.title || '당근');
      }
    }
  }

  App.nav = {
    href,
    go(path, query) {
      const next = href(path, query);
      if (location.hash === next) render();
      else location.hash = next;
    },
    reload: () => render(),
  };

  /* ---------- 누름 피드백 (DESIGN.md 5.2) ----------
     basis = max(height, width / 4, 24), scale = (basis - 2) / basis */
  document.addEventListener('pointerdown', (e) => {
    const el = e.target.closest && e.target.closest('.pressable');
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const basis = Math.max(rect.height, rect.width / 4, 24);
    el.style.setProperty('--press-scale', ((basis - 2) / basis).toFixed(4));
  }, { passive: true });

  /* ---------- 시작 ---------- */
  function start() {
    sortRoutes();
    App.session.load();
    App.layout.renderFooter();
    App.layout.bind();
    window.addEventListener('hashchange', render);
    render().then(() => App.layout.refreshUnread());
    // 채팅 화면 밖에서도 가끔 안 읽은 메시지 수를 갱신한다
    setInterval(() => {
      if (!document.hidden && parseHash().path.indexOf('/chat') !== 0) App.layout.refreshUnread();
    }, 15000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else setTimeout(start, 0); // 화면 스크립트(pages/*.js)가 모두 라우트를 등록한 뒤에 시작한다
})();
