import { createContext, useContext } from 'react'

export type Tab = 'home' | 'book' | 'log' | 'mind'
export type Route =
  | { name: 'lesson'; lessonId: string }
  | { name: 'test'; chapterId: string }
  | { name: 'chapter'; chapterId: string }
  | { name: 'session'; start?: number; only?: string } // 연습 모드 (전체 화면, 탭바 없음)

export type Nav = {
  setTab: (t: Tab) => void
  push: (r: Route) => void
  pop: () => void
  toast: (msg: string) => void
  openReflect: () => void
}

export const NavCtx = createContext<Nav | null>(null)

export function useNav(): Nav {
  const v = useContext(NavCtx)
  if (!v) throw new Error('NavCtx 밖에서 useNav 사용')
  return v
}
