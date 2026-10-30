import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { BookOpen, ChartLineUp, House, Brain } from '@phosphor-icons/react'
import { PARTS } from '@/data/content'
import { useStore } from '@/state/store'
import { NavCtx, type Nav, type Route, type Tab } from './nav'
import { Home } from './screens/Home'
import { Book, ChapterScreen, LessonScreen } from './screens/Book'
import { TestScreen } from './screens/Test'
import { Log, Mental } from './screens/Log'
import { Button, Sheet } from './ui'

const TABS: { key: Tab; label: string; Icon: typeof House }[] = [
  { key: 'home', label: '홈', Icon: House },
  { key: 'book', label: '교본', Icon: BookOpen },
  { key: 'log', label: '기록', Icon: ChartLineUp },
  { key: 'mind', label: '멘탈', Icon: Brain },
]

export function PhoneApp() {
  const { s, dispatch } = useStore()
  const [tab, setTabState] = useState<Tab>('home')
  const [stack, setStack] = useState<Route[]>([])
  const [toastMsg, setToast] = useState<string | null>(null)
  const [reflectOpen, setReflectOpen] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  const toast = useCallback((m: string) => { setToast(m); window.setTimeout(() => setToast(null), 1800) }, [])
  const nav: Nav = useMemo(() => ({
    tab, stack,
    setTab: (t) => { setTabState(t); setStack([]) },
    push: (r) => setStack((x) => [...x, r]),
    pop: () => setStack((x) => x.slice(0, -1)),
    toast,
    openReflect: () => setReflectOpen(true),
  }), [tab, stack, toast])

  useEffect(() => { scroller.current?.scrollTo({ top: 0 }) }, [tab, stack.length])

  if (!s.onboarded) return <Onboarding onStart={() => dispatch({ type: 'onboard' })} />

  const top = stack[stack.length - 1]
  const screen = top
    ? top.name === 'lesson' ? <LessonScreen key={top.lessonId} lessonId={top.lessonId} />
      : top.name === 'test' ? <TestScreen key={top.chapterId} chapterId={top.chapterId} />
        : <ChapterScreen key={top.chapterId} chapterId={top.chapterId} />
    : { home: <Home />, book: <Book />, log: <Log />, mind: <Mental /> }[tab]

  return (
    <NavCtx.Provider value={nav}>
      <div className="relative flex h-full flex-col overflow-hidden bg-bg">
        <div ref={scroller} className="no-scrollbar flex-1 overflow-y-auto px-[18px] pb-8 pt-[max(22px,env(safe-area-inset-top))]">
          <div key={tab + stack.length} className={top ? '' : 'anim-rise'}>{screen}</div>
        </div>
        <nav className="grid grid-cols-4 border-t border-line bg-surface px-2.5 pb-[max(12px,env(safe-area-inset-bottom))] pt-1.5">
          {TABS.map(({ key, label, Icon }) => {
            const on = tab === key
            return (
              <button key={key} onClick={() => nav.setTab(key)} aria-current={on}
                className={`flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl text-[11px] transition-colors ${on ? 'font-bold text-ink' : 'text-sub'}`}>
                <Icon size={22} weight={on ? 'fill' : 'regular'} className={on ? 'text-forest' : ''} />
                {label}
              </button>
            )
          })}
        </nav>
        {toastMsg && <div className="anim-rise absolute inset-x-6 bottom-24 z-30 rounded-full bg-ink px-4 py-3 text-center text-[13px] text-bg">{toastMsg}</div>}
        <ReflectSheet open={reflectOpen} onClose={() => setReflectOpen(false)} />
      </div>
    </NavCtx.Provider>
  )
}

function ReflectSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { s, dispatch } = useStore()
  const prev = s.days[s.today].reflection
  const [good, setGood] = useState(prev?.good ?? '')
  const [fix, setFix] = useState(prev?.fix ?? '')
  useEffect(() => { if (open) { setGood(prev?.good ?? ''); setFix(prev?.fix ?? '') } }, [open, prev])
  return (
    <Sheet open={open} onClose={onClose} label="30초 회고">
      <h3 className="text-xl font-medium">30초 회고</h3>
      <p className="mt-0.5 text-[13px] text-sub">길게 쓰지 않아도 돼요. 한 줄씩이면 충분해요.</p>
      <label htmlFor="good" className="mt-4 block text-[13px] font-bold text-forest">오늘 잘된 것 하나</label>
      <input id="good" value={good} onChange={(e) => setGood(e.target.value)} placeholder="예: 피니시에서 3초 버텼다"
        className="mt-1.5 w-full rounded-[14px] bg-bg px-3.5 py-3 text-[14.5px] text-ink outline-none ring-1 ring-inset ring-line placeholder:text-sub" />
      <label htmlFor="fix" className="mt-3 block text-[13px] font-bold text-gold">다음에 고칠 것 하나</label>
      <input id="fix" value={fix} onChange={(e) => setFix(e.target.value)} placeholder="예: 오른발 뒤꿈치가 덜 들린다"
        className="mt-1.5 w-full rounded-[14px] bg-bg px-3.5 py-3 text-[14.5px] text-ink outline-none ring-1 ring-inset ring-line placeholder:text-sub" />
      <div className="mt-5 grid grid-cols-[auto_1fr] gap-2">
        <Button variant="ghost" onClick={onClose}>건너뛰기</Button>
        <Button disabled={!good.trim() && !fix.trim()} onClick={() => { dispatch({ type: 'reflect', good: good.trim(), fix: fix.trim() }); onClose() }}>저장</Button>
      </div>
    </Sheet>
  )
}

function Onboarding({ onStart }: { onStart: () => void }) {
  const first = PARTS[0].chapters[0]
  return (
    <div className="anim-rise flex h-full flex-col justify-between bg-hero px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-[max(56px,env(safe-area-inset-top))] text-hero-ink">
      <div>
        <p className="text-sm text-hero-sub">골프 바이블</p>
        <h1 className="mt-3 text-[30px] font-light leading-tight tracking-tight">목적 없는 연습은<br /><b className="font-bold">오늘까지만</b></h1>
        <ul className="mt-8 flex flex-col gap-4 text-[15px]">
          <li><b className="mr-2 font-num text-gold">12</b>순서가 있는 단원. 그립부터 코스 매니지먼트까지</li>
          <li><b className="mr-2 font-num text-gold">1</b>연습장에 가면 오늘 할 레슨 하나와 드릴</li>
          <li><b className="mr-2 font-num text-gold">7/10</b>통과 테스트를 넘어야 다음 단원이 열려요</li>
        </ul>
      </div>
      <Button onClick={onStart} className="w-full">{first.no}단원 {first.title}부터 시작</Button>
    </div>
  )
}
