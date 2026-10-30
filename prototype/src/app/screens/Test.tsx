import { PARTS } from '@/data/content'
import { useStore } from '@/state/store'
import { findChapter } from '@/logic/progress'
import { useNav } from '../nav'
import { BackBar } from './Book'
import { Button } from '../ui'

// 테스트 안내. 기록은 연습 모드에서 공마다 성공/실패를 눌러 한다 (나중에 숫자를 기억해서 넣지 않음).
export function TestScreen({ chapterId }: { chapterId: string }) {
  const ch = findChapter(PARTS, chapterId)!
  const { s } = useStore()
  const nav = useNav()
  const t = ch.test
  const passedBefore = s.passed.includes(ch.id)
  const last = Object.values(s.days).flatMap((d) => d.tests).filter((x) => x.chapterId === ch.id).pop()
  return (
    <div className="anim-slide flex flex-col gap-6">
      <BackBar label={`${ch.no}단원 ${ch.title}`} />
      <div>
        <p className="text-13 text-sub">{ch.no}단원 마지막 테스트</p>
        <h1 data-screen-title tabIndex={-1} className="text-24 font-medium tracking-tight">{ch.title} 통과 테스트</h1>
        <p className="mt-2 text-15">{t.description}</p>
      </div>
      <dl className="grid grid-cols-2 gap-3">
        <div className="flex flex-col-reverse rounded bg-surface p-4">
          <dt className="text-12 text-sub">통과 기준</dt>
          <dd className="font-num text-24 tabular">{t.kind === 'count' ? `${t.need}/${t.of}` : `${t.items.length}개 모두`}</dd>
        </div>
        <div className="flex flex-col-reverse rounded bg-surface p-4">
          <dt className="text-12 text-sub">지난 결과</dt>
          <dd className="font-num text-24 tabular">{last ? `${last.score}/${last.of}` : '없음'}</dd>
        </div>
      </dl>
      {t.kind === 'count' && <p className="text-14 text-sub">공을 칠 때마다 성공이나 실패를 눌러요. {t.of}개를 다 치면 결과가 자동으로 기록돼요.</p>}
      {passedBefore && <p className="rounded-sm bg-forest-soft p-3 text-13">이미 통과한 단원이에요. 연습 삼아 다시 기록할 수 있어요.</p>}
      <Button onClick={() => nav.push({ name: 'session', only: ch.id })}>테스트 시작</Button>
    </div>
  )
}
