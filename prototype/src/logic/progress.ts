// 진행 계산. 화면과 분리된 순수 함수 (설계 문서 5.2 ~ 5.6).
import type { Chapter, Drill, Lesson, MentalCard, Part } from '@/data/types'

export type Assignment = { type: 'lesson'; lessonId: string } | { type: 'test'; chapterId: string }

export type TestResult = { chapterId: string; score: number; of: number; passed: boolean }

export type DayLog = {
  date: string // YYYY-MM-DD, 폰 현지 날짜
  assignments: Assignment[] // 그날 정해진 레슨. 첫 항목은 자정까지 고정, 뒤는 "다음 레슨 미리 하기"
  checked: string[] // 체크한 드릴 id (멘탈 드릴은 'mental:<카드 id>')
  tests: TestResult[]
  reflection?: { good: string; fix: string }
}

export type AppState = {
  onboarded: boolean
  startDate: string
  today: string
  passed: string[] // 통과한 단원 id
  completedLessons: string[]
  days: Record<string, DayLog>
}

export type RoutineItem =
  | { kind: 'drill'; drill: Drill; tag?: '복습' }
  | { kind: 'mental'; id: string; title: string; detail: string }

export function chaptersOf(parts: Part[]): Chapter[] {
  return parts.flatMap((p) => p.chapters)
}

export function findLesson(parts: Part[], lessonId: string): { lesson: Lesson; chapter: Chapter; index: number } | null {
  for (const ch of chaptersOf(parts)) {
    const index = ch.lessons.findIndex((l) => l.id === lessonId)
    if (index >= 0) return { lesson: ch.lessons[index], chapter: ch, index }
  }
  return null
}

export function findChapter(parts: Part[], chapterId: string): Chapter | undefined {
  return chaptersOf(parts).find((c) => c.id === chapterId)
}

export function partOf(parts: Part[], chapterId: string): Part | undefined {
  return parts.find((p) => p.chapters.some((c) => c.id === chapterId))
}

// 잠금 해제된 단원 중 아직 통과 못 한 가장 앞 단원. 전부 통과했으면 null.
export function currentChapter(parts: Part[], passed: string[]): Chapter | null {
  return chaptersOf(parts).find((c) => !passed.includes(c.id)) ?? null
}

export type ChapterStatus = 'done' | 'now' | 'locked'
export function chapterStatus(parts: Part[], passed: string[], chapterId: string): ChapterStatus {
  if (passed.includes(chapterId)) return 'done'
  return currentChapter(parts, passed)?.id === chapterId ? 'now' : 'locked'
}

export function level(parts: Part[], passed: string[]): { n: number; name: string } {
  const cur = currentChapter(parts, passed)
  const name = cur ? partOf(parts, cur.id)?.title ?? '' : '완주'
  return { n: passed.length + 1, name }
}

// 현재 단원에서 다음에 할 것: 안 끝난 가장 앞 레슨, 없으면 통과 테스트.
export function nextAssignment(parts: Part[], s: Pick<AppState, 'passed' | 'completedLessons'>, skip: string[] = []): Assignment | null {
  const ch = currentChapter(parts, s.passed)
  if (!ch) return null
  const lesson = ch.lessons.find((l) => !s.completedLessons.includes(l.id) && !skip.includes(l.id))
  return lesson ? { type: 'lesson', lessonId: lesson.id } : { type: 'test', chapterId: ch.id }
}

export function daysBetween(a: string, b: string): number {
  return Math.round((Date.parse(b + 'T00:00:00') - Date.parse(a + 'T00:00:00')) / 86400000)
}

export function addDays(date: string, n: number): string {
  const d = new Date(date + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return toDateString(d)
}

export function toDateString(d: Date): string {
  const p = (x: number) => String(x).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function mentalCardFor(cards: MentalCard[], startDate: string, date: string): MentalCard {
  const i = ((daysBetween(startDate, date) % cards.length) + cards.length) % cards.length
  return cards[i]
}

// 하루 동안 만난 멘탈 카드 (시작일부터 오늘까지 순환한 카드).
export function metMentalCards(cards: MentalCard[], startDate: string, today: string): MentalCard[] {
  const n = Math.min(cards.length, daysBetween(startDate, today) + 1)
  const first = mentalCardFor(cards, startDate, startDate)
  const start = cards.indexOf(first)
  return Array.from({ length: n }, (_, k) => cards[(start + k) % cards.length])
}

export function routineFor(parts: Part[], a: Assignment, mental: MentalCard): RoutineItem[] {
  const m: RoutineItem = { kind: 'mental', id: `mental:${mental.id}`, title: mental.drill, detail: mental.principle }
  if (a.type === 'lesson') {
    const found = findLesson(parts, a.lessonId)
    return [...(found?.lesson.drills ?? []).map((drill): RoutineItem => ({ kind: 'drill', drill })), m]
  }
  const ch = findChapter(parts, a.chapterId)
  return ch ? [{ kind: 'drill', drill: ch.reviewDrill, tag: '복습' }, m] : [m]
}

export function itemId(item: RoutineItem): string {
  return item.kind === 'drill' ? item.drill.id : item.id
}

export function isAssignmentDone(parts: Part[], day: DayLog, a: Assignment): boolean {
  if (a.type === 'test') return day.tests.some((t) => t.chapterId === a.chapterId)
  const found = findLesson(parts, a.lessonId)
  return !!found && found.lesson.drills.every((d) => day.checked.includes(d.id))
}

export function isActiveDay(day: DayLog | undefined): boolean {
  return !!day && (day.checked.length > 0 || day.tests.length > 0)
}

// 오늘 활동이 없으면 어제부터 센다 (오늘 아직 연습 전이어도 연속 기록이 끊겨 보이지 않게).
export function streak(days: Record<string, DayLog>, today: string): number {
  let d = isActiveDay(days[today]) ? today : addDays(today, -1)
  let n = 0
  while (isActiveDay(days[d])) {
    n++
    d = addDays(d, -1)
  }
  return n
}

export function ballsOf(parts: Part[], days: Record<string, DayLog>): number {
  const drills = new Map<string, number>()
  for (const ch of chaptersOf(parts)) {
    for (const l of ch.lessons) for (const d of l.drills) drills.set(d.id, d.balls ?? 0)
    drills.set(ch.reviewDrill.id, ch.reviewDrill.balls ?? 0)
  }
  return Object.values(days).reduce((sum, day) => sum + day.checked.reduce((s, id) => s + (drills.get(id) ?? 0), 0), 0)
}

export function testHistory(days: Record<string, DayLog>): (TestResult & { date: string })[] {
  return Object.values(days)
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap((d) => d.tests.map((t) => ({ ...t, date: d.date })))
}

export function lessonLabel(parts: Part[], a: Assignment): { chapter: Chapter; title: string; where: string } | null {
  if (a.type === 'test') {
    const ch = findChapter(parts, a.chapterId)
    return ch ? { chapter: ch, title: `${ch.title} 통과 테스트`, where: `${ch.no}단원 마지막 관문` } : null
  }
  const f = findLesson(parts, a.lessonId)
  return f ? { chapter: f.chapter, title: f.lesson.title, where: `${f.chapter.no}단원 ${f.chapter.title}, 레슨 ${f.index + 1}/${f.chapter.lessons.length}` } : null
}
