import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Check, Pause, Play } from '@phosphor-icons/react'
import type { Mark } from '@/data/types'
import type { RoutineItem } from '@/logic/progress'
import { itemId, qtyLabel } from '@/logic/progress'

export const fmt = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`

export function Thumb({ duration, small }: { duration: number; small?: boolean }) {
  return (
    <div className="turf relative aspect-video w-full overflow-hidden rounded-sm">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-black/50" />
      <span className={`absolute font-num text-12 text-white tabular ${small ? 'bottom-1 right-2' : 'bottom-2 right-3'}`}>{fmt(duration)}</span>
    </div>
  )
}

// 실제 앱에서는 유튜브 플레이어. 영상 촬영 전이라 잔디 화면 위에서 재생과 구간 이동만 흉내 낸다.
export function VideoPlayer({ duration, marks, youtubeId }: { duration: number; marks: Mark[]; youtubeId?: string }) {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    const id = window.setInterval(() => setT((x) => {
      if (x + 1 >= duration) { setPlaying(false); return duration }
      return x + 1
    }), 120)
    return () => window.clearInterval(id)
  }, [playing, duration])
  const cur = marks.reduce((a, m, i) => (t >= m.at ? i : a), 0)
  return (
    <div className="flex flex-col gap-3">
      <div className="turf relative aspect-video w-full overflow-hidden rounded-sm">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-40% to-black/55" />
        <button
          onClick={() => { if (t >= duration) setT(0); setPlaying((p) => !p) }}
          aria-label={playing ? '일시정지' : '재생'}
          className="absolute left-1/2 top-[46%] grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-play-ink transition-transform active:scale-95"
        >
          {playing ? <Pause size={22} weight="fill" /> : <Play size={22} weight="fill" className="ml-1" />}
        </button>
        {!youtubeId && <span className="absolute bottom-2 left-3 text-12 text-white/85">영상 준비 중</span>}
        <span className="absolute bottom-2 right-3 font-num text-12 text-white tabular" aria-live="off">{fmt(t)} / {fmt(duration)}</span>
      </div>
      <div className="relative h-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-label="영상 진행" aria-valuemin={0} aria-valuemax={duration} aria-valuenow={t}>
        <i className="absolute inset-y-0 left-0 bg-gold transition-[width] duration-150" style={{ width: `${(t / duration) * 100}%` }} />
        {marks.slice(1).map((m) => <span key={m.at} className="absolute top-0 h-1 w-1 bg-surface" style={{ left: `${(m.at / duration) * 100}%` }} />)}
      </div>
      <div className="flex flex-col">
        {marks.map((m, i) => {
          const on = i === cur && t > 0
          return (
            <button key={m.at} onClick={() => setT(m.at)} aria-current={on || undefined}
              className={`grid min-h-[44px] grid-cols-[48px_1fr] items-center gap-2 border-b py-2 text-left text-14 last:border-0 ${on ? 'font-medium text-gold-text' : ''}`}>
              <span className={`font-num text-13 tabular ${on ? 'text-gold-text' : 'text-sub'}`}>{fmt(m.at)}</span>{m.title}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export function CheckDot({ on }: { on: boolean }) {
  return (
    <span className={`mt-1 grid h-6 w-6 flex-none place-items-center rounded-full transition-all duration-300 ${on ? 'scale-105 bg-forest text-surface' : 'ring-2 ring-inset ring-sub'}`}>
      {on && <Check size={13} weight="bold" />}
    </span>
  )
}

// 오늘 연습 목록. onToggle이 없으면 읽기 전용(체크 원 없이)으로 같은 목록을 보여 준다.
export function Routine({ items, checked, onToggle }: { items: RoutineItem[]; checked: string[]; onToggle?: (id: string) => void }) {
  return (
    <ul className="flex flex-col">
      {items.map((it) => {
        const id = itemId(it)
        const on = checked.includes(id)
        const title = it.kind === 'drill' ? it.drill.title : it.title
        const detail = it.kind === 'drill' ? it.drill.detail : it.detail
        const tag = it.kind === 'mental' ? '멘탈' : it.tag
        const body = (
          <>
            {onToggle && <CheckDot on={on} />}
            <span className="min-w-0">
              <b className={`block text-15 ${on && onToggle ? 'font-normal text-sub line-through' : 'font-medium'}`}>
                {tag && <span className="mr-2 text-12 font-bold text-gold-text no-underline">{tag}</span>}{title}
              </b>
              <small className="block text-13 text-sub">{detail}</small>
            </span>
            <span className="pt-1 font-num text-13 text-sub">{it.kind === 'drill' ? qtyLabel(it.drill.qty) : ''}</span>
          </>
        )
        return (
          <li key={id}>
            {onToggle ? (
              <button onClick={() => onToggle(id)} aria-pressed={on}
                className="grid min-h-[56px] w-full grid-cols-[24px_1fr_auto] items-start gap-3 border-b py-3 text-left">
                {body}
              </button>
            ) : (
              <div className="grid grid-cols-[1fr_auto] items-start gap-3 border-b py-3">{body}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function LevelRing({ n, name, ratio }: { n: number; name: string; ratio: number }) {
  const r = 27, c = 2 * Math.PI * r
  return (
    <div className="relative h-16 w-16 flex-none" role="img" aria-label={`레벨 ${n}, ${name} 단계, 지금 단원 진행 ${Math.round(ratio * 100)}%`}>
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90" aria-hidden="true">
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--line)" strokeWidth="4" />
        <circle cx="32" cy="32" r={r} fill="none" stroke="var(--amber)" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`${c * ratio} ${c}`} className="transition-[stroke-dasharray] duration-700" />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center leading-none" aria-hidden="true">
        <div><small className="block text-12 text-sub">레벨</small><b className="font-num text-20 font-semibold leading-none">{n}</b></div>
      </div>
    </div>
  )
}

export function SectionHead({ title, note }: { title: string; note?: ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <h2 className="text-15 font-bold">{title}</h2>
      {note && <span className="text-13 text-sub">{note}</span>}
    </div>
  )
}

export function Button({ children, onClick, variant = 'gold', className = '', disabled }: { children: ReactNode; onClick?: () => void; variant?: 'gold' | 'ghost' | 'tint'; className?: string; disabled?: boolean }) {
  const v = {
    gold: 'bg-gold text-gold-ink font-bold',
    ghost: 'text-ink ring-1 ring-inset ring-line font-medium',
    tint: 'bg-gold-tint text-gold-ink font-bold',
  }[variant]
  return (
    <button onClick={onClick} disabled={disabled}
      className={`min-h-[48px] whitespace-nowrap rounded-full px-5 text-15 transition-transform active:scale-[0.98] disabled:opacity-40 ${v} ${className}`}>
      {children}
    </button>
  )
}

// 아래에서 올라오는 시트. 열리면 첫 입력으로 포커스, Tab은 시트 안에서만 돌고, Esc로 닫히고, 닫히면 연 버튼으로 포커스가 돌아간다.
export function Sheet({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  const box = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const close = useRef(onClose)
  close.current = onClose
  useEffect(() => {
    if (!open) return
    opener.current = document.activeElement as HTMLElement | null
    const el = box.current
    el?.querySelector<HTMLElement>('input, button:not([data-backdrop])')?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); close.current(); return }
      if (e.key !== 'Tab' || !el) return
      const f = [...el.querySelectorAll<HTMLElement>('input, button:not([disabled])')]
      if (!f.length) return
      const [first, last] = [f[0], f[f.length - 1]]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      opener.current?.focus?.()
    }
  }, [open])
  if (!open) return null
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end">
      <button data-backdrop tabIndex={-1} aria-hidden="true" onClick={onClose} className="anim-fade absolute inset-0 bg-scrim" />
      <div ref={box} role="dialog" aria-modal="true" aria-label={label} className="anim-sheet relative max-h-[88%] overflow-y-auto rounded-t bg-surface px-5 pb-8 pt-3">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-line" />
        {children}
      </div>
    </div>
  )
}
