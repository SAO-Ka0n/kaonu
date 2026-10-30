import { useEffect, useRef } from 'react'
import { ArrowRight } from '@phosphor-icons/react'
import { PARTS } from '@/data/content'
import { MENTAL_CARDS } from '@/data/mental'
import { useStore } from '@/state/store'
import {
  chapterStatus, chaptersOf, currentChapter, findLesson, isAssignmentDone, itemId, lessonLabel,
  level, mentalCardFor, nextAssignment, routineFor, streak,
} from '@/logic/progress'
import { useNav } from '../nav'
import { Button, LevelRing, Routine, SectionHead, Thumb } from '../ui'

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
  const ratio = cur ? cur.lessons.filter((l) => s.completedLessons.includes(l.id)).length / cur.lessons.length : 1

  const items = active ? routineFor(PARTS, active, mental) : []
  const doneCount = items.filter((it) => day.checked.includes(itemId(it))).length
  const assignmentsDone = day.assignments.length > 0 && day.assignments.every((a) => isAssignmentDone(PARTS, day, a))
  const routineDone = assignmentsDone && doneCount === items.length
  const canExtra = assignmentsDone && !!nextAssignment(PARTS, s, day.assignments.flatMap((a) => (a.type === 'lesson' ? [a.lessonId] : [])))

  // 루틴을 막 끝낸 순간 한 번만 회고 화면을 띄운다
  const prev = useRef(routineDone)
  useEffect(() => {
    if (routineDone && !prev.current && !day.reflection) nav.openReflect()
    prev.current = routineDone
  }, [routineDone, day.reflection, nav])

  if (!active || !cur) {
    return (
      <div className="flex flex-col gap-4 pt-10">
        <h2 className="text-2xl font-light">12단원을 <b className="font-bold">모두 통과</b>했어요</h2>
        <p className="text-sub">기록 탭에서 지금까지의 연습을 돌아볼 수 있어요.</p>
      </div>
    )
  }

  const label = lessonLabel(PARTS, active)!
  const lesson = active.type === 'lesson' ? findLesson(PARTS, active.lessonId)?.lesson : undefined
  const balls = items.reduce((n, it) => n + (it.kind === 'drill' ? it.drill.balls ?? 0 : 0), 0)
  const minutes = active.type === 'lesson' ? Math.round((lesson?.durationSec ?? 0) / 60) + 10 * (lesson?.drills.length ?? 0) : 30
  const open = () => nav.push(active.type === 'lesson' ? { name: 'lesson', lessonId: active.lessonId } : { name: 'test', chapterId: active.chapterId })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <small className="block text-[12.5px] text-sub">{koreanDate(s.today)}</small>
          <strong className="block text-[22px] font-light leading-snug tracking-tight">
            {routineDone ? <>오늘 연습<br /><b className="font-bold">끝났어요</b></> : <>오늘은<br /><b className="font-bold">{label.title}</b></>}
          </strong>
        </div>
        <LevelRing n={lv.n} name={lv.name} ratio={ratio} />
      </div>

      {routineDone && (
        <div className="anim-rise rounded-[20px] bg-gold p-4 text-gold-ink">
          <b className="block">오늘 루틴 완료</b>
          <small className="block text-[12.5px]">{streak(s.days, s.today)}일 연속 연습 중이에요</small>
          <div className="mt-3 flex flex-wrap gap-2">
            <button onClick={nav.openReflect} className="min-h-[40px] rounded-full bg-gold-ink/10 px-4 text-[13px] font-bold">
              {day.reflection ? '회고 고치기' : '30초 회고 쓰기'}
            </button>
            {canExtra && <button onClick={() => dispatch({ type: 'extra' })} className="min-h-[40px] rounded-full px-4 text-[13px] font-bold ring-1 ring-inset ring-gold-ink/30">다음 레슨 미리 하기</button>}
          </div>
        </div>
      )}

      <section className="flex flex-col gap-3.5 rounded-[20px] bg-hero p-[18px] text-hero-ink">
        <div>
          <div className="text-xs text-hero-sub">{label.where}</div>
          <h3 className="mt-0.5 text-[21px] font-medium leading-snug tracking-tight">{label.title}</h3>
        </div>
        {lesson ? <Thumb duration={lesson.durationSec} /> : (
          <div className="rounded-[14px] bg-hero-line/50 p-4 text-[13.5px] leading-relaxed">
            {label.chapter.test.description}
          </div>
        )}
        <div className="flex gap-5">
          <Fact n={minutes} u="분" />
          <Fact n={balls} u="공 개수" />
          <Fact n={`${doneCount}/${items.length}`} u="드릴 완료" />
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Button onClick={open}>{active.type === 'lesson' ? '영상 보고 시작' : '테스트 하러 가기'}</Button>
          <Button variant="heroGhost" onClick={() => nav.setTab('book')}>교본</Button>
        </div>
      </section>

      <section>
        <SectionHead title="오늘의 드릴" note="누르면 체크돼요" />
        <Routine items={items} checked={day.checked} onToggle={(id) => dispatch({ type: 'toggle', id })} />
      </section>

      <section>
        <SectionHead title="교본에서 내 위치" note={`12단원 중 ${cur.no}단원`} />
        <div className="mt-2.5 grid grid-cols-12 gap-1">
          {chaptersOf(PARTS).map((c) => {
            const st = chapterStatus(PARTS, s.passed, c.id)
            return <i key={c.id} title={c.title} className={`h-7 rounded-full ${st === 'done' ? 'bg-forest' : st === 'now' ? 'bg-gold' : 'bg-line'}`} />
          })}
        </div>
        <div className="mt-1.5 flex justify-between text-[11.5px] text-sub"><span>그립</span><span>코스 매니지먼트</span></div>
      </section>

      <button onClick={() => nav.setTab('mind')} className="flex items-start justify-between gap-3 rounded-[20px] bg-forest-soft px-[18px] py-4 text-left">
        <span>
          <small className="block text-xs text-sub">오늘의 멘탈 카드</small>
          <b className="mt-0.5 block text-[15px] font-medium leading-normal">“{mental.principle}”</b>
          <span className="mt-1 block text-[13px] text-sub">{mental.body}</span>
        </span>
        <ArrowRight size={18} className="mt-1 flex-none text-sub" />
      </button>
    </div>
  )
}

function Fact({ n, u }: { n: number | string; u: string }) {
  return (
    <div className="flex flex-col">
      <b className="font-num text-[22px] font-normal leading-tight tabular">{n}</b>
      <span className="text-[11px] text-hero-sub">{u}</span>
    </div>
  )
}
