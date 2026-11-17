// 실행 설정. 백엔드가 준비되면 USE_MOCK 을 false 로 바꾸고 API_BASE 를 서버 주소로 맞춘다.
window.App = window.App || {};

App.config = {
  // true: 브라우저 안의 목(mock) 서버 사용 (js/mock/server.js, 데이터는 localStorage 에 저장)
  // false: API_BASE 의 실제 백엔드로 fetch 요청
  USE_MOCK: true,

  // 실제 백엔드 주소. '/api/v1' 접두사를 쓰기로 하면 여기에 붙인다. 예: 'http://localhost:8000/api/v1'
  API_BASE: 'http://localhost:8000',

  // 목록 한 페이지 크기
  PAGE_SIZE: 12,

  // 채팅 화면이 새 메시지를 확인하는 주기(ms). 실시간(WebSocket) 없이 HTTP 로만 동작한다.
  CHAT_POLL_MS: 3000,

  // 목 서버 전용: 응답 지연(ms), 상대방 자동 답장
  MOCK_DELAY: 120,
  MOCK_AUTO_REPLY: true,
};

// 화면과 목 서버가 함께 쓰는 선택지
App.options = {
  regions: ['신당동', '약수동', '청구동', '황학동', '금호동', '옥수동', '한남동', '성수동'],
  regionPrefix: '서울특별시',

  buySellCategories: [
    '디지털기기', '생활가전', '가구/인테리어', '생활/주방', '유아동', '여성의류',
    '남성패션/잡화', '뷰티/미용', '스포츠/레저', '취미/게임/음반', '도서', '반려동물용품', '기타 중고물품',
  ],
  buySellStatus: { selling: '판매중', reserved: '예약중', sold: '거래완료' },

  carBrands: ['현대', '기아', '제네시스', '쉐보레', '르노', 'KG모빌리티', 'BMW', '벤츠', '아우디', '테슬라', '기타'],
  carFuels: { gasoline: '가솔린', diesel: '디젤', lpg: 'LPG', hybrid: '하이브리드', electric: '전기' },

  jobCategories: ['서빙', '주방', '카페/베이커리', '매장관리/판매', '편의점', '배달/운반', '청소', '돌봄', '사무보조', '기타'],
  jobPayTypes: { hourly: '시급', daily: '일급', monthly: '월급', per_task: '건당' },
  jobPeriods: { short: '단기', long: '1개월 이상' },
  days: [['mon', '월'], ['tue', '화'], ['wed', '수'], ['thu', '목'], ['fri', '금'], ['sat', '토'], ['sun', '일']],
};
