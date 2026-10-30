import { PARTS } from '@/data/content'
import { MENTAL_CARDS } from '@/data/mental'
import { useStore } from '@/state/store'
import {
  ballsOfSteps, chapterStatus, chaptersOf, currentChapter, estimateMinutes, extraAssignment, findLesson, isAssignmentDone,
  lessonLabel, level, mentalCardFor, stepDone, stepProgress, stepsFor, streak,
} from '@/logic/progress'
import { useNav } from '../nav'
import { CaretRight, Check } from '@phosphor-icons/react'
import { Button, SectionHead, Thumb, fmt } from '../ui'

export function koreanDate(date: string) {
  const d = new Date(date + 'T00:00:00')
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${'일월화수목금토'[d.getDay()]}요일`
}

export function Home() {
  const { s, dispatch } = useStore()
  const nav = useNav()
  const day = s.days[s.today]
  const mental = mentalCardFor(MENTAL_CARDS, s.startDate, s.today)
  const active = day.assignments.find((a) => !isAssignmentDone(PARTS, day, a)) ?? day.assignments[day.assignments.length - 1]
  const lv = level(PARTS, s.passed)
  const cur = currentChapter(PARTS, s.passed)

  const steps = active ? stepsFor(PARTS, active, mental) : []
  const doneCount = steps.filter((st) => stepDone(day, st)).length
  const assignmentsDone = day.assignments.length > 0 && day.assignments.every((a) => isAssignmentDone(PARTS, day, a))
  const routineDone = assignmentsDone && doneCount === steps.length
  const failedToday = active?.type === 'test' && day.tests.some((t) => t.chapterId === active.chapterId) && !day.tests.some((t) => t.chapterId === active.chapterId && t.passed)
  const extra = assignmentsDone ? extraAssignment(PARTS, s, day) : null

  if (!active || !cur) {
    return (
      <div className="flex flex-col gap-4 pt-10">
        <h1 data-screen-title tabIndex={-1} className="text-24 font-light">{chaptersOf(PARTS).length}단원을 <b className="font-bold">모두 통과</b>했어요</h1>
        <p className="text-sub">기록 탭에서 지금까지의 연습을 돌아볼 수 있어요.</p>
      </div>
    )
  }

  const label = lessonLabel(PARTS, active)!
  const lesson = active.type === 'lesson' ? findLesson(PARTS, active.lessonId)?.lesson : undefined
  const { hit, planned } = ballsOfSteps(day, steps)
  const started = steps.some((st) => stepProgress(day, st) > 0)
  const cta = routineDone ? '오늘 연습 다시 보기' : started ? `이어서 하기 (${doneCount}/${steps.length})` : '연습 시작'
  const total = chaptersOf(PARTS).length

  return (
    <div className="flex flex-col gap-6">
      <div>
          <p className="text-13 text-sub">{koreanDate(s.today)}</p>
          <h1 data-screen-title tabIndex={-1} className="text-24 font-light tracking-tight">
            {!routineDone ? <>오늘은<br /><b className="font-bold">{label.title}</b></>
              : failedToday ? <>재도전 기록<br /><b className="font-bold">완료</b></>
                : <>오늘 연습<br /><b className="font-bold">끝났어요</b></>}
          </h1>
      </div>

      {routineDone && (
        <div className="anim-rise rounded bg-gold p-4 text-gold-ink">
          <b className="block text-15">{failedToday ? '테스트 결과를 남겼어요' : '오늘 연습 완료'}</b>
          <p className="text-13">{failedToday ? '다시 도전은 횟수 제한 없이 할 수 있어요. ' : ''}{streak(s.days, s.today)}일 연속 연습 중이에요</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={nav.openReflect} className="min-h-[44px] rounded-full bg-gold-tint px-4 text-13 font-bold">
              {day.reflection ? '회고 고치기' : '30초 회고 쓰기'}
            </button>
            {extra && (
              <button onClick={() => dispatch({ type: 'extra' })} className="min-h-[44px] rounded-full px-4 text-13 font-bold ring-1 ring-inset ring-gold-ink">
                {extra.type === 'lesson' ? '다음 레슨 미리 하기' : '통과 테스트 미리 하기'}
              </button>
            )}
          </div>
        </div>
      )}

      <section aria-label="오늘 레슨" className="flex flex-col gap-4 rounded bg-hero p-5 text-hero-ink">
        <p className="text-13 text-hero-sub">{label.where}</p>
        {lesson && active.type === 'lesson' ? (
          <button onClick={() => nav.push({ name: 'lesson', lessonId: active.lessonId })} className="flex flex-col gap-2 text-left">
            <Thumb duration={lesson.durationSec} />
            <span className="text-13 text-hero-sub underline underline-offset-4">레슨 영상과 자세 포인트 보기</span>
          </button>
        ) : (
          <p className="rounded-sm bg-hero-tint p-4 text-14">{label.chapter.test.description}</p>
        )}
        <dl className="flex gap-6">
          <Fact n={`약 ${estimateMinutes(PARTS, active)}`} u="예상 시간(분)" />
          <Fact n={started ? `${hit}/${planned}` : planned} u={started ? '친 공 / 칠 공' : '칠 공'} />
          <Fact n={`${doneCount}/${steps.length}`} u="끝낸 연습" />
        </dl>
        <Button onClick={() => nav.push({ name: 'session', start: routineDone ? steps.length : undefined })} className="w-full">{cta}</Button>
      </section>

      <section>
        <SectionHead title="오늘 연습" note="누르면 그 단계부터" />
        <ol className="mt-1 flex flex-col">
          {steps.map((st, i) => {
            const done = stepDone(day, st)
            const n = stepProgress(day, st)
            const amount = st.kind === 'test' ? (st.items ? `${st.of}항목` : `공 ${st.of}개`)
              : st.kind === 'balls' ? (n > 0 && !done ? `공 ${n}/${st.target}` : `공 ${st.target}개`)
                : st.kind === 'reps' ? (n > 0 && !done ? `${n}/${st.target}회` : `${st.target}회`)
                  : st.kind === 'timer' ? fmt(st.target) : ''
            return (
              <li key={st.id}>
                <button onClick={() => nav.push({ name: 'session', start: i })}
                  className="grid min-h-[56px] w-full grid-cols-[24px_1fr_auto_16px] items-center gap-3 border-b py-3 text-left">
                  <span className={`grid h-6 w-6 place-items-center rounded-full font-num text-12 ${done ? 'bg-forest text-surface' : 'ring-1 ring-inset ring-line text-sub'}`}>
                    {done ? <Check size={12} weight="bold" aria-label="끝냄" /> : i + 1}
                  </span>
                  <span className={`min-w-0 text-15 ${done ? 'text-sub' : 'font-medium'}`}>
                    {'tag' in st && st.tag && <span className="mr-2 text-12 font-bold text-gold-text">{st.tag}</span>}{st.title}
                  </span>
                  <span className="font-num text-13 text-sub tabular">{amount}</span>
                  <CaretRight size={14} className="text-sub" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ol>
      </section>

      <section>
        <SectionHead title={`레벨 ${lv.n}, ${lv.name} 단계`} note={`${total}단원 중 ${s.passed.length}단원 통과`} />
        <div className="mt-3 grid grid-cols-12 gap-1" role="img" aria-label={`${total}단원 중 ${s.passed.length}단원 통과, 지금 ${cur.no}단원 ${cur.title}`}>
          {chaptersOf(PARTS).map((c) => {
            const st = chapterStatus(PARTS, s.passed, c.id)
            return <i key={c.id} className={`h-7 rounded-full ${st === 'done' ? 'bg-forest' : st === 'now' ? 'bg-gold' : 'bg-line'}`} />
          })}
        </div>
        <div className="mt-2 flex justify-between text-12 text-sub" aria-hidden="true"><span>{chaptersOf(PARTS)[0].title}</span><span>{chaptersOf(PARTS)[total - 1].title}</span></div>
      </section>

      <section aria-label="오늘의 멘탈 카드" className="rounded bg-forest-soft px-5 py-4">
        <p className="text-12 text-sub">오늘의 멘탈 카드</p>
        <p className="mt-1 text-15 font-medium">“{mental.principle}”</p>
        <p className="mt-1 text-13 text-sub">{mental.body}</p>
      </section>
    </div>
  )
}

function Fact({ n, u }: { n: number | string; u: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-12 text-hero-sub">{u}</dt>
      <dd className="font-num text-20 leading-tight tabular">{n}</dd>
    </div>
  )
}
