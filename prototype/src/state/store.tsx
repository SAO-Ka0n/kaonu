import { createContext, useContext, useEffect, useReducer, useState, type ReactNode } from 'react'
import { PARTS } from '@/data/content'
import {
  addDays, chaptersOf, extraAssignment, findLesson, isAssignmentDone, nextAssignment, toDateString,
  type AppState, type DayLog, type TestResult,
} from '@/logic/progress'

const KEY = 'golf-bible-proto-v2' // v2: 테스트 결과에 통과 기준과 공 개수 추가

function ensureDay(s: AppState, date: string): AppState {
  if (s.days[date]) return s
  const next = nextAssignment(PARTS, s)
  const day: DayLog = { date, assignments: next ? [next] : [], checked: [], tests: [] }
  return { ...s, days: { ...s.days, [date]: day } }
}

export function freshState(): AppState {
  const today = toDateString(new Date())
  return ensureDay({ onboarded: false, startDate: today, today, passed: [], completedLessons: [], days: {} }, today)
}

// 예시 상태: 4단원까지 통과, 5단원 풀스윙 레슨 3 진행 중, 5일 연속 연습.
export function demoState(): AppState {
  const today = toDateString(new Date())
  const chs = chaptersOf(PARTS)
  const [c2, c3, c4, c5] = [chs[1], chs[2], chs[3], chs[4]]
  const d = (n: number) => addDays(today, n)
  const test = (ch: typeof c2, offset: number) => {
    const t = ch.test
    const of = t.kind === 'count' ? t.of : t.items.length
    const need = t.kind === 'count' ? t.need : t.items.length
    const score = Math.max(0, Math.min(of, need + offset))
    return { chapterId: ch.id, score, of, need, passed: score >= need, balls: t.kind === 'count' ? t.of : 0 }
  }
  const allDrills = (lessonIdx: number) => c5.lessons[lessonIdx].drills.map((x) => x.id)
  const days: Record<string, DayLog> = {}
  const put = (date: string, p: Partial<DayLog>) => { days[date] = { date, assignments: [], checked: [], tests: [], ...p } }
  put(d(-16), { assignments: [{ type: 'test', chapterId: c2.id }], tests: [test(c2, -2)], checked: [c2.reviewDrill.id] })
  put(d(-15), { assignments: [{ type: 'test', chapterId: c2.id }], tests: [test(c2, 0)], checked: [c2.reviewDrill.id], reflection: { good: '그립 압력을 일정하게 유지했다', fix: '정렬할 때 발끝이 오른쪽을 본다' } })
  put(d(-12), { assignments: [{ type: 'test', chapterId: c3.id }], tests: [test(c3, -3)], checked: [c3.reviewDrill.id] })
  put(d(-10), { assignments: [{ type: 'test', chapterId: c3.id }], tests: [test(c3, -1)], checked: [c3.reviewDrill.id] })
  put(d(-9), { assignments: [{ type: 'test', chapterId: c3.id }], tests: [test(c3, 0)], checked: [c3.reviewDrill.id] })
  put(d(-5), { assignments: [{ type: 'test', chapterId: c4.id }], tests: [test(c4, -1)], checked: [c4.reviewDrill.id] })
  put(d(-4), { assignments: [{ type: 'test', chapterId: c4.id }], tests: [test(c4, 1)], checked: [c4.reviewDrill.id], reflection: { good: '하프스윙 템포가 일정했다', fix: '테스트 때 긴장해서 첫 두 개를 당겼다' } })
  put(d(-3), { assignments: [{ type: 'lesson', lessonId: c5.lessons[0].id }], checked: allDrills(0) })
  put(d(-2), { assignments: [{ type: 'lesson', lessonId: c5.lessons[1].id }], checked: allDrills(1) })
  put(d(-1), { assignments: [{ type: 'lesson', lessonId: c5.lessons[2].id }], checked: allDrills(2).slice(0, 2), reflection: { good: '피니시에서 2초는 버텼다', fix: '오른발 뒤꿈치가 덜 들린다' } })
  const passed = chs.slice(0, 4).map((c) => c.id)
  const completedLessons = [...chs.slice(0, 4).flatMap((c) => c.lessons.map((l) => l.id)), c5.lessons[0].id, c5.lessons[1].id]
  return ensureDay({ onboarded: true, startDate: d(-20), today, passed, completedLessons, days }, today)
}

type Action =
  | { type: 'toggle'; id: string }
  | { type: 'extra' }
  | { type: 'test'; result: TestResult }
  | { type: 'reflect'; good: string; fix: string }
  | { type: 'nextDay' }
  | { type: 'onboard' }
  | { type: 'replace'; state: AppState }

function reducer(s: AppState, a: Action): AppState {
  const day = s.days[s.today]
  const setDay = (p: Partial<DayLog>): AppState => ({ ...s, days: { ...s.days, [s.today]: { ...day, ...p } } })
  switch (a.type) {
    case 'toggle': {
      const checked = day.checked.includes(a.id) ? day.checked.filter((x) => x !== a.id) : [...day.checked, a.id]
      const next = { ...day, checked }
      const done = next.assignments
        .filter((x) => x.type === 'lesson' && isAssignmentDone(PARTS, next, x))
        .map((x) => (x.type === 'lesson' ? x.lessonId : ''))
      return { ...s, completedLessons: [...new Set([...s.completedLessons, ...done])], days: { ...s.days, [s.today]: next } }
    }
    case 'extra': {
      const next = extraAssignment(PARTS, s, day)
      return next ? setDay({ assignments: [...day.assignments, next] }) : s
    }
    case 'test': {
      const r = a.result
      const s2 = setDay({ tests: [...day.tests, r] })
      return r.passed && !s.passed.includes(r.chapterId) ? { ...s2, passed: [...s.passed, r.chapterId] } : s2
    }
    case 'reflect':
      return setDay({ reflection: { good: a.good, fix: a.fix } })
    case 'nextDay': {
      const today = addDays(s.today, 1)
      return ensureDay({ ...s, today }, today)
    }
    case 'onboard':
      return { ...s, onboarded: true }
    case 'replace':
      return a.state
  }
}

function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const s = JSON.parse(raw) as AppState
      // 저장된 레슨 id가 현재 교본에 없으면 예시 상태로 시작
      const ok = Object.values(s.days).every((d) => d.assignments.every((x) => x.type === 'test' || findLesson(PARTS, x.lessonId)))
      if (ok) return s
    }
  } catch { /* 저장소를 못 쓰면 예시 상태로 */ }
  return demoState()
}

const Ctx = createContext<{ s: AppState; dispatch: (a: Action) => void; saveFailed: boolean } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [s, dispatch] = useReducer(reducer, undefined, load)
  const [saveFailed, setSaveFailed] = useState(false)
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(s))
      setSaveFailed(false)
    } catch {
      setSaveFailed(true)
    }
  }, [s])
  return <Ctx.Provider value={{ s, dispatch, saveFailed }}>{children}</Ctx.Provider>
}

export function useStore() {
  const v = useContext(Ctx)
  if (!v) throw new Error('StoreProvider 밖에서 useStore 사용')
  return v
}
