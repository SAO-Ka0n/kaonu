import { CaretLeft, CaretRight, LockSimple, Flag } from '@phosphor-icons/react'
import { PARTS } from '@/data/content'
import type { Chapter } from '@/data/types'
import { useStore } from '@/state/store'
import { chapterStatus, chaptersOf, findChapter, findLesson, isAssignmentDone, itemId } from '@/logic/progress'
import { useNav } from '../nav'
import { Button, Routine, SectionHead, Thumb, VideoPlayer } from '../ui'

export function BackBar({ label }: { label: string }) {
  const nav = useNav()
  return (
    <button onClick={nav.pop} className="-ml-2 flex min-h-[44px] items-center gap-1 self-start pl-1 pr-3 text-14 text-sub">
      <CaretLeft size={16} aria-hidden="true" />{label}<span className="sr-only">로 돌아가기</span>
    </button>
  )
}

export function Book() {
  const { s } = useStore()
  const nav = useNav()
  const total = chaptersOf(PARTS).length
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 data-screen-title tabIndex={-1} className="text-24 font-bold tracking-tight">골프 바이블 {total}단원</h1>
        <p className="mt-2 text-13 text-sub">단원마다 영상 레슨과 통과 테스트가 있어요. 테스트를 통과하면 다음 단원이 열려요.</p>
      </div>
      {PARTS.map((p) => (
        <section key={p.id} aria-label={p.title}>
          <h2 className="mb-2 text-12 font-medium text-sub">{p.title}</h2>
          <ul className="flex flex-col rounded bg-surface px-4 py-1">
            {p.chapters.map((c) => {
              const st = chapterStatus(PARTS, s.passed, c.id)
              const inner = (
                <>
                  <span className={`font-num text-15 tabular ${st === 'now' ? 'text-gold-text' : 'text-sub'}`}>{c.no}</span>
                  <span className={`text-15 ${st === 'locked' ? 'text-sub' : ''}`}>{c.title}</span>
                  <span className={`flex items-center gap-1 text-12 ${st === 'now' ? 'font-bold text-gold-text' : 'text-sub'}`}>
                    {st === 'done' ? <>통과<CaretRight size={12} aria-hidden="true" /></> : st === 'now' ? '진행 중' : <><LockSimple size={12} aria-hidden="true" />잠김</>}
                  </span>
                </>
              )
              const cls = 'grid min-h-[52px] w-full grid-cols-[32px_1fr_auto] items-center gap-3 py-3 text-left'
              return (
                <li key={c.id} className="border-b last:border-0">
                  {st === 'done' ? <button onClick={() => nav.push({ name: 'chapter', chapterId: c.id })} className={cls}>{inner}</button>
                    : st === 'locked' ? <button onClick={() => nav.toast(`${c.no}단원은 앞 단원을 통과하면 열려요`)} aria-disabled="true" className={cls}>{inner}</button>
                      : <div className={cls}>{inner}</div>}
                  {st === 'now' && <LessonList chapter={c} />}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </div>
  )
}

function LessonList({ chapter }: { chapter: Chapter }) {
  const { s } = useStore()
  const nav = useNav()
  const day = s.days[s.today]
  return (
    <div className="flex flex-col gap-3 pb-4">
      {chapter.lessons.map((l, i) => {
        const done = s.completedLessons.includes(l.id)
        const today = day.assignments.find((a) => a.type === 'lesson' && a.lessonId === l.id)
        const todayOpen = !!today && !isAssignmentDone(PARTS, day, today)
        return (
          <button key={l.id} onClick={() => nav.push({ name: 'lesson', lessonId: l.id })} className="grid grid-cols-[96px_1fr] items-center gap-3 text-left">
            <Thumb duration={l.durationSec} small />
            <span>
              <b className={`block text-14 font-medium ${todayOpen ? 'text-gold-text' : ''}`}>{i + 1}. {l.title}</b>
              <small className="text-12 text-sub">{todayOpen ? '오늘 레슨' : done ? '완료' : '예정'}</small>
            </span>
          </button>
        )
      })}
      <button onClick={() => nav.push({ name: 'test', chapterId: chapter.id })}
        className="flex min-h-[48px] items-center justify-between rounded-sm bg-forest-soft px-4 text-left">
        <span className="flex items-center gap-2 text-14 font-medium"><Flag size={16} className="text-gold-text" aria-hidden="true" />{chapter.no}단원 통과 테스트</span>
        <CaretRight size={14} className="text-sub" aria-hidden="true" />
      </button>
    </div>
  )
}

export function ChapterScreen({ chapterId }: { chapterId: string }) {
  const ch = findChapter(PARTS, chapterId)!
  return (
    <div className="anim-slide flex flex-col gap-4">
      <BackBar label="교본" />
      <div>
        <p className="text-12 text-sub">{ch.no}단원, 통과함</p>
        <h1 data-screen-title tabIndex={-1} className="text-24 font-medium tracking-tight">{ch.title}</h1>
        <p className="mt-1 text-14 text-sub">{ch.summary}</p>
      </div>
      <LessonList chapter={ch} />
    </div>
  )
}

export function LessonScreen({ lessonId }: { lessonId: string }) {
  const { s } = useStore()
  const { lesson, chapter, index } = findLesson(PARTS, lessonId)!
  const day = s.days[s.today]
  const assignment = day.assignments.find((a) => a.type === 'lesson' && a.lessonId === lessonId)
  // 드릴은 읽기 전용. 기록은 연습 모드에서만 한다 (같은 일을 하는 길은 하나)
  const items = lesson.drills.map((drill) => ({ kind: 'drill' as const, drill }))
  const done = items.filter((it) => day.checked.includes(itemId(it))).length
  const completed = s.completedLessons.includes(lessonId)
  const nav = useNav()
  return (
    <div className="anim-slide flex flex-col gap-6">
      <BackBar label={`${chapter.no}단원 ${chapter.title}`} />
      <VideoPlayer duration={lesson.durationSec} marks={lesson.marks} youtubeId={lesson.youtubeId} />
      <div>
        <p className="text-13 text-sub">{chapter.no}단원 {chapter.title}, 레슨 {index + 1}/{chapter.lessons.length}</p>
        <h1 data-screen-title tabIndex={-1} className="text-20 font-medium tracking-tight">{lesson.title}</h1>
        <p className="mt-1 text-14 text-sub">{lesson.goal}</p>
      </div>
      <section>
        <SectionHead title="자세 체크포인트" note="거울이나 영상으로 확인" />
        <dl className="mt-3 grid grid-cols-2 gap-2">
          {lesson.checkpoints.map((c) => (
            <div key={c.key} className="flex flex-col rounded-sm bg-surface p-3">
              <dt className="font-num text-20 leading-tight">{c.key}</dt>
              <dd className="mt-1 text-13">{c.text}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section>
        <SectionHead title="연습 드릴"
          note={assignment ? `오늘 ${done}/${items.length} 끝냄` : completed ? '완료한 레슨이에요' : '이 레슨 차례가 되면 연습할 수 있어요'} />
        <Routine items={items} checked={day.checked} />
        {assignment && !isAssignmentDone(PARTS, day, assignment) && (
          <Button onClick={() => nav.push({ name: 'session' })} className="mt-4 w-full">이 레슨으로 연습 시작</Button>
        )}
      </section>
      <div className="rounded p-4 text-13 ring-1 ring-inset ring-line">
        <b className="mb-1 block text-14">{chapter.no}단원 통과 기준</b>{chapter.test.description}
      </div>
    </div>
  )
}
