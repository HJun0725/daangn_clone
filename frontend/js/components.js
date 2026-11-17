// 여러 화면이 함께 쓰는 덩어리: 헤더·푸터, 폼 조각, 목록 화면 틀, 공통 동작
(function () {
  const App = window.App;
  const ui = App.ui;
  const { html, raw, attrs, icon } = ui;
  const O = App.options;

  // 서비스 목록. key 는 백엔드 라우터 이름과 같다.
  const SERVICES = [
    { key: 'buy-sell', label: '중고거래', icon: 'bag', color: 'orange', desc: '동네 이웃과 가깝고 따뜻한 거래' },
    { key: 'used-car', label: '중고차', icon: 'car', color: 'blue', desc: '수수료 없는 이웃 간 중고차 직거래' },
    { key: 'part-time-job', label: '알바', icon: 'briefcase', color: 'green', desc: '걸어서 10분, 우리 동네 알바' },
    { key: 'chat', label: '채팅', icon: 'chat', color: 'purple', desc: '이웃과 나누는 거래 대화' },
  ];
  const SEARCHABLE = SERVICES.filter((s) => s.key !== 'chat');
  App.services = SERVICES;

  const scopeOptions = (current) => SEARCHABLE.map((s) =>
    html`<option value="${s.key}"${s.key === current ? raw(' selected') : ''}>${s.label}</option>`);

  /* ---------- 헤더·푸터 ---------- */
  let unread = 0;
  const unreadBadge = () => (unread > 0
    ? html`<span class="noti-badge" data-unread>${unread > 99 ? '99+' : unread}<span class="sr-only">개의 안 읽은 메시지</span></span>`
    : '');

  const layout = {
    scopeOptions,

    renderHeader(ctx) {
      const el = document.getElementById('header');
      const section = ctx.path.split('/')[1] || '';
      const user = App.session.user;
      const scope = SEARCHABLE.some((s) => s.key === section) ? section : 'buy-sell';
      const q = SEARCHABLE.some((s) => s.key === section) ? ctx.query.q || '' : '';

      el.innerHTML = html`
        <div class="container site-header__top">
          <a class="logo" href="#/" aria-label="당근 홈">${ui.logoMark(30)}<span class="logo__text">당근</span></a>
          ${ctx.path === '/' ? '' : html`
          <form class="header-search" role="search" data-header-search>
            <select class="header-search__scope" name="scope" aria-label="검색 범위">${scopeOptions(scope)}</select>
            <span class="header-search__bar" aria-hidden="true"></span>
            <input class="header-search__input" type="search" name="q" value="${q}" placeholder="검색어를 입력해주세요" aria-label="검색어" maxlength="50">
            <button class="header-search__submit" type="submit" aria-label="검색">${icon('search')}</button>
          </form>`}
          <div class="header-actions">
            ${App.session.token ? html`
              <a class="icon-btn" href="#/chat" aria-label="채팅">${icon('chat', 24)}<span data-unread-slot>${unreadBadge()}</span></a>
              <a class="header-user" href="#/users/me">${ui.avatar(user)}<span class="header-user__name">${user ? user.nickname : '내 프로필'}</span></a>
            ` : html`
              <a class="btn btn--small btn--ghost pressable" href="#/signup">회원가입</a>
              <a class="btn btn--small btn--neutral-weak pressable" href="#/login">로그인</a>
            `}
          </div>
        </div>
        <nav class="service-tabs" aria-label="서비스">
          <div class="container service-tabs__list">
            ${SERVICES.map((s) => html`
              <a class="service-tab ${s.key === section ? 'is-selected' : ''}" href="#/${s.key}"${s.key === section ? raw(' aria-current="page"') : ''}>
                ${icon(s.icon, 20)}${s.label}${s.key === 'chat' ? html`<span data-unread-slot>${unreadBadge()}</span>` : ''}
              </a>`)}
          </div>
        </nav>`.s;
    },

    renderFooter() {
      const el = document.getElementById('footer');
      el.innerHTML = html`
        <div class="container site-footer__inner">
          <div class="site-footer__cols">
            <div class="site-footer__brand">
              <a class="logo" href="#/" aria-label="당근 홈">${ui.logoMark(26)}<span class="logo__text">당근</span></a>
              <p>동네 이웃과 중고거래부터 알바, 중고차까지.</p>
            </div>
            <div>
              <h4>서비스</h4>
              <ul>${SERVICES.map((s) => html`<li><a href="#/${s.key}">${s.label}</a></li>`)}</ul>
            </div>
            <div>
              <h4>글쓰기</h4>
              <ul>
                <li><a href="#/buy-sell/new">내 물건 팔기</a></li>
                <li><a href="#/used-car/new">내 차 팔기</a></li>
                <li><a href="#/part-time-job/new">알바 공고 올리기</a></li>
              </ul>
            </div>
            <div>
              <h4>계정</h4>
              <ul>
                <li><a href="#/users/me">내 프로필</a></li>
                <li><a href="#/login">로그인</a></li>
                <li><a href="#/signup">회원가입</a></li>
              </ul>
            </div>
          </div>
          <hr class="divider">
          <p class="site-footer__note">
            <span>학교 과제로 만든 학습용 클론이에요. 당근마켓과는 관련이 없어요.</span>
            ${App.config.USE_MOCK ? html`<span>지금은 목(mock) 데이터로 동작해요.</span><button type="button" data-mock-reset>목 데이터 초기화</button>` : ''}
          </p>
        </div>`.s;
    },

    setUnread(count) {
      unread = count;
      document.querySelectorAll('[data-unread-slot]').forEach((slot) => { slot.innerHTML = unreadBadge().toString(); });
    },
    // 안 읽은 채팅 수를 다시 센다. 실패해도 화면에는 영향을 주지 않는다.
    async refreshUnread() {
      if (!App.session.token) return layout.setUnread(0);
      try {
        const rooms = await App.api.chat.rooms();
        layout.setUnread(rooms.items.reduce((sum, r) => sum + (r.unread_count || 0), 0));
      } catch (e) { /* 채팅 API 가 아직 없을 수 있다 */ }
      return undefined;
    },

    // 헤더·푸터는 한 번만 이벤트를 건다(내용은 매번 다시 그려도 요소는 그대로다).
    bind() {
      ui.on(document.getElementById('header'), 'submit', '[data-header-search]', (e, form) => {
        e.preventDefault();
        const { scope, q } = ui.formValues(form);
        App.nav.go(`/${scope}`, q ? { q } : {});
      });
      ui.on(document.getElementById('footer'), 'click', '[data-mock-reset]', async () => {
        const ok = await ui.dialog({
          title: '목 데이터를 초기화할까요?',
          desc: '직접 쓴 글과 채팅이 모두 지워지고 처음 상태로 돌아가요. 로그아웃도 함께 돼요.',
          confirmLabel: '초기화', variant: 'critical-solid',
        });
        if (!ok) return;
        App.mock.reset();
        App.session.clear();
        layout.setUnread(0);
        App.nav.go('/');
        ui.toast('목 데이터를 초기화했어요');
      });
    },
  };
  App.layout = layout;

  /* ---------- 공통 동작 ---------- */
  App.actions = {
    // 로그인이 필요한 동작 앞에서 부른다. 로그인 화면으로 보내고 false 를 돌려준다.
    requireLogin() {
      if (App.session.token) return true;
      ui.toast('로그인이 필요해요');
      App.nav.go('/login', { next: location.hash || '#/' });
      return false;
    },
    // 오류를 스낵바로 알린다. 로그인이 풀린 경우에는 로그인 화면으로 보낸다.
    showError(err) {
      if (err && err.status === 401) {
        ui.toast('로그인이 필요해요');
        App.nav.go('/login', { next: location.hash || '#/' });
        return;
      }
      if (!(err instanceof App.ApiError)) console.error(err);
      ui.toast(err instanceof App.ApiError ? err.detail : '문제가 생겼어요. 잠시 후 다시 시도해 주세요.');
    },
    // 게시글에서 "채팅하기": POST /chat/rooms 로 방을 만들고(이미 있으면 그 방) 채팅 화면으로 간다.
    async startChat(postType, postId, button) {
      if (!App.actions.requireLogin()) return;
      try {
        const room = await ui.withLoading(button, () => App.api.chat.createRoom(postType, postId));
        if (room) App.nav.go(`/chat/${room.id}`);
      } catch (err) {
        App.actions.showError(err);
      }
    },
    // 삭제 확인 → 삭제 → 목록으로
    async removePost({ title, remove, backTo }) {
      const ok = await ui.dialog({
        title, desc: '삭제하면 되돌릴 수 없어요.',
        confirmLabel: '삭제', variant: 'critical-solid',
      });
      if (!ok) return;
      try {
        await remove();
        ui.toast('삭제했어요');
        App.nav.go(backTo);
      } catch (err) {
        App.actions.showError(err);
      }
    },
  };

  /* ---------- 폼 조각 ---------- */
  const pairs = (list) => list.map((v) => [v, v]);
  const F = {
    pairs,
    regionOptions: () => pairs(O.regions),
    field(name, label, control, opts = {}) {
      return html`<div class="field">
        <label class="field__label" for="f-${name}">${label}${opts.required ? html`<span class="req" aria-hidden="true">*</span>` : ''}</label>
        ${control}
        ${opts.hint ? html`<p class="field__hint">${opts.hint}</p>` : ''}
      </div>`;
    },
    input: (name, value, a = {}) => html`<input class="input" id="f-${name}" name="${name}" value="${value == null ? '' : value}" ${attrs(a)}>`,
    textarea: (name, value, a = {}) => html`<textarea class="textarea" id="f-${name}" name="${name}" ${attrs(a)}>${value == null ? '' : value}</textarea>`,
    select(name, options, value, a = {}, placeholder) {
      const current = value == null ? '' : String(value);
      return html`<select class="select" id="f-${name}" name="${name}" ${attrs(a)}>
        ${placeholder ? html`<option value="">${placeholder}</option>` : ''}
        ${options.map(([v, l]) => html`<option value="${v}"${String(v) === current ? raw(' selected') : ''}>${l}</option>`)}
      </select>`;
    },
    actions: (cancelHref, submitLabel) => html`<div class="form__actions">
      <a class="btn btn--large btn--neutral-weak pressable" href="${cancelHref}">취소</a>
      <button class="btn btn--large btn--brand-solid pressable" type="submit">${submitLabel}</button>
    </div>`,
    // 숫자 입력값을 정수로 읽는다. 비어 있거나 숫자가 아니면 null.
    int(value) {
      if (value === '' || value == null) return null;
      const n = Number(String(value).replace(/,/g, ''));
      return Number.isFinite(n) ? Math.round(n) : null;
    },
  };
  App.form = F;

  /* ---------- 목록 화면 틀 (중고거래·중고차·알바 공용) ----------
     필터와 검색어는 주소(#/buy-sell?category=...&q=...)에 담는다. 그래서 새로고침·뒤로가기·링크 공유가 그대로 된다. */
  const isDesktop = () => window.matchMedia('(min-width: 992px)').matches;
  const checked = (on) => (on ? raw(' checked') : '');

  const filterParts = {
    group: (label, body) => html`<div class="filter__group"><p class="filter__label">${label}</p>${body}</div>`,
    // 라디오 목록. 첫 줄은 항상 "전체"
    radios(label, name, options, current) {
      const cur = current || '';
      return filterParts.group(label, html`<div role="radiogroup" aria-label="${label}">
        <label class="option"><input type="radio" name="${name}" value="" data-filter${checked(!cur)}>전체</label>
        ${options.map(([v, l]) => html`<label class="option"><input type="radio" name="${name}" value="${v}" data-filter${checked(String(v) === cur)}>${l}</label>`)}
      </div>`);
    },
    select(label, name, options, current, allLabel = '전체') {
      const cur = current || '';
      return filterParts.group(label, html`<select class="select select--medium" name="${name}" data-filter aria-label="${label}">
        <option value="">${allLabel}</option>
        ${options.map(([v, l]) => html`<option value="${v}"${String(v) === cur ? raw(' selected') : ''}>${l}</option>`)}
      </select>`);
    },
    check: (name, value, label, current) => html`<label class="option"><input type="checkbox" name="${name}" value="${value}" data-filter${checked(current === value)}>${label}</label>`,
    // 미리 정해 둔 값 버튼. patch 는 주소에 넣을 값 묶음.
    presets(query, presets) {
      return html`<div class="chip-group">${presets.map(([label, patch]) => {
        const on = Object.entries(patch).every(([k, v]) => (query[k] || '') === v);
        return html`<button type="button" class="chip chip--outline ${on ? 'is-selected' : ''}" data-set="${JSON.stringify(patch)}" aria-pressed="${on ? 'true' : 'false'}">${label}</button>`;
      })}</div>`;
    },
    // 최소~최대 직접 입력. scale 은 화면 단위(예: 만원=10000)
    range(query, minKey, maxKey, { scale = 1, unit = '', minPlaceholder = '최소', maxPlaceholder = '최대' } = {}) {
      const show = (v) => (v === undefined || v === '' ? '' : Number(v) / scale);
      return html`<form data-range data-scale="${scale}">
        <div class="filter__range">
          <input class="input input--medium" type="number" min="0" name="${minKey}" value="${show(query[minKey])}" placeholder="${minPlaceholder}" aria-label="${minPlaceholder}${unit ? ` (${unit})` : ''}">
          <span aria-hidden="true">~</span>
          <input class="input input--medium" type="number" min="0" name="${maxKey}" value="${show(query[maxKey])}" placeholder="${maxPlaceholder}" aria-label="${maxPlaceholder}${unit ? ` (${unit})` : ''}">
        </div>
        <button class="btn btn--small btn--neutral-weak btn--block filter__apply pressable" type="submit">적용하기</button>
      </form>`;
    },
  };

  const listPage = {
    parts: filterParts,
    filterOpen: null, // 좁은 화면에서 필터를 펼쳐 두었는지 기억한다

    /* cfg: { base, label, unit, writeLabel, filterKeys, list, search, card, listClass,
              title(query), filters(query), chips(query), keywords, emptyTitle, emptyDesc } */
    async render(ctx, cfg) {
      const query = ctx.query;
      const q = (query.q || '').trim();
      const filters = {};
      cfg.filterKeys.forEach((key) => { if (query[key] !== undefined && query[key] !== '') filters[key] = query[key]; });
      const size = App.config.PAGE_SIZE;
      const load = (page) => (q ? cfg.search({ q, ...filters, page, size }) : cfg.list({ ...filters, page, size }));

      const first = await load(1);
      let page = 1;
      let loaded = first.items.length;
      const hasMore = (batch) => (first.total != null ? loaded < first.total : batch.length === size);

      const chips = cfg.chips(query);
      if (q) chips.unshift({ keys: ['q'], label: `'${q}' 검색` });
      const open = listPage.filterOpen != null && !isDesktop() ? listPage.filterOpen : isDesktop();
      ctx.title = q ? `'${q}' ${cfg.label} 검색` : cfg.title(query);

      ctx.root.innerHTML = html`
        <div class="container page">
          ${ui.breadcrumb([{ label: '홈', href: '#/' }, { label: cfg.label }])}
          <div class="page-head">
            <h1 class="page-title">${q ? `'${q}' 검색 결과` : cfg.title(query)}</h1>
            <a class="btn btn--brand-solid pressable" href="#${cfg.base}/new">${icon('plus', 18, 2.4)}${cfg.writeLabel}</a>
          </div>
          <div class="list-layout">
            <details class="filter"${open ? raw(' open') : ''}>
              <summary class="filter__head">
                <span class="filter__title">${icon('filter', 20)}필터</span>
                <button type="button" class="text-link" data-reset>초기화</button>
              </summary>
              ${cfg.filters(query)}
            </details>
            <div>
              ${cfg.keywords ? ui.keywords('인기 검색어', cfg.keywords, (w) => App.nav.href(cfg.base, { q: w })) : ''}
              ${chips.length ? html`<div class="active-filters" aria-label="적용한 필터">
                ${chips.map((c) => html`<button type="button" class="chip chip--solid" data-clear="${c.keys.join(',')}">${c.label}${icon('close', 14, 2.4)}<span class="sr-only">필터 해제</span></button>`)}
              </div>` : ''}
              ${first.items.length ? html`
                <p class="result-count">${cfg.unit} ${first.total != null ? ui.fmt.num(first.total) : first.items.length}개</p>
                <div class="${cfg.listClass}" data-list>${first.items.map(cfg.card)}</div>
                <div class="load-more"${hasMore(first.items) ? '' : raw(' hidden')}>
                  <button type="button" class="btn btn--large btn--neutral-weak pressable" data-more>더보기</button>
                </div>
              ` : ui.empty(
                q ? `'${q}' 검색 결과가 없어요` : cfg.emptyTitle,
                chips.length ? '필터를 바꾸거나 다른 검색어로 찾아보세요.' : cfg.emptyDesc,
                chips.length ? html`<button type="button" class="btn btn--neutral-weak pressable" data-reset-all>전체 ${cfg.label} 보기</button>` : '')}
            </div>
          </div>
        </div>`.s;

      const root = ctx.root;
      const update = (patch) => {
        const next = { ...query, ...patch };
        Object.keys(next).forEach((key) => { if (next[key] === '' || next[key] == null) delete next[key]; });
        App.nav.go(cfg.base, next);
      };

      ui.on(root, 'change', '[data-filter]', (e, el) => {
        update({ [el.name]: el.type === 'checkbox' && !el.checked ? '' : el.value });
      });
      ui.on(root, 'click', '[data-set]', (e, el) => {
        const patch = JSON.parse(el.dataset.set);
        if (el.classList.contains('is-selected')) Object.keys(patch).forEach((key) => { patch[key] = ''; });
        update(patch);
      });
      ui.on(root, 'submit', '[data-range]', (e, form) => {
        e.preventDefault();
        const scale = Number(form.dataset.scale) || 1;
        const patch = {};
        const values = [];
        form.querySelectorAll('input').forEach((input) => {
          const n = F.int(input.value);
          values.push(n);
          patch[input.name] = n == null || n < 0 ? '' : String(n * scale);
        });
        if (values[0] != null && values[1] != null && values[0] > values[1]) {
          ui.toast('최소값이 최대값보다 클 수 없어요');
          return;
        }
        update(patch);
      });
      ui.on(root, 'click', '[data-clear]', (e, el) => {
        const patch = {};
        el.dataset.clear.split(',').forEach((key) => { patch[key] = ''; });
        update(patch);
      });
      ui.on(root, 'click', '[data-reset]', (e) => {
        e.preventDefault(); // summary 안의 버튼이라 접힘이 같이 일어나지 않게 한다
        App.nav.go(cfg.base, q ? { q } : {});
      });
      ui.on(root, 'click', '[data-reset-all]', () => App.nav.go(cfg.base));
      // 넓은 화면에서는 필터를 접지 않는다.
      ui.on(root, 'click', '.filter__head', (e) => {
        if (isDesktop() && !e.target.closest('[data-reset]')) e.preventDefault();
      });
      root.addEventListener('toggle', (e) => {
        if (e.target.classList && e.target.classList.contains('filter') && !isDesktop()) listPage.filterOpen = e.target.open;
      }, true);

      ui.on(root, 'click', '[data-more]', async (e, button) => {
        try {
          const next = await ui.withLoading(button, () => load(page + 1));
          if (!next || !ctx.isCurrent()) return;
          page += 1;
          loaded += next.items.length;
          root.querySelector('[data-list]').insertAdjacentHTML('beforeend', next.items.map((item) => cfg.card(item).toString()).join(''));
          if (!hasMore(next.items)) button.parentElement.hidden = true;
        } catch (err) {
          App.actions.showError(err);
        }
      });
    },
  };
  App.listPage = listPage;

  /* ---------- 상세 화면 조각 ---------- */
  App.detail = {
    // 작성자 줄: 아바타, 닉네임(프로필 링크), 동네, 매너온도
    seller(author) {
      const a = author || {};
      return html`<div class="seller">
        <a href="#/users/${a.id}" aria-hidden="true" tabindex="-1">${ui.avatar(a)}</a>
        <div class="seller__info">
          <a class="seller__name" href="#/users/${a.id}">${a.nickname || '알 수 없음'}</a>
          <p class="seller__region">${a.region || ''}</p>
        </div>
        ${a.manner_temp != null ? ui.manner(a.manner_temp) : ''}
      </div>`;
    },
    // 관련 글 묶음. 글이 없으면 아무것도 그리지 않는다.
    related(title, moreHref, items, card, listClass = 'card-grid card-grid--wide') {
      if (!items.length) return '';
      return html`<section class="related">
        <div class="section-head">
          <h2 class="section-title">${title}</h2>
          ${moreHref ? html`<a class="more-link" href="${moreHref}">더보기${icon('chevron-right', 16, 2.4)}</a>` : ''}
        </div>
        <div class="${listClass}">${items.map(card)}</div>
      </section>`;
    },
    // Promise.allSettled 결과에서 목록만 꺼낸다(실패한 요청은 빈 목록).
    items: (settled) => (settled.status === 'fulfilled' ? settled.value.items : []),
  };
})();
