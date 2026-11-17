// 홈: 동네 + 검색, 인기 검색어, 서비스 둘러보기, 최신 글
(function () {
  const App = window.App;
  const ui = App.ui;
  const { html, raw, icon } = ui;
  const D = App.detail;

  const POPULAR = ['아이폰', '자전거', '식탁', '닌텐도', '맥북', '캠핑', '모니터', '나눔'];

  App.route('/', async (ctx) => {
    const region = App.state.region();
    const [buySell, cars, jobs] = await Promise.allSettled([
      App.api.buySell.list({ region, size: 10 }),
      App.api.usedCar.list({ size: 5 }),
      App.api.partTimeJob.list({ size: 4 }),
    ]);
    if (!ctx.isCurrent()) return;
    let items = D.items(buySell);
    // 내 동네 글이 적으면 전체 최신 글로 채운다
    if (items.length < 5) {
      try { items = (await App.api.buySell.list({ size: 10 })).items; } catch (e) { /* 그대로 둔다 */ }
    }

    ctx.title = '당근 - 우리 동네 중고 직거래';
    ctx.root.innerHTML = html`
      <section class="container hero">
        <h1 class="hero__title"><em>${region}</em>에서 중고거래 찾고 계신가요?</h1>
        <form class="hero-search" role="search" data-home-search>
          <label class="hero-search__region">${icon('pin', 18)}
            <select name="region" aria-label="동네 선택">
              ${App.options.regions.map((r) => html`<option value="${r}"${r === region ? raw(' selected') : ''}>${r}</option>`)}
            </select>
            ${icon('chevron-down', 14, 2.6)}
          </label>
          <select class="header-search__scope" name="scope" aria-label="검색 범위">${App.layout.scopeOptions('buy-sell')}</select>
          <input class="hero-search__input" type="search" name="q" placeholder="검색어를 입력해주세요" aria-label="검색어" maxlength="50">
          <button class="hero-search__submit" type="submit" aria-label="검색">${icon('search', 20, 2.4)}</button>
        </form>
        ${ui.keywords('인기 검색어', POPULAR, (w) => App.nav.href('/buy-sell', { q: w }))}
      </section>

      <div class="container">
        <section class="home-section">
          <div class="section-head"><h2 class="section-title">당근 서비스 둘러보기</h2></div>
          <div class="service-grid">
            ${App.services.map((s) => html`
              <a class="service-card pressable" href="#/${s.key}" style="background: var(--seed-color-banner-${raw(s.color)})">
                <span class="service-card__icon">${icon(s.icon, 24)}</span>
                <span>
                  <span class="service-card__name">${s.label}${icon('chevron-right', 18, 2.4)}</span>
                  <p class="service-card__desc">${s.desc}</p>
                </span>
              </a>`)}
          </div>
        </section>

        <section class="home-section">
          <div class="section-head">
            <h2 class="section-title">${region} 근처 인기 중고거래</h2>
            <a class="more-link" href="${App.nav.href('/buy-sell', { region })}">더보기${icon('chevron-right', 16, 2.4)}</a>
          </div>
          ${items.length ? html`<div class="card-grid card-grid--wide">${items.map(ui.buySellCard)}</div>` : ui.empty('아직 올라온 물건이 없어요')}
        </section>

        ${D.items(cars).length ? html`<section class="home-section">
          <div class="section-head">
            <h2 class="section-title">새로 올라온 중고차</h2>
            <a class="more-link" href="#/used-car">더보기${icon('chevron-right', 16, 2.4)}</a>
          </div>
          <div class="card-grid card-grid--wide">${D.items(cars).map(ui.carCard)}</div>
        </section>` : ''}

        ${D.items(jobs).length ? html`<section class="home-section">
          <div class="section-head">
            <h2 class="section-title">우리 동네 알바</h2>
            <a class="more-link" href="#/part-time-job">더보기${icon('chevron-right', 16, 2.4)}</a>
          </div>
          <div class="job-list">${D.items(jobs).map(ui.jobRow)}</div>
        </section>` : ''}
      </div>`.s;

    const form = ctx.root.querySelector('[data-home-search]');
    form.region.addEventListener('change', () => {
      App.state.setRegion(form.region.value);
      App.nav.reload();
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const { scope, q, region: r } = ui.formValues(form);
      App.state.setRegion(r);
      const query = q ? { q } : {};
      if (scope !== 'used-car' && r) query.region = r;
      App.nav.go(`/${scope}`, query);
    });
  });
})();
