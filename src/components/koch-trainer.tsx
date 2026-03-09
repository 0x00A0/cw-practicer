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
import { Play, Square, RotateCcw, Globe, Volume2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  I18nContext,
  useI18n,
  locales,
  langLabels,
  detectLang,
  type LangCode,
} from "@/i18n";
import { courses, MORSE, getName, type Lesson } from "@/courses";

/* ────────────────────────── constants ────────────────────────── */

const STORAGE_KEY = "cw-practicer-v3";

/* ────────────────────────── helpers ──────────────────────────── */

const pick    = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
const randInt = (lo: number, hi: number) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
const dotMs   = (wpm: number) => 1200 / wpm;

/* ────────────────────────── component ───────────────────────── */

export default function KochMethodTrainer() {
  const ctxRef   = useRef<AudioContext | null>(null);
  const stopRef  = useRef(false);
  const noiseRef = useRef<{ src: AudioBufferSourceNode; gain: GainNode } | null>(null);

  const [lang, setLang]             = useState<LangCode>(detectLang);
  const [catId, setCatId]           = useState(courses[0].id);
  const [lessonId, setLessonId]     = useState(courses[0].lessons[0].id);
  const [toneHz, setToneHz]         = useState(600);
  const [charWpm, setCharWpm]       = useState(20);
  const [effWpm, setEffWpm]         = useState(10);
  const [grpLen, setGrpLen]         = useState(5);
  const [grpLenRnd, setGrpLenRnd]   = useState(false);
  const [grpCnt, setGrpCnt]         = useState(8);
  const [grpCntRnd, setGrpCntRnd]   = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [input, setInput]           = useState("");
  const [seq, setSeq]               = useState("");
  const [playing, setPlaying]       = useState(false);
  const [accuracy, setAccuracy]     = useState<number | null>(null);
  const [checked, setChecked]       = useState(false);
  const [volume, setVolume]         = useState(80);
  const [noiseOn, setNoiseOn]       = useState(false);
  const [noiseVol, setNoiseVol]     = useState(30);

  /* derived: current category & lesson */
  const currentCat = useMemo(() => courses.find(c => c.id === catId) ?? courses[0], [catId]);
  const currentLesson: Lesson = useMemo(
    () => currentCat.lessons.find(l => l.id === lessonId) ?? currentCat.lessons[0],
    [currentCat, lessonId],
  );

  /* persist */
  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      if (d.lang && d.lang in locales) setLang(d.lang);
      if (d.catId)    setCatId(d.catId);
      if (d.lessonId) setLessonId(d.lessonId);
      if (d.toneHz)   setToneHz(d.toneHz);
      if (d.charWpm)  setCharWpm(d.charWpm);
      if (d.effWpm)   setEffWpm(d.effWpm);
      if (d.grpLen)   setGrpLen(d.grpLen);
      if (d.grpCnt)   setGrpCnt(d.grpCnt);
      if (d.grpLenRnd !== undefined) setGrpLenRnd(d.grpLenRnd);
      if (d.grpCntRnd !== undefined) setGrpCntRnd(d.grpCntRnd);
      if (d.volume !== undefined) setVolume(d.volume);
      if (d.noiseOn !== undefined) setNoiseOn(d.noiseOn);
      if (d.noiseVol !== undefined) setNoiseVol(d.noiseVol);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      lang, catId, lessonId, toneHz, charWpm, effWpm, grpLen, grpLenRnd, grpCnt, grpCntRnd, volume, noiseOn, noiseVol,
    }));
  }, [lang, catId, lessonId, toneHz, charWpm, effWpm, grpLen, grpLenRnd, grpCnt, grpCntRnd, volume, noiseOn, noiseVol]);

  /* generate — uses category mode to decide strategy */
  const isPhrase = currentCat.mode === "phrase";
  const generate = () => {
    const pool = currentLesson.chars;
    if (!pool.length) return "";
    const gc = grpCntRnd ? randInt(4, 10) : grpCnt;
    let text: string;
    if (isPhrase) {
      // phrase mode: each "group" is one item from pool, separated by space
      text = Array.from({ length: gc }, () => pick(pool)).join(" ");
    } else {
      // char mode: build random groups of single chars
      text = Array.from({ length: gc }, () => {
        const gl = grpLenRnd ? randInt(1, 8) : grpLen;
        return Array.from({ length: gl }, () => pick(pool)).join("");
      }).join(" ");
    }
    setSeq(text); setInput(""); setShowAnswer(false); setAccuracy(null); setChecked(false);
    return text;
  };

  useEffect(() => { if (!seq) generate(); }, []);
  // regenerate when lesson changes
  useEffect(() => { generate(); }, [currentLesson]);

  /* Ensure AudioContext is unlocked on user gesture (required by mobile browsers) */
  const unlockAudio = () => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    // Play a silent buffer to fully unlock on iOS
    const buf = ctxRef.current.createBuffer(1, 1, 22050);
    const src = ctxRef.current.createBufferSource();
    src.buffer = buf;
    src.connect(ctxRef.current.destination);
    src.start(0);
  };

  /* audio */
  async function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") {
      await ctxRef.current.resume();
    }
    return ctxRef.current;
  }

  /** Create and start simulated HF CW receiver noise:
   *  Gaussian white noise → narrow band-pass filter centred on CW tone */
  function startNoise(ac: AudioContext) {
    if (noiseRef.current) return;
    const sr = ac.sampleRate;
    const len = sr * 4;
    const buf = ac.createBuffer(1, len, sr);
    const d = buf.getChannelData(0);

    // Gaussian white noise (Box-Muller transform)
    for (let i = 0; i < len; i += 2) {
      const u1 = Math.random() || 1e-10;
      const u2 = Math.random();
      const r = Math.sqrt(-2 * Math.log(u1));
      d[i]     = r * Math.cos(2 * Math.PI * u2);
      if (i + 1 < len) d[i + 1] = r * Math.sin(2 * Math.PI * u2);
    }

    const src = ac.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    // Narrow band-pass: centre = CW tone, bandwidth ≈ 300 Hz
    // Q = centre / bandwidth
    const bpf = ac.createBiquadFilter();
    bpf.type = "bandpass";
    bpf.frequency.value = toneHz*2;
    bpf.Q.value = toneHz / 200;

    const gain = ac.createGain();
    gain.gain.value = (noiseVol / 100) * 0.15;

    src.connect(bpf);
    bpf.connect(gain);
    gain.connect(ac.destination);
    src.start();
    noiseRef.current = { src, gain };
  }

  /** Stop noise */
  function stopNoise() {
    if (noiseRef.current) {
      try { noiseRef.current.src.stop(); } catch { /* ignore */ }
      noiseRef.current = null;
    }
  }

  async function beep(ms: number, ac: AudioContext, hz: number) {
    return new Promise<void>(resolve => {
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sine";
      osc.frequency.value = hz;

      const vol = Math.max(0, volume / 100) * 0.2;
      const now = ac.currentTime;
      const end = now + ms / 1000;
      const ramp = 0.004; // 4ms ramp to avoid click/pop

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(vol, now + ramp);
      gain.gain.setValueAtTime(vol, end - ramp);
      gain.gain.linearRampToValueAtTime(0, end);

      osc.connect(gain);
      gain.connect(ac.destination);
      osc.start(now);
      osc.stop(end + 0.01);

      // resolve after tone finishes (use setTimeout as fallback for Safari)
      const timeout = setTimeout(() => resolve(), ms);
      osc.onended = () => { clearTimeout(timeout); resolve(); };
    });
  }
  const gap = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  /** Tokenize text into morse-playable units: single chars, prosigns like <AR>, or " " */
  const tokenize = (text: string): string[] => {
    const tokens: string[] = [];
    let i = 0;
    while (i < text.length) {
      if (text[i] === " ") {
        tokens.push(" ");
        i++;
      } else if (text[i] === "<") {
        const end = text.indexOf(">", i);
        if (end !== -1) {
          tokens.push(text.slice(i, end + 1));
          i = end + 1;
        } else {
          i++;
        }
      } else {
        tokens.push(text[i]);
        i++;
      }
    }
    return tokens;
  };

  /** Play the morse pattern string (dots and dashes) as one continuous symbol */
  async function playPattern(pattern: string, ac: AudioContext, d: number, da: number, intra: number) {
    for (let i = 0; i < pattern.length; i++) {
      if (stopRef.current) break;
      await beep(pattern[i] === "." ? d : da, ac, toneHz);
      if (i < pattern.length - 1) await gap(intra);
    }
  }

  async function playMorse(text: string) {
    if (!text) return;
    stopRef.current = false; setPlaying(true);
    const ac = await getCtx();

    // start white noise if enabled
    if (noiseOn) startNoise(ac);

    const d = dotMs(charWpm);       // dit duration at character speed
    const da = d * 3;               // dah duration
    const intra = d;                // intra-character gap (between dits/dahs)

    // Farnsworth: character gap & word gap based on effective speed
    const ed = dotMs(effWpm);       // dit duration at effective speed
    const charGap = ed * 3;         // 3-dit gap between characters
    const wordGap = ed * 7;         // 7-dit gap between words

    const tokens = tokenize(text.toUpperCase());
    for (const tok of tokens) {
      if (stopRef.current) break;
      if (tok === " ") { await gap(wordGap); continue; }
      const p = MORSE[tok]; if (!p) continue;
      await playPattern(p, ac, d, da, intra);
      await gap(charGap);
    }

    stopNoise();
    setPlaying(false);
  }

  async function playChar(item: string) {
    stopRef.current = false;
    const ac = await getCtx();
    const d = dotMs(charWpm), da = d * 3, intra = d;
    const charGap = dotMs(effWpm) * 3;
    // item could be a prosign like <AR>, a single char, or a phrase like "CQ"
    const tokens = tokenize(item);
    for (let i = 0; i < tokens.length; i++) {
      if (stopRef.current) break;
      const p = MORSE[tokens[i]]; if (!p) continue;
      await playPattern(p, ac, d, da, intra);
      if (i < tokens.length - 1) await gap(charGap);
    }
  }

  const stop = () => { stopRef.current = true; setPlaying(false); stopNoise(); };
  const resetQuestion = () => { stop(); generate(); };

  /* check — tokenize-aware comparison; prosigns match by letters only (no <>) */
  const stripBrackets = (s: string) => s.replace(/[<>]/g, "");
  const normTokens = (s: string) => tokenize(s.toUpperCase()).filter(t => t !== " ");
  const check = () => {
    const a = normTokens(seq), b = normTokens(input);
    const mx = Math.max(a.length, b.length);
    if (!mx) { setAccuracy(100); setShowAnswer(true); setChecked(true); return; }
    let ok = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (stripBrackets(a[i]) === stripBrackets(b[i])) ok++;
    }
    setAccuracy(Math.round((ok / mx) * 100));
    setShowAnswer(true);
    setChecked(true);
  };

  const t = locales[lang];

  /* render answer with per-token coloring */
  const renderColoredSeq = (answer: string, userInputRaw: string) => {
    const answerTokens = tokenize(answer);
    const userTokens = normTokens(userInputRaw);
    let ui = 0;
    return answerTokens.map((tok, i) => {
      if (tok === " ") return <span key={i}>{" "}</span>;
      const matched = ui < userTokens.length && stripBrackets(tok) === stripBrackets(userTokens[ui]);
      const color = ui < userTokens.length
        ? (matched ? "text-green-400" : "text-red-400")
        : "text-red-400";
      ui++;
      return <span key={i} className={color}>{tok}</span>;
    });
  };

  /* category change handler */
  const handleCatChange = (newCatId: string) => {
    setCatId(newCatId);
    const cat = courses.find(c => c.id === newCatId);
    if (cat && cat.lessons.length > 0) {
      setLessonId(cat.lessons[0].id);
    }
  };

  /* prev / next lesson */
  const lessonIndex = currentCat.lessons.findIndex(l => l.id === lessonId);
  const hasPrev = lessonIndex > 0;
  const hasNext = lessonIndex < currentCat.lessons.length - 1;
  const goPrev = () => { if (hasPrev) setLessonId(currentCat.lessons[lessonIndex - 1].id); };
  const goNext = () => { if (hasNext) setLessonId(currentCat.lessons[lessonIndex + 1].id); };

  /* morse display for a char, phrase, or prosign */
  const morseOf = (item: string) => {
    // prosign like <AR> — look up directly
    if (MORSE[item]) return MORSE[item];
    // phrase like "CQ" — tokenize and join
    return tokenize(item).filter(t => t !== " ").map(t => MORSE[t] ?? "").join("  ");
  };

  /* ─────────────────────────── JSX ──────────────────────────── */
  return (
    <I18nContext.Provider value={t}>
    <div className="flex min-h-screen flex-col bg-wf-bg-deep text-wf-text selection:bg-wf-selection">

      {/* ── header ── */}
      <header className="border-b border-wf-border-divider bg-wf-bg-base">
        <div className="mx-auto flex max-w-4xl items-center gap-3 px-5 py-5">
          <span className="relative flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-wf-accent-glow opacity-60" />
            <span className="inline-flex h-3 w-3 rounded-full bg-wf-accent" />
          </span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-wide sm:text-3xl">
              <span className="text-wf-accent-hover">{t.header.title1}</span>{" "}
              <span className="text-wf-text">{t.header.title2}</span>
            </h1>
            <p className="mt-1 text-sm tracking-wide text-wf-text-muted">
              {t.header.by} <span className="font-semibold text-wf-callsign">SAØWXR</span>
            </p>
          </div>
          {/* language switcher */}
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-wf-text-dim" />
            <Select value={lang} onValueChange={v => setLang(v as LangCode)}>
              <SelectTrigger className="w-auto min-w-[120px] rounded-lg border-wf-border bg-wf-bg-deep text-sm text-wf-text-secondary focus:ring-wf-text-muted">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-wf-border bg-wf-bg-card">
                {(Object.keys(locales) as LangCode[]).map(code => (
                  <SelectItem key={code} value={code}>
                    <span className="inline-flex items-center gap-2 text-sm text-wf-text-secondary">
                      {langLabels[code].flag()}
                      {langLabels[code].label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* ── main ── */}
      <main className="flex-1">
        <div className="mx-auto max-w-4xl space-y-4 px-5 py-5">

          <div className="grid items-stretch gap-4 lg:grid-cols-[1fr_260px]">

          {/* ════ practice card ════ */}
          <Card className="rounded-2xl border-wf-border bg-wf-bg-card shadow-wf">
            <CardContent className="p-4 sm:p-5">
              <div className="space-y-3">
                {/* play / stop / new */}
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => { unlockAudio(); playMorse(seq); }}
                    disabled={playing}
                    className="rounded-lg bg-wf-ok px-5 py-2.5 text-base font-medium text-white hover:bg-wf-ok-hover disabled:opacity-40"
                  >
                    <Play className="mr-2 h-4 w-4" />{t.practice.play}
                  </Button>
                  <Button
                    onClick={resetQuestion}
                    variant="outline"
                    className="rounded-lg border-wf-border-strong px-5 py-2.5 text-base font-medium text-wf-accent-hover hover:bg-wf-accent-subtle"
                  >
                    <Square className="mr-2 h-4 w-4" />{t.practice.stop}
                  </Button>
                  <button
                    onClick={resetQuestion}
                    title={t.practice.newSequence}
                    className="group ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-red-500/50 bg-red-500/15 transition hover:border-red-400 hover:bg-red-500/25"
                  >
                    <RotateCcw className="h-4 w-4 text-red-400 transition group-hover:text-red-300" />
                  </button>
                </div>

                {/* audio text */}
                <div className="rounded-xl border border-wf-border bg-wf-bg-deep px-4 py-3">
                  <div className="mb-1.5 text-sm font-medium uppercase tracking-wide text-wf-text-dim">
                    {t.practice.audioText}
                  </div>
                  <div className="min-h-[48px] font-mono text-xl tracking-[0.3em] sm:text-2xl">
                    {showAnswer
                      ? (checked
                        ? renderColoredSeq(seq, input)
                        : <span className="text-wf-text-secondary">{seq}</span>)
                      : "\u00A0"}
                  </div>
                </div>

                {/* input */}
                <Input
                  value={input}
                  onChange={e => setInput(e.target.value.toUpperCase())}
                  placeholder={t.practice.inputPlaceholder}
                  className="rounded-lg border-wf-border bg-wf-bg-deep py-3 text-lg tracking-widest text-wf-text placeholder:text-wf-text-dim focus-visible:ring-wf-text-muted"
                />

                {/* check / show + accuracy */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    onClick={check}
                    className="rounded-lg bg-wf-ok px-5 py-2.5 text-base font-medium text-white hover:bg-wf-ok-hover"
                  >
                    {t.practice.check}
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
                    className="rounded-lg border-wf-border-strong px-5 py-2.5 text-base font-medium text-wf-accent-hover hover:bg-wf-accent-subtle"
                  >
                    {showAnswer ? t.practice.next : t.practice.showAnswer}
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
            </CardContent>
          </Card>

          {/* ════ lesson card (right side) ════ */}
          <Card className="flex flex-col rounded-2xl border-wf-border bg-wf-bg-card shadow-wf">
            <CardContent className="flex flex-1 flex-col p-4">
              {/* category selector */}
              <div className="mb-3">
                <div className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-wf-text-dim">
                  {t.lesson.category}
                </div>
                <Select value={catId} onValueChange={handleCatChange}>
                  <SelectTrigger className="rounded-lg border-wf-border bg-wf-bg-deep text-sm text-wf-text-secondary focus:ring-wf-text-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-wf-border bg-wf-bg-card">
                    {courses.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="text-sm text-wf-text-secondary">{getName(cat.name, lang)}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* lesson selector */}
              <div className="mb-3">
                <div className="mb-1.5 text-sm font-semibold uppercase tracking-wide text-wf-text-dim">
                  {t.lesson.title}
                </div>
                <Select value={lessonId} onValueChange={setLessonId}>
                  <SelectTrigger className="rounded-lg border-wf-border bg-wf-bg-deep text-sm text-wf-text-secondary focus:ring-wf-text-muted">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 border-wf-border bg-wf-bg-card">
                    {currentCat.lessons.map(les => (
                      <SelectItem key={les.id} value={les.id}>
                        <span className="text-sm text-wf-text-secondary">{getName(les.name, lang)}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* new chars/phrases in this lesson */}
              <div className="mb-3 flex-1">
                <div className="mb-2 text-sm font-semibold uppercase tracking-wide text-wf-text-dim">
                  {t.lesson.newInThisLesson}
                </div>
                <div className="space-y-1.5">
                  {currentLesson.newChars.map(item => (
                    <div
                      key={item}
                      className="flex items-center gap-3 rounded-lg bg-wf-bg-well px-3 py-2"
                    >
                      <span className="inline-flex min-w-[32px] items-center justify-center rounded-md bg-wf-bg-deep px-2 py-1 font-mono text-base font-bold text-wf-text">
                        {item}
                      </span>
                      <span className="flex-1 font-mono text-sm tracking-widest text-wf-text-muted">
                        {morseOf(item)}
                      </span>
                      <button
                        onClick={() => { unlockAudio(); playChar(item); }}
                        title={`${t.lesson.playChar} ${item}`}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-wf-bg-deep text-wf-text-muted transition hover:text-wf-text"
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* prev / next buttons */}
              <div className="flex gap-2 pt-2 border-t border-wf-border-divider">
                <Button
                  onClick={goPrev}
                  disabled={!hasPrev}
                  variant="outline"
                  className="flex-1 rounded-lg border-wf-border-strong text-sm font-medium text-wf-accent-hover hover:bg-wf-accent-subtle disabled:opacity-30"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" />{t.lesson.prev}
                </Button>
                <Button
                  onClick={goNext}
                  disabled={!hasNext}
                  variant="outline"
                  className="flex-1 rounded-lg border-wf-border-strong text-sm font-medium text-wf-accent-hover hover:bg-wf-accent-subtle disabled:opacity-30"
                >
                  {t.lesson.next}<ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          </div>

          {/* ════ settings card ════ */}
          <Card className="rounded-2xl border-wf-border bg-wf-bg-card shadow-wf">
            <CardContent className="p-4 sm:p-5">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-wf-text-dim">
                {t.settings.title}
              </h2>

              <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
                {!isPhrase && (
                  <SettingSlider
                    label={t.settings.groupLength} value={grpLen} min={1} max={8}
                    onChange={setGrpLen} random={grpLenRnd}
                    onRandomChange={setGrpLenRnd} randomLabel="1 – 8"
                  />
                )}
                <SettingSlider
                  label={t.settings.groups} value={grpCnt} min={4} max={12}
                  onChange={setGrpCnt} random={grpCntRnd}
                  onRandomChange={setGrpCntRnd} randomLabel="4 – 10"
                />
                <SettingSlider
                  label={t.settings.wpm} value={charWpm} min={12} max={30}
                  onChange={v => { setCharWpm(v); if (effWpm > v) setEffWpm(v); }}
                />
                <SettingSlider
                  label={t.settings.effectiveSpeed} value={effWpm} min={5} max={charWpm}
                  onChange={setEffWpm} suffix=" WPM"
                />
                <SettingSlider
                  label={t.settings.toneFreq} value={toneHz} min={400} max={1000} step={10}
                  onChange={setToneHz} suffix=" Hz"
                />
                <SettingSlider
                  label={t.settings.volume} value={volume} min={0} max={100}
                  onChange={setVolume} suffix="%"
                />
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm text-wf-accent">{t.settings.noise}</Label>
                    <Switch checked={noiseOn} onCheckedChange={setNoiseOn} className="scale-[0.8]" />
                  </div>
                  {noiseOn ? (
                    <Slider
                      value={[noiseVol]} min={0} max={100} step={1}
                      onValueChange={v => setNoiseVol(v[0])}
                      className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3 [&_[role=slider]]:border-wf-slider-border [&_[role=slider]]:bg-wf-slider-thumb"
                    />
                  ) : (
                    <div className="rounded-md bg-wf-bg-well py-1 text-center text-xs text-wf-text-muted">
                      OFF
                    </div>
                  )}
                  {noiseOn && (
                    <div className="text-right font-mono text-sm text-wf-text-secondary">{noiseVol}%</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* ── footer ── */}
      <footer className="border-t border-wf-border-divider bg-wf-bg-base">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-3 text-sm text-wf-text-dim">
          <span><a href="https://github.com/0x00A0/cw-practicer">{t.footer.poweredBy}</a></span>
          <span>{t.footer.copyright}</span>
          <span>{t.footer.de} <a href="https://www.qrz.com/db/SA0WXR"><span className="font-semibold text-wf-callsign">SAØWXR</span></a></span>
        </div>
      </footer>
    </div>
    </I18nContext.Provider>
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
  const t = useI18n();
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
              {t.settings.rnd}
            </label>
          )}
        </div>
      </div>
      {random ? (
        <div className="rounded-md bg-wf-bg-well py-1 text-center text-xs text-wf-text-muted">
          {t.settings.random} {randomLabel}
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

