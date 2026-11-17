# 프론트엔드

당근마켓 웹(daangn.com/kr)의 화면 구성을 따라 만든 프론트엔드다. 디자인 값은 루트의 [DESIGN.md](../DESIGN.md)(SEED 디자인 토큰)를 그대로 쓴다.
라우터·API 구성은 [description.md](../description.md)와 1:1로 맞췄다.

- 순수 HTML / CSS / JavaScript. 빌드 도구와 설치가 필요 없다.
- 백엔드가 없어도 브라우저 안의 **목(mock) 서버**로 모든 기능이 동작한다.
- 운영체제가 다크 모드이면 다크 테마로 보인다.

## 실행

`index.html`을 브라우저로 열면 된다. 정적 서버로 띄워도 된다.

```bash
cd frontend
python -m http.server 5500     # http://localhost:5500
```

체험용 계정: `demo@karrot.com` / `karrot1234` (목 모드에서만 있음)

목 데이터는 브라우저 localStorage(`karrot_mock_v1`)에 저장된다. 처음 상태로 되돌리려면 화면 맨 아래 **목 데이터 초기화**를 누른다.

## 실제 백엔드에 연결하기

[js/config.js](js/config.js)에서 두 값만 바꾼다.

```js
USE_MOCK: false,
API_BASE: 'http://localhost:8000',   // '/api/v1' 접두사를 쓰면 여기에 붙인다
```

- 요청은 `fetch(API_BASE + 경로)`로 보내고, 로그인 후에는 `Authorization: Bearer <access_token>` 헤더를 붙인다.
- 다른 주소(포트)에서 프론트를 열면 백엔드에 CORS 허용이 필요하다.

## 화면 주소

| 주소 | 화면 | 사용하는 API |
|---|---|---|
| `#/` | 홈 | `GET /buy-sell`, `GET /used-car`, `GET /part-time-job` |
| `#/buy-sell` | 중고거래 목록·검색·필터 | `GET /buy-sell`, `GET /buy-sell/search` |
| `#/buy-sell/:id` | 중고거래 상세 | `GET /buy-sell/{id}`, `POST /buy-sell/{id}/like`, `PATCH /buy-sell/{id}/status`, `DELETE /buy-sell/{id}`, `POST /chat/rooms` |
| `#/buy-sell/new`, `#/buy-sell/:id/edit` | 글쓰기, 수정 | `POST /buy-sell`, `PATCH /buy-sell/{id}` |
| `#/used-car` … | 중고차 (위와 같은 구성) | `/used-car` 6개 |
| `#/part-time-job` … | 알바 (상세에서 지원하기, 작성자는 지원자 목록) | `/part-time-job` 8개 |
| `#/chat`, `#/chat/:roomId` | 채팅 | `/chat` 7개 |
| `#/login`, `#/signup`, `#/users/me`, `#/users/:id` | 로그인, 회원가입, 내 프로필, 사용자 프로필 | `/users` 5개 |

description.md의 34개 API를 화면에서 모두 호출한다. 엔드포인트별 호출 함수는 [js/api.js](js/api.js)에 있다.

## 백엔드가 맞춰 줄 응답 형식

목 서버([js/mock/server.js](js/mock/server.js))가 기준 구현이다. 필드 이름은 snake_case.

- **목록**: `{ "items": [...], "total": 18, "page": 1, "size": 12 }` (쿼리 `page`, `size`). 배열만 내려와도 동작은 한다.
- **오류**: `{ "detail": "사람이 읽을 메시지" }` (FastAPI 기본 형식). 422 검증 오류의 배열 형식도 읽는다.
- **삭제**: `204 No Content`.
- **로그인·회원가입**: `{ "access_token": "...", "user": { ... } }`. `user`가 없으면 `GET /users/me`로 채운다.

| 자원 | 필드 |
|---|---|
| 사용자 | `id, nickname, region, manner_temp, created_at` (`/users/me`는 `email` 추가) |
| 중고거래 | `id, title, description, price, category, region, status(selling·reserved·sold), image_url, author, like_count, chat_count, view_count, liked, created_at, updated_at` |
| 중고차 | `id, title, description, price(원), brand, year, mileage(km), fuel(gasoline·diesel·lpg·hybrid·electric), region, image_url, author, chat_count, view_count, created_at` |
| 알바 | `id, title, description, pay_type(hourly·daily·monthly·per_task), pay, work_period(short·long), work_days(["mon",...]), work_time, job_category, company, region, author, applicant_count, applied, view_count, created_at` |
| 지원 | `id, job_id, user, message, created_at` |
| 채팅방 | `id, post_type(buy-sell·used-car·part-time-job), post_id, post{type,id,title,price,status,image_url}, partner, last_message, last_message_at, unread_count` |
| 메시지 | `id, room_id, sender_id, content, created_at` |

`author`, `partner`, `user`는 사용자 객체다. 카테고리·제조사·동네 등 선택지 목록은 [js/config.js](js/config.js)의 `App.options`에 있다.

목록 필터로 쓰는 쿼리(모두 선택):

- `/buy-sell`: `category, region, status, min_price, max_price, author_id`
- `/used-car`: `brand, fuel, region, min_year, max_year, max_mileage, min_price, max_price, author_id`
- `/part-time-job`: `job_category, work_period, region, author_id`
- 각 `/search`는 `q`와 위 필터를 함께 받는다. `/chat/search?q=`는 상대 닉네임·게시글 제목·마지막 메시지로 내 채팅방을 찾는다.

## 파일 구성

```
index.html
css/tokens.css       SEED 토큰 (색·간격·반경·글자·모션, 다크 모드 포함)
css/components.css   버튼, 칩, 배지, 매너온도, 입력, 스낵바, 다이얼로그 등
css/pages.css        헤더, 목록, 상세, 폼, 채팅 등 화면 레이아웃
js/config.js         설정(USE_MOCK, API_BASE)과 선택지
js/ui.js             HTML 템플릿(자동 이스케이프), 아이콘, 표시 형식, 카드
js/mock/seed.js      목 초기 데이터
js/mock/server.js    목 서버 (API 34개)
js/api.js            API 호출, 로그인 상태
js/components.js     헤더·푸터, 목록 화면 틀, 폼 조각
js/app.js            해시 라우터
js/pages/*.js        화면별 코드
```

## 참고

- 상품 사진은 실제 사진 대신 색 타일 + 이모지 이미지(data URI)를 쓴다. 사진 업로드 방식이 정해지기 전까지 글쓰기에서는 이미지 주소(URL)를 받는다.
- 로고와 아이콘은 직접 그린 단순한 모양이다. 당근마켓의 실제 로고 파일은 쓰지 않았다.
- 채팅은 3초마다 HTTP로 새 메시지를 확인한다(WebSocket 없음). 목 모드에서는 상대가 1.5초 뒤 자동으로 답장한다.
