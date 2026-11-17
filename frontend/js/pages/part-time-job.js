// 알바 (/part-time-job): 목록·검색, 상세(지원하기, 작성자만 지원자 목록), 글쓰기, 수정
(function () {
  const App = window.App;
  const ui = App.ui;
  const { html, raw, icon, fmt } = ui;
  const O = App.options;
  const F = App.form;
  const D = App.detail;
  const P = App.listPage.parts;
  const api = () => App.api.partTimeJob;

  /* ---------- 목록 ---------- */
  App.route('/part-time-job', (ctx) => App.listPage.render(ctx, {
    base: '/part-time-job',
    label: '알바',
    unit: '공고',
    writeLabel: '알바 공고 올리기',
    filterKeys: ['region', 'work_period', 'job_category'],
    list: (q) => api().list(q),
    search: (q) => api().search(q),
    card: ui.jobRow,
    listClass: 'job-list',
    keywords: ['카페', '편의점', '주말', '서빙', '단기'],
    title: (q) => `${q.region || O.regionPrefix} ${q.job_category || ''} 알바`.replace(/\s+/g, ' '),
    emptyTitle: '아직 올라온 공고가 없어요',
    emptyDesc: '우리 동네 이웃에게 일손을 구해 보세요.',
    filters: (q) => html`
      ${P.select('위치', 'region', F.regionOptions(), q.region, `${O.regionPrefix} 전체`)}
      ${P.radios('근무 기간', 'work_period', Object.entries(O.jobPeriods), q.work_period)}
      ${P.radios('하는 일', 'job_category', F.pairs(O.jobCategories), q.job_category)}`,
    chips(q) {
      const chips = [];
      if (q.region) chips.push({ keys: ['region'], label: q.region });
      if (q.work_period) chips.push({ keys: ['work_period'], label: O.jobPeriods[q.work_period] || q.work_period });
      if (q.job_category) chips.push({ keys: ['job_category'], label: q.job_category });
      return chips;
    },
  }));

  /* ---------- 상세 ---------- */
  function applicantsSection(list) {
    return html`<section class="applicants">
      <div class="section-head"><h2 class="section-title">지원자 ${list.items.length}명</h2></div>
      ${list.items.length ? html`<ul>${list.items.map((a) => html`
        <li class="applicant">
          <a href="#/users/${a.user ? a.user.id : ''}" aria-hidden="true" tabindex="-1">${ui.avatar(a.user)}</a>
          <div class="applicant__body">
            <p class="applicant__name"><a href="#/users/${a.user ? a.user.id : ''}">${a.user ? a.user.nickname : '알 수 없음'}</a>
              ${a.user && a.user.manner_temp != null ? ui.mannerBadge(a.user.manner_temp) : ''}
              <span class="meta">${a.user ? a.user.region : ''} · ${fmt.timeAgo(a.created_at)}</span></p>
            <p class="applicant__msg">${a.message || '지원 메시지가 없어요.'}</p>
          </div>
        </li>`)}</ul>` : ui.empty('아직 지원자가 없어요', '지원자가 생기면 여기에 보여요.')}
    </section>`;
  }

  App.route('/part-time-job/:id', async (ctx) => {
    const j = await api().get(ctx.params.id);
    const me = App.session.user;
    const mine = !!me && j.author && me.id === j.author.id;
    const [applicants, nearby] = await Promise.allSettled([
      mine ? api().applicants(j.id) : Promise.resolve(null),
      api().list({ region: j.region, size: 6 }),
    ]);
    if (!ctx.isCurrent()) return;
    const pay = fmt.pay(j);
    ctx.title = j.title;

    ctx.root.innerHTML = html`
      <div class="container page">
        ${ui.breadcrumb([{ label: '홈', href: '#/' }, { label: '알바', href: '#/part-time-job' }, { label: j.job_category, href: App.nav.href('/part-time-job', { job_category: j.job_category }) }])}
        <article class="detail detail--single">
          <div class="detail__main">
            ${D.seller(j.author)}
            <div class="detail__head">
              <p class="job-row__tags">
                <span class="badge badge--large">${O.jobPeriods[j.work_period] || ''}</span>
                <span class="badge badge--large">${j.job_category}</span>
              </p>
              <h1 class="detail__title">${j.title}</h1>
              <p class="detail__sub">${j.company ? html`${j.company} · ` : ''}${j.region} · ${fmt.timeAgo(j.created_at)}</p>
            </div>
            <dl class="spec-table spec-table--rows">
              <div><dt>급여</dt><dd>${pay.label} ${pay.amount}</dd></div>
              <div><dt>근무 요일</dt><dd>${fmt.days(j.work_days)}</dd></div>
              <div><dt>근무 시간</dt><dd>${j.work_time || '시간 협의'}</dd></div>
              <div><dt>근무 기간</dt><dd>${O.jobPeriods[j.work_period] || ''}</dd></div>
              <div><dt>근무지</dt><dd>${O.regionPrefix} ${j.region}</dd></div>
            </dl>
            <p class="detail__desc">${j.description}</p>
            <p class="detail__counts">지원 ${j.applicant_count} · 조회 ${j.view_count}</p>
            ${mine ? html`
              <div class="owner-box">
                <p class="owner-box__title">내 공고 관리</p>
                <div class="owner-box__row">
                  <span class="spacer"></span>
                  <a class="btn btn--small btn--neutral-weak pressable" href="#/part-time-job/${j.id}/edit">${icon('pencil', 16)}수정</a>
                  <button type="button" class="btn btn--small btn--neutral-weak pressable" data-delete>${icon('trash', 16)}삭제</button>
                </div>
              </div>
            ` : html`
              <div class="detail__actions">
                <button type="button" class="btn btn--large btn--neutral-weak pressable" data-chat>${icon('chat', 20)}문의하기</button>
                <button type="button" class="btn btn--large btn--brand-solid btn--grow pressable" data-apply${j.applied ? raw(' disabled') : ''}>
                  ${j.applied ? '지원 완료' : '지원하기'}
                </button>
              </div>`}
            ${mine && applicants.status === 'fulfilled' && applicants.value ? applicantsSection(applicants.value) : ''}
          </div>
        </article>
        ${D.related(`${j.region} 근처 알바`, App.nav.href('/part-time-job', { region: j.region }),
          D.items(nearby).filter((x) => x.id !== j.id).slice(0, 4), ui.jobRow, 'job-list')}
      </div>`.s;

    ui.on(ctx.root, 'click', '[data-chat]', (e, b) => App.actions.startChat('part-time-job', j.id, b));
    ui.on(ctx.root, 'click', '[data-apply]', async (e, b) => {
      if (!App.actions.requireLogin()) return;
      const message = await ui.dialog({
        title: '이 공고에 지원할까요?',
        desc: '사장님께 보낼 간단한 자기소개를 적어 주세요.',
        textarea: { placeholder: '예) 주말 모두 가능하고 카페 경험이 있어요.', label: '지원 메시지' },
        confirmLabel: '지원하기', variant: 'brand-solid',
      });
      if (message === null) return;
      try {
        await ui.withLoading(b, () => api().apply(j.id, message));
        ui.toast('지원했어요');
        App.nav.reload();
      } catch (err) { App.actions.showError(err); }
    });
    ui.on(ctx.root, 'click', '[data-delete]', () => App.actions.removePost({
      title: '공고를 삭제할까요?', remove: () => api().remove(j.id), backTo: '/part-time-job',
    }));
  });

  /* ---------- 글쓰기·수정 ---------- */
  function validate(v) {
    const e = {};
    if (!v.title) e.title = '제목을 입력해 주세요.';
    if (!v.job_category) e.job_category = '하는 일을 선택해 주세요.';
    if (!v.pay_type) e.pay_type = '급여 종류를 선택해 주세요.';
    if (v.pay == null || v.pay < 1) e.pay = '급여를 숫자로 입력해 주세요.';
    if (!v.work_period) e.work_period = '근무 기간을 선택해 주세요.';
    if (!v.description) e.description = '상세 내용을 입력해 주세요.';
    return e;
  }

  async function renderForm(ctx, id) {
    if (!App.actions.requireLogin()) return;
    const j = id ? await api().get(id) : null;
    if (!ctx.isCurrent()) return;
    if (j && (!App.session.user || j.author.id !== App.session.user.id)) {
      ui.toast('내가 쓴 공고만 수정할 수 있어요');
      App.nav.go(`/part-time-job/${id}`);
      return;
    }
    const v = j || { region: App.session.user ? App.session.user.region : '', work_days: [], pay_type: 'hourly', work_period: 'long' };
    ctx.title = j ? '알바 공고 수정' : '알바 공고 올리기';

    ctx.root.innerHTML = html`
      <div class="container page">
        <div class="form-page">
          ${ui.breadcrumb([{ label: '홈', href: '#/' }, { label: '알바', href: '#/part-time-job' }, { label: ctx.title }])}
          <h1 class="page-title" style="margin-top: var(--seed-dimension-x4)">${ctx.title}</h1>
          <form class="form" novalidate>
            ${F.field('title', '공고 제목', F.input('title', v.title, { maxlength: 60, placeholder: '예) 주말 카페 바리스타 구해요' }), { required: true })}
            <div class="form__grid">
              ${F.field('company', '가게 이름', F.input('company', v.company, { maxlength: 30, placeholder: '개인이면 비워 두세요' }))}
              ${F.field('job_category', '하는 일', F.select('job_category', F.pairs(O.jobCategories), v.job_category, {}, '선택'), { required: true })}
              ${F.field('pay_type', '급여 종류', F.select('pay_type', Object.entries(O.jobPayTypes), v.pay_type), { required: true })}
              ${F.field('pay', '급여 (원)', F.input('pay', v.pay, { type: 'number', min: 1, placeholder: '예) 11000' }), { required: true })}
              ${F.field('work_period', '근무 기간', F.select('work_period', Object.entries(O.jobPeriods), v.work_period), { required: true })}
              ${F.field('region', '근무 동네', F.select('region', F.regionOptions(), v.region))}
            </div>
            <fieldset class="field" style="border:0; padding:0; margin:0">
              <legend class="field__label" style="margin-bottom: var(--seed-dimension-x2)">근무 요일</legend>
              <div class="day-picker">
                ${O.days.map(([key, label]) => html`<label><input type="checkbox" name="work_days" value="${key}"${(v.work_days || []).includes(key) ? raw(' checked') : ''}><span class="chip chip--outline">${label}</span></label>`)}
              </div>
              <p class="field__hint">선택하지 않으면 '요일 협의'로 보여요.</p>
            </fieldset>
            ${F.field('work_time', '근무 시간', F.input('work_time', v.work_time, { maxlength: 30, placeholder: '예) 10:00 ~ 18:00' }))}
            ${F.field('description', '상세 내용', F.textarea('description', v.description, {
              rows: 8, maxlength: 2000, placeholder: '하는 일, 우대 사항, 복리후생 등을 적어 주세요.',
            }), { required: true })}
            ${F.actions(j ? `#/part-time-job/${j.id}` : '#/part-time-job', j ? '수정 완료' : '공고 올리기')}
          </form>
        </div>
      </div>`.s;

    const form = ctx.root.querySelector('form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const r = ui.formValues(form);
      const body = {
        title: r.title || '', company: r.company || '', job_category: r.job_category || '',
        pay_type: r.pay_type || '', pay: F.int(r.pay), work_period: r.work_period || '',
        work_days: [].concat(r.work_days || []), work_time: r.work_time || '',
        region: r.region || undefined, description: r.description || '',
      };
      if (!ui.showFieldErrors(form, validate(body))) return;
      try {
        const saved = await ui.withLoading(form.querySelector('[type=submit]'), () => (j ? api().update(j.id, body) : api().create(body)));
        if (!saved) return;
        ui.toast(j ? '수정했어요' : '공고를 올렸어요');
        App.nav.go(`/part-time-job/${saved.id}`);
      } catch (err) { App.actions.showError(err); }
    });
  }

  App.route('/part-time-job/new', (ctx) => renderForm(ctx, null));
  App.route('/part-time-job/:id/edit', (ctx) => renderForm(ctx, ctx.params.id));
})();
