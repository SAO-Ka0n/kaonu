# 작업 방식

스킬은 `.claude/skills/`에 있다. 출처는 `.claude/docs/VENDORED.md`.

## 기본: pstack poteto-mode

코드를 만들거나 고치거나 조사하는 요청이면, 첫 작업 전에 `.claude/skills/poteto-mode/SKILL.md`를 끝까지 읽고 그대로 따른다.
poteto-mode가 부르는 스킬(`how`, `architect`, `swarm`, `arena`, `interrogate`, `tdd`, `unslop`, `principle-*` 등)은 대부분 수동 전용이라 Skill 도구로 호출되지 않는다. `.claude/skills/<이름>/SKILL.md`를 읽어서 따른다.

단순한 질문이나 대화에는 바로 답한다.

## 작업 크기별 흐름

1. **새 기능, 큰 변경, 요구사항이 모호한 요청**
   1. `grilling` 스킬로 사용자에게 질문해 요구사항을 확정한다.
   2. 확정한 내용을 `.claude/skills/to-spec/SKILL.md`를 따라 명세로 만든다.
   3. 한 번에 끝나지 않을 크기면 `.claude/skills/to-tickets/SKILL.md`를 따라 작업 단위로 쪼갠다.
   4. 그다음 poteto-mode로 구현한다.
   - `to-spec`·`to-tickets`가 이슈 트래커 설정을 요구하는데 설정이 없으면, 사용자에게 `/setup-matt-pocock-skills`를 한 번 실행하라고 말하고 그동안 명세는 `docs/specs/<이름>.md`에 저장한다.
2. **작은 수정, 명확한 버그 수정**: 질문 단계를 건너뛰고 poteto-mode로 바로 진행한다.
3. **끝난 뒤**: 다음에 다시 쓸 만한 교훈(코드와 테스트만 봐서는 알 수 없는 이유나 함정)이 있으면 `ce-compound` 스킬로 `docs/solutions/`에 기록한다. 흔한 수정이면 건너뛴다.
