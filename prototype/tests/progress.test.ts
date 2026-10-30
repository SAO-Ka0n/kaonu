// 실행: node --test --experimental-strip-types tests/
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { PARTS } from '../src/data/content.ts'
import { MENTAL_CARDS } from '../src/data/mental.ts'
import { ballsOfDay, migrateState, stepKind, stepsFor, stepProgress, type DayLog } from '../src/logic/progress.ts'

const mental = MENTAL_CARDS[0]
const c5 = PARTS[1].chapters[1]
const day = (p: Partial<DayLog> = {}): DayLog => ({ date: '2026-10-30', assignments: [], checked: [], tests: [], counts: {}, shots: {}, ...p })

test('드릴 양 표기로 단계 종류를 정한다', () => {
  assert.equal(stepKind('20구'), 'balls')
  assert.equal(stepKind('10회'), 'reps')
  assert.equal(stepKind('5분'), 'timer')
  assert.equal(stepKind('매 샷'), 'check')
})

test('레슨 날 단계: 드릴 순서대로, 마지막은 멘탈', () => {
  const lesson = c5.lessons[2]
  const steps = stepsFor(PARTS, { type: 'lesson', lessonId: lesson.id }, mental)
  assert.equal(steps.length, lesson.drills.length + 1)
  assert.deepEqual(steps.slice(0, -1).map((x) => x.id), lesson.drills.map((d) => d.id))
  assert.equal(steps[steps.length - 1].id, `mental:${mental.id}`)
  const timer = steps.find((x) => x.kind === 'timer')
  if (timer && timer.kind !== 'test') assert.equal(timer.target % 60, 0)
})

test('테스트 날 단계: 복습 드릴, 테스트, 멘탈', () => {
  const steps = stepsFor(PARTS, { type: 'test', chapterId: c5.id }, mental)
  assert.deepEqual(steps.map((x) => x.kind === 'test' ? 'test' : x.id), [c5.reviewDrill.id, 'test', `mental:${mental.id}`])
  const t = steps[1]
  assert.ok(t.kind === 'test' && c5.test.kind === 'count' && t.of === c5.test.of && t.need === c5.test.need)
})

test('친 공: 실제로 누른 수를 세고, 체크만 된 옛 기록은 계획값을 센다', () => {
  const ballDrill = c5.lessons[2].drills.find((d) => stepKind(d.qty) === 'balls')!
  assert.equal(ballsOfDay(PARTS, day({ counts: { [ballDrill.id]: 7 } })), 7)
  assert.equal(ballsOfDay(PARTS, day({ checked: [ballDrill.id] })), ballDrill.balls)
  assert.equal(ballsOfDay(PARTS, day({ shots: { [c5.id]: [true, false, true] } })), 3)
  assert.equal(ballsOfDay(PARTS, day({ tests: [{ chapterId: c5.id, score: 6, of: 10, need: 7, passed: false, balls: 10 }] })), 10)
})

test('단계 진행: 누른 수, 진행 중 테스트 공 수', () => {
  const steps = stepsFor(PARTS, { type: 'test', chapterId: c5.id }, mental)
  assert.equal(stepProgress(day({ shots: { [c5.id]: [true, true] } }), steps[1]), 2)
  assert.equal(stepProgress(day({ counts: { [steps[0].id]: 4 } }), steps[0]), 4)
})

test('v2 데이터 이전: counts와 shots를 채우고 나머지는 그대로', () => {
  const v2 = { onboarded: true, startDate: '2026-10-01', today: '2026-10-30', passed: ['c1'], completedLessons: [], days: { '2026-10-30': { date: '2026-10-30', assignments: [], checked: ['x'], tests: [] } } }
  const s = migrateState(v2)!
  assert.deepEqual(s.days['2026-10-30'].counts, {})
  assert.deepEqual(s.days['2026-10-30'].shots, {})
  assert.deepEqual(s.days['2026-10-30'].checked, ['x'])
  assert.equal(migrateState({ nope: 1 }), null)
  assert.equal(migrateState(null), null)
})
