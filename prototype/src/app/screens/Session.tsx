import { useEffect, useRef, useState, type RefObject } from 'react'
import { ArrowCounterClockwise, Check, PlayCircle, X } from '@phosphor-icons/react'
import { PARTS } from '@/data/content'
import { MENTAL_CARDS } from '@/data/mental'
import { useStore } from '@/state/store'
import {
  ballsOfDay, findChapter, findLesson, isAssignmentDone, mentalCardFor, stepDone, stepProgress, stepsFor, testStep,
  type Step,
} from '@/logic/progress'
import { useNav } from '../nav'
import { Button, CheckDot, Sheet, VideoPlayer, fmt } from '../ui'

const UNIT = { balls: '공', reps: '회', timer: '', check: '' } as const

// 연습 모드: 오늘 연습을 한 단계씩, 화면 아래 절반의 큰 버튼으로 기록한다.
// only가 있으면 그 단원의 통과 테스트 한 단계만 진행한다.
export function Session({ start, only }: { start?: number; only?: string }) {
  const { s } = useStore()
  const nav = useNav()
  const day = s.days[s.today]
  const mental = mentalCardFor(MENTAL_CARDS, s.startDate, s.today)
  const active = day.assignments.find((a) => !isAssignmentDone(PARTS, day, a)) ?? day.assignments[day.assignments.length - 1]
  const onlyCh = only ? findChapter(PARTS, only) : undefined
  const steps: Step[] = onlyCh ? [testStep(onlyCh)] : active ? stepsFor(PARTS, active, mental) : []
  const firstOpen = steps.findIndex((st) => !stepDone(day, st))
  const [idx, setIdx] = useState(start ?? (firstOpen < 0 ? steps.length : firstOpen))
  const [video, setVideo] = useState(false)
  const title = useRef<HTMLHeadingElement>(null)
  const lesson = !onlyCh && active?.type === 'lesson' ? findLesson(PARTS, active.lessonId)?.lesson : undefined

  useEffect(() => { title.current?.focus({ preventScroll: true }) }, [idx])

  const step = steps[idx]
  const doneCount = steps.filter((st) => stepDone(day, st)).length
  const go = (i: number) => setIdx(Math.max(0, Math.min(steps.length, i)))

  // 목표에 막 도달하면 잠깐 보여 준 뒤 다음 단계로 넘어간다
  // (단계를 옮겨 이미 끝난 단계를 볼 때는 넘어가지 않는다)
  const isDone = step ? stepDone(day, step) : false
  const prev = useRef({ id: step?.id, done: isDone })
  useEffect(() => {
    const was = prev.current
    prev.current = { id: step?.id, done: isDone }
    if (!step || step.kind === 'test' || was.id !== step.id || was.done || !isDone) return
    const t = window.setTimeout(() => go(idx + 1), 700)
    return () => window.clearTimeout(t)
  }, [isDone, step?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-full flex-col bg-bg">
      <header className="flex items-center gap-3 px-4 pb-3 pt-[max(16px,env(safe-area-inset-top))]">
        <button onClick={nav.pop} aria-label="연습 닫기" className="grid h-11 w-11 place-items-center rounded-full text-sub ring-1 ring-inset ring-line"><X size={18} /></button>
        <div className="flex-1">
          <div className="flex justify-between text-12 text-sub">
            <span>{onlyCh ? '통과 테스트' : '오늘 연습'}</span>
            <span className="font-num tabular">{Math.min(idx + 1, steps.length)}/{steps.length}</span>
          </div>
          <div className="mt-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }} aria-hidden="true">
            {steps.map((st, i) => <i key={st.id} className={`h-1 rounded-full ${stepDone(day, st) ? 'bg-forest' : i === idx ? 'bg-gold' : 'bg-line'}`} />)}
          </div>
        </div>
        {lesson && (
          <button onClick={() => setVideo(true)} className="flex min-h-[44px] items-center gap-1 rounded-full px-3 text-13 font-medium ring-1 ring-inset ring-line">
            <PlayCircle size={18} aria-hidden="true" />영상
          </button>
        )}
      </header>

      <main inert={video} className="flex flex-1 flex-col overflow-y-auto px-5 pb-[max(16px,env(safe-area-inset-bottom))]">
        {step ? (
          <div key={step.id} className="anim-slide flex flex-1 flex-col">
            <div>
              {'tag' in step && step.tag && <p className="text-12 font-bold text-gold-text">{step.tag}</p>}
              <h1 ref={title} tabIndex={-1} data-screen-title className="text-24 font-medium tracking-tight">{step.title}</h1>
              <p className="mt-2 text-14 text-sub">{step.detail}</p>
            </div>
            <div className="flex flex-1 flex-col justify-end gap-3 pt-6">
              <Control step={step} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button variant="ghost" disabled={idx === 0} onClick={() => go(idx - 1)}>이전</Button>
              <Button variant="ghost" onClick={() => go(idx + 1)}>{isDone ? '다음' : '건너뛰기'}</Button>
            </div>
          </div>
        ) : (
          <Summary steps={steps} doneCount={doneCount} balls={ballsOfDay(PARTS, day)} onBack={() => go(steps.length - 1)} titleRef={title} />
        )}
      </main>

      {lesson && (
        <Sheet open={video} onClose={() => setVideo(false)} label="레슨 영상">
          <h2 className="mb-3 text-17 font-medium">{lesson.title}</h2>
          <VideoPlayer duration={lesson.durationSec} marks={lesson.marks} youtubeId={lesson.youtubeId} />
        </Sheet>
      )}
    </div>
  )

}

function Control({ step }: { step: Step }) {
  const { s, dispatch } = useStore()
  const day = s.days[s.today]
  const isDone = stepDone(day, step)
  const n = stepProgress(day, step)
  if (step.kind === 'test') return <TestControl step={step} />
  if (step.kind === 'check') {
    return (
      <button onClick={() => dispatch({ type: 'check', id: step.id, on: !isDone })} aria-pressed={isDone}
        className={`flex min-h-[176px] flex-col items-center justify-center gap-2 rounded text-20 font-bold transition-transform active:scale-[0.98] ${isDone ? 'bg-forest text-surface' : 'bg-gold text-gold-ink'}`}>
        {isDone ? <><Check size={32} weight="bold" aria-hidden="true" />했어요</> : '했어요'}
      </button>
    )
  }
  if (step.kind === 'timer') return <TimerControl step={step} seconds={n} />
  const unit = UNIT[step.kind]
  return (
    <>
      <p className="text-center" aria-live="polite">
        <span className="font-num text-56 font-light tabular">{n}</span>
        <span className="font-num text-20 text-sub"> / {step.target} {unit}</span>
      </p>
      <button onClick={() => dispatch({ type: 'count', id: step.id, delta: 1, target: step.target })} disabled={n >= step.target}
        className="flex min-h-[176px] flex-col items-center justify-center rounded bg-gold text-gold-ink transition-transform active:scale-[0.98] disabled:bg-forest disabled:text-surface">
        <span className="text-24 font-bold">{n >= step.target ? '다 했어요' : step.kind === 'balls' ? '한 개 쳤어요' : '1회 했어요'}</span>
      </button>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="ghost" disabled={n === 0} onClick={() => dispatch({ type: 'count', id: step.id, delta: -1, target: step.target })}>
          <span className="inline-flex items-center gap-1"><ArrowCounterClockwise size={16} aria-hidden="true" />하나 취소</span>
        </Button>
        <Button variant="ghost" disabled={n >= step.target} onClick={() => dispatch({ type: 'count', id: step.id, delta: 5, target: step.target })}>+5</Button>
      </div>
    </>
  )
}

function TimerControl({ step, seconds }: { step: Extract<Step, { kind: 'balls' | 'reps' | 'timer' | 'check' }>; seconds: number }) {
  const { dispatch } = useStore()
  const isDone = seconds >= step.target
  const [running, setRunning] = useState(false)
  useEffect(() => {
    if (!running || seconds >= step.target) return
    const t = window.setInterval(() => dispatch({ type: 'count', id: step.id, delta: 1, target: step.target }), 1000)
    return () => window.clearInterval(t)
  }, [running, seconds, step])
  return (
    <>
      <p className="text-center font-num text-56 font-light tabular" aria-live="off">{fmt(seconds)}<span className="text-20 text-sub"> / {fmt(step.target)}</span></p>
      <button onClick={() => setRunning((r) => !r)} disabled={isDone}
        className="min-h-[176px] rounded bg-gold text-24 font-bold text-gold-ink transition-transform active:scale-[0.98] disabled:bg-forest disabled:text-surface">
        {isDone ? '다 했어요' : running ? '잠깐 멈춤' : seconds > 0 ? '이어서 시작' : '타이머 시작'}
      </button>
      <Button variant="ghost" disabled={isDone} onClick={() => dispatch({ type: 'count', id: step.id, delta: step.target, target: step.target })}>시간 안 재고 끝냈어요</Button>
    </>
  )
}

function TestControl({ step }: { step: Extract<Step, { kind: 'test' }> }) {
  const { s, dispatch } = useStore()
  const day = s.days[s.today]
  const shots = day.shots[step.chapterId] ?? []
  const result = [...day.tests].reverse().find((t) => t.chapterId === step.chapterId)
  const [ticks, setTicks] = useState<number[]>([])
  const [confirmEmpty, setConfirmEmpty] = useState(false)
  const [retry, setRetry] = useState(false)
  if (result && shots.length === 0 && !retry) {
    return (
      <div className={`rounded p-5 ${result.passed ? 'bg-hero text-hero-ink' : 'bg-surface'}`} role="status">
        <p className="font-num text-56 font-light tabular">{result.score}<small className="text-20">/{result.of}</small></p>
        <p className="mt-2 text-20 font-medium">{result.passed ? '통과했어요' : `통과 기준은 ${result.need}개예요`}</p>
        <p className={`mt-1 text-14 ${result.passed ? 'text-hero-sub' : 'text-sub'}`}>
          {!result.passed ? '결과를 기록에 남겼어요. 다시 도전은 횟수 제한 없이 할 수 있어요.'
            : result.unlocked ? '다음 단원이 열렸어요.' : '이미 통과한 단원이라 기록만 남겼어요.'}
        </p>
        <button onClick={() => { setRetry(true); setTicks([]) }} className={`mt-4 min-h-[44px] rounded-full px-4 text-14 font-bold ring-1 ring-inset ${result.passed ? 'ring-hero-line' : 'ring-line'}`}>다시 도전</button>
      </div>
    )
  }
  if (step.items) {
    return (
      <>
        <ul className="flex flex-col rounded bg-surface px-4 py-1">
          {step.items.map((it, i) => {
            const on = ticks.includes(i)
            return (
              <li key={i}>
                <button onClick={() => setTicks((x) => (on ? x.filter((y) => y !== i) : [...x, i]))} aria-pressed={on}
                  className="grid min-h-[52px] w-full grid-cols-[24px_1fr] items-start gap-3 border-b py-3 text-left text-14">
                  <CheckDot on={on} />{it}
                </button>
              </li>
            )
          })}
        </ul>
        {confirmEmpty && ticks.length === 0 && <p className="text-14" role="status">아무 항목도 체크하지 않았어요. 이대로 저장할까요?</p>}
        <Button onClick={() => {
          if (ticks.length === 0 && !confirmEmpty) { setConfirmEmpty(true); return }
          dispatch({ type: 'test', result: { chapterId: step.chapterId, score: ticks.length, of: step.of, need: step.need, passed: ticks.length >= step.need, balls: 0 } })
          setRetry(false)
        }}>{confirmEmpty && ticks.length === 0 ? '이대로 저장' : '결과 저장'}</Button>
      </>
    )
  }
  const ok = shots.filter(Boolean).length
  const full = shots.length >= step.of
  return (
    <>
      <div className="flex flex-col items-center gap-2">
        <p aria-live="polite"><span className="font-num text-56 font-light tabular">{ok}</span><span className="font-num text-20 text-sub"> 성공 / {shots.length}개 쳤어요</span></p>
        <p className="text-13 text-sub">통과 기준: {step.of}개 중 {step.need}개</p>
        <div className="flex gap-1" aria-hidden="true">
          {Array.from({ length: step.of }, (_, i) => <i key={i} className={`h-3 w-3 rounded-full ${i >= shots.length ? 'ring-1 ring-inset ring-line' : shots[i] ? 'bg-forest' : 'bg-sub'}`} />)}
        </div>
      </div>
      {full ? (
        <button onClick={() => { dispatch({ type: 'saveShots', chapterId: step.chapterId, need: step.need }); setRetry(false) }}
          className="min-h-[160px] rounded bg-gold text-gold-ink active:scale-[0.98]">
          <span className="block text-24 font-bold">결과 저장</span>
          <span className="block text-15">{step.of}개 중 {ok}개 성공, {ok >= step.need ? '통과' : '미통과'}</span>
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => dispatch({ type: 'shot', chapterId: step.chapterId, ok: true, of: step.of })}
            className="min-h-[160px] rounded bg-forest text-24 font-bold text-surface active:scale-[0.98]">성공</button>
          <button onClick={() => dispatch({ type: 'shot', chapterId: step.chapterId, ok: false, of: step.of })}
            className="min-h-[160px] rounded bg-surface text-24 font-bold ring-1 ring-inset ring-line active:scale-[0.98]">실패</button>
        </div>
      )}
      <Button variant="ghost" disabled={shots.length === 0} onClick={() => dispatch({ type: 'undoShot', chapterId: step.chapterId })}>
        <span className="inline-flex items-center gap-1"><ArrowCounterClockwise size={16} aria-hidden="true" />마지막 공 취소</span>
      </Button>
    </>
  )
}

function Summary({ steps, doneCount, balls, onBack, titleRef }: { steps: Step[]; doneCount: number; balls: number; onBack: () => void; titleRef: RefObject<HTMLHeadingElement | null> }) {
  const { s, dispatch } = useStore()
  const nav = useNav()
  const day = s.days[s.today]
  const [good, setGood] = useState(day.reflection?.good ?? '')
  const [fix, setFix] = useState(day.reflection?.fix ?? '')
  const all = doneCount === steps.length
  const input = 'mt-2 w-full rounded-sm bg-surface px-4 py-3 text-15 text-ink outline-none ring-1 ring-inset ring-line placeholder:text-sub focus-visible:ring-2 focus-visible:ring-gold'
  const finish = () => {
    if (good.trim() || fix.trim()) dispatch({ type: 'reflect', good: good.trim(), fix: fix.trim() })
    nav.pop()
  }
  return (
    <div className="anim-rise flex flex-col gap-5">
      <h1 ref={titleRef} tabIndex={-1} data-screen-title className="text-24 font-bold tracking-tight">
        {all ? '오늘 연습 끝났어요' : `연습 ${steps.length}개 중 ${doneCount}개 끝냈어요`}
      </h1>
      <dl className="grid grid-cols-2 gap-3">
        <div className="flex flex-col-reverse rounded bg-hero p-4 text-hero-ink"><dt className="text-12 text-hero-sub">오늘 친 공</dt><dd className="font-num text-32 tabular">{balls}</dd></div>
        <div className="flex flex-col-reverse rounded bg-surface p-4"><dt className="text-12 text-sub">끝낸 연습</dt><dd className="font-num text-32 tabular">{doneCount}/{steps.length}</dd></div>
      </dl>
      {!all && <button onClick={onBack} className="min-h-[44px] self-start text-14 font-medium text-gold-text underline underline-offset-4">남은 연습으로 돌아가기</button>}
      <section>
        <h2 className="text-17 font-medium">30초 회고</h2>
        <p className="mt-1 text-13 text-sub">한 줄씩이면 충분해요. 비워 두고 끝내도 돼요.</p>
        <label htmlFor="s-good" className="mt-4 block text-13 font-bold text-forest">오늘 잘된 것 하나</label>
        <input id="s-good" value={good} onChange={(e) => setGood(e.target.value)} placeholder="예: 피니시에서 3초 버텼다" className={input} />
        <label htmlFor="s-fix" className="mt-4 block text-13 font-bold text-gold-text">다음에 고칠 것 하나</label>
        <input id="s-fix" value={fix} onChange={(e) => setFix(e.target.value)} placeholder="예: 오른발 뒤꿈치가 덜 들린다" className={input} />
      </section>
      <Button onClick={finish} className="w-full">{good.trim() || fix.trim() ? '회고 저장하고 끝내기' : '끝내기'}</Button>
    </div>
  )
}

