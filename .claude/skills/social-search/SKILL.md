---
name: social-search
description: 인스타그램·트위터(X)·레딧·틱톡에서 키워드로 게시물을 찾아 플랫폼별로 정리한다. "인스타/트위터/레딧/틱톡에서 찾아줘", "SNS 반응 알아봐", "social search" 요청 때 사용. Xpoz 커넥터가 있으면 그것을 쓰고, 없거나 로그인이 풀렸으면 웹 검색과 Reddit JSON API로 대신한다.
---

# social-search

4개 플랫폼(Instagram, X, Reddit, TikTok)을 한 번에 검색한다. 백엔드는 두 단계다.

1. **Xpoz 커넥터** (`mcp__xpoz__*`): 정식 데이터. 좋아요·조회수·댓글까지 나온다.
2. **예비 경로**: 웹 검색 + Reddit JSON API. 링크와 요약만 나온다.

## 0. 백엔드 고르기

1. ToolSearch로 `xpoz`를 찾는다.
2. 도구가 있으면 그 플랫폼 검색 도구를 `limit` 작게(5~10) 한 번 호출해 본다.
   - 결과가 오면 → **1. Xpoz 경로**.
   - "sign in again" / 인증 오류 / 도구 없음 → **2. 예비 경로**로 가고, 끝에
     "Xpoz 재로그인: https://claude.ai/customize/connectors → Xpoz 연결 → 새 세션" 한 줄을 붙인다.
3. 시작할 때 어느 경로를 쓰는지 한 줄로 말한다.

## 1. Xpoz 경로

4개 플랫폼을 한 메시지에서 병렬 호출한다. 모두 `limit`(기본 10)과 `fields`를 지정하고 `userPrompt`에 사용자 질문 원문을 넣는다.

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

## 2. 예비 경로

한 메시지에서 아래 4개를 병렬로 실행한다. 웹 검색은 **플랫폼마다 따로** 호출한다(여러 도메인을 한 번에 넣으면 한 플랫폼 결과만 나온다).

| 플랫폼 | 방법 | 비고 |
|---|---|---|
| X | `WebSearch` `allowed_domains: ["x.com", "twitter.com"]` | 게시물 링크와 요약 |
| TikTok | `WebSearch` `allowed_domains: ["tiktok.com"]` | 영상 링크와 설명 |
| Instagram | `WebSearch` `allowed_domains: ["instagram.com"]` | 계정 페이지 위주, 게시물은 드묾 |
| Reddit | `python3 <이 스킬 폴더>/scripts/reddit_search.py "쿼리" --sort new --time week --limit 10` | 웹 검색은 reddit 도메인을 거부하므로 이 스크립트만 쓴다 |

- `<이 스킬 폴더>`는 스킬을 불러올 때 알려주는 base directory다(예: `~/.claude/skills/social-search`). 저장소 상대 경로로 쓰지 않는다.
- Reddit 스크립트가 종료 코드 2(`BLOCKED`)를 내면 네트워크 정책 차단이다. 결과 칸에 "차단됨"이라 쓰고, 끝에 "환경 설정 → Network access → Allowed domains에 `www.reddit.com` 추가 후 새 세션" 한 줄을 붙인다.
- 웹 검색 결과가 비거나 엉뚱하면 쿼리를 한 번 바꿔 다시 시도한다(영어 키워드, 해시태그 형태, 브랜드 이름만). 그래도 없으면 "결과 없음"으로 적는다.
- 예비 경로는 좋아요 수·조회수·정렬을 보장하지 못한다. 결과 끝에 이 한계를 한 줄로 적는다.

## 출력 형식

1. 첫 줄: 사용한 경로와 플랫폼별 건수. 예: `Xpoz 사용 · X 10 · Reddit 8 · TikTok 10 · Instagram 6`
2. 플랫폼별 섹션: 표(내용 한 줄 요약 | 작성자 | 지표 | 날짜 | 링크). 지표가 없으면 칸을 비운다.
3. 마지막: 전체 반응을 3줄 이내로 요약하고, 다음에 할 수 있는 행동 하나를 제안한다.

## 규칙

- 결과를 지어내지 않는다. 실패한 플랫폼은 "실패"와 이유를 적는다.
- 모든 게시물에 원문 링크를 단다. 웹 검색 결과를 썼다면 끝에 Sources 목록을 붙인다.
- 읽기 전용이다. 게시, 좋아요, 팔로우, 추적 항목 추가(`addTrackedItems`)는 사용자가 명시적으로 요청할 때만 한다.
