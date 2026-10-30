import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, Pause, Play } from '@phosphor-icons/react'
import type { Mark } from '@/data/types'
import type { RoutineItem } from '@/logic/progress'
import { itemId } from '@/logic/progress'

export const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`

export function Thumb({ duration, small }: { duration: number; small?: boolean }) {
  return (
    <div className={`turf relative aspect-video w-full overflow-hidden ${small ? 'rounded-[10px]' : 'rounded-[14px]'}`}>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-black/50" />
      <span className={`absolute font-num text-white tabular ${small ? 'bottom-1 right-1.5 text-[10.5px]' : 'bottom-2 right-2.5 text-xs'}`}>{fmt(duration)}</span>
    </div>
  )
}

// 실제 앱에서는 유튜브 플레이어. 영상 촬영 전이라 잔디 화면 위에서 재생과 구간 이동만 흉내 낸다.
export function VideoPlayer({ duration, marks, youtubeId }: { duration: number; marks: Mark[]; youtubeId?: string }) {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<number | null>(null)
  useEffect(() => {
    if (!playing) return
    timer.current = window.setInterval(() => setT((x) => {
      if (x + 1 >= duration) { setPlaying(false); return duration }
      return x + 1
    }), 120)
    return () => { if (timer.current) window.clearInterval(timer.current) }
  }, [playing, duration])
  const cur = marks.reduce((a, m, i) => (t >= m.at ? i : a), 0)
  return (
    <div className="flex flex-col gap-3">
      <div className="turf relative aspect-video w-full overflow-hidden rounded-[14px]">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-black/55" />
        <button
          onClick={() => { if (t >= duration) setT(0); setPlaying((p) => !p) }}
          aria-label={playing ? '일시정지' : '재생'}
          className="absolute left-1/2 top-[46%] grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-[#13201a] transition-transform active:scale-95"
        >
          {playing ? <Pause size={22} weight="fill" /> : <Play size={22} weight="fill" className="ml-0.5" />}
        </button>
        <span className="absolute bottom-2 left-3 text-[11px] text-white/85">{youtubeId ? '' : '영상 촬영 전 임시 화면'}</span>
        <span className="absolute bottom-2 right-3 font-num text-xs text-white tabular">{fmt(t)} / {fmt(duration)}</span>
      </div>
      <div className="relative h-1 overflow-hidden rounded-full bg-line">
        <i className="absolute inset-y-0 left-0 bg-gold transition-[width] duration-150" style={{ width: `${(t / duration) * 100}%` }} />
        {marks.slice(1).map((m) => <span key={m.at} className="absolute top-0 h-1 w-0.5 bg-surface" style={{ left: `${(m.at / duration) * 100}%` }} />)}
      </div>
      <div className="flex flex-col">
        {marks.map((m, i) => (
          <button key={m.at} onClick={() => setT(m.at)}
            className={`grid grid-cols-[48px_1fr] gap-2 border-b border-line py-2.5 text-left text-[13.5px] last:border-0 ${i === cur && t > 0 ? 'font-medium text-gold' : ''}`}>
            <span className={`font-num text-[13px] tabular ${i === cur && t > 0 ? 'text-gold' : 'text-sub'}`}>{fmt(m.at)}</span>{m.title}
          </button>
        ))}
      </div>
    </div>
  )
}

export function Routine({ items, checked, onToggle }: { items: RoutineItem[]; checked: string[]; onToggle: (id: string) => void }) {
  return (
    <ul className="flex flex-col">
      {items.map((it) => {
        const id = itemId(it)
        const on = checked.includes(id)
        const title = it.kind === 'drill' ? it.drill.title : it.title
        const detail = it.kind === 'drill' ? it.drill.detail : it.detail
        const tag = it.kind === 'mental' ? '멘탈' : it.tag
        return (
          <li key={id}>
            <button onClick={() => onToggle(id)} aria-pressed={on}
              className="grid min-h-[56px] w-full grid-cols-[26px_1fr_auto] items-start gap-3 border-b border-line py-3 text-left">
              <span className={`mt-0.5 grid h-[23px] w-[23px] place-items-center rounded-full transition-all duration-300 ${on ? 'scale-105 bg-forest text-surface' : 'ring-[1.5px] ring-inset ring-sub'}`}>
                {on && <Check size={13} weight="bold" />}
              </span>
              <span className="min-w-0">
                <b className={`block text-[14.5px] leading-snug ${on ? 'font-normal text-sub line-through' : 'font-medium'}`}>
                  {tag && <span className="mr-1.5 text-[11.5px] font-bold text-gold no-underline">{tag}</span>}{title}
                </b>
                <small className="block text-xs text-sub">{detail}</small>
              </span>
              <span className="pt-0.5 font-num text-[13px] text-sub">{it.kind === 'drill' ? it.drill.qty : '매 샷'}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export function LevelRing({ n, name, ratio }: { n: number; name: string; ratio: number }) {
  const r = 27, c = 2 * Math.PI * r
  return (
    <div className="relative h-16 w-16 flex-none" aria-label={`레벨 ${n}, ${name}`}>
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--line)" strokeWidth="4" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--amber)" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`${c * ratio} ${c}`} className="transition-[stroke-dasharray] duration-700" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none">
        <div><b className="font-num text-[19px] font-semibold">Lv.{n}</b><small className="mt-0.5 block text-[9.5px] text-sub">{name}</small></div>
      </div>
    </div>
  )
}

export function SectionHead({ title, note }: { title: string; note?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <h4 className="text-[15px] font-bold">{title}</h4>
      {note && <span className="text-xs text-sub">{note}</span>}
    </div>
  )
}

export function Button({ children, onClick, variant = 'gold', className = '', disabled }: { children: ReactNode; onClick?: () => void; variant?: 'gold' | 'ghost' | 'heroGhost' | 'forest'; className?: string; disabled?: boolean }) {
  const v = {
    gold: 'bg-gold text-gold-ink font-bold',
    forest: 'bg-forest text-surface font-bold',
    ghost: 'text-ink ring-1 ring-inset ring-line font-medium',
    heroGhost: 'text-hero-ink ring-1 ring-inset ring-hero-line font-medium',
  }[variant]
  return (
    <button onClick={onClick} disabled={disabled}
      className={`min-h-[48px] whitespace-nowrap rounded-full px-5 text-[14.5px] transition-transform active:scale-[0.98] disabled:opacity-40 ${v} ${className}`}>
      {children}
    </button>
  )
}

export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  if (!open) return null
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end" role="dialog" aria-label={label}>
      <button aria-label="닫기" onClick={onClose} className="anim-fade absolute inset-0 bg-black/40" />
      <div className="anim-sheet relative max-h-[88%] overflow-y-auto rounded-t-[26px] bg-surface px-5 pb-7 pt-3">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        {children}
      </div>
    </div>
  )
}
