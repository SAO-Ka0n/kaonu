import { useState } from 'react'
import { Minus, Plus } from '@phosphor-icons/react'
import { PARTS } from '@/data/content'
import { useStore } from '@/state/store'
import { chaptersOf, findChapter } from '@/logic/progress'
import { useNav } from '../nav'
import { BackBar } from './Book'
import { Button, CheckDot } from '../ui'

export function TestScreen({ chapterId }: { chapterId: string }) {
  const ch = findChapter(PARTS, chapterId)!
  const { s, dispatch } = useStore()
  const nav = useNav()
  const t = ch.test
  const of = t.kind === 'count' ? t.of : t.items.length
  const need = t.kind === 'count' ? t.need : t.items.length
  const [score, setScore] = useState(0) // 0에서 시작: 미리 채운 통과 점수 없음 (감사 #6)
  const [ticks, setTicks] = useState<number[]>([])
  const [result, setResult] = useState<null | { passed: boolean; again: boolean }>(null)
  const passedBefore = s.passed.includes(ch.id)
  const next = chaptersOf(PARTS)[ch.no]
  const value = t.kind === 'count' ? score : ticks.length

  const submit = () => {
    const passed = value >= need
    dispatch({ type: 'test', result: { chapterId: ch.id, score: value, of, need, passed, balls: t.kind === 'count' ? of : 0 } })
    setResult({ passed, again: passedBefore })
  }

  if (result) {
    const msg = !result.passed ? '결과를 기록에 남겼어요. 횟수 제한 없이 다시 도전할 수 있어요.'
      : result.again ? '이미 통과한 단원이라 기록만 남겼어요.'
        : next ? `${next.no}단원 ${next.title}이 열렸어요. 내일부터 새 단원 레슨이 시작돼요.` : '마지막 단원까지 모두 통과했어요.'
    return (
      <div className="anim-rise flex flex-col gap-6 pt-6">
        <div className={`rounded p-5 ${result.passed ? 'bg-hero text-hero-ink' : 'bg-surface'}`} role="status">
          <p className={`text-12 ${result.passed ? 'text-hero-sub' : 'text-sub'}`}>{ch.no}단원 {ch.title} 통과 테스트</p>
          <p className="mt-1 font-num text-56 font-light tabular">{value}<small className="text-20">/{of}</small></p>
          <h1 data-screen-title tabIndex={-1} className="mt-3 text-20 font-medium">{result.passed ? '통과했어요' : `통과 기준은 ${need}개예요. 다시 도전해요`}</h1>
          <p className={`mt-1 text-14 ${result.passed ? 'text-hero-sub' : 'text-sub'}`}>{msg}</p>
        </div>
        <Button onClick={() => nav.setTab('home')}>홈으로</Button>
      </div>
    )
  }

  return (
    <div className="anim-slide flex flex-col gap-6">
      <BackBar label={`${ch.no}단원 ${ch.title}`} />
      <div>
        <p className="text-13 text-sub">{ch.no}단원 마지막 테스트</p>
        <h1 data-screen-title tabIndex={-1} className="text-24 font-medium tracking-tight">{ch.title} 통과 테스트</h1>
        <p className="mt-2 text-15">{t.description}</p>
      </div>
      {passedBefore && <p className="rounded-sm bg-forest-soft p-3 text-13">이미 통과한 단원이에요. 연습 삼아 다시 기록할 수 있어요.</p>}

      {t.kind === 'count' ? (
        <div className="flex flex-col items-center gap-4 rounded bg-surface py-6">
          <span id="score-label" className="text-13 text-sub">{of}개 중 성공한 개수</span>
          <div className="flex items-center gap-6">
            <button aria-label="하나 빼기" disabled={score === 0} onClick={() => setScore((x) => Math.max(0, x - 1))} className="grid h-14 w-14 place-items-center rounded-full ring-1 ring-inset ring-line active:scale-95 disabled:opacity-40"><Minus size={20} /></button>
            <output aria-labelledby="score-label" aria-live="polite" className="w-20 text-center font-num text-56 font-light tabular">{score}</output>
            <button aria-label="하나 더하기" disabled={score === of} onClick={() => setScore((x) => Math.min(of, x + 1))} className="grid h-14 w-14 place-items-center rounded-full ring-1 ring-inset ring-line active:scale-95 disabled:opacity-40"><Plus size={20} /></button>
          </div>
          <span className={`text-13 font-medium ${score >= need ? 'text-forest' : 'text-sub'}`}>
            {score >= need ? `통과 기준 ${need}개를 넘었어요` : `통과 기준 ${need}개까지 ${need - score}개 남았어요`}
          </span>
        </div>
      ) : (
        <ul className="flex flex-col rounded bg-surface px-4 py-1">
          {t.items.map((it, i) => {
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
      )}
      <Button onClick={submit}>결과 저장</Button>
    </div>
  )
}
