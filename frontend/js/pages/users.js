// 사용자 (/users): 로그인, 회원가입, 내 프로필(조회·수정), 다른 사용자 프로필
(function () {
  const App = window.App;
  const ui = App.ui;
  const { html, icon, fmt } = ui;
  const O = App.options;
  const F = App.form;
  const D = App.detail;

  // 로그인 뒤 돌아갈 곳. 같은 사이트 안의 해시 주소만 받는다.
  const nextOf = (ctx) => {
    const next = ctx.query.next || '';
    return /^#\/(?!\/)/.test(next) && !/^#\/(login|signup)/.test(next) ? next : '#/';
  };
  const goNext = (ctx) => { location.hash = nextOf(ctx); };

  /* ---------- 로그인 ---------- */
  App.route('/login', (ctx) => {
    if (App.session.token) { goNext(ctx); return; }
    ctx.title = '로그인';
    ctx.root.innerHTML = html`
      <div class="container page">
        <div class="form-page form-page--narrow">
          <h1 class="page-title">로그인</h1>
          <p class="detail__sub" style="margin-top: var(--seed-dimension-x2)">우리 동네 이웃과 거래하려면 로그인해 주세요.</p>
          <form class="form" novalidate>
            ${App.config.USE_MOCK ? html`<p class="notice"><strong>체험용 계정</strong> demo@karrot.com / karrot1234</p>` : ''}
            ${F.field('email', '이메일', F.input('email', '', { type: 'email', autocomplete: 'email', placeholder: 'example@email.com' }))}
            ${F.field('password', '비밀번호', F.input('password', '', { type: 'password', autocomplete: 'current-password', placeholder: '비밀번호' }))}
            <button class="btn btn--large btn--brand-solid btn--block pressable" type="submit">로그인</button>
            <p class="form__alt">아직 계정이 없나요? <a href="${App.nav.href('/signup', ctx.query.next ? { next: ctx.query.next } : {})}">회원가입</a></p>
          </form>
        </div>
      </div>`.s;

    const form = ctx.root.querySelector('form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = ui.formValues(form);
      const errors = {};
      if (!v.email) errors.email = '이메일을 입력해 주세요.';
      if (!v.password) errors.password = '비밀번호를 입력해 주세요.';
      if (!ui.showFieldErrors(form, errors)) return;
      try {
        const user = await ui.withLoading(form.querySelector('[type=submit]'), () => App.api.users.login({ email: v.email, password: v.password }));
        if (!user && !App.session.token) return;
        ui.toast(`${App.session.user ? App.session.user.nickname : ''}님, 반가워요!`);
        goNext(ctx);
      } catch (err) { App.actions.showError(err); }
    });
    form.email.focus();
  });

  /* ---------- 회원가입 ---------- */
  App.route('/signup', (ctx) => {
    if (App.session.token) { goNext(ctx); return; }
    ctx.title = '회원가입';
    ctx.root.innerHTML = html`
      <div class="container page">
        <div class="form-page form-page--narrow">
          <h1 class="page-title">회원가입</h1>
          <p class="detail__sub" style="margin-top: var(--seed-dimension-x2)">동네를 정하고 이웃과 거래를 시작해 보세요.</p>
          <form class="form" novalidate>
            ${F.field('email', '이메일', F.input('email', '', { type: 'email', autocomplete: 'email', placeholder: 'example@email.com' }), { required: true })}
            ${F.field('password', '비밀번호', F.input('password', '', { type: 'password', autocomplete: 'new-password', placeholder: '8자 이상' }), { required: true, hint: '8자 이상 입력해 주세요.' })}
            ${F.field('nickname', '닉네임', F.input('nickname', '', { maxlength: 12, placeholder: '2~12자' }), { required: true })}
            ${F.field('region', '내 동네', F.select('region', F.regionOptions(), App.state.region()), { required: true })}
            <button class="btn btn--large btn--brand-solid btn--block pressable" type="submit">가입하기</button>
            <p class="form__alt">이미 계정이 있나요? <a href="${App.nav.href('/login', ctx.query.next ? { next: ctx.query.next } : {})}">로그인</a></p>
          </form>
        </div>
      </div>`.s;

    const form = ctx.root.querySelector('form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = ui.formValues(form);
      const errors = {};
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email || '')) errors.email = '이메일 형식이 올바르지 않아요.';
      if ((form.password.value || '').length < 8) errors.password = '비밀번호는 8자 이상이어야 해요.';
      if (!v.nickname || v.nickname.length < 2) errors.nickname = '닉네임은 2~12자로 입력해 주세요.';
      if (!ui.showFieldErrors(form, errors)) return;
      try {
        await ui.withLoading(form.querySelector('[type=submit]'), () => App.api.users.signup({
          email: v.email, password: form.password.value, nickname: v.nickname, region: v.region,
        }));
        App.state.setRegion(v.region);
        ui.toast('가입을 환영해요!');
        goNext(ctx);
      } catch (err) { App.actions.showError(err); }
    });
    form.email.focus();
  });

  /* ---------- 프로필 공통 ---------- */
  function profileCard(user, extra) {
    return html`<section class="profile">
      ${ui.avatar(user)}
      <div class="profile__info">
        <p class="profile__name">${user.nickname}</p>
        <p class="profile__sub">${O.regionPrefix} ${user.region} · ${fmt.date(user.created_at)} 가입</p>
        ${extra || ''}
      </div>
      ${user.manner_temp != null ? ui.manner(user.manner_temp) : ''}
    </section>`;
  }

  // 사용자가 쓴 글 세 종류를 author_id 필터로 불러온다.
  async function loadPosts(userId) {
    const [buySell, cars, jobs] = await Promise.allSettled([
      App.api.buySell.list({ author_id: userId, size: 20 }),
      App.api.usedCar.list({ author_id: userId, size: 20 }),
      App.api.partTimeJob.list({ author_id: userId, size: 20 }),
    ]);
    return { buySell: D.items(buySell), cars: D.items(cars), jobs: D.items(jobs) };
  }
  function postsSections(posts, who) {
    const total = posts.buySell.length + posts.cars.length + posts.jobs.length;
    if (!total) return ui.empty(`${who} 쓴 글이 없어요`);
    return html`
      ${D.related(`판매 물품 ${posts.buySell.length}`, '', posts.buySell, ui.buySellCard, 'card-grid')}
      ${D.related(`중고차 ${posts.cars.length}`, '', posts.cars, ui.carCard, 'card-grid')}
      ${D.related(`알바 공고 ${posts.jobs.length}`, '', posts.jobs, ui.jobRow, 'job-list')}`;
  }

  /* ---------- 내 프로필 ---------- */
  App.route('/users/me', async (ctx) => {
    if (!App.actions.requireLogin()) return;
    const me = await App.api.users.me();
    const posts = await loadPosts(me.id);
    if (!ctx.isCurrent()) return;
    App.layout.renderHeader(ctx);
    ctx.title = '내 프로필';

    ctx.root.innerHTML = html`
      <div class="container page">
        ${ui.breadcrumb([{ label: '홈', href: '#/' }, { label: '내 프로필' }])}
        ${profileCard(me, html`<p class="profile__sub">${me.email}</p>`)}
        <div class="me-layout">
          <section>
            <h2 class="section-title">프로필 수정</h2>
            <form class="form" novalidate>
              ${F.field('nickname', '닉네임', F.input('nickname', me.nickname, { maxlength: 12 }))}
              ${F.field('region', '내 동네', F.select('region', F.regionOptions(), me.region))}
              <button class="btn btn--large btn--neutral-solid btn--block pressable" type="submit">저장</button>
              <button class="btn btn--large btn--neutral-weak btn--block pressable" type="button" data-logout>${icon('logout', 20)}로그아웃</button>
            </form>
          </section>
          <section>
            <h2 class="section-title">내가 쓴 글</h2>
            <div style="margin-top: calc(-1 * var(--seed-dimension-x10))">${postsSections(posts, '아직')}</div>
            <p style="margin-top: var(--seed-dimension-x10)" class="chip-group">
              <a class="chip chip--outline" href="#/buy-sell/new">${icon('plus', 16)}물건 팔기</a>
              <a class="chip chip--outline" href="#/used-car/new">${icon('plus', 16)}차 팔기</a>
              <a class="chip chip--outline" href="#/part-time-job/new">${icon('plus', 16)}알바 공고</a>
            </p>
          </section>
        </div>
      </div>`.s;

    const form = ctx.root.querySelector('form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const v = ui.formValues(form);
      if (!ui.showFieldErrors(form, v.nickname && v.nickname.length >= 2 ? {} : { nickname: '닉네임은 2~12자로 입력해 주세요.' })) return;
      try {
        await ui.withLoading(form.querySelector('[type=submit]'), () => App.api.users.updateMe({ nickname: v.nickname, region: v.region }));
        App.state.setRegion(v.region);
        ui.toast('프로필을 저장했어요');
        App.nav.reload();
      } catch (err) { App.actions.showError(err); }
    });
    ui.on(ctx.root, 'click', '[data-logout]', async () => {
      const ok = await ui.dialog({ title: '로그아웃할까요?', confirmLabel: '로그아웃' });
      if (!ok) return;
      App.session.clear();
      App.layout.setUnread(0);
      ui.toast('로그아웃했어요');
      App.nav.go('/');
    });
  });

  /* ---------- 다른 사용자 프로필 ---------- */
  App.route('/users/:id', async (ctx) => {
    if (App.session.user && App.session.user.id === ctx.params.id) { App.nav.go('/users/me'); return; }
    const user = await App.api.users.get(ctx.params.id);
    const posts = await loadPosts(user.id);
    if (!ctx.isCurrent()) return;
    ctx.title = `${user.nickname}님의 프로필`;
    ctx.root.innerHTML = html`
      <div class="container page">
        ${ui.breadcrumb([{ label: '홈', href: '#/' }, { label: `${user.nickname}님의 프로필` }])}
        ${profileCard(user)}
        ${postsSections(posts, '아직')}
      </div>`.s;
  });
})();
