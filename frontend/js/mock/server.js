// 브라우저 안에서 도는 목(mock) 서버. description.md 의 라우터·API 와 같은 경로, 같은 응답 모양을 흉내 낸다.
// 실제 백엔드가 준비되면 config.js 의 USE_MOCK 을 false 로 바꾸면 되고, 이 파일은 쓰이지 않는다.
(function () {
  const App = (window.App = window.App || {});
  const mock = (App.mock = App.mock || {});
  const O = App.options;
  const KEY = 'karrot_mock_v1';

  /* ---------- 저장소 ---------- */
  let memory = null;      // 가장 최근 데이터 (localStorage 를 못 쓸 때 대신 쓴다)
  let storageOk = true;

  function load() {
    let db = null;
    if (storageOk) {
      try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { storageOk = false; }
    }
    if (!storageOk) db = memory;
    if (!db || db.version !== mock.SEED_VERSION) {
      db = mock.seed();
      save(db);
    }
    return db;
  }
  function save(db) {
    memory = db;
    if (!storageOk) return;
    try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { storageOk = false; }
  }
  mock.reset = function () {
    memory = null;
    try { localStorage.removeItem(KEY); } catch (e) { /* 저장소를 못 쓰는 환경 */ }
  };

  /* ---------- 공통 도구 ---------- */
  class HttpError extends Error {
    constructor(status, detail) { super(detail); this.status = status; this.detail = detail; }
  }
  const fail = (status, detail) => { throw new HttpError(status, detail); };
  const has = (v) => v !== undefined && v !== null && v !== '';
  const str = (v) => (typeof v === 'string' ? v.trim() : '');
  const nowIso = () => new Date().toISOString();
  const nextId = (db, table) => (db.seq[table] = (db.seq[table] || 0) + 1);
  const byNewest = (a, b) => new Date(b.created_at) - new Date(a.created_at) || b.id - a.id;
  const findUser = (db, id) => db.users.find((u) => u.id === id);

  function paginate(items, query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const size = Math.min(100, Math.max(1, parseInt(query.size, 10) || 20));
    return { items: items.slice((page - 1) * size, page * size), total: items.length, page, size };
  }
  function keyword(query) {
    const q = str(String(query.q == null ? '' : query.q)).toLowerCase();
    if (!q) fail(422, '검색어를 입력해 주세요.');
    return q;
  }
  const includes = (q, ...fields) => fields.some((f) => String(f || '').toLowerCase().includes(q));

  // 요청 본문 검사. partial 이 true 면(PATCH) 들어온 값만 검사한다.
  function clean(body, spec, partial) {
    const out = {};
    Object.entries(spec).forEach(([key, rule]) => {
      const value = body[key];
      if (value === undefined || value === null) {
        if (!partial && rule.required) fail(422, rule.required);
        if (!partial && 'fallback' in rule) out[key] = rule.fallback;
        return;
      }
      out[key] = rule.parse(value);
    });
    return out;
  }
  const text = (required, max, invalid) => ({
    required,
    parse(v) {
      const s = str(String(v));
      if (required && !s) fail(422, required);
      if (s.length > max) fail(422, invalid || `${max}자 이하로 입력해 주세요.`);
      return s;
    },
  });
  const optionalText = (max) => ({ ...text('', max), fallback: '' });
  const integer = (required, min, max, invalid) => ({
    required,
    parse(v) {
      const n = Number(v);
      if (v === '' || !Number.isInteger(n) || n < min || n > max) fail(422, invalid);
      return n;
    },
  });
  const oneOf = (required, list, fallback) => {
    const rule = {
      required,
      parse(v) {
        if (!list.includes(v)) fail(422, required || '선택할 수 없는 값이에요.');
        return v;
      },
    };
    if (fallback !== undefined) rule.fallback = fallback;
    return rule;
  };
  const imageUrl = {
    fallback: null,
    parse(v) {
      const s = str(String(v));
      if (!s) return null;
      if (!/^(https?:\/\/|data:image\/)/i.test(s)) fail(422, '이미지 주소는 http:// 또는 https:// 로 시작해야 해요.');
      return s;
    },
  };
  const MAX_PRICE = 9999999999;

  /* ---------- 응답 모양 ---------- */
  const userOut = (u) => (u ? { id: u.id, nickname: u.nickname, region: u.region, manner_temp: u.manner_temp, created_at: u.created_at } : null);
  const meOut = (u) => ({ ...userOut(u), email: u.email });
  const tokenFor = (u) => `mock.${u.id}`;
  const authOut = (u) => ({ access_token: tokenFor(u), token_type: 'bearer', user: meOut(u) });
  const roomCount = (db, type, id) => db.rooms.filter((r) => r.post_type === type && r.post_id === id).length;

  function buySellOut(db, p, me) {
    const likes = db.likes.filter((l) => l.post_id === p.id);
    return {
      id: p.id, title: p.title, description: p.description, price: p.price, category: p.category, region: p.region,
      status: p.status, image_url: p.image_url, author: userOut(findUser(db, p.author_id)),
      like_count: p.like_base + likes.length, chat_count: p.chat_base + roomCount(db, 'buy-sell', p.id), view_count: p.view_count,
      liked: !!me && likes.some((l) => l.user_id === me.id),
      created_at: p.created_at, updated_at: p.updated_at,
    };
  }
  function carOut(db, c) {
    return {
      id: c.id, title: c.title, description: c.description, price: c.price, brand: c.brand, year: c.year,
      mileage: c.mileage, fuel: c.fuel, region: c.region, image_url: c.image_url,
      author: userOut(findUser(db, c.author_id)),
      chat_count: c.chat_base + roomCount(db, 'used-car', c.id), view_count: c.view_count,
      created_at: c.created_at, updated_at: c.updated_at,
    };
  }
  function jobOut(db, j, me) {
    const apps = db.applications.filter((a) => a.job_id === j.id);
    return {
      id: j.id, title: j.title, description: j.description, pay_type: j.pay_type, pay: j.pay,
      work_period: j.work_period, work_days: j.work_days, work_time: j.work_time, job_category: j.job_category,
      company: j.company, region: j.region, author: userOut(findUser(db, j.author_id)),
      applicant_count: apps.length, applied: !!me && apps.some((a) => a.user_id === me.id), view_count: j.view_count,
      created_at: j.created_at, updated_at: j.updated_at,
    };
  }
  const applicationOut = (db, a) => ({ id: a.id, job_id: a.job_id, user: userOut(findUser(db, a.user_id)), message: a.message, created_at: a.created_at });

  const TABLES = { 'buy-sell': 'buy_sell', 'used-car': 'used_car', 'part-time-job': 'part_time_job' };
  function postSummary(db, type, id) {
    const p = (db[TABLES[type]] || []).find((x) => x.id === id);
    if (!p) return null;
    const out = { type, id: p.id, title: p.title, price: type === 'part-time-job' ? p.pay : p.price, image_url: p.image_url || null };
    if (type === 'buy-sell') out.status = p.status;
    if (type === 'part-time-job') out.pay_type = p.pay_type;
    return out;
  }
  function roomOut(db, r, me) {
    const msgs = db.messages.filter((m) => m.room_id === r.id);
    const last = msgs[msgs.length - 1];
    const lastRead = r.last_read[me.id] || 0;
    return {
      id: r.id, post_type: r.post_type, post_id: r.post_id, post: postSummary(db, r.post_type, r.post_id),
      partner: userOut(findUser(db, r.buyer_id === me.id ? r.seller_id : r.buyer_id)),
      last_message: last ? last.content : '', last_message_at: last ? last.created_at : r.created_at,
      unread_count: msgs.filter((m) => m.sender_id !== me.id && m.id > lastRead).length,
      created_at: r.created_at,
    };
  }
  const myRooms = (db, me) => db.rooms
    .filter((r) => (r.buyer_id === me.id || r.seller_id === me.id) && !r.left.includes(me.id))
    .map((r) => roomOut(db, r, me))
    .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
  function myRoom(db, id, me) {
    const room = db.rooms.find((r) => r.id === id);
    if (!room || !(room.buyer_id === me.id || room.seller_id === me.id) || room.left.includes(me.id)) fail(404, '채팅방을 찾을 수 없어요.');
    return room;
  }
  function pushMessage(db, room, senderId, content) {
    const message = { id: nextId(db, 'messages'), room_id: room.id, sender_id: senderId, content, created_at: nowIso() };
    db.messages.push(message);
    room.last_read[senderId] = message.id;
    return message;
  }

  // 글 하나를 찾는다. owner 가 주어지면 작성자인지도 확인한다.
  function findPost(db, table, id, owner) {
    const post = db[table].find((p) => p.id === id);
    if (!post) fail(404, '게시글을 찾을 수 없어요.');
    if (owner && post.author_id !== owner.id) fail(403, '내가 쓴 글만 바꿀 수 있어요.');
    return post;
  }
  function removePost(db, table, id) {
    db[table] = db[table].filter((p) => p.id !== id);
  }

  /* ---------- 라우트 ---------- */
  const routes = [];
  function route(method, path, handler, auth) {
    const keys = [];
    const pattern = path.replace(/\{(\w+)\}/g, (_, key) => { keys.push(key); return '(\\d+)'; });
    routes.push({ method, regex: new RegExp(`^${pattern}$`), keys, handler, auth: !!auth });
  }
  const AUTH = true;

  // ===== /users (과제 라우터 수에는 포함하지 않음) =====
  const userSpec = {
    email: {
      required: '이메일을 입력해 주세요.',
      parse(v) {
        const s = str(String(v)).toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) fail(422, '이메일 형식이 올바르지 않아요.');
        return s;
      },
    },
    password: {
      required: '비밀번호를 입력해 주세요.',
      parse(v) {
        const s = String(v);
        if (s.length < 8) fail(422, '비밀번호는 8자 이상이어야 해요.');
        return s;
      },
    },
    nickname: {
      required: '닉네임을 입력해 주세요.',
      parse(v) {
        const s = str(String(v));
        if (s.length < 2 || s.length > 12) fail(422, '닉네임은 2~12자로 입력해 주세요.');
        return s;
      },
    },
    region: oneOf('동네를 선택해 주세요.', O.regions),
  };

  route('POST', '/users/signup', (c) => {
    const data = clean(c.body, userSpec, false);
    if (c.db.users.some((u) => u.email === data.email)) fail(409, '이미 가입한 이메일이에요.');
    const user = { id: nextId(c.db, 'users'), ...data, manner_temp: 36.5, created_at: nowIso() };
    c.db.users.push(user);
    return [201, authOut(user)];
  });
  route('POST', '/users/login', (c) => {
    const email = str(String(c.body.email || '')).toLowerCase();
    const user = c.db.users.find((u) => u.email === email && u.password === String(c.body.password || ''));
    if (!user) fail(401, '이메일 또는 비밀번호가 올바르지 않아요.');
    return [200, authOut(user)];
  });
  route('GET', '/users/me', (c) => [200, meOut(c.me)], AUTH);
  route('PATCH', '/users/me', (c) => {
    const data = clean(c.body, { nickname: userSpec.nickname, region: userSpec.region }, true);
    Object.assign(c.me, data);
    return [200, meOut(c.me)];
  }, AUTH);
  route('GET', '/users/{id}', (c) => {
    const user = findUser(c.db, c.params.id);
    if (!user) fail(404, '사용자를 찾을 수 없어요.');
    return [200, userOut(user)];
  });

  // ===== /buy-sell =====
  const buySellSpec = {
    title: text('제목을 입력해 주세요.', 60),
    description: text('설명을 입력해 주세요.', 2000),
    price: integer('가격을 입력해 주세요.', 0, MAX_PRICE, '가격은 0 이상의 숫자로 입력해 주세요.'),
    category: oneOf('카테고리를 선택해 주세요.', O.buySellCategories),
    region: oneOf('', O.regions),
    image_url: imageUrl,
  };
  function filterBuySell(db, query) {
    return db.buy_sell.filter((p) =>
      (!has(query.category) || p.category === query.category) &&
      (!has(query.region) || p.region === query.region) &&
      (!has(query.status) || p.status === query.status) &&
      (!has(query.author_id) || p.author_id === Number(query.author_id)) &&
      (!has(query.min_price) || p.price >= Number(query.min_price)) &&
      (!has(query.max_price) || p.price <= Number(query.max_price))).sort(byNewest);
  }
  const buySellPage = (c, items) => {
    const page = paginate(items, c.query);
    page.items = page.items.map((p) => buySellOut(c.db, p, c.me));
    return [200, page];
  };

  route('GET', '/buy-sell', (c) => buySellPage(c, filterBuySell(c.db, c.query)));
  route('GET', '/buy-sell/search', (c) => {
    const q = keyword(c.query);
    return buySellPage(c, filterBuySell(c.db, c.query).filter((p) => includes(q, p.title, p.description, p.category)));
  });
  route('GET', '/buy-sell/{id}', (c) => {
    const post = findPost(c.db, 'buy_sell', c.params.id);
    post.view_count += 1;
    c.touch();
    return [200, buySellOut(c.db, post, c.me)];
  });
  route('POST', '/buy-sell', (c) => {
    const data = clean(c.body, buySellSpec, false);
    const post = {
      id: nextId(c.db, 'buy_sell'), ...data, region: data.region || c.me.region, status: 'selling',
      author_id: c.me.id, like_base: 0, chat_base: 0, view_count: 0, created_at: nowIso(), updated_at: nowIso(),
    };
    c.db.buy_sell.push(post);
    return [201, buySellOut(c.db, post, c.me)];
  }, AUTH);
  route('PATCH', '/buy-sell/{id}', (c) => {
    const post = findPost(c.db, 'buy_sell', c.params.id, c.me);
    Object.assign(post, clean(c.body, buySellSpec, true), { updated_at: nowIso() });
    return [200, buySellOut(c.db, post, c.me)];
  }, AUTH);
  route('DELETE', '/buy-sell/{id}', (c) => {
    findPost(c.db, 'buy_sell', c.params.id, c.me);
    removePost(c.db, 'buy_sell', c.params.id);
    c.db.likes = c.db.likes.filter((l) => l.post_id !== c.params.id);
    return [204, null];
  }, AUTH);
  route('PATCH', '/buy-sell/{id}/status', (c) => {
    const post = findPost(c.db, 'buy_sell', c.params.id, c.me);
    const { status } = clean(c.body, { status: oneOf('거래 상태를 선택해 주세요.', Object.keys(O.buySellStatus)) }, false);
    Object.assign(post, { status, updated_at: nowIso() });
    return [200, buySellOut(c.db, post, c.me)];
  }, AUTH);
  route('POST', '/buy-sell/{id}/like', (c) => {
    const post = findPost(c.db, 'buy_sell', c.params.id);
    const mine = (l) => l.user_id === c.me.id && l.post_id === post.id;
    const liked = !c.db.likes.some(mine);
    if (liked) c.db.likes.push({ user_id: c.me.id, post_id: post.id });
    else c.db.likes = c.db.likes.filter((l) => !mine(l));
    return [200, { liked, like_count: post.like_base + c.db.likes.filter((l) => l.post_id === post.id).length }];
  }, AUTH);

  // ===== /part-time-job =====
  const dayKeys = O.days.map((d) => d[0]);
  const jobSpec = {
    title: text('제목을 입력해 주세요.', 60),
    description: text('상세 내용을 입력해 주세요.', 2000),
    pay_type: oneOf('급여 종류를 선택해 주세요.', Object.keys(O.jobPayTypes)),
    pay: integer('급여를 입력해 주세요.', 1, MAX_PRICE, '급여는 1 이상의 숫자로 입력해 주세요.'),
    work_period: oneOf('근무 기간을 선택해 주세요.', Object.keys(O.jobPeriods)),
    work_days: {
      fallback: [],
      parse(v) {
        if (!Array.isArray(v) || v.some((d) => !dayKeys.includes(d))) fail(422, '근무 요일이 올바르지 않아요.');
        return dayKeys.filter((d) => v.includes(d));
      },
    },
    work_time: optionalText(30),
    job_category: oneOf('하는 일을 선택해 주세요.', O.jobCategories),
    company: optionalText(30),
    region: oneOf('', O.regions),
  };
  function filterJobs(db, query) {
    return db.part_time_job.filter((j) =>
      (!has(query.job_category) || j.job_category === query.job_category) &&
      (!has(query.work_period) || j.work_period === query.work_period) &&
      (!has(query.region) || j.region === query.region) &&
      (!has(query.author_id) || j.author_id === Number(query.author_id))).sort(byNewest);
  }
  const jobPage = (c, items) => {
    const page = paginate(items, c.query);
    page.items = page.items.map((j) => jobOut(c.db, j, c.me));
    return [200, page];
  };

  route('GET', '/part-time-job', (c) => jobPage(c, filterJobs(c.db, c.query)));
  route('GET', '/part-time-job/search', (c) => {
    const q = keyword(c.query);
    return jobPage(c, filterJobs(c.db, c.query).filter((j) => includes(q, j.title, j.description, j.company, j.job_category)));
  });
  route('GET', '/part-time-job/{id}', (c) => {
    const job = findPost(c.db, 'part_time_job', c.params.id);
    job.view_count += 1;
    c.touch();
    return [200, jobOut(c.db, job, c.me)];
  });
  route('POST', '/part-time-job', (c) => {
    const data = clean(c.body, jobSpec, false);
    const job = {
      id: nextId(c.db, 'part_time_job'), ...data, region: data.region || c.me.region,
      author_id: c.me.id, view_count: 0, created_at: nowIso(), updated_at: nowIso(),
    };
    c.db.part_time_job.push(job);
    return [201, jobOut(c.db, job, c.me)];
  }, AUTH);
  route('PATCH', '/part-time-job/{id}', (c) => {
    const job = findPost(c.db, 'part_time_job', c.params.id, c.me);
    Object.assign(job, clean(c.body, jobSpec, true), { updated_at: nowIso() });
    return [200, jobOut(c.db, job, c.me)];
  }, AUTH);
  route('DELETE', '/part-time-job/{id}', (c) => {
    findPost(c.db, 'part_time_job', c.params.id, c.me);
    removePost(c.db, 'part_time_job', c.params.id);
    c.db.applications = c.db.applications.filter((a) => a.job_id !== c.params.id);
    return [204, null];
  }, AUTH);
  route('POST', '/part-time-job/{id}/apply', (c) => {
    const job = findPost(c.db, 'part_time_job', c.params.id);
    if (job.author_id === c.me.id) fail(400, '내가 올린 공고에는 지원할 수 없어요.');
    if (c.db.applications.some((a) => a.job_id === job.id && a.user_id === c.me.id)) fail(409, '이미 지원한 공고예요.');
    const { message } = clean(c.body, { message: optionalText(500) }, false);
    const application = { id: nextId(c.db, 'applications'), job_id: job.id, user_id: c.me.id, message, created_at: nowIso() };
    c.db.applications.push(application);
    return [201, applicationOut(c.db, application)];
  }, AUTH);
  route('GET', '/part-time-job/{id}/applicants', (c) => {
    const job = findPost(c.db, 'part_time_job', c.params.id);
    if (job.author_id !== c.me.id) fail(403, '공고 작성자만 지원자를 볼 수 있어요.');
    const items = c.db.applications.filter((a) => a.job_id === job.id).sort(byNewest).map((a) => applicationOut(c.db, a));
    return [200, { items, total: items.length }];
  }, AUTH);

  // ===== /used-car =====
  const thisYear = new Date().getFullYear();
  const carSpec = {
    title: text('제목을 입력해 주세요.', 60),
    description: text('설명을 입력해 주세요.', 2000),
    price: integer('가격을 입력해 주세요.', 0, MAX_PRICE * 10, '가격은 0 이상의 숫자로 입력해 주세요.'),
    brand: oneOf('제조사를 선택해 주세요.', O.carBrands),
    year: integer('연식을 입력해 주세요.', 1980, thisYear + 1, `연식은 1980~${thisYear + 1} 사이로 입력해 주세요.`),
    mileage: integer('주행거리를 입력해 주세요.', 0, 2000000, '주행거리는 0 이상의 숫자로 입력해 주세요.'),
    fuel: oneOf('연료를 선택해 주세요.', Object.keys(O.carFuels)),
    region: oneOf('', O.regions),
    image_url: imageUrl,
  };
  function filterCars(db, query) {
    return db.used_car.filter((car) =>
      (!has(query.brand) || car.brand === query.brand) &&
      (!has(query.fuel) || car.fuel === query.fuel) &&
      (!has(query.region) || car.region === query.region) &&
      (!has(query.author_id) || car.author_id === Number(query.author_id)) &&
      (!has(query.min_year) || car.year >= Number(query.min_year)) &&
      (!has(query.max_year) || car.year <= Number(query.max_year)) &&
      (!has(query.max_mileage) || car.mileage <= Number(query.max_mileage)) &&
      (!has(query.min_price) || car.price >= Number(query.min_price)) &&
      (!has(query.max_price) || car.price <= Number(query.max_price))).sort(byNewest);
  }
  const carPage = (c, items) => {
    const page = paginate(items, c.query);
    page.items = page.items.map((car) => carOut(c.db, car));
    return [200, page];
  };

  route('GET', '/used-car', (c) => carPage(c, filterCars(c.db, c.query)));
  route('GET', '/used-car/search', (c) => {
    const q = keyword(c.query);
    return carPage(c, filterCars(c.db, c.query).filter((car) => includes(q, car.title, car.description, car.brand)));
  });
  route('GET', '/used-car/{id}', (c) => {
    const car = findPost(c.db, 'used_car', c.params.id);
    car.view_count += 1;
    c.touch();
    return [200, carOut(c.db, car)];
  });
  route('POST', '/used-car', (c) => {
    const data = clean(c.body, carSpec, false);
    const car = {
      id: nextId(c.db, 'used_car'), ...data, region: data.region || c.me.region,
      author_id: c.me.id, chat_base: 0, view_count: 0, created_at: nowIso(), updated_at: nowIso(),
    };
    c.db.used_car.push(car);
    return [201, carOut(c.db, car)];
  }, AUTH);
  route('PATCH', '/used-car/{id}', (c) => {
    const car = findPost(c.db, 'used_car', c.params.id, c.me);
    Object.assign(car, clean(c.body, carSpec, true), { updated_at: nowIso() });
    return [200, carOut(c.db, car)];
  }, AUTH);
  route('DELETE', '/used-car/{id}', (c) => {
    findPost(c.db, 'used_car', c.params.id, c.me);
    removePost(c.db, 'used_car', c.params.id);
    return [204, null];
  }, AUTH);

  // ===== /chat =====
  const REPLIES = ['네, 안녕하세요!', '아직 가능해요 :)', '언제 시간 괜찮으세요?', '네, 그때 뵐게요!', '감사합니다. 좋은 하루 보내세요!'];
  function scheduleAutoReply(roomId, partnerId) {
    if (!App.config.MOCK_AUTO_REPLY) return;
    setTimeout(() => {
      const db = load();
      const room = db.rooms.find((r) => r.id === roomId);
      if (!room || room.left.includes(partnerId)) return;
      const count = db.messages.filter((m) => m.room_id === roomId && m.sender_id === partnerId).length;
      pushMessage(db, room, partnerId, REPLIES[count % REPLIES.length]);
      save(db);
    }, 1500);
  }

  route('GET', '/chat/rooms', (c) => {
    const items = myRooms(c.db, c.me);
    return [200, { items, total: items.length }];
  }, AUTH);
  route('POST', '/chat/rooms', (c) => {
    const type = c.body.post_type;
    const postId = Number(c.body.post_id);
    if (!TABLES[type]) fail(422, '게시글 종류가 올바르지 않아요.');
    const post = findPost(c.db, TABLES[type], postId);
    if (post.author_id === c.me.id) fail(400, '내가 쓴 글에는 채팅을 걸 수 없어요.');
    let room = c.db.rooms.find((r) => r.post_type === type && r.post_id === postId && r.buyer_id === c.me.id);
    if (room) {
      room.left = room.left.filter((id) => id !== c.me.id);
      return [200, roomOut(c.db, room, c.me)];
    }
    room = { id: nextId(c.db, 'rooms'), post_type: type, post_id: postId, buyer_id: c.me.id, seller_id: post.author_id, left: [], last_read: {}, created_at: nowIso() };
    c.db.rooms.push(room);
    return [201, roomOut(c.db, room, c.me)];
  }, AUTH);
  route('GET', '/chat/rooms/{id}/messages', (c) => {
    const room = myRoom(c.db, c.params.id, c.me);
    const items = c.db.messages.filter((m) => m.room_id === room.id);
    return [200, { items, total: items.length }];
  }, AUTH);
  route('POST', '/chat/rooms/{id}/messages', (c) => {
    const room = myRoom(c.db, c.params.id, c.me);
    const { content } = clean(c.body, { content: text('메시지를 입력해 주세요.', 1000) }, false);
    const message = pushMessage(c.db, room, c.me.id, content);
    scheduleAutoReply(room.id, room.buyer_id === c.me.id ? room.seller_id : room.buyer_id);
    return [201, message];
  }, AUTH);
  route('PATCH', '/chat/rooms/{id}/read', (c) => {
    const room = myRoom(c.db, c.params.id, c.me);
    const last = c.db.messages.filter((m) => m.room_id === room.id).pop();
    room.last_read[c.me.id] = last ? last.id : 0;
    return [200, { unread_count: 0 }];
  }, AUTH);
  route('DELETE', '/chat/rooms/{id}', (c) => {
    const room = myRoom(c.db, c.params.id, c.me);
    room.left.push(c.me.id);
    // 두 사람 모두 나가면 방과 메시지를 지운다.
    if (room.left.includes(room.buyer_id) && room.left.includes(room.seller_id)) {
      c.db.rooms = c.db.rooms.filter((r) => r.id !== room.id);
      c.db.messages = c.db.messages.filter((m) => m.room_id !== room.id);
    }
    return [204, null];
  }, AUTH);
  route('GET', '/chat/search', (c) => {
    const q = keyword(c.query);
    const items = myRooms(c.db, c.me).filter((r) => includes(q, r.partner && r.partner.nickname, r.post && r.post.title, r.last_message));
    return [200, { items, total: items.length }];
  }, AUTH);

  /* ---------- 요청 처리 ---------- */
  function dispatch(method, path, query, body, token) {
    const db = load();
    let matched = null;
    let params = {};
    for (const r of routes) {
      if (r.method !== method) continue;
      const m = r.regex.exec(path);
      if (!m) continue;
      matched = r;
      r.keys.forEach((key, i) => { params[key] = Number(m[i + 1]); });
      break;
    }
    if (!matched) {
      const pathExists = routes.some((r) => r.regex.test(path));
      fail(pathExists ? 405 : 404, pathExists ? '허용되지 않는 요청이에요.' : '요청한 주소를 찾을 수 없어요.');
    }
    const tokenMatch = /^mock\.(\d+)$/.exec(token || '');
    const me = tokenMatch ? findUser(db, Number(tokenMatch[1])) || null : null;
    if (matched.auth && !me) fail(401, '로그인이 필요해요.');

    let dirty = method !== 'GET';
    const [status, data] = matched.handler({ db, params, query: query || {}, body: body || {}, me, touch: () => { dirty = true; } });
    if (dirty) save(db);
    return { status, data: data == null ? null : JSON.parse(JSON.stringify(data)) };
  }

  // api.js 가 부르는 입구. 실제 HTTP 처럼 { status, data } 를 비동기로 돌려준다.
  mock.handle = function (method, path, { query, body, token } = {}) {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          resolve(dispatch(method, path, query, body == null ? null : JSON.parse(JSON.stringify(body)), token));
        } catch (e) {
          if (e instanceof HttpError) resolve({ status: e.status, data: { detail: e.detail } });
          else {
            console.error(e);
            resolve({ status: 500, data: { detail: '서버에서 문제가 생겼어요.' } });
          }
        }
      }, App.config.MOCK_DELAY);
    });
  };
  mock.routes = routes.map((r) => `${r.method} ${r.regex.source}`);
})();
