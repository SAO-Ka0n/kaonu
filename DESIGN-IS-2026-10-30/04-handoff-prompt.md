# 04. /make-plan 핸드오프

````
/make-plan Redesign 골프 바이블 React 프로토타입 (prototype/). Current design failed audit at 16/30 with critical gaps in principles #3 아름다움(1), #4 이해(1), #6 정직(1), #8 세심함(1), #10 최소 디자인(1).

Verdict paragraph (quoted from 03-verdict.md):
> 합계 16/30으로 기준(20점)보다 낮으므로, 이 프로토타입은 목적("오늘 할 연습 하나를 정직하게 보여 주고 끝내게 한다")에서 다시 출발해 재설계한다.

Why redesign and not refine: 합계가 20점 미만이고, 부하가 걸리는 원칙인 #4 이해와 #6 정직이 모두 1점이다. 특히 통과 테스트 점수가 통과 기준으로 미리 채워져 있어 "실력과 관계없는 진행"이라는 반목표에 걸린다.

Preserve from current design:
- 색 토큰과 라이트/다크 구조 (prototype/src/index.css:6-25). 7번 원칙 3점.
- 교본 데이터 형식과 내용 (prototype/src/data/types.ts, content.ts, mental.ts).
- 4개 탭 구조 홈/교본/기록/멘탈 (prototype/src/app/PhoneApp.tsx:12-17). 사용자가 정한 것.
- 하루 고정 레슨, 단원 잠금, 연속 연습일 규칙 (prototype/src/logic/progress.ts:66-131, 설계 문서 5.2~5.5).

Discard:
- 통과 기준으로 미리 채운 점수. Evidence: prototype/src/app/screens/Test.tsx:17. Caused failure on principle #6.
- 화면마다 다르게 세는 드릴 수. Evidence: Home.tsx:94, Book.tsx:107/130, Log.tsx:47. Caused failure on principle #6.
- 고정 "보통 통과선 7/10"과 첫 실행 "7/10". Evidence: Log.tsx:84-85, PhoneApp.tsx:107. Caused failure on principle #6.
- 반 픽셀 글자 크기 20종, 격자 밖 여백, 반경 6종, 컴파일 안 되는 투명도 클래스. Evidence: Home.tsx:73/76/87, Log.tsx:102. Caused failure on principle #3.
- 탭바와 겹치는 홈 버튼, 교본 탭의 두 번째 길, 레슨 화면 드릴 목록 두 벌. Evidence: Home.tsx:98/118, Book.tsx:38/47/96, Book.tsx:132-137. Caused failure on principle #10.

Top 5 moves from the audit (verbatim):
1. #6 정직: 모든 숫자가 실제 동작과 같게. 통과 테스트 점수는 0에서 시작한다. "오늘 연습"의 정의를 하나로 정해 홈, 레슨, 일지에서 똑같이 센다. 그래프는 막대마다 자기 단원의 통과 기준을 표시한다. 첫 실행 문구에서 "7/10"을 뺀다. 실패한 날은 "재도전 기록 완료"로 표시한다. 다시 통과한 단원은 "열렸어요"라고 말하지 않는다. 시간은 "약 N분"으로 쓰고, 테스트 공도 센다. Evidence: Test.tsx:17, Home.tsx:62/92/94, Log.tsx:84, PhoneApp.tsx:107, Test.tsx:38.
2. #4 이해: 쉬운 말 하나로. 통과선은 통과 기준, 마지막 관문은 단원 마지막 테스트, 20구는 공 20개, Lv.은 레벨로 바꾼다. 목록 이름은 "오늘 연습"으로 통일한다. 멘탈 항목은 카드에 적힌 때를 보여 준다. 동작하지 않는 버튼은 없앤다. Evidence: Test.tsx:50/64, ui.tsx:84/103, Home.tsx:70/76/103.
3. #3 아름다움: 체계 하나로. 글자 크기 9단계(12, 13, 14, 15, 17, 20, 24, 32, 56), 4px 격자 여백, 반경 3종. 투명도는 토큰으로 정의하고 하드코딩 색과 파란 테두리를 없앤다. Evidence: ui.tsx:39, Home.tsx:73/76/87, Log.tsx:102.
4. #8 세심함과 접근성: 시트 포커스 가두기, Esc 닫기, 포커스 복귀, aria-modal. 화면 전환 시 제목으로 포커스. 토스트 live region. 터치 영역 44px 이상. 라이트 모드 금색 글자는 대비 4.5:1 이상 토큰. 테스트 +/- 끝값 비활성. 저장 실패 안내. Evidence: ui.tsx:133-144, PhoneApp.tsx:66, Book.tsx:13, ui.tsx:52/80, Test.tsx:60/62, store.tsx:107/116.
5. #10 덜어내기: 홈의 "교본" 버튼 제거, 교본 탭은 현재 단원을 펼치기만, 레슨 화면 드릴 목록 한 벌, 쓰지 않는 템플릿 파일 47개 삭제. Evidence: Home.tsx:98, Book.tsx:38/96, Book.tsx:132-137, src/components/ui/**.

Redesign principles in priority order:
1. #6 정직 — 화면에 보이는 모든 숫자를 코드 한 곳에서 계산하고, 같은 숫자는 어디서나 같다.
2. #4 이해 — 연습장에서 처음 쓰는 사람이 설명 없이 모든 버튼의 뜻을 안다.
3. #10 최소 디자인 — 같은 일을 하는 길은 하나뿐이고, 빼도 되는 요소가 없다.

Deliverables for the plan:
- 화면 지도: 4개 탭 안의 화면과 이동 경로 (중복 경로 제거 후)
- 홈 주 흐름 와이어프레임: 지금과 나란히 비교
- 상태 체크리스트: 빈, 로딩, 오류(저장 실패), 성공, 포커스, 비활성
- 기존 사용자 데이터 이전: localStorage 키 버전 올리기와 이전 규칙
- 이전 디자인을 폐기하는 기준

Anti-patterns to guard against:
- 옛 구조에 새 스타일만 입히기
- 두 디자인을 플래그로 오래 함께 두기
- 원칙이 아니라 유행을 따라 재설계하기
- Preserve 목록을 선택 사항으로 취급하기
````
