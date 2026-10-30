import { useState } from 'react'
import { Check, Minus, Plus } from '@phosphor-icons/react'
import { PARTS } from '@/data/content'
import { useStore } from '@/state/store'
import { chaptersOf, chapterStatus, findChapter } from '@/logic/progress'
import { useNav } from '../nav'
import { BackBar } from './Book'
import { Button } from '../ui'

export function TestScreen({ chapterId }: { chapterId: string }) {
  const ch = findChapter(PARTS, chapterId)!
  const { s, dispatch } = useStore()
  const nav = useNav()
  const t = ch.test
  const of = t.kind === 'count' ? t.of : t.items.length
  const need = t.kind === 'count' ? t.need : t.items.length
  const [score, setScore] = useState(Math.min(of, need))
  const [ticks, setTicks] = useState<number[]>([])
  const [result, setResult] = useState<null | boolean>(null)
  const status = chapterStatus(PARTS, s.passed, ch.id)
  const next = chaptersOf(PARTS)[ch.no]
  const value = t.kind === 'count' ? score : ticks.length

  const submit = () => {
    const passed = value >= need
    dispatch({ type: 'test', chapterId: ch.id, score: value, of, passed })
    setResult(passed)
  }

  if (result !== null) {
    return (
      <div className="anim-rise flex flex-col gap-5 pt-6">
        <div className={`rounded-[20px] p-5 ${result ? 'bg-hero text-hero-ink' : 'bg-surface'}`}>
          <p className={`text-xs ${result ? 'text-hero-sub' : 'text-sub'}`}>{ch.no}단원 {ch.title} 통과 테스트</p>
          <b className="mt-1 block font-num text-[56px] font-light leading-none tabular">{value}<small className="text-xl">/{of}</small></b>
          <h3 className="mt-3 text-xl font-medium">{result ? '통과했어요' : `${need}개가 필요해요. 다시 도전해요`}</h3>
          <p className={`mt-1 text-[13.5px] ${result ? 'text-hero-sub' : 'text-sub'}`}>
            {result ? (next ? `${next.no}단원 ${next.title}이 열렸어요. 내일부터 새 단원 레슨이 시작돼요.` : '마지막 단원까지 모두 통과했어요.') : '결과는 기록에 남았어요. 횟수 제한 없이 다시 할 수 있어요.'}
          </p>
        </div>
        <Button onClick={() => { nav.pop(); nav.setTab('home') }}>홈으로</Button>
      </div>
    )
  }

  return (
    <div className="anim-slide flex flex-col gap-5">
      <BackBar label={`${ch.no}단원 ${ch.title}`} />
      <div>
        <p className="text-[12.5px] text-sub">{ch.no}단원 마지막 관문</p>
        <h2 className="text-[22px] font-medium tracking-tight">{ch.title} 통과 테스트</h2>
        <p className="mt-1.5 text-[14px] leading-relaxed">{t.description}</p>
      </div>
      {status === 'done' && <p className="rounded-[14px] bg-forest-soft p-3 text-[13px]">이미 통과한 단원이에요. 연습 삼아 다시 기록할 수 있어요.</p>}

      {t.kind === 'count' ? (
        <div className="flex flex-col items-center gap-4 rounded-[20px] bg-surface py-6">
          <span className="text-[13px] text-sub">{of}개 중 성공한 개수</span>
          <div className="flex items-center gap-6">
            <button aria-label="하나 빼기" onClick={() => setScore((x) => Math.max(0, x - 1))} className="grid h-14 w-14 place-items-center rounded-full ring-1 ring-inset ring-line active:scale-95"><Minus size={20} /></button>
            <b className="w-20 text-center font-num text-[64px] font-light leading-none tabular">{score}</b>
            <button aria-label="하나 더하기" onClick={() => setScore((x) => Math.min(of, x + 1))} className="grid h-14 w-14 place-items-center rounded-full ring-1 ring-inset ring-line active:scale-95"><Plus size={20} /></button>
          </div>
          <span className={`text-[13px] font-medium ${score >= need ? 'text-forest' : 'text-sub'}`}>통과선 {need}개 {score >= need ? '넘었어요' : `까지 ${need - score}개`}</span>
        </div>
      ) : (
        <ul className="flex flex-col rounded-[20px] bg-surface px-4 py-1">
          {t.items.map((it, i) => {
            const on = ticks.includes(i)
            return (
              <li key={i}>
                <button onClick={() => setTicks((x) => (on ? x.filter((y) => y !== i) : [...x, i]))} aria-pressed={on}
                  className="grid min-h-[52px] w-full grid-cols-[26px_1fr] items-center gap-3 border-b border-line py-3 text-left text-[14px]">
                  <span className={`grid h-[23px] w-[23px] place-items-center rounded-full ${on ? 'bg-forest text-surface' : 'ring-[1.5px] ring-inset ring-sub'}`}>{on && <Check size={13} weight="bold" />}</span>
                  {it}
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
