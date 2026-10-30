import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, ChartLineUp, House, Brain } from '@phosphor-icons/react'
import { PARTS } from '@/data/content'
import { useStore } from '@/state/store'
import { chaptersOf } from '@/logic/progress'
import { NavCtx, type Nav, type Route, type Tab } from './nav'
import { Home } from './screens/Home'
import { Book, ChapterScreen, LessonScreen } from './screens/Book'
import { TestScreen } from './screens/Test'
import { Session } from './screens/Session'
import { Log, Mental } from './screens/Log'
import { Button, Sheet } from './ui'

const TABS: { key: Tab; label: string; Icon: typeof House }[] = [
  { key: 'home', label: '홈', Icon: House },
  { key: 'book', label: '교본', Icon: BookOpen },
  { key: 'log', label: '기록', Icon: ChartLineUp },
  { key: 'mind', label: '멘탈', Icon: Brain },
]

export function PhoneApp() {
  const { s, dispatch, saveFailed } = useStore()
  const [tab, setTabState] = useState<Tab>('home')
  const [stack, setStack] = useState<Route[]>([])
  const [toastMsg, setToast] = useState('')
  const [reflectOpen, setReflectOpen] = useState(false)
  const scroller = useRef<HTMLElement>(null)
  const navigated = useRef(false)

  const toast = useCallback((m: string) => { setToast(m); window.setTimeout(() => setToast(''), 2200) }, [])
  const nav: Nav = useMemo(() => ({
    setTab: (t) => { navigated.current = true; setTabState(t); setStack([]) },
    push: (r) => { navigated.current = true; setStack((x) => [...x, r]) },
    pop: () => { navigated.current = true; setStack((x) => x.slice(0, -1)) },
    toast,
    openReflect: () => setReflectOpen(true),
  }), [toast])

  // 화면이 바뀌면 맨 위로 올리고, 화면 제목으로 포커스를 옮겨 스크린 리더가 새 화면을 읽게 한다
  useEffect(() => {
    scroller.current?.scrollTo({ top: 0 })
    if (navigated.current) scroller.current?.querySelector<HTMLElement>('[data-screen-title]')?.focus({ preventScroll: true })
  }, [tab, stack])

  if (!s.onboarded) return <Onboarding onStart={() => dispatch({ type: 'onboard' })} />

  const top = stack[stack.length - 1]
  if (top?.name === 'session') {
    return (
      <NavCtx.Provider value={nav}>
        <div className="relative h-full overflow-hidden">
          <Session key={JSON.stringify(top)} start={top.start} only={top.only} />
          {saveFailed && <p role="alert" className="absolute inset-x-4 top-20 rounded-sm bg-surface p-3 text-13 ring-1 ring-inset ring-line">기록을 저장하지 못했어요. 브라우저의 저장 공간 설정을 확인해 주세요.</p>}
        </div>
      </NavCtx.Provider>
    )
  }
  const screen = top
    ? top.name === 'lesson' ? <LessonScreen key={top.lessonId} lessonId={top.lessonId} />
      : top.name === 'test' ? <TestScreen key={top.chapterId} chapterId={top.chapterId} />
        : <ChapterScreen key={top.chapterId} chapterId={top.chapterId} />
    : { home: <Home />, book: <Book />, log: <Log />, mind: <Mental /> }[tab]

  return (
    <NavCtx.Provider value={nav}>
      <div className="relative flex h-full flex-col overflow-hidden bg-bg">
        <main ref={scroller} inert={reflectOpen} className="no-scrollbar flex-1 overflow-y-auto px-5 pb-8 pt-[max(24px,env(safe-area-inset-top))]">
          {saveFailed && <p role="alert" className="mb-4 rounded-sm bg-surface p-3 text-13 ring-1 ring-inset ring-line">기록을 저장하지 못했어요. 브라우저의 저장 공간 설정을 확인해 주세요. 앱을 닫으면 오늘 기록이 사라질 수 있어요.</p>}
          <div key={tab + stack.length} className={top ? '' : 'anim-rise'}>{screen}</div>
        </main>
        <nav aria-label="주 메뉴" inert={reflectOpen} className="grid grid-cols-4 border-t bg-surface px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-2">
          {TABS.map(({ key, label, Icon }) => {
            const on = tab === key
            return (
              <button key={key} onClick={() => nav.setTab(key)} aria-current={on ? 'page' : undefined}
                className={`flex min-h-[52px] flex-col items-center justify-center gap-1 rounded-sm text-12 transition-colors ${on ? 'font-bold text-ink' : 'text-sub'}`}>
                <Icon size={22} weight={on ? 'fill' : 'regular'} className={on ? 'text-forest' : ''} aria-hidden="true" />
                {label}
              </button>
            )
          })}
        </nav>
        <div role="status" aria-live="polite" className="pointer-events-none absolute inset-x-6 bottom-24 z-30 flex justify-center">
          {toastMsg && <span className="anim-rise rounded-full bg-ink px-4 py-3 text-center text-13 text-bg">{toastMsg}</span>}
        </div>
        <ReflectSheet open={reflectOpen} onClose={() => setReflectOpen(false)} />
      </div>
    </NavCtx.Provider>
  )
}

function ReflectSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { s, dispatch } = useStore()
  const prev = s.days[s.today].reflection
  const [good, setGood] = useState('')
  const [fix, setFix] = useState('')
  useEffect(() => { if (open) { setGood(prev?.good ?? ''); setFix(prev?.fix ?? '') } }, [open, prev])
  const input = 'mt-2 w-full rounded-sm bg-bg px-4 py-3 text-15 text-ink outline-none ring-1 ring-inset ring-line placeholder:text-sub focus-visible:ring-2 focus-visible:ring-gold'
  return (
    <Sheet open={open} onClose={onClose} label="30초 회고">
      <h2 className="text-20 font-medium">30초 회고</h2>
      <p className="mt-1 text-13 text-sub">길게 쓰지 않아도 돼요. 한 줄씩이면 충분해요.</p>
      <label htmlFor="good" className="mt-4 block text-13 font-bold text-forest">오늘 잘된 것 하나</label>
      <input id="good" value={good} onChange={(e) => setGood(e.target.value)} placeholder="예: 피니시에서 3초 버텼다" className={input} />
      <label htmlFor="fix" className="mt-4 block text-13 font-bold text-gold-text">다음에 고칠 것 하나</label>
      <input id="fix" value={fix} onChange={(e) => setFix(e.target.value)} placeholder="예: 오른발 뒤꿈치가 덜 들린다" className={input} />
      <div className="mt-6 grid grid-cols-[auto_1fr] gap-2">
        <Button variant="ghost" onClick={onClose}>건너뛰기</Button>
        <Button disabled={!good.trim() && !fix.trim()} onClick={() => { dispatch({ type: 'reflect', good: good.trim(), fix: fix.trim() }); onClose() }}>저장</Button>
      </div>
    </Sheet>
  )
}

function Onboarding({ onStart }: { onStart: () => void }) {
  const chs = chaptersOf(PARTS)
  return (
    <main className="anim-rise flex h-full flex-col justify-between bg-hero px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-[max(56px,env(safe-area-inset-top))] text-hero-ink">
      <div>
        <p className="text-14 text-hero-sub">골프 바이블</p>
        <h1 className="mt-3 text-32 font-light tracking-tight">순서대로 배우고,<br /><b className="font-bold">매일 하나씩</b></h1>
        <ul className="mt-8 flex flex-col gap-4 text-15">
          <li className="grid grid-cols-[44px_1fr]"><b className="font-num text-gold-hero">{chs.length}</b>{chs[0].title}부터 {chs[chs.length - 1].title}까지 순서가 있는 단원</li>
          <li className="grid grid-cols-[44px_1fr]"><b className="font-num text-gold-hero">1</b>연습장에서 열면 오늘 할 레슨 하나와 연습 목록</li>
          <li className="grid grid-cols-[44px_1fr]"><b className="text-gold-hero">통과</b>단원마다 정해진 테스트 기준을 넘으면 다음 단원이 열려요</li>
        </ul>
      </div>
      <Button onClick={onStart} className="w-full">{chs[0].no}단원 {chs[0].title}부터 시작</Button>
    </main>
  )
}
