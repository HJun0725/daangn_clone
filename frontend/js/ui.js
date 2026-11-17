// 화면 공통 도구: 안전한 HTML 템플릿, 아이콘, 표시 형식, 스낵바·다이얼로그, 공용 조각(카드 등)
(function () {
  const App = (window.App = window.App || {});
  const O = App.options;

  /* ---------- 안전한 HTML 템플릿 ----------
     html`...${값}...` 에 넣는 값은 자동으로 이스케이프된다.
     이미 만들어진 HTML 조각(html`` 의 결과)만 그대로 들어간다. */
  class Safe {
    constructor(s) { this.s = s; }
    toString() { return this.s; }
  }
  const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ESC[c]);
  function toHtml(v) {
    if (v == null || v === false || v === true) return '';
    if (v instanceof Safe) return v.s;
    if (Array.isArray(v)) return v.map(toHtml).join('');
    return esc(v);
  }
  // 코드에 직접 쓴 고정 문자열만 넘긴다. 사용자 입력·서버 응답은 절대 넘기지 않는다.
  const raw = (s) => new Safe(s);
  // 속성 객체 → 속성 문자열. true 는 값 없는 속성, false/null 은 생략.
  function attrs(obj) {
    return new Safe(Object.entries(obj || {})
      .filter(([, v]) => v !== false && v != null)
      .map(([k, v]) => (v === true ? k : `${k}="${esc(v)}"`))
      .join(' '));
  }
  function html(strings, ...vals) {
    let out = '';
    strings.forEach((s, i) => {
      out += s;
      if (i < vals.length) out += toHtml(vals[i]);
    });
    return new Safe(out);
  }

  /* ---------- 아이콘 (24 그리드, 굵은 선, 둥근 끝) ---------- */
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    pin: '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    heart: '<path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z"/>',
    chat: '<path d="M6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H11l-4 3.5V16h-.5A2.5 2.5 0 0 1 4 13.5v-7A2.5 2.5 0 0 1 6.5 4z"/>',
    'chevron-right': '<path d="m9 6 6 6-6 6"/>',
    'chevron-left': '<path d="m15 6-6 6 6 6"/>',
    'chevron-down': '<path d="m6 9 6 6 6-6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    close: '<path d="M6 6l12 12M18 6 6 18"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 20c0-3.6 3.6-6 8-6s8 2.4 8 6"/>',
    bag: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/>',
    car: '<path d="M5 11l1.6-4.2A2 2 0 0 1 8.5 5.5h7a2 2 0 0 1 1.9 1.3L19 11"/><rect x="3" y="11" width="18" height="6" rx="2"/><path d="M6.5 17v2M17.5 17v2M7 14h.5M16.5 14h.5"/>',
    briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V7M3 12.5h18"/>',
    send: '<path d="M20 4 3.5 10.5l6.5 3 3 6.5z"/><path d="M20 4 10 13.5"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    won: '<circle cx="12" cy="12" r="8.5"/><path d="m8 9.5 1.6 5.5L12 10l2.4 5L16 9.5M7.5 12h9"/>',
    filter: '<path d="M4 7h16M7 12h10M10 17h4"/>',
    image: '<rect x="3.5" y="4.5" width="17" height="15" rx="2"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5"/>',
    logout: '<path d="M10 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2H10M15 8l4 4-4 4M19 12H9.5"/>',
    pencil: '<path d="M4 20l1-4.5L16 4.5a2 2 0 0 1 3 0l.5.5a2 2 0 0 1 0 3L8.5 19z"/>',
    trash: '<path d="M4.5 7h15M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M6.5 7l.8 12a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4l.8-12"/>',
    face: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c.8 1.2 2 1.9 3.5 1.9s2.700-.7 3.500-1.900M9 9.800v.400M15 9.800v.400"/>',
  };
  function icon(name, size = 20, strokeWidth = 2) {
    return new Safe(
      `<svg class="icon" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" ` +
      `stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`
    );
  }
  // 로고: 직접 그린 단순한 당근 모양(공식 로고 파일이 아님)
  function logoMark(size = 28) {
    return new Safe(
      `<svg width="${size}" height="${size}" viewBox="0 0 28 28" aria-hidden="true">` +
      '<path d="M14 26c-.6 0-7.500-6.400-7.500-12.300C6.500 9.400 9.900 6.500 14 6.500s7.500 2.900 7.500 7.200C21.500 19.600 14.600 26 14 26z" fill="#ff6600"/>' +
      '<circle cx="14" cy="13.600" r="2.600" fill="#fff"/>' +
      '<path d="M14.200 6.200c-.300-2 .500-3.600 2.300-4.400.500 1.900-.300 3.500-2.300 4.400zM13.300 6.300c-1.700-.400-2.800-1.600-3-3.300 1.800.200 2.900 1.400 3 3.300z" fill="#00a05b"/>' +
      '</svg>'
    );
  }

  /* ---------- 표시 형식 ---------- */
  const num = (n) => Number(n).toLocaleString('ko-KR');
  const fmt = {
    num,
    won: (n) => (Number(n) === 0 ? '나눔' : `${num(n)}원`),
    // 중고차 가격: 원 단위를 만원·억 단위로 표시
    carPrice(won) {
      const man = Math.round(Number(won) / 10000);
      if (man >= 10000) {
        const rest = man % 10000;
        return `${num(Math.floor(man / 10000))}억${rest ? ` ${num(rest)}만원` : '원'}`;
      }
      return `${num(man)}만원`;
    },
    mileage: (km) => (km >= 10000 ? `${+(km / 10000).toFixed(1)}만km` : `${num(km)}km`),
    year: (y) => `${String(y).slice(2)}년식`,
    pay(job) {
      const label = O.jobPayTypes[job.pay_type] || '';
      const amount = job.pay >= 1000000 && job.pay % 10000 === 0 ? `${num(job.pay / 10000)}만원` : `${num(job.pay)}원`;
      return { label, amount };
    },
    days(days) {
      const order = O.days.map((d) => d[0]);
      const idx = (days || []).map((d) => order.indexOf(d)).filter((i) => i >= 0).sort((a, b) => a - b);
      if (!idx.length) return '요일 협의';
      const name = (i) => O.days[i][1];
      const consecutive = idx.every((v, i) => i === 0 || v === idx[i - 1] + 1);
      if (consecutive && idx.length >= 3) return `${name(idx[0])}~${name(idx[idx.length - 1])}`;
      return idx.map(name).join(', ');
    },
    timeAgo(iso) {
      const diff = Math.max(0, Date.now() - new Date(iso).getTime());
      const min = Math.floor(diff / 60000);
      if (min < 1) return '방금 전';
      if (min < 60) return `${min}분 전`;
      const hour = Math.floor(min / 60);
      if (hour < 24) return `${hour}시간 전`;
      const day = Math.floor(hour / 24);
      if (day < 30) return `${day}일 전`;
      const month = Math.floor(day / 30);
      if (month < 12) return `${month}달 전`;
      return `${Math.floor(month / 12)}년 전`;
    },
    clock(iso) {
      const d = new Date(iso);
      const h = d.getHours();
      return `${h < 12 ? '오전' : '오후'} ${h % 12 === 0 ? 12 : h % 12}:${String(d.getMinutes()).padStart(2, '0')}`;
    },
    date(iso) {
      const d = new Date(iso);
      return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
    },
    // 매너온도 → 색 단계. SEED 가 구간을 공개하지 않아 이 프로젝트에서 정한 값이다.
    mannerLevel(temp) {
      const limits = [30, 34, 36.5, 38, 40, 45, 50, 60, 75];
      const i = limits.findIndex((limit) => temp < limit);
      return i === -1 ? 10 : i + 1;
    },
  };

  /* ---------- 공용 조각 ---------- */
  const safeImageUrl = (url) => (typeof url === 'string' && /^(https?:\/\/|data:image\/)/i.test(url) ? url : '');

  function thumb(url, cls = '', iconSize = 28) {
    const src = safeImageUrl(url);
    return html`<div class="thumb ${cls}">${src ? html`<img src="${src}" alt="" loading="lazy">` : icon('image', iconSize, 1.6)}</div>`;
  }
  function avatar(user, size) {
    const style = size ? new Safe(` style="--size:${Number(size)}px"`) : '';
    return html`<span class="avatar"${style} aria-hidden="true">${(user && user.nickname ? user.nickname : '?').slice(0, 1)}</span>`;
  }
  function manner(temp) {
    const t = Number(temp).toFixed(1);
    return html`<div class="manner manner-l${fmt.mannerLevel(Number(temp))}">
      <div class="manner__row"><span class="manner__value">${t}°C</span><span class="manner__face">${icon('face', 32, 1.8)}</span></div>
      <span class="manner__label">매너온도</span>
    </div>`;
  }
  function mannerBadge(temp) {
    return html`<span class="manner-badge manner-l${fmt.mannerLevel(Number(temp))}">${Number(temp).toFixed(1)}°C</span>`;
  }
  function statusBadge(status) {
    if (status === 'reserved') return html`<span class="badge badge--positive">예약중</span>`;
    if (status === 'sold') return html`<span class="badge">거래완료</span>`;
    return '';
  }
  function breadcrumb(items) {
    return html`<nav class="breadcrumb" aria-label="현재 위치">${items.map((it, i) => html`
      ${i > 0 ? icon('chevron-right', 14, 2.4) : ''}
      ${it.href ? html`<a href="${it.href}">${it.label}</a>` : html`<span aria-current="page">${it.label}</span>`}`)}</nav>`;
  }
  function empty(title, desc, action) {
    return html`<div class="empty">
      <p class="empty__title">${title}</p>
      ${desc ? html`<p class="empty__desc">${desc}</p>` : ''}
      ${action || ''}
    </div>`;
  }
  function keywords(label, words, hrefOf) {
    return html`<div class="keywords">
      <span class="keywords__label">${label}</span>
      <ul class="keywords__list">${words.map((w) => html`<li><a href="${hrefOf(w)}">${w}</a></li>`)}</ul>
    </div>`;
  }

  // 중고거래 카드
  function buySellCard(p) {
    return html`<a class="post-card ${p.status === 'sold' ? 'is-closed' : ''}" href="#/buy-sell/${p.id}">
      ${thumb(p.image_url)}
      <div class="post-card__body">
        <h3 class="post-card__title">${statusBadge(p.status)}${p.title}</h3>
        <p class="post-card__price">${fmt.won(p.price)}</p>
        <p class="meta"><span>${p.region}</span><span aria-hidden="true">·</span><span>${fmt.timeAgo(p.created_at)}</span></p>
      </div>
    </a>`;
  }
  // 중고차 카드
  function carCard(c) {
    return html`<a class="post-card" href="#/used-car/${c.id}">
      ${thumb(c.image_url, 'thumb--4x3')}
      <div class="post-card__body">
        <h3 class="post-card__title">${c.title}</h3>
        <p class="post-card__price">${fmt.carPrice(c.price)}</p>
        <p class="post-card__spec">${fmt.year(c.year)} · ${fmt.mileage(c.mileage)}</p>
        <p class="meta"><span>${c.region}</span><span aria-hidden="true">·</span>
          <span class="meta__item">${icon('chat', 14)}<span class="sr-only">채팅 수</span>${c.chat_count}</span></p>
      </div>
    </a>`;
  }
  // 알바 행
  function jobRow(j) {
    const pay = fmt.pay(j);
    return html`<a class="job-row" href="#/part-time-job/${j.id}">
      <div class="job-row__body">
        <h3 class="job-row__title">${j.title}</h3>
        <p class="job-row__pay">
          <span><span class="badge badge--large badge--brand">${pay.label}</span> <strong>${pay.amount}</strong></span>
          <span class="meta__item">${icon('clock', 16)}${fmt.days(j.work_days)} · ${j.work_time || '시간 협의'}</span>
        </p>
        <p class="meta"><span>${j.company || (j.author || {}).nickname}</span><span aria-hidden="true">·</span><span>${j.region}</span><span aria-hidden="true">·</span><span>${fmt.timeAgo(j.created_at)}</span></p>
        <p class="job-row__tags">
          <span class="badge">${O.jobPeriods[j.work_period] || ''}</span>
          <span class="badge">${j.job_category}</span>
          ${j.applicant_count ? html`<span class="badge badge--informative">지원 ${j.applicant_count}</span>` : ''}
        </p>
      </div>
      ${j.image_url ? thumb(j.image_url) : ''}
    </a>`;
  }

  /* ---------- 스낵바 ---------- */
  let snackbarTimer;
  function toast(message) {
    let region = document.querySelector('.snackbar-region');
    if (!region) {
      region = document.createElement('div');
      region.className = 'snackbar-region';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      document.body.appendChild(region);
    }
    clearTimeout(snackbarTimer);
    region.innerHTML = html`<div class="snackbar">${message}</div>`.s;
    snackbarTimer = setTimeout(() => {
      const el = region.firstElementChild;
      if (!el) return;
      el.classList.add('is-leaving');
      setTimeout(() => { region.innerHTML = ''; }, 120);
    }, 2600);
  }

  /* ---------- 다이얼로그 ---------- */
  // 확인 다이얼로그. textarea 옵션을 주면 입력값(문자열)을, 아니면 true 를 돌려준다. 취소하면 null.
  function dialog({ title, desc, confirmLabel = '확인', cancelLabel = '취소', variant = 'neutral-solid', textarea }) {
    return new Promise((resolve) => {
      const lastFocus = document.activeElement;
      const wrap = document.createElement('div');
      wrap.className = 'dialog-backdrop';
      wrap.innerHTML = html`<div class="dialog" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
        <h2 class="dialog__title" id="dialog-title">${title}</h2>
        ${desc ? html`<p class="dialog__desc">${desc}</p>` : ''}
        ${textarea ? html`<textarea class="textarea" placeholder="${textarea.placeholder || ''}" maxlength="500" aria-label="${textarea.label || title}"></textarea>` : ''}
        <div class="dialog__actions">
          <button type="button" class="btn btn--large btn--neutral-weak pressable" data-role="cancel">${cancelLabel}</button>
          <button type="button" class="btn btn--large btn--${variant} pressable" data-role="confirm">${confirmLabel}</button>
        </div>
      </div>`.s;
      const input = wrap.querySelector('textarea');
      const close = (value) => {
        document.removeEventListener('keydown', onKey);
        wrap.remove();
        if (lastFocus && lastFocus.focus) lastFocus.focus();
        resolve(value);
      };
      const onKey = (e) => { if (e.key === 'Escape') close(null); };
      wrap.addEventListener('click', (e) => {
        if (e.target === wrap || e.target.closest('[data-role="cancel"]')) close(null);
        else if (e.target.closest('[data-role="confirm"]')) close(input ? input.value.trim() : true);
      });
      document.addEventListener('keydown', onKey);
      document.body.appendChild(wrap);
      (input || wrap.querySelector('[data-role="confirm"]')).focus();
    });
  }

  /* ---------- DOM 도우미 ---------- */
  // 이벤트 위임: root 안에서 selector 에 맞는 요소의 이벤트를 받는다.
  function on(root, type, selector, handler) {
    root.addEventListener(type, (e) => {
      const target = e.target.closest(selector);
      if (target && root.contains(target)) handler(e, target);
    });
  }
  // 폼 값을 객체로 읽는다. 같은 name 이 여러 개면(체크박스) 배열이 된다.
  function formValues(form) {
    const out = {};
    new FormData(form).forEach((value, key) => {
      const v = typeof value === 'string' ? value.trim() : value;
      if (key in out) out[key] = [].concat(out[key], v);
      else out[key] = v;
    });
    return out;
  }
  // 요청 중 버튼을 잠그고, 끝나면 되돌린다.
  async function withLoading(button, task) {
    if (!button) return task();
    if (button.disabled) return undefined;
    button.disabled = true;
    button.classList.add('is-loading');
    try {
      return await task();
    } finally {
      button.disabled = false;
      button.classList.remove('is-loading');
    }
  }
  function showFieldErrors(form, errors) {
    form.querySelectorAll('.field__error').forEach((el) => el.remove());
    form.querySelectorAll('.is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    let first;
    Object.entries(errors).forEach(([name, message]) => {
      const input = form.querySelector(`[name="${name}"]`);
      if (!input) return;
      input.classList.add('is-invalid');
      const field = input.closest('.field');
      if (field) {
        const p = document.createElement('p');
        p.className = 'field__error';
        p.textContent = message;
        field.appendChild(p);
      }
      first = first || input;
    });
    if (first) first.focus();
    return !first;
  }

  App.ui = {
    Safe, html, raw, attrs, esc, icon, logoMark, fmt, thumb, avatar, manner, mannerBadge, statusBadge,
    breadcrumb, empty, keywords, buySellCard, carCard, jobRow,
    toast, dialog, on, formValues, withLoading, showFieldErrors,
  };
})();
