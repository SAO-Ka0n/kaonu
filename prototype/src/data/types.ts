// 교본 데이터 형식. 실제 Expo 앱에서도 같은 형식을 쓴다.

export type Mark = { at: number; title: string } // 영상 구간: 시작 초, 제목

export type Drill = {
  id: string
  title: string
  detail: string
  qty: string // 화면에 보이는 양: "20구", "10회", "5분", "매 샷"
  balls?: number // 이 드릴에서 치는 공 개수 (누적 공 계산용)
}

export type Checkpoint = { key: string; text: string } // key는 크게 보이는 짧은 말: "90%", "발끝"

export type Lesson = {
  id: string
  title: string
  goal: string
  youtubeId?: string // 비어 있으면 "영상 준비 중"
  durationSec: number
  marks: Mark[]
  checkpoints: Checkpoint[]
  drills: Drill[]
}

export type PassTest =
  | { kind: 'count'; description: string; need: number; of: number }
  | { kind: 'checklist'; description: string; items: string[] }

export type Chapter = {
  id: string
  no: number
  title: string
  summary: string
  lessons: Lesson[]
  test: PassTest
  reviewDrill: Drill // 통과 테스트 날 복습 드릴
}

export type Part = { id: string; title: string; chapters: Chapter[] }

export type MentalCard = {
  id: string
  principle: string // 원칙 한 줄
  body: string // 설명 한두 줄
  drill: string // 오늘 루틴에 들어가는 멘탈 드릴 한 줄
}
