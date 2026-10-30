import { PARTS } from '@/data/content'
import { MENTAL_CARDS } from '@/data/mental'
import { useStore } from '@/state/store'
import { ballsOf, findChapter, isActiveDay, lessonLabel, mentalCardFor, metMentalCards, streak, testHistory } from '@/logic/progress'
import { SectionHead } from '../ui'

export function Log() {
  const { s } = useStore()
  const tests = testHistory(s.days).slice(-8)
  const days = Object.values(s.days).filter(isActiveDay).sort((a, b) => b.date.localeCompare(a.date))
  const st = streak(s.days, s.today)
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-light tracking-tight">성장 <b className="font-bold">기록</b></h2>
      <div className="grid grid-cols-[1.3fr_1fr] gap-2.5">
        <div className="flex min-h-[150px] flex-col justify-between rounded-[20px] bg-hero p-4 text-hero-ink">
          <span className="text-xs text-hero-sub">연속 연습</span>
          <b className="font-num text-[56px] font-light leading-none tabular">{st}<small className="ml-0.5 text-lg">일</small></b>
        </div>
        <div className="flex flex-col gap-2.5">
          <Mini n={`${s.passed.length}/12`} u="통과한 단원" />
          <Mini n={ballsOf(PARTS, s.days).toLocaleString('ko-KR')} u="누적 공" />
        </div>
      </div>

      <div className="rounded-[20px] bg-surface p-3.5 pb-2.5">
        <SectionHead title="통과 테스트 결과" note={tests.length ? `최근 ${tests.length}회` : undefined} />
        {tests.length ? <Chart tests={tests} /> : <p className="py-6 text-center text-[13px] text-sub">첫 통과 테스트를 하면 여기에 쌓여요.</p>}
      </div>

      <section>
        <SectionHead title="연습 일지" />
        {days.length === 0 ? <p className="mt-2 rounded-[20px] bg-surface p-5 text-center text-[13px] text-sub">첫 연습을 끝내면 여기에 쌓여요.</p> : (
          <div className="mt-2 flex flex-col rounded-[20px] bg-surface px-3.5 py-0.5">
            {days.slice(0, 10).map((d) => {
              const a = d.assignments[0]
              const label = a ? lessonLabel(PARTS, a) : null
              const t = d.tests[d.tests.length - 1]
              return (
                <div key={d.date} className="grid grid-cols-[46px_1fr_auto] gap-2.5 border-b border-line py-3 text-[13.5px] last:border-0">
                  <span className="font-num text-[13px] text-sub tabular">{d.date.slice(5).replace('-', '/')}</span>
                  <span className="min-w-0">
                    {label?.title ?? '연습'}
                    {d.reflection && <small className="mt-0.5 block text-xs text-sub">고칠 것: {d.reflection.fix}</small>}
                  </span>
                  <span className={`font-num text-[13px] tabular ${t?.passed ? 'font-semibold text-forest' : 'text-sub'}`}>
                    {t ? `${t.score}/${t.of}` : `드릴 ${d.checked.length}`}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

function Mini({ n, u }: { n: string; u: string }) {
  return (
    <div className="flex-1 rounded-[20px] bg-surface px-3.5 py-3">
      <b className="block font-num text-2xl font-normal leading-tight tabular">{n}</b>
      <span className="text-[11.5px] text-sub">{u}</span>
    </div>
  )
}

function Chart({ tests }: { tests: ReturnType<typeof testHistory> }) {
  const w = 300, h = 140, pl = 22, pb = 24, bw = (w - pl - 6) / Math.max(tests.length, 4)
  const y = (v: number) => h - pb - (v / 10) * (h - pb - 14)
  const norm = (t: (typeof tests)[number]) => (t.score / t.of) * 10
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-2 block h-auto w-full" role="img" aria-label="최근 통과 테스트 결과, 10점 만점으로 환산">
      {[0, 5, 10].map((v) => <text key={v} x={pl - 6} y={y(v) + 4} fontSize="9" textAnchor="end" fill="var(--sub)">{v}</text>)}
      {tests.map((t, i) => {
        const x = pl + 5 + i * bw, v = norm(t)
        return (
          <g key={i}>
            <rect x={x} y={y(v)} width={bw - 10} height={Math.max(2, h - pb - y(v))} rx={(bw - 10) / 2} fill={t.passed ? 'var(--forest)' : 'var(--line)'} />
            <text x={x + (bw - 10) / 2} y={h - 8} fontSize="8.5" textAnchor="middle" fill="var(--sub)">{findChapter(PARTS, t.chapterId)?.no}단원</text>
          </g>
        )
      })}
      <line x1={pl} x2={w - 2} y1={y(7)} y2={y(7)} stroke="var(--amber)" strokeDasharray="3 4" strokeWidth="1.2" />
      <text x={w - 2} y={y(7) - 5} fontSize="9" textAnchor="end" fill="var(--amber)">보통 통과선 7/10</text>
    </svg>
  )
}

export function Mental() {
  const { s } = useStore()
  const today = mentalCardFor(MENTAL_CARDS, s.startDate, s.today)
  const met = metMentalCards(MENTAL_CARDS, s.startDate, s.today).filter((c) => c.id !== today.id).reverse()
  const reflections = Object.values(s.days).filter((d) => d.reflection).sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-2xl font-light tracking-tight">멘탈 <b className="font-bold">노트</b></h2>
      <div className="rounded-[20px] bg-hero p-5 text-hero-ink">
        <small className="text-xs text-hero-sub">오늘의 멘탈 카드</small>
        <b className="mt-1 block text-[19px] font-medium leading-snug">“{today.principle}”</b>
        <p className="mt-2 text-[13.5px] text-hero-sub">{today.body}</p>
        <p className="mt-3 rounded-[14px] bg-hero-line/60 p-3 text-[13.5px]"><span className="mr-1.5 font-bold text-gold">오늘 할 것</span>{today.drill}</p>
      </div>
      <section>
        <SectionHead title="지금까지 만난 카드" note={`${met.length + 1}/${MENTAL_CARDS.length}장`} />
        <div className="no-scrollbar -mx-[18px] mt-2.5 flex snap-x gap-2.5 overflow-x-auto px-[18px] pb-1">
          {met.length === 0 && <p className="text-[13px] text-sub">내일부터 하루에 한 장씩 쌓여요.</p>}
          {met.map((c) => (
            <div key={c.id} className="w-[220px] flex-none snap-start rounded-[20px] bg-forest-soft p-4">
              <b className="block text-[14px] font-medium leading-snug">{c.principle}</b>
              <p className="mt-1.5 text-[12.5px] text-sub">{c.drill}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <SectionHead title="회고 모음" note="잘된 것 하나, 고칠 것 하나" />
        {reflections.length === 0 ? <p className="mt-2 text-[13px] text-sub">루틴을 끝내면 30초 회고를 남길 수 있어요.</p> : (
          <div className="mt-2 flex flex-col gap-2">
            {reflections.map((d) => (
              <div key={d.date} className="rounded-[20px] bg-surface p-4 text-[13.5px]">
                <span className="font-num text-xs text-sub">{d.date.slice(5).replace('-', '/')}</span>
                <p className="mt-1"><b className="mr-1.5 text-forest">잘된 것</b>{d.reflection!.good}</p>
                <p className="mt-0.5"><b className="mr-1.5 text-gold">고칠 것</b>{d.reflection!.fix}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
