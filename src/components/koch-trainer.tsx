import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Square, RotateCcw } from "lucide-react";

/* ────────────────────────── constants ────────────────────────── */

const KOCH_ORDER = [
  "K","M","R","S","U","A","P","T","L","O",
  "W","I",".","N","J","E","F","0","Y",",",
  "V","G","5","/","Q","9","Z","H","3","8",
  "B","?","4","2","7","C","1","D","6","X",
];

const MORSE: Record<string, string> = {
  A:".-",B:"-...",C:"-.-.",D:"-..",E:".",F:"..-.",G:"--.",H:"....",
  I:"..",J:".---",K:"-.-",L:".-..",M:"--",N:"-.",O:"---",P:".--.",
  Q:"--.-",R:".-.",S:"...",T:"-",U:"..-",V:"...-",W:".--",X:"-..-",
  Y:"-.--",Z:"--..",0:"-----",1:".----",2:"..---",3:"...--",4:"....-",
  5:".....",6:"-....",7:"--...",8:"---..",9:"----.",".":".-.-.-",",":"--..--",
  "?":"..--..","/":"-..-.",
};

const STORAGE_KEY = "cw-practicer-v2";

/* ────────────────────────── helpers ──────────────────────────── */

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);
const pick  = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const randInt = (lo: number, hi: number) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
const dotMs = (wpm: number) => 1200 / wpm;

/* ────────────────────────── component ───────────────────────── */

export default function KochMethodTrainer() {
  const ctxRef  = useRef<AudioContext | null>(null);
  const stopRef = useRef(false);

  const [lesson, setLesson]       = useState(2);
  const [toneHz, setToneHz]       = useState(650);
  const [charWpm, setCharWpm]     = useState(20);
  const [effWpm, setEffWpm]       = useState(10);
  const [grpLen, setGrpLen]       = useState(5);
  const [grpLenRnd, setGrpLenRnd] = useState(false);
  const [grpCnt, setGrpCnt]       = useState(5);
  const [grpCntRnd, setGrpCntRnd] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [input, setInput]         = useState("");
  const [seq, setSeq]             = useState("");
  const [playing, setPlaying]     = useState(false);
  const [accuracy, setAccuracy]   = useState<number | null>(null);
  const [volume, setVolume]       = useState(50);

  /* persist */
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (d.lesson)  setLesson(d.lesson);
      if (d.toneHz)  setToneHz(d.toneHz);
      if (d.charWpm) setCharWpm(d.charWpm);
      if (d.effWpm)  setEffWpm(d.effWpm);
      if (d.grpLen)  setGrpLen(d.grpLen);
      if (d.grpCnt)  setGrpCnt(d.grpCnt);
      if (d.grpLenRnd !== undefined) setGrpLenRnd(d.grpLenRnd);
      if (d.grpCntRnd !== undefined) setGrpCntRnd(d.grpCntRnd);
      if (d.volume !== undefined) setVolume(d.volume);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      lesson, toneHz, charWpm, effWpm, grpLen, grpLenRnd, grpCnt, grpCntRnd, volume,
    }));
  }, [lesson, toneHz, charWpm, effWpm, grpLen, grpLenRnd, grpCnt, grpCntRnd, volume]);

  const chars = useMemo(() => KOCH_ORDER.slice(0, clamp(lesson, 2, KOCH_ORDER.length)), [lesson]);

  /* generate */
  const generate = () => {
    const gc = grpCntRnd ? randInt(3, 8) : grpCnt;
    const text = Array.from({ length: gc }, () => {
      const gl = grpLenRnd ? randInt(1, 8) : grpLen;
      return Array.from({ length: gl }, () => pick(chars)).join("");
    }).join(" ");
    setSeq(text); setInput(""); setShowAnswer(false); setAccuracy(null);
    return text;
  };

  useEffect(() => { if (!seq) generate(); }, []);

  /* audio */
  async function getCtx() {
    if (!ctxRef.current) ctxRef.current = new AudioContext();
    if (ctxRef.current.state === "suspended") await ctxRef.current.resume();
    return ctxRef.current;
  }
  async function beep(ms: number, ac: AudioContext, hz: number) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = "sine"; o.frequency.value = hz;
    g.gain.value = Math.max(0, volume / 100) * 0.2;
    o.connect(g); g.connect(ac.destination); o.start();
    await new Promise(r => setTimeout(r, ms)); o.stop();
  }
  const gap = (ms: number) => new Promise(r => setTimeout(r, ms));

  async function playMorse(text: string) {
    if (!text) return;
    stopRef.current = false; setPlaying(true);
    const ac = await getCtx();
    const d = dotMs(charWpm), da = d * 3, intra = d;
    const cg = Math.max(d * 3, dotMs(effWpm) * 3), wg = cg * 2;
    for (const ch of text.toUpperCase()) {
      if (stopRef.current) break;
      if (ch === " ") { await gap(wg); continue; }
      const p = MORSE[ch]; if (!p) continue;
      for (let i = 0; i < p.length; i++) {
        if (stopRef.current) break;
        await beep(p[i] === "." ? d : da, ac, toneHz);
        if (i < p.length - 1) await gap(intra);
      }
      await gap(Math.max(0, cg - intra));
    }
    setPlaying(false);
  }
  const stop = () => { stopRef.current = true; setPlaying(false); };
  const resetQuestion = () => { stop(); generate(); };

  /* check */
  const norm = (s: string) => s.toUpperCase().replace(/\s+/g, "");
  const check = () => {
    const a = norm(seq), b = norm(input);
    const mx = Math.max(a.length, b.length);
    if (!mx) { setAccuracy(100); setShowAnswer(true); return; }
    let ok = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] === b[i]) ok++;
    setAccuracy(Math.round((ok / mx) * 100));
    setShowAnswer(true);
  };

  /* ─────────────────────────── JSX ──────────────────────────── */
  return (
    <div className="flex min-h-screen flex-col bg-wf-bg-deep text-wf-text selection:bg-wf-selection">

      {/* ── header ── */}
      <header className="border-b border-wf-border-divider bg-wf-bg-base">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-5">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-wf-accent-glow opacity-60" />
            <span className="inline-flex h-3 w-3 rounded-full bg-wf-accent" />
          </span>
          <div>
            <h1 className="text-4xl font-bold tracking-wide sm:text-3xl">
              <span className="text-wf-accent-hover">CW</span>{" "}
              <span className="text-wf-text">Practice Tool</span>
            </h1>
            <p className="text-sm tracking-widest text-wf-text-muted">
              By <span className="font-semibold text-wf-callsign">SAØWXR</span>
            </p>
          </div>
        </div>
      </header>

      {/* ── main ── */}
      <main className="flex-1">
        <div className="mx-auto max-w-3xl space-y-4 px-5 py-5">

          {/* ════ practice card ════ */}
          <Card className="rounded-2xl border-wf-border bg-wf-bg-card shadow-wf">
            <CardContent className="p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto]">

                {/* left column */}
                <div className="space-y-3">
                  {/* play / stop / new */}
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => playMorse(seq)}
                      disabled={playing}
                      className="rounded-lg bg-wf-ok px-5 py-2 text-base text-white hover:bg-wf-ok-hover disabled:opacity-40"
                    >
                      <Play className="mr-2 h-4 w-4" />Play
                    </Button>
                    <Button
                      onClick={resetQuestion}
                      variant="outline"
                      className="rounded-lg border-wf-border-strong px-5 py-2 text-base text-wf-accent-hover hover:bg-wf-accent-subtle"
                    >
                      <Square className="mr-2 h-4 w-4" />Stop</Button>
                  </div>

                  {/* audio text */}
                  <div className="rounded-xl border border-wf-border bg-wf-bg-deep px-4 py-3">
                    <div className="mb-1 text-xs uppercase tracking-[0.15em] text-wf-text-dim">
                      Audio Text
                    </div>
                    <div className="min-h-[48px] font-mono text-xl tracking-[0.3em] text-wf-text-secondary sm:text-2xl">
                      {showAnswer ? seq : "\u00A0"}
                    </div>
                  </div>

                  {/* input */}
                  <Input
                    value={input}
                    onChange={e => setInput(e.target.value.toUpperCase())}
                    placeholder="Type what you hear …"
                    className="rounded-lg border-wf-border bg-wf-bg-deep py-3 text-lg font-mono tracking-[0.2em] text-wf-text placeholder:text-wf-text-dim focus-visible:ring-wf-text-muted"
                  />

                  {/* check / show + accuracy */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      onClick={check}
                      className="rounded-lg bg-wf-ok px-5 py-2 text-base text-white hover:bg-wf-ok-hover"
                    >
                      Check
                    </Button>
                    <Button
                      onClick={() => {
                        if (!showAnswer) {
                          setShowAnswer(true);
                        } else {
                          resetQuestion();
                        }
                      }}
                      variant="outline"
                      className="rounded-lg border-wf-border-strong px-5 py-2 text-base text-wf-accent-hover hover:bg-wf-accent-subtle"
                    >
                      {showAnswer ? "Next" : "Show Answer"}
                    </Button>

                    {accuracy !== null && (
                      <span className={`ml-auto font-mono text-2xl font-bold ${
                        accuracy >= 90
                          ? "text-wf-score-good"
                          : accuracy >= 70
                            ? "text-wf-score-mid"
                            : "text-wf-score-bad"
                      }`}>
                        {accuracy}%
                      </span>
                    )}
                  </div>
                </div>

                {/* right column: reset + lesson */}
                <div className="flex flex-row items-start gap-4 sm:flex-col sm:items-center sm:border-l sm:border-wf-border-divider sm:pl-4">
                  <button
                    onClick={resetQuestion}
                    title="New Sequence"
                    className="group flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-red-500/50 bg-red-500/15 transition hover:border-red-400 hover:bg-red-500/25"
                  >
                    <RotateCcw className="h-6 w-6 text-red-400 transition group-hover:text-red-300" />
                  </button>

                  <div className="w-full min-w-[110px] space-y-1">
                    <span className="block text-xs uppercase tracking-[0.12em] text-wf-text-dim">
                      Lesson
                    </span>
                    <Select value={String(lesson)} onValueChange={v => setLesson(Number(v))}>
                      <SelectTrigger className="rounded-lg border-wf-border bg-wf-bg-deep text-wf-text-secondary focus:ring-wf-text-muted">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-64 border-wf-border bg-wf-bg-card">
                        {KOCH_ORDER.map((_, i) => {
                          if (i < 1) return null;
                          const n = i + 1;
                          return (
                            <SelectItem key={n} value={String(n)}>
                              <span className="font-mono text-base text-wf-text-secondary">{n}</span>
                              <span className="ml-2 text-sm text-wf-text-muted">
                                {KOCH_ORDER.slice(0, n).join(" ")}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ════ settings card ════ */}
          <Card className="rounded-2xl border-wf-border bg-wf-bg-card shadow-wf">
            <CardContent className="p-4 sm:p-5">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-wf-text-dim">
                Settings
              </h2>

              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                <SettingSlider
                  label="Group Length" value={grpLen} min={1} max={8}
                  onChange={setGrpLen} random={grpLenRnd}
                  onRandomChange={setGrpLenRnd} randomLabel="1 – 8"
                />
                <SettingSlider
                  label="Groups" value={grpCnt} min={3} max={8}
                  onChange={setGrpCnt} random={grpCntRnd}
                  onRandomChange={setGrpCntRnd} randomLabel="3 – 8"
                />
                <SettingSlider
                  label="WPM" value={charWpm} min={10} max={40}
                  onChange={v => { setCharWpm(v); if (effWpm > v) setEffWpm(v); }}
                />
                <SettingSlider
                  label="Effective Speed" value={effWpm} min={5} max={charWpm}
                  onChange={setEffWpm} suffix=" WPM"
                />
                <SettingSlider
                  label="Tone Freq" value={toneHz} min={400} max={1000} step={10}
                  onChange={setToneHz} suffix=" Hz"
                />
                <SettingSlider
                  label="Volume" value={volume} min={0} max={100}
                  onChange={setVolume} suffix="%"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* ── footer ── */}
      <footer className="border-t border-wf-border-divider bg-wf-bg-base">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-3 text-sm text-wf-text-dim">
          <span> Powered by GitHub Pages</span>
          <span>©2026 Xinrui Wan</span>
          <span>VY73 de <a href={"https://www.qrz.com/db/SA0WXR"}><span className="font-semibold text-wf-callsign">SAØWXR</span></a></span>
        </div>
      </footer>
    </div>
  );
}

/* ────────── reusable slider row ────────── */

function SettingSlider({
  label, value, min, max, step = 1, onChange, suffix = "",
  random, onRandomChange, randomLabel,
}: {
  label: string;
  value: number; min: number; max: number; step?: number;
  onChange: (v: number) => void;
  suffix?: string;
  random?: boolean;
  onRandomChange?: (v: boolean) => void;
  randomLabel?: string;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-sm text-wf-accent">{label}</Label>
        <div className="flex items-center gap-2">
          {!random && (
            <span className="font-mono text-sm text-wf-text-secondary">{value}{suffix}</span>
          )}
          {onRandomChange && (
            <label className="flex cursor-pointer items-center gap-1 text-[10px] uppercase tracking-wider text-wf-text-dim">
              <Switch checked={random} onCheckedChange={onRandomChange} className="scale-[0.65]" />
              Rnd
            </label>
          )}
        </div>
      </div>
      {random ? (
        <div className="rounded-md bg-wf-bg-well py-1 text-center text-xs text-wf-text-muted">
          Random {randomLabel}
        </div>
      ) : (
        <Slider
          value={[value]} min={min} max={max} step={step}
          onValueChange={v => onChange(v[0])}
          className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-wf-slider-border [&_[role=slider]]:bg-wf-slider-thumb"
        />
      )}
    </div>
  );
}

