---
name: social-search
description: 인스타그램·트위터(X)·레딧·틱톡에서 키워드로 게시물을 찾아 플랫폼별로 정리한다. "인스타/트위터/레딧/틱톡에서 찾아줘", "SNS 반응 알아봐", "social search" 요청 때 사용. Reddit·X·Instagram은 공식 API 스크립트를 먼저 쓰고, 안 되면 Xpoz 커넥터, 그다음 웹 검색으로 내려간다.
---

# social-search

4개 플랫폼(Instagram, X, Reddit, TikTok)을 한 번에 검색한다. 크레딧을 아끼려고 **플랫폼마다 공식 무료·저가 경로를 먼저** 쓰고, 안 되면 다음 경로로 내려간다.

| 플랫폼 | 1순위 (직접) | 2순위 | 3순위 |
|---|---|---|---|
| Reddit | `reddit_search.py` (공식 OAuth, 무료) | Xpoz | — |
| X | `x_search.py` (공식 API, 사용량 과금) | Xpoz | 웹 검색 |
| Instagram | `ig_search.py` (Graph API, 무료) | Xpoz | 웹 검색 |
| TikTok | Xpoz | 웹 검색 | — |

시작할 때 플랫폼별로 어느 경로를 쓰는지 한 줄로 말한다. 4개 플랫폼은 한 메시지에서 병렬로 실행한다.

## 0. 스크립트 공통

스크립트는 `.claude/skills/social-search/scripts/`에 있고 결과를 한 줄에 JSON 하나씩 출력한다. 종료 코드로 다음 경로를 정한다.

| 코드 | 뜻 | 할 일 |
|---|---|---|
| 0 | 성공 | 그대로 쓴다 |
| 1 | API 오류 | 오류 내용을 적고 다음 경로로 |
| 2 | `BLOCKED` 네트워크 정책 차단 | 다음 경로로, 끝에 도메인 허용 안내 |
| 3 | `MISSING` 키 없음 | 다음 경로로, 끝에 키 설정 안내 |

## 1. 직접 경로 (스크립트)

```bash
python3 .claude/skills/social-search/scripts/reddit_search.py "쿼리" --sort new --time week --limit 10
python3 .claude/skills/social-search/scripts/x_search.py "쿼리" --sort recency --limit 10
python3 .claude/skills/social-search/scripts/ig_search.py "해시태그" --sort top --limit 10
```

- **Reddit**: 환경 변수 `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`이 필요하다. 로그인 없는 공개 JSON은 403으로 막히므로 app-only OAuth 토큰으로 `oauth.reddit.com`을 부른다. 웹 검색은 reddit 도메인을 거부하므로 이 스크립트나 Xpoz만 쓴다.
- **X**: 환경 변수 `X_BEARER_TOKEN`이 필요하다. 최근 7일만 검색되고 게시물 1개를 읽을 때마다 과금되므로 `--limit`은 10을 넘기지 않는다. 쿼리 문법은 X 검색 문법(`"정확한 구문"`, `OR`, `-제외어`)을 따르며 리트윗은 기본으로 뺀다.
- **Instagram**: 환경 변수 `IG_ACCESS_TOKEN`, `IG_USER_ID`(비즈니스·크리에이터 계정)가 필요하다. **해시태그 한 단어**로만 검색된다(공백 제거, 예: `클로드코드`, `claudecode`). 계정당 7일에 해시태그 30개까지라 한 요청에 해시태그는 1~2개만 쓴다. 작성자 이름은 API가 주지 않으므로 칸을 비운다.

## 2. Xpoz 경로

ToolSearch로 `xpoz`를 찾아 해당 플랫폼 도구를 호출한다. `limit`(기본 10)과 `fields`를 지정하고 `userPrompt`에 사용자 질문 원문을 넣는다. "sign in again" / 인증 오류 / 도구 없음이면 다음 경로로 간다.

| 플랫폼 | 도구 | 추천 fields |
|---|---|---|
| X | `getTwitterPostsByKeywords` (`sortBy: latest` 또는 `relevance`, `filterOutRetweets: true`) | id, text, authorUsername, likeCount, retweetCount, createdAtDate |
| Reddit | `getRedditPostsByKeywords` (`sort`, `time`, `subreddit`) | title, subredditName, score, commentsCount, permalink, createdAtDate |
| TikTok | `getTiktokPostsByKeywords` | id, description, username, playCount, likeCount, createdAtDate |
| Instagram | `getInstagramPostsByKeywords` | id, caption, username, likeCount, codeUrl, createdAtDate |

- 쿼리: 정확한 구문은 큰따옴표, 결합은 `AND`/`OR`를 명시한다. 공백은 OR로 처리된다.
- 날짜는 사용자가 기간을 말했을 때만 `startDate`/`endDate`(YYYY-MM-DD)로 넣는다. 연도를 시스템 날짜로 다시 확인한다.
- 링크 만들기: X `https://x.com/{authorUsername}/status/{id}`, TikTok `https://www.tiktok.com/@{username}/video/{id}`, Instagram `https://www.instagram.com/p/{codeUrl}/`, Reddit `https://www.reddit.com{permalink}`.
- 댓글 등 더 깊은 데이터가 필요하면 `getRedditPostWithCommentsById`, `getTiktokCommentsByPostId`, `getInstagramCommentsByPostId`, `getTwitterPostComments`를 쓴다.

## 3. 웹 검색 경로

`WebSearch`를 **플랫폼마다 따로** 호출한다(여러 도메인을 한 번에 넣으면 한 플랫폼 결과만 나온다).

| 플랫폼 | allowed_domains | 비고 |
|---|---|---|
| X | `["x.com", "twitter.com"]` | 게시물 링크와 요약 |
| TikTok | `["tiktok.com"]` | 영상 링크와 설명 |
| Instagram | `["instagram.com"]` | 계정 페이지 위주, 게시물은 드묾 |

- 결과가 비거나 엉뚱하면 쿼리를 한 번 바꿔 다시 시도한다(영어 키워드, 해시태그 형태, 브랜드 이름만). 그래도 없으면 "결과 없음"으로 적는다.
- 웹 검색은 좋아요 수·조회수·정렬을 보장하지 못한다. 결과 끝에 이 한계를 한 줄로 적는다.

## 4. 설정 안내 (막혔을 때 끝에 붙이는 문구)

해당하는 줄만 붙인다.

- 차단(코드 2): "환경 설정 → Network access → Allowed domains에 `www.reddit.com`·`oauth.reddit.com` / `api.x.com` / `graph.facebook.com` 중 막힌 것 추가 후 새 세션"
- Reddit 키 없음(코드 3): "reddit.com/prefs/apps에서 script 타입 앱 생성 → client ID와 secret을 `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`으로 저장 후 새 세션"
- X 키 없음(코드 3): "X 개발자 콘솔(developer.x.com)에서 Bearer Token 발급 → 환경 설정의 Network secrets(또는 환경 변수)에 `X_BEARER_TOKEN`으로 저장 후 새 세션"
- Instagram 키 없음(코드 3): "Instagram 비즈니스 계정을 Meta 개발자 앱에 연결 → 액세스 토큰과 IG 사용자 ID를 `IG_ACCESS_TOKEN`, `IG_USER_ID`로 저장 후 새 세션"
- Xpoz 인증 오류: "Xpoz 재로그인: https://claude.ai/customize/connectors → Xpoz 연결 해제 후 재연결 → 새 세션"
- 키는 채팅에 붙여넣지 말라고 함께 적는다.

## 출력 형식

1. 첫 줄: 사용한 경로와 플랫폼별 건수. 예: `X 공식 API 10 · Reddit 직접 8 · TikTok 웹 검색 6 · Instagram Graph API 10`
2. 플랫폼별 섹션: 표(내용 한 줄 요약 | 작성자 | 지표 | 날짜 | 링크). 지표가 없으면 칸을 비운다.
3. 마지막: 전체 반응을 3줄 이내로 요약하고, 다음에 할 수 있는 행동 하나를 제안한다.

## 규칙

- 결과를 지어내지 않는다. 실패한 플랫폼은 "실패"와 이유를 적는다.
- 모든 게시물에 원문 링크를 단다. 웹 검색 결과를 썼다면 끝에 Sources 목록을 붙인다.
- 읽기 전용이다. 게시, 좋아요, 팔로우, 추적 항목 추가(`addTrackedItems`)는 사용자가 명시적으로 요청할 때만 한다.
