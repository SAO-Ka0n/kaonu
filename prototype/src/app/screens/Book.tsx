import { CaretLeft, CaretRight, LockSimple, Flag } from '@phosphor-icons/react'
import { PARTS } from '@/data/content'
import type { Chapter } from '@/data/types'
import { useStore } from '@/state/store'
import { chapterStatus, findChapter, findLesson, isAssignmentDone, itemId, routineFor, mentalCardFor } from '@/logic/progress'
import { MENTAL_CARDS } from '@/data/mental'
import { useNav } from '../nav'
import { Routine, SectionHead, Thumb, VideoPlayer } from '../ui'

export function BackBar({ label }: { label: string }) {
  const nav = useNav()
  return (
    <button onClick={nav.pop} className="-ml-1 flex min-h-[40px] items-center gap-1 self-start pr-3 text-[13.5px] text-sub">
      <CaretLeft size={16} />{label}
    </button>
  )
}

export function Book() {
  const { s } = useStore()
  const nav = useNav()
  let no = 0
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-light leading-snug tracking-tight">골프 바이블<br /><b className="font-bold">12단원</b></h2>
        <p className="mt-1.5 text-[13px] text-sub">단원마다 영상 레슨과 통과 테스트가 있어요. 테스트를 통과하면 다음 단원이 열려요.</p>
      </div>
      {PARTS.map((p) => (
        <div key={p.id}>
          <h5 className="mb-1.5 text-xs font-medium text-sub">{p.title}</h5>
          <div className="flex flex-col rounded-[20px] bg-surface px-3.5 py-1">
            {p.chapters.map((c) => {
              no++
              const st = chapterStatus(PARTS, s.passed, c.id)
              const row = (
                <button key={c.id}
                  onClick={() => st === 'locked' ? nav.toast('앞 단원을 통과하면 열려요') : nav.push({ name: 'chapter', chapterId: c.id })}
                  className="grid min-h-[50px] w-full grid-cols-[30px_1fr_auto] items-center gap-2.5 border-b border-line py-3 text-left last:border-0">
                  <span className={`font-num text-[15px] tabular ${st === 'now' ? 'text-gold' : 'text-sub'} ${st === 'locked' ? 'opacity-60' : ''}`}>{String(no).padStart(2, '0')}</span>
                  <span className={`text-[14.5px] ${st === 'locked' ? 'text-sub opacity-60' : ''}`}>{c.title}</span>
                  <span className={`flex items-center gap-1 text-[11.5px] ${st === 'now' ? 'font-bold text-gold' : 'text-sub'}`}>
                    {st === 'done' ? '통과' : st === 'now' ? '진행 중' : <><LockSimple size={12} />잠김</>}
                  </span>
                </button>
              )
              return st === 'now' ? [row, <LessonList key={c.id + 'l'} chapter={c} />] : row
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

function LessonList({ chapter }: { chapter: Chapter }) {
  const { s } = useStore()
  const nav = useNav()
  const today = s.days[s.today].assignments
  return (
    <div className="flex flex-col gap-2.5 border-b border-line pb-3">
      {chapter.lessons.map((l, i) => {
        const done = s.completedLessons.includes(l.id)
        const isToday = today.some((a) => a.type === 'lesson' && a.lessonId === l.id)
        return (
          <button key={l.id} onClick={() => nav.push({ name: 'lesson', lessonId: l.id })} className="grid grid-cols-[96px_1fr] items-center gap-3 text-left">
            <Thumb duration={l.durationSec} small />
            <span>
              <b className={`block text-[13.5px] font-medium leading-snug ${isToday ? 'text-gold' : ''}`}>{i + 1}. {l.title}</b>
              <small className="text-[11.5px] text-sub">{isToday ? '오늘 레슨' : done ? '완료' : '다음 레슨'}</small>
            </span>
          </button>
        )
      })}
      <button onClick={() => nav.push({ name: 'test', chapterId: chapter.id })}
        className="flex min-h-[48px] items-center justify-between rounded-[14px] bg-forest-soft px-3.5 text-left">
        <span className="flex items-center gap-2 text-[13.5px] font-medium"><Flag size={16} className="text-gold" />통과 테스트</span>
        <CaretRight size={14} className="text-sub" />
      </button>
    </div>
  )
}

export function ChapterScreen({ chapterId }: { chapterId: string }) {
  const ch = findChapter(PARTS, chapterId)!
  const { s } = useStore()
  const st = chapterStatus(PARTS, s.passed, ch.id)
  return (
    <div className="anim-slide flex flex-col gap-4">
      <BackBar label="교본" />
      <div>
        <p className="text-xs text-sub">{ch.no}단원 {st === 'done' ? '통과' : '진행 중'}</p>
        <h2 className="text-[22px] font-medium tracking-tight">{ch.title}</h2>
        <p className="mt-1 text-[13.5px] text-sub">{ch.summary}</p>
      </div>
      <LessonList chapter={ch} />
    </div>
  )
}

export function LessonScreen({ lessonId }: { lessonId: string }) {
  const { s, dispatch } = useStore()
  const found = findLesson(PARTS, lessonId)!
  const { lesson, chapter, index } = found
  const day = s.days[s.today]
  const assignment = day.assignments.find((a) => a.type === 'lesson' && a.lessonId === lessonId)
  const items = routineFor(PARTS, { type: 'lesson', lessonId }, mentalCardFor(MENTAL_CARDS, s.startDate, s.today)).filter((it) => it.kind === 'drill')
  const done = items.filter((it) => day.checked.includes(itemId(it))).length
  return (
    <div className="anim-slide flex flex-col gap-5">
      <BackBar label={`${chapter.no}단원 ${chapter.title}`} />
      <VideoPlayer duration={lesson.durationSec} marks={lesson.marks} youtubeId={lesson.youtubeId} />
      <div>
        <p className="text-[12.5px] text-sub">{chapter.title} 단원, 레슨 {index + 1}/{chapter.lessons.length}</p>
        <h2 className="text-[21px] font-medium leading-snug tracking-tight">{lesson.title}</h2>
        <p className="mt-0.5 text-[13.5px] text-sub">{lesson.goal}</p>
      </div>
      <section>
        <SectionHead title="자세 체크포인트" note="거울이나 영상으로 확인" />
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {lesson.checkpoints.map((c) => (
            <div key={c.key} className="rounded-[14px] bg-surface p-3">
              <b className="block font-num text-xl font-normal leading-tight">{c.key}</b>
              <span className="mt-1 block text-[12.5px] leading-snug">{c.text}</span>
            </div>
          ))}
        </div>
      </section>
      <section>
        <SectionHead title="연습 드릴" note={assignment ? `${done}/${items.length}` : '오늘 레슨이 되면 체크할 수 있어요'} />
        {assignment
          ? <Routine items={items} checked={day.checked} onToggle={(id) => dispatch({ type: 'toggle', id })} />
          : <ul className="mt-1 flex flex-col">{lesson.drills.map((d) => (
              <li key={d.id} className="grid grid-cols-[1fr_auto] gap-3 border-b border-line py-3 last:border-0">
                <span><b className="block text-[14.5px] font-medium">{d.title}</b><small className="text-xs text-sub">{d.detail}</small></span>
                <span className="font-num text-[13px] text-sub">{d.qty}</span>
              </li>))}
            </ul>}
        {assignment && isAssignmentDone(PARTS, day, assignment) && <p className="mt-2 text-[13px] font-medium text-forest">이 레슨을 완료했어요.</p>}
      </section>
      <div className="rounded-[20px] p-4 text-[13px] ring-1 ring-inset ring-line">
        <b className="mb-0.5 block text-[13.5px]">단원 통과 기준</b>{chapter.test.description}
      </div>
    </div>
  )
}
