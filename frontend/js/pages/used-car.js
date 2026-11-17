// 중고차 (/used-car): 목록·검색(연식·주행거리·가격 필터), 상세, 글쓰기, 수정
(function () {
  const App = window.App;
  const ui = App.ui;
  const { html, icon, fmt } = ui;
  const O = App.options;
  const F = App.form;
  const D = App.detail;
  const P = App.listPage.parts;
  const api = () => App.api.usedCar;
  const MAN = 10000;
  const thisYear = new Date().getFullYear();

  const PRICE_PRESETS = [
    ['500만원 이하', { min_price: '', max_price: String(500 * MAN) }],
    ['1,000만원 이하', { min_price: '', max_price: String(1000 * MAN) }],
    ['2,000만원 이하', { min_price: '', max_price: String(2000 * MAN) }],
    ['3,000만원 이하', { min_price: '', max_price: String(3000 * MAN) }],
  ];
  const YEAR_PRESETS = [
    ['3년 이내', { min_year: String(thisYear - 3), max_year: '' }],
    ['5년 이내', { min_year: String(thisYear - 5), max_year: '' }],
    ['10년 이내', { min_year: String(thisYear - 10), max_year: '' }],
  ];
  const MILEAGE = [['30000', '3만km 이하'], ['50000', '5만km 이하'], ['100000', '10만km 이하'], ['150000', '15만km 이하']];

  /* ---------- 목록 ---------- */
  App.route('/used-car', (ctx) => App.listPage.render(ctx, {
    base: '/used-car',
    label: '중고차',
    unit: '차량',
    writeLabel: '내 차 팔기',
    filterKeys: ['region', 'brand', 'fuel', 'min_year', 'max_year', 'max_mileage', 'min_price', 'max_price'],
    list: (q) => api().list(q),
    search: (q) => api().search(q),
    card: ui.carCard,
    listClass: 'card-grid',
    keywords: ['아반떼', '모닝', '그랜저', '쏘렌토', '테슬라'],
    title: (q) => `${q.region || O.regionPrefix} ${q.brand || ''} 중고차`.replace(/\s+/g, ' '),
    emptyTitle: '아직 올라온 차량이 없어요',
    emptyDesc: '첫 번째로 차량을 올려 보세요.',
    filters: (q) => html`
      ${P.select('위치', 'region', F.regionOptions(), q.region, `${O.regionPrefix} 전체`)}
      ${P.radios('제조사', 'brand', F.pairs(O.carBrands), q.brand)}
      ${P.select('연료', 'fuel', Object.entries(O.carFuels), q.fuel)}
      ${P.group('가격', html`${P.presets(q, PRICE_PRESETS)}${P.range(q, 'min_price', 'max_price', { scale: MAN, unit: '만원', minPlaceholder: '최소(만원)', maxPlaceholder: '최대(만원)' })}`)}
      ${P.group('연식', html`${P.presets(q, YEAR_PRESETS)}${P.range(q, 'min_year', 'max_year', { unit: '년', minPlaceholder: '부터(년)', maxPlaceholder: '까지(년)' })}`)}
      ${P.select('주행거리', 'max_mileage', MILEAGE, q.max_mileage)}`,
    chips(q) {
      const chips = [];
      if (q.region) chips.push({ keys: ['region'], label: q.region });
      if (q.brand) chips.push({ keys: ['brand'], label: q.brand });
      if (q.fuel) chips.push({ keys: ['fuel'], label: O.carFuels[q.fuel] || q.fuel });
      if (q.min_price || q.max_price) {
        const a = q.min_price ? fmt.carPrice(q.min_price) : '';
        const b = q.max_price ? fmt.carPrice(q.max_price) : '';
        chips.push({ keys: ['min_price', 'max_price'], label: a && b ? `${a} ~ ${b}` : (b ? `${b} 이하` : `${a} 이상`) });
      }
      if (q.min_year || q.max_year) {
        chips.push({ keys: ['min_year', 'max_year'], label: q.min_year && q.max_year ? `${q.min_year}~${q.max_year}년식` : (q.min_year ? `${q.min_year}년식 이후` : `${q.max_year}년식 이전`) });
      }
      if (q.max_mileage) chips.push({ keys: ['max_mileage'], label: `${fmt.mileage(Number(q.max_mileage))} 이하` });
      return chips;
    },
  }));

  /* ---------- 상세 ---------- */
  App.route('/used-car/:id', async (ctx) => {
    const c = await api().get(ctx.params.id);
    const me = App.session.user;
    const mine = !!me && c.author && me.id === c.author.id;
    const [similar] = await Promise.allSettled([api().list({ brand: c.brand, size: 6 })]);
    if (!ctx.isCurrent()) return;
    let related = D.items(similar).filter((x) => x.id !== c.id);
    if (related.length < 2) {
      try { related = (await api().list({ size: 6 })).items.filter((x) => x.id !== c.id); } catch (e) { /* 그대로 둔다 */ }
    }
    ctx.title = c.title;

    ctx.root.innerHTML = html`
      <div class="container page">
        ${ui.breadcrumb([{ label: '홈', href: '#/' }, { label: '중고차', href: '#/used-car' }, { label: c.brand, href: App.nav.href('/used-car', { brand: c.brand }) }])}
        <article class="detail">
          <div class="detail__media">${ui.thumb(c.image_url, 'thumb--4x3', 64)}</div>
          <div class="detail__main">
            ${D.seller(c.author)}
            <div class="detail__head">
              <h1 class="detail__title">${c.title}</h1>
              <p class="detail__sub">${c.region} · ${fmt.timeAgo(c.created_at)}</p>
              <p class="detail__price">${fmt.carPrice(c.price)}</p>
            </div>
            <dl class="spec-table">
              <div><dt>연식</dt><dd>${c.year}년식</dd></div>
              <div><dt>주행거리</dt><dd>${fmt.num(c.mileage)}km</dd></div>
              <div><dt>연료</dt><dd>${O.carFuels[c.fuel] || c.fuel}</dd></div>
              <div><dt>제조사</dt><dd>${c.brand}</dd></div>
            </dl>
            <p class="detail__desc">${c.description}</p>
            <p class="detail__counts">채팅 ${c.chat_count} · 조회 ${c.view_count}</p>
            ${mine ? html`
              <div class="owner-box">
                <p class="owner-box__title">내 글 관리</p>
                <div class="owner-box__row">
                  <span class="spacer"></span>
                  <a class="btn btn--small btn--neutral-weak pressable" href="#/used-car/${c.id}/edit">${icon('pencil', 16)}수정</a>
                  <button type="button" class="btn btn--small btn--neutral-weak pressable" data-delete>${icon('trash', 16)}삭제</button>
                </div>
              </div>
            ` : html`
              <div class="detail__actions">
                <button type="button" class="btn btn--large btn--brand-solid btn--grow pressable" data-chat>판매자와 채팅하기</button>
              </div>`}
          </div>
        </article>
        ${D.related('비슷한 중고차', App.nav.href('/used-car', { brand: c.brand }), related.slice(0, 5), ui.carCard)}
      </div>`.s;

    ui.on(ctx.root, 'click', '[data-chat]', (e, b) => App.actions.startChat('used-car', c.id, b));
    ui.on(ctx.root, 'click', '[data-delete]', () => App.actions.removePost({
      title: '차량 글을 삭제할까요?', remove: () => api().remove(c.id), backTo: '/used-car',
    }));
  });

  /* ---------- 글쓰기·수정 ---------- */
  function validate(v) {
    const e = {};
    if (!v.title) e.title = '제목을 입력해 주세요.';
    if (!v.brand) e.brand = '제조사를 선택해 주세요.';
    if (v.year == null || v.year < 1980 || v.year > thisYear + 1) e.year = `연식은 1980~${thisYear + 1} 사이로 입력해 주세요.`;
    if (v.mileage == null || v.mileage < 0) e.mileage = '주행거리를 0 이상의 숫자로 입력해 주세요.';
    if (!v.fuel) e.fuel = '연료를 선택해 주세요.';
    if (v.price == null || v.price < 0) e.price = '가격을 만원 단위 숫자로 입력해 주세요.';
    if (!v.description) e.description = '설명을 입력해 주세요.';
    if (v.image_url && !/^https?:\/\//i.test(v.image_url)) e.image_url = 'http:// 또는 https:// 로 시작하는 주소를 입력해 주세요.';
    return e;
  }

  async function renderForm(ctx, id) {
    if (!App.actions.requireLogin()) return;
    const c = id ? await api().get(id) : null;
    if (!ctx.isCurrent()) return;
    if (c && (!App.session.user || c.author.id !== App.session.user.id)) {
      ui.toast('내가 쓴 글만 수정할 수 있어요');
      App.nav.go(`/used-car/${id}`);
      return;
    }
    const v = c || { region: App.session.user ? App.session.user.region : '' };
    ctx.title = c ? '중고차 글 수정' : '내 차 팔기';

    ctx.root.innerHTML = html`
      <div class="container page">
        <div class="form-page">
          ${ui.breadcrumb([{ label: '홈', href: '#/' }, { label: '중고차', href: '#/used-car' }, { label: ctx.title }])}
          <h1 class="page-title" style="margin-top: var(--seed-dimension-x4)">${ctx.title}</h1>
          <form class="form" novalidate>
            ${F.field('title', '제목', F.input('title', v.title, { maxlength: 60, placeholder: '예) 현대 아반떼 CN7 1.6 인스퍼레이션' }), { required: true })}
            <div class="form__grid">
              ${F.field('brand', '제조사', F.select('brand', F.pairs(O.carBrands), v.brand, {}, '제조사 선택'), { required: true })}
              ${F.field('fuel', '연료', F.select('fuel', Object.entries(O.carFuels), v.fuel, {}, '연료 선택'), { required: true })}
              ${F.field('year', '연식', F.input('year', v.year, { type: 'number', min: 1980, max: thisYear + 1, placeholder: `예) ${thisYear - 3}` }), { required: true })}
              ${F.field('mileage', '주행거리 (km)', F.input('mileage', v.mileage, { type: 'number', min: 0, placeholder: '예) 32000' }), { required: true })}
              ${F.field('price', '가격 (만원)', F.input('price', c ? Math.round(c.price / MAN) : '', { type: 'number', min: 0, placeholder: '예) 1890' }), { required: true, hint: '만원 단위로 입력해요.' })}
              ${F.field('region', '거래 희망 동네', F.select('region', F.regionOptions(), v.region))}
            </div>
            ${F.field('description', '차량 설명', F.textarea('description', v.description, {
              rows: 8, maxlength: 2000, placeholder: '사고 이력, 정비 이력, 옵션 등을 자세히 적어주세요.',
            }), { required: true })}
            ${F.field('image_url', '사진 주소', F.input('image_url', c && /^https?:/i.test(c.image_url || '') ? c.image_url : '', { type: 'url', placeholder: 'https://...' }),
              { hint: '선택 사항이에요. 비워 두면 기본 이미지로 보여요.' })}
            ${F.actions(c ? `#/used-car/${c.id}` : '#/used-car', c ? '수정 완료' : '작성 완료')}
          </form>
        </div>
      </div>`.s;

    const form = ctx.root.querySelector('form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const r = ui.formValues(form);
      const man = F.int(r.price);
      const body = {
        title: r.title || '', brand: r.brand || '', fuel: r.fuel || '', region: r.region || undefined,
        year: F.int(r.year), mileage: F.int(r.mileage), price: man == null ? null : man * MAN,
        description: r.description || '',
      };
      if (r.image_url) body.image_url = r.image_url;
      if (!ui.showFieldErrors(form, validate(body))) return;
      try {
        const saved = await ui.withLoading(form.querySelector('[type=submit]'), () => (c ? api().update(c.id, body) : api().create(body)));
        if (!saved) return;
        ui.toast(c ? '수정했어요' : '차량을 올렸어요');
        App.nav.go(`/used-car/${saved.id}`);
      } catch (err) { App.actions.showError(err); }
    });
  }

  App.route('/used-car/new', (ctx) => renderForm(ctx, null));
  App.route('/used-car/:id/edit', (ctx) => renderForm(ctx, ctx.params.id));
})();
