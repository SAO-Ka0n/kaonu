/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    // 글자 크기 9단계만 쓴다 (감사 #3)
    fontSize: {
      12: ["12px", "1.45"], 13: ["13px", "1.5"], 14: ["14px", "1.5"], 15: ["15px", "1.5"],
      17: ["17px", "1.45"], 20: ["20px", "1.35"], 24: ["24px", "1.3"], 32: ["32px", "1.2"], 56: ["56px", "1"],
    },
    // 반경 3종: 썸네일·입력·작은 상자 12, 카드 20, 버튼·칩 원형
    borderRadius: { none: "0", sm: "12px", DEFAULT: "20px", full: "9999px" },
    extend: {
      fontFamily: { num: ["Outfit", '"Noto Sans KR"', "system-ui", "sans-serif"] },
      colors: {
        page: "var(--page)", bg: "var(--bg)", surface: "var(--surface)", ink: "var(--ink)", sub: "var(--sub)", line: "var(--line)",
        forest: { DEFAULT: "var(--forest)", soft: "var(--forest-soft)" },
        gold: { DEFAULT: "var(--amber)", ink: "var(--amber-ink)", text: "var(--gold-text)", hero: "var(--gold-hero)", tint: "var(--gold-tint)" },
        hero: { DEFAULT: "var(--hero)", ink: "var(--hero-ink)", sub: "var(--hero-sub)", line: "var(--hero-line)", tint: "var(--hero-tint)" },
        frame: "var(--frame)", "play-ink": "var(--play-ink)", scrim: "var(--scrim)",
      },
    },
  },
  plugins: [],
}
