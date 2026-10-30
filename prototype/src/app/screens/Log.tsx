import { PARTS } from '@/data/content'
import { MENTAL_CARDS } from '@/data/mental'
import { useStore } from '@/state/store'
import { ballsOf, chaptersOf, daySteps, findChapter, isActiveDay, lessonLabel, mentalCardFor, metMentalCards, stepDone, streak, testHistory } from '@/logic/progress'
import { SectionHead } from '../ui'

export function Log() {
  const { s } = useStore()
  const tests = testHistory(s.days).slice(-8)
  const days = Object.values(s.days).filter(isActiveDay).sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="flex flex-col gap-6">
      <h1 data-screen-title tabIndex={-1} className="text-24 font-bold tracking-tight">성장 기록</h1>
      <dl className="grid grid-cols-3 gap-3 rounded bg-surface p-4">
        <Mini n={`${streak(s.days, s.today)}일`} u="연속 연습" />
        <Mini n={`${s.passed.length}/${chaptersOf(PARTS).length}`} u="통과한 단원" />
        <Mini n={ballsOf(PARTS, s.days).toLocaleString('ko-KR')} u="지금까지 친 공" />
      </dl>

      <section className="rounded bg-surface p-4 pb-3">
        <SectionHead title="통과 테스트 결과" note={tests.length ? `최근 ${tests.length}회` : undefined} />
        {tests.length ? <Chart tests={tests} /> : <p className="py-6 text-center text-13 text-sub">첫 통과 테스트를 하면 여기에 쌓여요.</p>}
      </section>

      <section>
        <SectionHead title="연습 일지" note="끝낸 연습 / 테스트 결과" />
        {days.length === 0 ? <p className="mt-2 rounded bg-surface p-5 text-center text-13 text-sub">첫 연습을 끝내면 여기에 쌓여요.</p> : (
          <ul className="mt-2 flex flex-col rounded bg-surface px-4 py-1">
            {days.slice(0, 10).map((d) => {
              const titles = d.assignments.map((a) => lessonLabel(PARTS, a)?.title).filter(Boolean)
              const t = d.tests[d.tests.length - 1]
              const items = daySteps(PARTS, d, mentalCardFor(MENTAL_CARDS, s.startDate, d.date))
              const done = items.filter((st) => stepDone(d, st)).length
              return (
                <li key={d.date} className="grid grid-cols-[48px_1fr_auto] gap-3 border-b py-3 text-14 last:border-0">
                  <span className="font-num text-13 text-sub tabular">{d.date.slice(5).replace('-', '/')}</span>
                  <span className="min-w-0">
                    {titles.join(', ') || '연습'}
                    {d.reflection?.fix && <small className="mt-1 block text-12 text-sub">고칠 것: {d.reflection.fix}</small>}
                  </span>
                  <span className="text-right font-num text-13 tabular">
                    <span className="block text-sub">{done}/{items.length}</span>
                    {t && <span className={`block ${t.passed ? 'font-semibold text-forest' : 'text-sub'}`}>{t.score}/{t.of} {t.passed ? '통과' : ''}</span>}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}

function Mini({ n, u }: { n: string; u: string }) {
  return (
    <div className="flex flex-col-reverse">
      <dt className="text-12 text-sub">{u}</dt>
      <dd className="font-num text-24 leading-tight tabular">{n}</dd>
    </div>
  )
}

// 막대마다 그 단원의 통과 기준을 금색 눈금으로 표시한다 (단원마다 기준이 다름).
function Chart({ tests }: { tests: ReturnType<typeof testHistory> }) {
  const w = 300, h = 150, pl = 36, pb = 26, bw = (w - pl - 6) / Math.max(tests.length, 4)
  const y = (ratio: number) => h - pb - ratio * (h - pb - 14)
  return (
    <figure className="mt-3">
      <svg viewBox={`0 0 ${w} ${h}`} className="block h-auto w-full" role="img"
        aria-label={`최근 통과 테스트 ${tests.length}회: ` + tests.map((t) => `${findChapter(PARTS, t.chapterId)?.no}단원 ${t.score}/${t.of} ${t.passed ? '통과' : '미통과'}`).join(', ')}>
        {[0, 0.5, 1].map((r) => <text key={r} x={pl - 6} y={y(r) + 4} fontSize="11.3" textAnchor="end" fill="var(--sub)">{r * 100}%</text>)}
        {tests.map((t, i) => {
          const x = pl + 5 + i * bw, bwid = bw - 12
          return (
            <g key={i}>
              <rect x={x} y={y(t.score / t.of)} width={bwid} height={Math.max(2, h - pb - y(t.score / t.of))} rx={bwid / 2} fill={t.passed ? 'var(--forest)' : 'var(--sub)'} />
              <line x1={x - 3} x2={x + bwid + 3} y1={y(t.need / t.of)} y2={y(t.need / t.of)} stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" />
              <text x={x + bwid / 2} y={h - 8} fontSize="11.3" textAnchor="middle" fill="var(--sub)">{findChapter(PARTS, t.chapterId)?.no}단원</text>
            </g>
          )
        })}
      </svg>
      <figcaption className="mt-2 flex flex-wrap gap-4 text-12 text-sub">
        <span className="flex items-center gap-1"><i className="h-1 w-3 rounded-full bg-gold" />그 단원의 통과 기준</span>
        <span className="flex items-center gap-1"><i className="h-3 w-3 rounded-full bg-forest" />통과</span>
        <span className="flex items-center gap-1"><i className="h-3 w-3 rounded-full bg-sub" />미통과</span>
      </figcaption>
    </figure>
  )
}

export function Mental() {
  const { s } = useStore()
  const today = mentalCardFor(MENTAL_CARDS, s.startDate, s.today)
  const met = metMentalCards(MENTAL_CARDS, s.startDate, s.today).filter((c) => c.id !== today.id).reverse()
  const reflections = Object.values(s.days).filter((d) => d.reflection).sort((a, b) => b.date.localeCompare(a.date))
  return (
    <div className="flex flex-col gap-6">
      <h1 data-screen-title tabIndex={-1} className="text-24 font-bold tracking-tight">멘탈 노트</h1>
      <section aria-label="오늘의 멘탈 카드" className="rounded bg-hero p-5 text-hero-ink">
        <p className="text-12 text-hero-sub">오늘의 멘탈 카드</p>
        <p className="mt-1 text-20 font-medium">“{today.principle}”</p>
        <p className="mt-2 text-14 text-hero-sub">{today.body}</p>
        <p className="mt-3 rounded-sm bg-hero-tint p-3 text-14"><b className="mr-2 text-gold-hero">오늘 할 것</b>{today.drill}</p>
      </section>
      <section>
        <SectionHead title="지금까지 만난 카드" note={`${met.length + 1}/${MENTAL_CARDS.length}장`} />
        <div className="no-scrollbar -mx-5 mt-3 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
          {met.length === 0 && <p className="text-13 text-sub">내일부터 하루에 한 장씩 쌓여요.</p>}
          {met.map((c) => (
            <div key={c.id} className="w-[220px] flex-none snap-start rounded bg-forest-soft p-4">
              <p className="text-14 font-medium">{c.principle}</p>
              <p className="mt-2 text-13 text-sub">{c.drill}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <SectionHead title="회고 모음" note="잘된 것 하나, 고칠 것 하나" />
        {reflections.length === 0 ? <p className="mt-2 text-13 text-sub">오늘 연습을 끝내면 30초 회고를 남길 수 있어요.</p> : (
          <ul className="mt-2 flex flex-col gap-2">
            {reflections.map((d) => (
              <li key={d.date} className="rounded bg-surface p-4 text-14">
                <span className="font-num text-12 text-sub">{d.date.slice(5).replace('-', '/')}</span>
                {d.reflection!.good && <p className="mt-1"><b className="mr-2 text-forest">잘된 것</b>{d.reflection!.good}</p>}
                {d.reflection!.fix && <p className="mt-1"><b className="mr-2 text-gold-text">고칠 것</b>{d.reflection!.fix}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
