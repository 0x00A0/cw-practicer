/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system", "BlinkMacSystemFont", '"Segoe UI"', "Roboto",
          '"Helvetica Neue"', "Arial",
          '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"',
          '"Source Han Sans SC"', '"Noto Sans CJK SC"',
          "sans-serif",
        ],
        mono: [
          '"JetBrains Mono"', '"Fira Code"', '"SF Mono"', "Menlo", "Consolas",
          '"Source Han Sans SC"', '"Microsoft YaHei"', '"PingFang SC"',
          "monospace",
        ],
      },
      colors: {
        wf: {
          "bg-deep":    "var(--wf-bg-deep)",
          "bg-base":    "var(--wf-bg-base)",
          "bg-card":    "var(--wf-bg-card)",
          "bg-well":    "var(--wf-bg-well)",

          "border":         "var(--wf-border)",
          "border-strong":  "var(--wf-border-strong)",
          "border-divider": "var(--wf-border-divider)",

          "text":           "var(--wf-text)",
          "text-secondary": "var(--wf-text-secondary)",
          "text-muted":     "var(--wf-text-muted)",
          "text-dim":       "var(--wf-text-dim)",

          "accent":         "var(--wf-accent)",
          "accent-hover":   "var(--wf-accent-hover)",
          "accent-glow":    "var(--wf-accent-glow)",
          "accent-subtle":  "var(--wf-accent-subtle)",

          "callsign":       "var(--wf-callsign)",

          "ok":             "var(--wf-ok)",
          "ok-hover":       "var(--wf-ok-hover)",

          "score-good":     "var(--wf-score-good)",
          "score-mid":      "var(--wf-score-mid)",
          "score-bad":      "var(--wf-score-bad)",

          "slider-thumb":   "var(--wf-slider-thumb)",
          "slider-border":  "var(--wf-slider-border)",

          "selection":      "var(--wf-selection)",
          "shadow":         "var(--wf-shadow)",
        },
      },
      boxShadow: {
        wf: "0 10px 30px -5px var(--wf-shadow)",
      },
    },
  },
  plugins: [],
};

