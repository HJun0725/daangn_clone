// 채팅 (/chat): 채팅방 목록·검색, 메시지 보기·보내기, 읽음 처리, 나가기
// 실시간(WebSocket) 없이 CHAT_POLL_MS 마다 HTTP 로 새 메시지를 확인한다.
(function () {
  const App = window.App;
  const ui = App.ui;
  const { html, icon, fmt } = ui;
  const O = App.options;
  const api = () => App.api.chat;

  const postPrice = (post) => {
    if (!post) return '';
    if (post.type === 'used-car') return fmt.carPrice(post.price);
    if (post.type === 'part-time-job') return `${O.jobPayTypes[post.pay_type] || ''} ${fmt.num(post.price)}원`;
    return fmt.won(post.price);
  };
  const postLabel = { 'buy-sell': '중고거래', 'used-car': '중고차', 'part-time-job': '알바' };
  const dayKey = (iso) => new Date(iso).toDateString();

  function roomItem(r, selectedId) {
    return html`<li>
      <a class="room ${r.id === selectedId ? 'is-selected' : ''}" href="#/chat/${r.id}"${r.id === selectedId ? ui.raw(' aria-current="true"') : ''}>
        ${ui.avatar(r.partner)}
        <div class="room__body">
          <p class="room__top">
            <span class="room__name">${r.partner ? r.partner.nickname : '알 수 없음'}</span>
            <span class="room__meta">${r.partner ? r.partner.region : ''} · ${fmt.timeAgo(r.last_message_at)}</span>
          </p>
          <p class="room__last">${r.last_message || '대화를 시작해 보세요'}</p>
        </div>
        ${r.unread_count ? html`<span class="noti-badge">${r.unread_count}<span class="sr-only">개 안 읽음</span></span>` : ''}
        ${r.post ? ui.thumb(r.post.image_url, '', 16) : ''}
      </a>
    </li>`;
  }

  function messageList(items, myId) {
    let lastDay = '';
    return items.map((m) => {
      const day = dayKey(m.created_at);
      const divider = day !== lastDay ? html`<p class="msg-date">${fmt.date(m.created_at)}</p>` : '';
      lastDay = day;
      const mine = m.sender_id === myId;
      return html`${divider}<div class="msg ${mine ? 'msg--mine' : ''}">
        <p class="msg__bubble">${m.content}</p>
        <time class="msg__time" datetime="${m.created_at}">${fmt.clock(m.created_at)}</time>
      </div>`;
    });
  }

  async function renderChat(ctx) {
    if (!App.actions.requireLogin()) return;
    const roomId = ctx.params.roomId ? Number(ctx.params.roomId) : null;
    const me = App.session.user || {};
    let keyword = '';

    const roomsData = await api().rooms();
    if (!ctx.isCurrent()) return;
    let rooms = roomsData.items;
    let room = roomId ? rooms.find((r) => r.id === roomId) : null;
    if (roomId && !room) {
      ui.toast('채팅방을 찾을 수 없어요');
      App.nav.go('/chat');
      return;
    }
    let messages = [];
    if (room) {
      messages = (await api().messages(room.id)).items;
      await api().read(room.id).catch(() => null);
      room.unread_count = 0;
      if (!ctx.isCurrent()) return;
    }
    ctx.title = room ? `${room.partner ? room.partner.nickname : ''}님과의 채팅` : '채팅';

    ctx.root.innerHTML = html`
      <div class="container">
        <h1 class="sr-only">채팅</h1>
        <div class="chat ${room ? 'has-room' : ''}">
          <aside class="chat__side" aria-label="채팅방 목록">
            <div class="chat__side-head">
              <h2 class="chat__side-title">채팅</h2>
              <label class="chat-search">${icon('search', 18)}
                <input class="input input--medium" type="search" placeholder="닉네임, 게시글 제목 검색" aria-label="채팅방 검색" data-room-search maxlength="30">
              </label>
            </div>
            <ul class="room-list" data-rooms></ul>
          </aside>
          <section class="chat__main" aria-label="대화">
            ${room ? html`
              <header class="chat__head">
                <a class="icon-btn chat__back" href="#/chat" aria-label="채팅 목록으로">${icon('chevron-left', 24)}</a>
                <a href="#/users/${room.partner ? room.partner.id : ''}" class="chat__head-name">${room.partner ? room.partner.nickname : '알 수 없음'}</a>
                ${room.partner && room.partner.manner_temp != null ? ui.mannerBadge(room.partner.manner_temp) : ''}
                <span class="spacer"></span>
                <button type="button" class="btn btn--small btn--ghost pressable" data-leave>${icon('logout', 18)}나가기</button>
              </header>
              ${room.post ? html`<a class="chat-post" href="#/${room.post.type}/${room.post.id}">
                ${ui.thumb(room.post.image_url, '', 20)}
                <div class="chat-post__body">
                  <p class="chat-post__title"><span class="badge">${postLabel[room.post.type] || ''}</span>${ui.statusBadge(room.post.status)}${room.post.title}</p>
                  <p class="chat-post__price">${postPrice(room.post)}</p>
                </div>
                ${icon('chevron-right', 20)}
              </a>` : html`<p class="chat-post">삭제된 게시글이에요.</p>`}
              <div class="messages" data-messages aria-live="polite"></div>
              <form class="composer" data-composer>
                <input class="input input--medium" name="content" placeholder="메시지 보내기" aria-label="메시지" autocomplete="off" maxlength="1000">
                <button class="icon-btn" type="submit" aria-label="보내기" disabled>${icon('send', 24)}</button>
              </form>
            ` : html`<div class="chat__placeholder">${ui.empty(
              rooms.length ? '채팅할 상대를 선택해 주세요' : '아직 채팅이 없어요',
              rooms.length ? '왼쪽 목록에서 대화를 고르면 여기에 보여요.' : '관심 있는 물건에서 "채팅하기"를 눌러 보세요.',
              rooms.length ? '' : html`<a class="btn btn--neutral-weak pressable" href="#/buy-sell">중고거래 둘러보기</a>`)}</div>`}
          </section>
        </div>
      </div>`.s;

    const root = ctx.root;
    const roomsEl = root.querySelector('[data-rooms]');
    const msgsEl = root.querySelector('[data-messages]');

    const drawRooms = (list) => {
      roomsEl.innerHTML = list.length
        ? list.map((r) => roomItem(r, roomId).s).join('')
        : html`<li>${ui.empty(keyword ? `'${keyword}' 검색 결과가 없어요` : '채팅방이 없어요')}</li>`.s;
    };
    const updateUnread = () => App.layout.setUnread(rooms.reduce((sum, r) => sum + (r.unread_count || 0), 0));
    const drawMessages = () => {
      if (!msgsEl) return;
      const nearBottom = msgsEl.scrollHeight - msgsEl.scrollTop - msgsEl.clientHeight < 80;
      msgsEl.innerHTML = messages.length
        ? messageList(messages, me.id).map(String).join('')
        : html`<p class="msg-date">첫 메시지를 보내 보세요</p>`.s;
      if (nearBottom || !drawMessages.done) msgsEl.scrollTop = msgsEl.scrollHeight;
      drawMessages.done = true;
    };
    drawRooms(rooms);
    drawMessages();
    updateUnread();

    // 방 검색: GET /chat/search?q=
    let searchTimer;
    const runSearch = async () => {
      try {
        const list = keyword ? (await api().search(keyword)).items : rooms;
        if (ctx.isCurrent()) drawRooms(list);
      } catch (err) { App.actions.showError(err); }
    };
    root.querySelector('[data-room-search]').addEventListener('input', (e) => {
      keyword = e.target.value.trim();
      clearTimeout(searchTimer);
      searchTimer = setTimeout(runSearch, 250);
    });

    // 메시지 보내기: POST /chat/rooms/{id}/messages
    const composer = root.querySelector('[data-composer]');
    if (composer) {
      const input = composer.content;
      const sendBtn = composer.querySelector('[type=submit]');
      input.addEventListener('input', () => { sendBtn.disabled = !input.value.trim(); });
      composer.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = input.value.trim();
        if (!content) return;
        input.value = '';
        sendBtn.disabled = true;
        try {
          const msg = await api().send(room.id, content);
          messages.push(msg);
          drawMessages.done = false;
          drawMessages();
        } catch (err) {
          input.value = content;
          sendBtn.disabled = false;
          App.actions.showError(err);
        }
        input.focus();
      });
      if (window.matchMedia('(pointer: fine)').matches) input.focus();
    }

    // 나가기: DELETE /chat/rooms/{id}
    ui.on(root, 'click', '[data-leave]', async () => {
      const ok = await ui.dialog({
        title: '채팅방을 나갈까요?', desc: '나가면 대화 내용이 목록에서 사라져요.',
        confirmLabel: '나가기', variant: 'critical-solid',
      });
      if (!ok) return;
      try {
        await api().leave(room.id);
        ui.toast('채팅방을 나갔어요');
        App.nav.go('/chat');
      } catch (err) { App.actions.showError(err); }
    });

    // 주기적으로 새 메시지와 방 목록을 확인한다.
    let busy = false;
    const timer = setInterval(async () => {
      if (busy || document.hidden || !ctx.isCurrent()) return;
      busy = true;
      try {
        const [nextRooms, nextMsgs] = await Promise.all([
          api().rooms(),
          room ? api().messages(room.id) : Promise.resolve(null),
        ]);
        if (!ctx.isCurrent()) return;
        if (nextMsgs && nextMsgs.items.length !== messages.length) {
          messages = nextMsgs.items;
          drawMessages();
          await api().read(room.id).catch(() => null);
        }
        rooms = nextRooms.items.map((r) => (room && r.id === room.id ? { ...r, unread_count: 0 } : r));
        if (!keyword) drawRooms(rooms);
        updateUnread();
      } catch (err) {
        if (err.status === 401) App.actions.showError(err);
      } finally {
        busy = false;
      }
    }, App.config.CHAT_POLL_MS);
    ctx.onLeave(() => { clearInterval(timer); clearTimeout(searchTimer); });
  }

  App.route('/chat', renderChat);
  App.route('/chat/:roomId', renderChat);
})();
