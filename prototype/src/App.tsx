import { useEffect, useState } from 'react'
import { StoreProvider, useStore, demoState, freshState } from '@/state/store'
import { PhoneApp } from '@/app/PhoneApp'
import { koreanDate } from '@/app/screens/Home'

type Theme = 'system' | 'light' | 'dark'

export default function App() {
  return (
    <StoreProvider>
      <div className="min-h-full bg-page md:flex md:items-start md:justify-center md:gap-10 md:px-8 md:py-10">
        <div className="h-[100dvh] md:h-[812px] md:w-[390px] md:flex-none md:overflow-hidden md:rounded-[46px] md:bg-frame md:p-[10px] md:shadow-[0_40px_80px_-40px_rgb(20_40_30/0.55)]">
          <div className="h-full overflow-hidden md:rounded-[36px]">
            <PhoneApp />
          </div>
        </div>
        <DemoPanel />
      </div>
    </StoreProvider>
  )
}

function DemoPanel() {
  const { s, dispatch } = useStore()
  const [theme, setTheme] = useState<Theme>('system')
  useEffect(() => {
    if (theme === 'system') document.documentElement.removeAttribute('data-theme')
    else document.documentElement.setAttribute('data-theme', theme)
  }, [theme])
  const btn = 'min-h-[40px] rounded-full px-4 text-13 font-medium ring-1 ring-inset ring-line text-ink active:scale-[0.98]'
  return (
    <aside className="flex flex-col gap-5 px-4 py-8 text-ink md:w-[300px] md:px-0 md:pt-6">
      <div>
        <h1 className="text-20 font-light tracking-tight">골프 바이블 <b className="font-bold">프로토타입</b></h1>
        <p className="mt-2 text-13 leading-relaxed text-sub">
          실제 Expo 앱을 만들기 전에 화면 흐름을 눌러 보는 시제품이에요. 기록은 이 브라우저에만 저장돼요. 영상은 촬영 전이라 잔디 화면으로 재생을 흉내 내요.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-12 font-bold text-sub">앱 속 날짜: {koreanDate(s.today)}</span>
        <div className="flex flex-wrap gap-2">
          <button className={btn} onClick={() => dispatch({ type: 'nextDay' })}>다음 날로 넘기기</button>
          <button className={btn} onClick={() => dispatch({ type: 'replace', state: demoState() })}>예시 상태로</button>
          <button className={btn} onClick={() => dispatch({ type: 'replace', state: freshState() })}>처음 쓰는 사람으로</button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-12 font-bold text-sub">화면 테마</span>
        <div className="flex gap-2">
          {(['system', 'light', 'dark'] as Theme[]).map((t) => (
            <button key={t} onClick={() => setTheme(t)} aria-pressed={theme === t}
              className={`${btn} ${theme === t ? 'bg-forest-soft font-bold' : ''}`}>{{ system: '시스템', light: '라이트', dark: '다크' }[t]}</button>
          ))}
        </div>
      </div>
      <div className="rounded bg-surface p-4 text-13 leading-relaxed">
        <b className="mb-1 block">눌러 볼 것</b>
        <ol className="list-decimal space-y-1 pl-4 text-sub">
          <li>홈에서 드릴을 모두 체크하면 회고 화면이 떠요</li>
          <li>홈의 "영상 보고 시작"에서 영상 구간을 눌러 보세요</li>
          <li>"다음 날로 넘기기"를 누르며 레슨을 끝내면 통과 테스트가 나와요</li>
          <li>교본에서 잠긴 단원을 눌러 보세요</li>
        </ol>
      </div>
    </aside>
  )
}
