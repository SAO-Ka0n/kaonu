import { createContext, useContext } from 'react'

export type Tab = 'home' | 'book' | 'log' | 'mind'
export type Route = { name: 'lesson'; lessonId: string } | { name: 'test'; chapterId: string } | { name: 'chapter'; chapterId: string }

export type Nav = {
  tab: Tab
  stack: Route[]
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
