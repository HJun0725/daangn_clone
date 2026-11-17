// 목 서버의 초기 데이터. 시간은 "지금"을 기준으로 만들어서 언제 열어도 최근 글처럼 보인다.
(function () {
  const App = (window.App = window.App || {});
  const mock = (App.mock = App.mock || {});

  // 데이터 구조를 바꾸면 이 숫자를 올린다. 저장된 데이터와 다르면 새로 만든다.
  mock.SEED_VERSION = 1;

  // 사진 대신 쓰는 자리 표시 이미지(색 타일 + 이모지). image_url 에 그대로 들어간다.
  const TINTS = ['#ffe8d6', '#e3f2fd', '#e8f5e9', '#fff8e1', '#f3e5f5', '#e0f2f1', '#fce4ec', '#eceff1'];
  function tile(emoji, index, wide) {
    const w = wide ? 640 : 480;
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="480" viewBox="0 0 ${w} 480">` +
      `<rect width="${w}" height="480" fill="${TINTS[index % TINTS.length]}"/>` +
      `<text x="50%" y="50%" font-size="190" text-anchor="middle" dominant-baseline="central" ` +
      `font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${emoji}</text></svg>`;
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  mock.seed = function () {
    const now = Date.now();
    const ago = (hours) => new Date(now - hours * 3600 * 1000).toISOString();

    const users = [
      ['demo@karrot.com', '당근이', '신당동', 36.5, 400],
      ['sindang@karrot.com', '신당동토박이', '신당동', 42.3, 900],
      ['yaksu@karrot.com', '약수역3번출구', '약수동', 50.3, 700],
      ['cheonggu@karrot.com', '청구동고양이', '청구동', 38.9, 300],
      ['hwanghak@karrot.com', '황학동만물상', '황학동', 61.2, 1200],
      ['geumho@karrot.com', '금호동카센터', '금호동', 45.0, 800],
      ['oksu@karrot.com', '옥수동사장님', '옥수동', 39.4, 500],
    ].map(([email, nickname, region, manner_temp, days], i) => ({
      id: i + 1, email, password: 'karrot1234', nickname, region, manner_temp, created_at: ago(days * 24),
    }));

    // [제목, 가격, 카테고리, 지역, 작성자, 몇 시간 전, 상태, 이모지, 관심, 조회, 설명]
    const buySell = [
      ['아이폰 14 프로 256GB 딥퍼플', 850000, '디지털기기', '신당동', 2, 0.3, 'selling', '📱', 12, 148,
        '작년 3월에 구매해서 케이스, 필름 붙이고 사용했어요.\n배터리 성능 89%이고 생활 기스 거의 없습니다.\n박스, 케이블 다 있어요. 신당역 직거래 원합니다.'],
      ['이케아 말름 서랍장 4단 화이트', 45000, '가구/인테리어', '약수동', 3, 1, 'selling', '🗄️', 5, 63,
        '이사 가면서 내놓아요. 사용감은 조금 있지만 튼튼합니다.\n직접 가져가셔야 해요. 엘리베이터 있습니다.'],
      ['다이슨 V10 무선청소기', 180000, '생활가전', '신당동', 5, 2, 'reserved', '🧹', 9, 120,
        '배터리 새로 교체한 지 3개월 됐어요. 헤드 3종, 거치대 포함입니다.'],
      ['닌텐도 스위치 OLED + 동물의 숲', 290000, '취미/게임/음반', '청구동', 4, 3, 'selling', '🎮', 21, 240,
        '화이트 모델이고 조이콘 쏠림 없습니다.\n동물의 숲 칩이랑 파우치 같이 드려요.'],
      ['원목 2인 식탁 세트 (의자 포함)', 70000, '가구/인테리어', '신당동', 1, 5, 'selling', '🪑', 4, 47,
        '2년 정도 사용한 원목 식탁이에요. 가로 80cm, 세로 60cm입니다.\n의자 2개 같이 드려요. 상판에 작은 찍힘이 하나 있습니다.'],
      ['유모차 나눔합니다', 0, '유아동', '금호동', 6, 7, 'selling', '🍼', 8, 96,
        '아이가 커서 나눔해요. 깨끗하게 세탁해 두었습니다.\n꼭 필요하신 분이 가져가시면 좋겠어요.'],
      ['캠핑 의자 2개 일괄', 30000, '스포츠/레저', '옥수동', 7, 9, 'selling', '⛺', 3, 51,
        '두 번 사용했어요. 수납 가방 포함입니다.'],
      ['맥북 에어 M2 13인치 미드나이트', 1150000, '디지털기기', '신당동', 3, 12, 'selling', '💻', 17, 310,
        '8GB / 256GB 모델입니다. 배터리 사이클 87회.\n풀박스이고 애플케어는 내년 2월까지 남아 있어요.'],
      ['해리포터 전집 1~7권', 35000, '도서', '황학동', 5, 20, 'selling', '📚', 6, 72,
        '개정판 전집입니다. 한 번 읽고 책장에 꽂아만 두었어요.'],
      ['에어팟 프로 2세대', 160000, '디지털기기', '약수동', 2, 26, 'sold', '🎧', 11, 204,
        'C타입 모델이에요. 이어팁 새것 2쌍 같이 드립니다.'],
      ['로드 자전거 입문용', 250000, '스포츠/레저', '신당동', 4, 30, 'selling', '🚲', 14, 187,
        '알루미늄 프레임, 시마노 클라리스 구동계입니다.\n키 170~180cm에 맞아요. 전조등, 후미등 포함.'],
      ['발뮤다 토스터기', 95000, '생활/주방', '청구동', 7, 48, 'selling', '🍞', 7, 88,
        '선물 받아서 몇 번 안 썼어요. 설명서, 계량컵 다 있습니다.'],
      ['고양이 캣타워 대형', 40000, '반려동물용품', '신당동', 4, 72, 'selling', '🐈', 5, 59,
        '높이 160cm 캣타워예요. 스크래처 부분은 사용감이 있습니다.'],
      ['나이키 덩크 로우 270', 85000, '남성패션/잡화', '한남동', 6, 96, 'selling', '👟', 9, 133,
        '세 번 신었습니다. 박스 있어요.'],
      ['LG 27인치 QHD 모니터', 120000, '디지털기기', '신당동', 1, 120, 'reserved', '🖥️', 6, 91,
        '27인치 QHD IPS 패널입니다. 불량 화소 없고 스탠드, 케이블 포함이에요.'],
      ['여성 울 코트 55 사이즈', 50000, '여성의류', '성수동', 2, 144, 'selling', '🧥', 4, 66,
        '드라이클리닝 해 두었어요. 카멜 색상입니다.'],
      ['전자레인지 나눔', 0, '생활가전', '황학동', 5, 192, 'sold', '📦', 13, 221,
        '작동 잘 됩니다. 가져가실 분께 드려요.'],
      ['통기타 입문용', 60000, '취미/게임/음반', '금호동', 3, 240, 'selling', '🎸', 3, 54,
        '입문용으로 샀다가 거의 안 쳤어요. 케이스, 카포 포함입니다.'],
    ].map(([title, price, category, region, author_id, hours, status, emoji, like_base, view_count, description], i) => ({
      id: i + 1, title, description, price, category, region, status, image_url: tile(emoji, i),
      author_id, like_base, chat_base: Math.floor(like_base / 3), view_count, created_at: ago(hours), updated_at: ago(hours),
    }));

    // [제목, 가격(원), 제조사, 연식, 주행거리(km), 연료, 지역, 작성자, 몇 시간 전, 조회, 설명]
    const usedCar = [
      ['현대 아반떼 CN7 1.6 인스퍼레이션', 18900000, '현대', 2021, 32000, 'gasoline', '신당동', 6, 2, 420,
        '1인 소유, 무사고 차량입니다.\n정비 이력 모두 있고 타이어는 올해 교체했어요.\n시운전 가능합니다.'],
      ['기아 모닝 어반 프레스티지', 6800000, '기아', 2019, 58000, 'gasoline', '약수동', 2, 6, 388,
        '출퇴근용으로 탔어요. 단순 교환 1건(뒷범퍼) 있습니다.'],
      ['제네시스 G80 2.5T AWD', 43500000, '제네시스', 2022, 21000, 'gasoline', '금호동', 6, 11, 512,
        '파노라마 선루프, 드라이빙 어시스턴스 패키지 포함. 무사고입니다.'],
      ['테슬라 모델 3 롱레인지', 37000000, '테슬라', 2021, 45000, 'electric', '한남동', 7, 20, 640,
        '배터리 상태 좋습니다. 오토파일럿 기본 포함, 윈터 타이어 같이 드려요.'],
      ['쉐보레 스파크 LT', 5200000, '쉐보레', 2017, 89000, 'gasoline', '황학동', 5, 30, 275,
        '첫 차로 추천합니다. 엔진오일, 배터리 최근 교체했어요.'],
      ['기아 쏘렌토 MQ4 하이브리드', 32800000, '기아', 2022, 28000, 'hybrid', '옥수동', 7, 50, 498,
        '7인승 시그니처 트림입니다. 가족용으로 깨끗하게 탔어요.'],
      ['BMW 320d M 스포츠', 29500000, 'BMW', 2019, 67000, 'diesel', '성수동', 3, 75, 455,
        '공식 서비스센터에서만 정비했습니다. 보증 연장 가능해요.'],
      ['현대 그랜저 IG 2.4 프리미엄', 16500000, '현대', 2018, 92000, 'gasoline', '신당동', 1, 100, 301,
        '부모님이 타시던 차입니다. 무사고, 실내 깨끗해요.\n신당역 근처에서 보실 수 있어요.'],
      ['르노 QM6 LPe', 14800000, '르노', 2020, 51000, 'lpg', '청구동', 4, 150, 233,
        'LPG라 유지비가 적게 들어요. 블랙박스, 하이패스 포함입니다.'],
      ['벤츠 E250 아방가르드', 48000000, '벤츠', 2021, 38000, 'gasoline', '한남동', 2, 200, 587,
        '보증 기간 남아 있습니다. 무사고, 비흡연 차량이에요.'],
    ].map(([title, price, brand, year, mileage, fuel, region, author_id, hours, view_count, description], i) => ({
      id: i + 1, title, description, price, brand, year, mileage, fuel, region,
      image_url: tile(['🚗', '🚙', '🚘'][i % 3], i + 1, true),
      author_id, chat_base: (i * 3) % 7, view_count, created_at: ago(hours), updated_at: ago(hours),
    }));

    // [제목, 급여 종류, 급여, 근무 기간, 요일, 시간, 하는 일, 상호, 지역, 작성자, 몇 시간 전, 설명]
    const partTimeJob = [
      ['주말 카페 바리스타 구해요', 'hourly', 11000, 'long', ['sat', 'sun'], '10:00 ~ 18:00', '카페/베이커리', '카페 온도', '신당동', 2, 1,
        '주말 이틀 함께 일하실 분을 찾아요.\n에스프레소 머신 경험이 있으면 좋지만 없어도 알려 드립니다.\n식사 제공, 음료 무료예요.'],
      ['평일 점심 홀서빙', 'hourly', 12000, 'long', ['mon', 'tue', 'wed', 'thu', 'fri'], '11:00 ~ 15:00', '서빙', '신당 칼국수', '신당동', 5, 4,
        '점심 피크 시간에 홀 서빙을 도와주실 분 구합니다. 점심 식사 제공해요.'],
      ['이삿짐 운반 도와주실 분 (당일)', 'daily', 150000, 'short', ['sat'], '09:00 ~ 15:00', '배달/운반', '', '약수동', 3, 8,
        '원룸 이사입니다. 박스 20개 정도와 작은 가구 몇 개예요. 엘리베이터 있습니다.'],
      ['편의점 주말 야간', 'hourly', 11500, 'long', ['fri', 'sat'], '22:00 ~ 06:00', '편의점', 'CU 청구역점', '청구동', 4, 15,
        '야간 근무 경험자 우대합니다. 주휴수당 지급해요.'],
      ['반찬가게 주방 보조', 'hourly', 12500, 'long', ['mon', 'wed', 'fri'], '08:00 ~ 13:00', '주방', '엄마손 반찬', '황학동', 5, 26,
        '재료 손질과 포장을 도와주시면 됩니다. 오래 함께하실 분 환영해요.'],
      ['강아지 산책 시켜주실 분', 'per_task', 15000, 'short', ['tue', 'thu'], '17:00 ~ 18:00', '돌봄', '', '옥수동', 7, 40,
        '5살 말티즈예요. 한 시간 정도 동네 산책을 부탁드려요.'],
      ['사무실 청소 주 2회', 'per_task', 50000, 'long', ['tue', 'fri'], '19:00 ~ 21:00', '청소', '금호 세무회계', '금호동', 6, 60,
        '20평 사무실 청소입니다. 청소 도구는 모두 준비되어 있어요.'],
      ['베이커리 오픈 직원 (정직원)', 'monthly', 2500000, 'long', ['mon', 'tue', 'wed', 'thu', 'fri'], '06:00 ~ 15:00', '카페/베이커리', '밀도 베이커리', '성수동', 3, 80,
        '오픈 준비와 빵 진열, 판매를 맡아 주실 분을 찾습니다. 4대 보험 가입.'],
      ['전단지 배포 단기 알바', 'hourly', 12000, 'short', ['mon', 'tue', 'wed', 'thu', 'fri'], '14:00 ~ 18:00', '기타', '당근이네 분식', '신당동', 1, 30,
        '가게 오픈 기념 전단지를 신당역 주변에 배포해 주실 분을 구해요.\n일주일만 근무하시면 됩니다.'],
      ['옷가게 판매 스태프', 'hourly', 11000, 'long', ['thu', 'fri', 'sat', 'sun'], '13:00 ~ 21:00', '매장관리/판매', '한남 편집숍', '한남동', 2, 110,
        '손님 응대와 매장 정리를 함께하실 분. 옷을 좋아하시면 더 좋아요.'],
      ['엑셀 자료 정리 사무보조', 'hourly', 13000, 'short', ['mon', 'tue', 'wed'], '10:00 ~ 17:00', '사무보조', '금호 세무회계', '금호동', 6, 170,
        '2주 동안 영수증 자료를 엑셀로 정리하는 일입니다.'],
    ].map(([title, pay_type, pay, work_period, work_days, work_time, job_category, company, region, author_id, hours, description], i) => ({
      id: i + 1, title, description, pay_type, pay, work_period, work_days, work_time, job_category, company, region,
      author_id, view_count: 40 + i * 13, created_at: ago(hours), updated_at: ago(hours),
    }));

    const applications = [
      { id: 1, job_id: 9, user_id: 4, message: '안녕하세요! 평일 오후 시간 모두 가능합니다. 신당역 근처에 살아요.', created_at: ago(20) },
      { id: 2, job_id: 9, user_id: 7, message: '전단지 배포 경험 있습니다. 성실하게 하겠습니다.', created_at: ago(9) },
      { id: 3, job_id: 1, user_id: 1, message: '카페에서 6개월 일한 경험이 있어요. 주말 모두 가능합니다.', created_at: ago(0.5) },
    ];

    // 채팅방: buyer 는 채팅을 건 사람, seller 는 게시글 작성자
    const rooms = [
      { id: 1, post_type: 'buy-sell', post_id: 8, buyer_id: 1, seller_id: 3, left: [], last_read: { 1: 3, 3: 4 }, created_at: ago(6) },
      { id: 2, post_type: 'used-car', post_id: 1, buyer_id: 1, seller_id: 6, left: [], last_read: { 1: 7, 6: 7 }, created_at: ago(30) },
      { id: 3, post_type: 'buy-sell', post_id: 5, buyer_id: 4, seller_id: 1, left: [], last_read: { 1: 0, 4: 9 }, created_at: ago(2) },
    ];
    const messages = [
      [1, 1, '안녕하세요! 맥북 아직 판매 중인가요?', 6],
      [1, 3, '네, 판매 중이에요 :)', 5.8],
      [1, 1, '배터리 사이클이 어떻게 되나요?', 5.5],
      [1, 3, '87회예요. 약수역에서 직거래 가능합니다.', 0.4],
      [2, 1, '안녕하세요, 아반떼 시운전 가능할까요?', 30],
      [2, 6, '네 가능합니다. 주말 오전 어떠세요?', 29],
      [2, 1, '토요일 10시에 뵐게요!', 28.5],
      [3, 4, '안녕하세요, 식탁 사이즈가 어떻게 되나요?', 2],
      [3, 4, '오늘 저녁에 보러 가도 될까요?', 1.9],
    ].map(([room_id, sender_id, content, hours], i) => ({ id: i + 1, room_id, sender_id, content, created_at: ago(hours) }));

    return {
      version: mock.SEED_VERSION,
      seq: {
        users: users.length, buy_sell: buySell.length, used_car: usedCar.length, part_time_job: partTimeJob.length,
        applications: applications.length, rooms: rooms.length, messages: messages.length,
      },
      users,
      buy_sell: buySell,
      likes: [{ user_id: 1, post_id: 4 }, { user_id: 1, post_id: 8 }],
      used_car: usedCar,
      part_time_job: partTimeJob,
      applications,
      rooms,
      messages,
    };
  };

  mock.tile = tile;
})();
