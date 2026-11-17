// API 계층. 화면은 여기 있는 함수만 부른다. 경로는 description.md 의 라우터·API 표와 1:1 로 맞춘다.
(function () {
  const App = (window.App = window.App || {});

  /* ---------- 로그인 상태 ---------- */
  const SESSION_KEY = 'karrot_session';
  const REGION_KEY = 'karrot_region';
  const store = {
    get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* 저장소를 못 쓰는 환경 */ } },
    remove(key) { try { localStorage.removeItem(key); } catch (e) { /* 저장소를 못 쓰는 환경 */ } },
  };

  App.session = {
    token: null,
    user: null,
    load() {
      try {
        const saved = JSON.parse(store.get(SESSION_KEY));
        if (saved && typeof saved.token === 'string') {
          this.token = saved.token;
          this.user = saved.user || null;
        }
      } catch (e) { /* 저장된 값이 깨졌으면 로그아웃 상태로 시작 */ }
    },
    set(token, user) {
      this.token = token;
      this.user = user;
      store.set(SESSION_KEY, JSON.stringify({ token, user }));
    },
    setUser(user) { this.set(this.token, user); },
    clear() {
      this.token = null;
      this.user = null;
      store.remove(SESSION_KEY);
    },
  };

  // 홈 검색창에서 고른 동네
  App.state = {
    region() {
      const saved = store.get(REGION_KEY);
      if (saved && App.options.regions.includes(saved)) return saved;
      const user = App.session.user;
      return user && App.options.regions.includes(user.region) ? user.region : App.options.regions[0];
    },
    setRegion(region) { store.set(REGION_KEY, region); },
  };

  /* ---------- 요청 ---------- */
  class ApiError extends Error {
    constructor(status, detail) {
      super(detail);
      this.name = 'ApiError';
      this.status = status;
      this.detail = detail;
    }
  }
  App.ApiError = ApiError;

  const FALLBACK = {
    0: '서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.',
    401: '로그인이 필요해요.',
    403: '권한이 없어요.',
    404: '찾을 수 없어요.',
  };
  // 오류 응답에서 사람이 읽을 문장을 꺼낸다. { detail: "..." } 와 FastAPI 검증 오류({ detail: [{ msg }] }) 모두 받는다.
  function detailOf(status, data) {
    const detail = data && data.detail;
    if (typeof detail === 'string' && detail) return detail;
    if (Array.isArray(detail) && detail.length) {
      return detail.map((d) => (d && d.msg ? d.msg : String(d))).join('\n');
    }
    return FALLBACK[status] || '요청을 처리하지 못했어요.';
  }
  function cleanQuery(query) {
    const out = {};
    Object.entries(query || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') out[key] = String(value);
    });
    return out;
  }

  async function request(method, path, { query, body } = {}) {
    const token = App.session.token;
    const q = cleanQuery(query);
    let status;
    let data;

    if (App.config.USE_MOCK) {
      ({ status, data } = await App.mock.handle(method, path, { query: q, body, token }));
    } else {
      const qs = new URLSearchParams(q).toString();
      const url = App.config.API_BASE.replace(/\/+$/, '') + path + (qs ? `?${qs}` : '');
      const headers = { Accept: 'application/json' };
      if (body !== undefined) headers['Content-Type'] = 'application/json';
      if (token) headers.Authorization = `Bearer ${token}`;
      let res;
      try {
        res = await fetch(url, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
      } catch (e) {
        throw new ApiError(0, FALLBACK[0]);
      }
      status = res.status;
      data = status === 204 ? null : await res.json().catch(() => null);
    }

    if (status >= 400) {
      // 토큰이 만료됐거나 틀렸으면 로그아웃 상태로 돌린다.
      if (status === 401 && token) App.session.clear();
      throw new ApiError(status, detailOf(status, data));
    }
    return data;
  }

  // 목록 응답은 { items, total, page, size } 가 기준이다. 배열만 내려와도 화면이 돌도록 맞춰 준다.
  function asList(data) {
    if (Array.isArray(data)) return { items: data, total: null };
    return { ...data, items: (data && data.items) || [], total: data && typeof data.total === 'number' ? data.total : null };
  }
  const list = (path, query) => request('GET', path, { query }).then(asList);

  // 로그인·회원가입 응답에서 토큰을 꺼내 저장한다. user 가 없으면 GET /users/me 로 채운다.
  async function startSession(data) {
    if (!data || !data.access_token) return false;
    App.session.set(data.access_token, data.user || null);
    if (!data.user) App.session.setUser(await request('GET', '/users/me'));
    return true;
  }

  /* ---------- 엔드포인트 ---------- */
  App.api = {
    request,

    users: {
      // POST /users/signup  → 가입 후 바로 로그인 상태가 된다(응답에 토큰이 없으면 로그인 API 를 한 번 더 부른다).
      async signup(body) {
        const data = await request('POST', '/users/signup', { body });
        if (!(await startSession(data))) await App.api.users.login({ email: body.email, password: body.password });
        return App.session.user;
      },
      // POST /users/login
      async login(body) {
        const data = await request('POST', '/users/login', { body });
        if (!(await startSession(data))) throw new ApiError(500, '로그인 응답에 access_token 이 없어요.');
        return App.session.user;
      },
      // GET /users/me
      async me() {
        const user = await request('GET', '/users/me');
        App.session.setUser(user);
        return user;
      },
      // PATCH /users/me
      async updateMe(body) {
        const user = await request('PATCH', '/users/me', { body });
        App.session.setUser(user);
        return user;
      },
      // GET /users/{id}
      get: (id) => request('GET', `/users/${id}`),
    },

    buySell: {
      list: (query) => list('/buy-sell', query),                                   // GET /buy-sell
      search: (query) => list('/buy-sell/search', query),                          // GET /buy-sell/search?q=
      get: (id) => request('GET', `/buy-sell/${id}`),                              // GET /buy-sell/{id}
      create: (body) => request('POST', '/buy-sell', { body }),                    // POST /buy-sell
      update: (id, body) => request('PATCH', `/buy-sell/${id}`, { body }),         // PATCH /buy-sell/{id}
      remove: (id) => request('DELETE', `/buy-sell/${id}`),                        // DELETE /buy-sell/{id}
      setStatus: (id, status) => request('PATCH', `/buy-sell/${id}/status`, { body: { status } }), // PATCH /buy-sell/{id}/status
      toggleLike: (id) => request('POST', `/buy-sell/${id}/like`),                 // POST /buy-sell/{id}/like
    },

    partTimeJob: {
      list: (query) => list('/part-time-job', query),                              // GET /part-time-job
      search: (query) => list('/part-time-job/search', query),                     // GET /part-time-job/search?q=
      get: (id) => request('GET', `/part-time-job/${id}`),                         // GET /part-time-job/{id}
      create: (body) => request('POST', '/part-time-job', { body }),               // POST /part-time-job
      update: (id, body) => request('PATCH', `/part-time-job/${id}`, { body }),    // PATCH /part-time-job/{id}
      remove: (id) => request('DELETE', `/part-time-job/${id}`),                   // DELETE /part-time-job/{id}
      apply: (id, message) => request('POST', `/part-time-job/${id}/apply`, { body: { message } }), // POST /part-time-job/{id}/apply
      applicants: (id) => list(`/part-time-job/${id}/applicants`),                 // GET /part-time-job/{id}/applicants
    },

    usedCar: {
      list: (query) => list('/used-car', query),                                   // GET /used-car
      search: (query) => list('/used-car/search', query),                          // GET /used-car/search?q=
      get: (id) => request('GET', `/used-car/${id}`),                              // GET /used-car/{id}
      create: (body) => request('POST', '/used-car', { body }),                    // POST /used-car
      update: (id, body) => request('PATCH', `/used-car/${id}`, { body }),         // PATCH /used-car/{id}
      remove: (id) => request('DELETE', `/used-car/${id}`),                        // DELETE /used-car/{id}
    },

    chat: {
      rooms: () => list('/chat/rooms'),                                            // GET /chat/rooms
      createRoom: (postType, postId) => request('POST', '/chat/rooms', { body: { post_type: postType, post_id: postId } }), // POST /chat/rooms
      messages: (roomId) => list(`/chat/rooms/${roomId}/messages`),                // GET /chat/rooms/{id}/messages
      send: (roomId, content) => request('POST', `/chat/rooms/${roomId}/messages`, { body: { content } }), // POST /chat/rooms/{id}/messages
      read: (roomId) => request('PATCH', `/chat/rooms/${roomId}/read`),            // PATCH /chat/rooms/{id}/read
      leave: (roomId) => request('DELETE', `/chat/rooms/${roomId}`),               // DELETE /chat/rooms/{id}
      search: (q) => list('/chat/search', { q }),                                  // GET /chat/search?q=
    },
  };
})();
