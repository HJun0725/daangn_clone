// 중고거래 (/buy-sell): 목록·검색, 상세, 글쓰기, 수정
(function () {
  const App = window.App;
  const ui = App.ui;
  const { html, raw, icon, fmt } = ui;
  const O = App.options;
  const F = App.form;
  const D = App.detail;
  const P = App.listPage.parts;
  const api = () => App.api.buySell;

  const PRICE_PRESETS = [
    ['나눔', { min_price: '0', max_price: '0' }],
    ['5,000원 이하', { min_price: '', max_price: '5000' }],
    ['1만원 이하', { min_price: '', max_price: '10000' }],
    ['5만원 이하', { min_price: '', max_price: '50000' }],
  ];
  const priceLabel = (min, max) => {
    if (min === '0' && max === '0') return '나눔';
    if (min && max) return `${fmt.num(min)}원 ~ ${fmt.num(max)}원`;
    if (max) return `${fmt.num(max)}원 이하`;
    return `${fmt.num(min)}원 이상`;
  };

  /* ---------- 목록 ---------- */
  App.route('/buy-sell', (ctx) => App.listPage.render(ctx, {
    base: '/buy-sell',
    label: '중고거래',
    unit: '물건',
    writeLabel: '내 물건 팔기',
    filterKeys: ['region', 'category', 'status', 'min_price', 'max_price'],
    list: (q) => api().list(q),
    search: (q) => api().search(q),
    card: ui.buySellCard,
    listClass: 'card-grid',
    keywords: ['아이폰', '자전거', '식탁', '닌텐도', '캠핑', '모니터'],
    title: (q) => `${q.region || O.regionPrefix} ${q.category || ''} 중고거래`.replace(/\s+/g, ' '),
    emptyTitle: '아직 올라온 물건이 없어요',
    emptyDesc: '첫 번째로 물건을 올려 보세요.',
    filters: (q) => html`
      ${P.select('위치', 'region', F.regionOptions(), q.region, `${O.regionPrefix} 전체`)}
      ${P.group('거래 상태', P.check('status', 'selling', '거래 가능만 보기', q.status))}
      ${P.radios('카테고리', 'category', F.pairs(O.buySellCategories), q.category)}
      ${P.group('가격', html`${P.presets(q, PRICE_PRESETS)}${P.range(q, 'min_price', 'max_price', { unit: '원' })}`)}`,
    chips(q) {
      const chips = [];
      if (q.region) chips.push({ keys: ['region'], label: q.region });
      if (q.status) chips.push({ keys: ['status'], label: '거래 가능만' });
      if (q.category) chips.push({ keys: ['category'], label: q.category });
      if (q.min_price || q.max_price) chips.push({ keys: ['min_price', 'max_price'], label: priceLabel(q.min_price, q.max_price) });
      return chips;
    },
  }));

  /* ---------- 상세 ---------- */
  App.route('/buy-sell/:id', async (ctx) => {
    const p = await api().get(ctx.params.id);
    const me = App.session.user;
    const mine = !!me && p.author && me.id === p.author.id;
    const [authorPosts, nearby] = await Promise.allSettled([
      api().list({ author_id: p.author && p.author.id, size: 6 }),
      api().list({ region: p.region, status: 'selling', size: 11 }),
    ]);
    if (!ctx.isCurrent()) return;
    const others = (r) => D.items(r).filter((x) => x.id !== p.id).slice(0, 5);
    ctx.title = p.title;

    const likeButton = (liked, count) => html`
      <button type="button" class="btn btn--large btn--neutral-outline like-btn pressable ${liked ? 'is-liked' : ''}" data-like aria-pressed="${liked ? 'true' : 'false'}">
        ${icon('heart', 22)}<span>관심 ${count}</span>
      </button>`;

    ctx.root.innerHTML = html`
      <div class="container page">
        ${ui.breadcrumb([{ label: '홈', href: '#/' }, { label: '중고거래', href: '#/buy-sell' }, { label: p.category, href: App.nav.href('/buy-sell', { category: p.category }) }])}
        <article class="detail">
          <div class="detail__media">${ui.thumb(p.image_url, '', 64)}</div>
          <div class="detail__main">
            ${D.seller(p.author)}
            <div class="detail__head">
              <h1 class="detail__title">${ui.statusBadge(p.status)}${p.title}</h1>
              <p class="detail__sub"><a href="${App.nav.href('/buy-sell', { category: p.category })}">${p.category}</a> · ${p.region} · ${fmt.timeAgo(p.created_at)}</p>
              <p class="detail__price">${fmt.won(p.price)}</p>
            </div>
            <p class="detail__desc">${p.description}</p>
            <p class="detail__counts">채팅 ${p.chat_count} · 관심 <span data-like-count>${p.like_count}</span> · 조회 ${p.view_count}</p>
            ${mine ? html`
              <div class="owner-box">
                <p class="owner-box__title">내 글 관리</p>
                <div class="owner-box__row">
                  <select class="select select--medium" data-status aria-label="거래 상태" style="width:auto">
                    ${Object.entries(O.buySellStatus).map(([v, l]) => html`<option value="${v}"${v === p.status ? raw(' selected') : ''}>${l}</option>`)}
                  </select>
                  <span class="spacer"></span>
                  <a class="btn btn--small btn--neutral-weak pressable" href="#/buy-sell/${p.id}/edit">${icon('pencil', 16)}수정</a>
                  <button type="button" class="btn btn--small btn--neutral-weak pressable" data-delete>${icon('trash', 16)}삭제</button>
                </div>
              </div>
              <div class="detail__actions"><a class="btn btn--large btn--neutral-weak btn--grow pressable" href="#/chat">내 채팅 보기</a></div>
            ` : html`
              <div class="detail__actions">
                <span data-like-slot>${likeButton(p.liked, p.like_count)}</span>
                <button type="button" class="btn btn--large btn--brand-solid btn--grow pressable" data-chat${p.status === 'sold' ? raw(' disabled') : ''}>
                  ${p.status === 'sold' ? '거래가 완료된 물건이에요' : '채팅하기'}
                </button>
              </div>`}
          </div>
        </article>
        ${D.related(`${p.author ? p.author.nickname : ''}님의 판매 물품`, p.author ? `#/users/${p.author.id}` : '', others(authorPosts), ui.buySellCard)}
        ${D.related(`${p.region} 근처 인기 중고거래`, App.nav.href('/buy-sell', { region: p.region }), others(nearby).slice(0, 10), ui.buySellCard)}
      </div>`.s;

    const root = ctx.root;
    ui.on(root, 'click', '[data-chat]', (e, b) => App.actions.startChat('buy-sell', p.id, b));
    ui.on(root, 'click', '[data-like]', async (e, b) => {
      if (!App.actions.requireLogin()) return;
      try {
        const r = await ui.withLoading(b, () => api().toggleLike(p.id));
        if (!r) return;
        root.querySelector('[data-like-slot]').innerHTML = likeButton(r.liked, r.like_count).s;
        root.querySelector('[data-like-count]').textContent = r.like_count;
        ui.toast(r.liked ? '관심 목록에 추가했어요' : '관심 목록에서 뺐어요');
      } catch (err) { App.actions.showError(err); }
    });
    ui.on(root, 'change', '[data-status]', async (e, select) => {
      try {
        select.disabled = true;
        await api().setStatus(p.id, select.value);
        ui.toast(`${O.buySellStatus[select.value]}(으)로 바꿨어요`);
        App.nav.reload();
      } catch (err) {
        select.value = p.status;
        select.disabled = false;
        App.actions.showError(err);
      }
    });
    ui.on(root, 'click', '[data-delete]', () => App.actions.removePost({
      title: '게시글을 삭제할까요?', remove: () => api().remove(p.id), backTo: '/buy-sell',
    }));
  });

  /* ---------- 글쓰기·수정 ---------- */
  function validate(v) {
    const e = {};
    if (!v.title) e.title = '제목을 입력해 주세요.';
    if (!v.category) e.category = '카테고리를 선택해 주세요.';
    if (v.price == null || v.price < 0) e.price = '가격을 0 이상의 숫자로 입력해 주세요.';
    if (!v.description) e.description = '자세한 설명을 입력해 주세요.';
    if (v.image_url && !/^https?:\/\//i.test(v.image_url) && !/^data:image\//i.test(v.image_url)) e.image_url = 'http:// 또는 https:// 로 시작하는 주소를 입력해 주세요.';
    return e;
  }

  async function renderForm(ctx, id) {
    if (!App.actions.requireLogin()) return;
    const p = id ? await api().get(id) : null;
    if (!ctx.isCurrent()) return;
    if (p && (!App.session.user || p.author.id !== App.session.user.id)) {
      ui.toast('내가 쓴 글만 수정할 수 있어요');
      App.nav.go(`/buy-sell/${id}`);
      return;
    }
    const v = p || { region: App.session.user ? App.session.user.region : '' };
    const sharing = p && p.price === 0;
    ctx.title = p ? '중고거래 글 수정' : '내 물건 팔기';

    ctx.root.innerHTML = html`
      <div class="container page">
        <div class="form-page">
          ${ui.breadcrumb([{ label: '홈', href: '#/' }, { label: '중고거래', href: '#/buy-sell' }, { label: ctx.title }])}
          <h1 class="page-title" style="margin-top: var(--seed-dimension-x4)">${ctx.title}</h1>
          <form class="form" novalidate>
            ${F.field('title', '제목', F.input('title', v.title, { maxlength: 60, placeholder: '제목', required: true }), { required: true })}
            <div class="form__grid">
              ${F.field('category', '카테고리', F.select('category', F.pairs(O.buySellCategories), v.category, { required: true }, '카테고리 선택'), { required: true })}
              ${F.field('region', '거래 희망 동네', F.select('region', F.regionOptions(), v.region))}
            </div>
            <div class="field">
              <label class="field__label" for="f-price">가격<span class="req" aria-hidden="true">*</span></label>
              <div class="field__row">
                ${F.input('price', p ? p.price : '', { type: 'number', min: 0, step: 1, inputmode: 'numeric', placeholder: '₩ 가격을 입력해주세요', disabled: sharing })}
                <label class="option" style="flex:none"><input type="checkbox" data-share${sharing ? raw(' checked') : ''}>나눔</label>
              </div>
            </div>
            ${F.field('description', '자세한 설명', F.textarea('description', v.description, {
              rows: 8, maxlength: 2000, required: true,
              placeholder: `${v.region || '우리 동네'}에 올릴 게시글 내용을 작성해 주세요.\n신뢰할 수 있는 거래를 위해 자세히 적어주세요.`,
            }), { required: true })}
            ${F.field('image_url', '사진 주소', F.input('image_url', p && /^https?:/i.test(p.image_url || '') ? p.image_url : '', { type: 'url', placeholder: 'https://...' }),
              { hint: p && p.image_url && !/^https?:/i.test(p.image_url) ? '비워 두면 지금 사진을 그대로 써요.' : '사진 업로드 방식이 정해지기 전까지는 이미지 주소로 받아요. 선택 사항이에요.' })}
            ${F.actions(p ? `#/buy-sell/${p.id}` : '#/buy-sell', p ? '수정 완료' : '작성 완료')}
          </form>
        </div>
      </div>`.s;

    const form = ctx.root.querySelector('form');
    form.querySelector('[data-share]').addEventListener('change', (e) => {
      form.price.disabled = e.target.checked;
      if (e.target.checked) form.price.value = '';
    });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const raw0 = ui.formValues(form);
      const body = {
        title: raw0.title || '',
        category: raw0.category || '',
        region: raw0.region || undefined,
        price: form.querySelector('[data-share]').checked ? 0 : F.int(raw0.price),
        description: raw0.description || '',
      };
      if (raw0.image_url) body.image_url = raw0.image_url;
      else if (!p) body.image_url = null;
      if (!ui.showFieldErrors(form, validate(body))) return;
      try {
        const saved = await ui.withLoading(form.querySelector('[type=submit]'), () => (p ? api().update(p.id, body) : api().create(body)));
        if (!saved) return;
        ui.toast(p ? '수정했어요' : '게시글을 올렸어요');
        App.nav.go(`/buy-sell/${saved.id}`);
      } catch (err) { App.actions.showError(err); }
    });
  }

  App.route('/buy-sell/new', (ctx) => renderForm(ctx, null));
  App.route('/buy-sell/:id/edit', (ctx) => renderForm(ctx, ctx.params.id));
})();
