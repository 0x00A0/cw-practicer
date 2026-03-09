export interface Locale {
  header: {
    title1: string;
    title2: string;
    by: string;
  };
  practice: {
    play: string;
    stop: string;
    audioText: string;
    inputPlaceholder: string;
    check: string;
    showAnswer: string;
    next: string;
    newSequence: string;
  };
  lesson: {
    title: string;
    category: string;
    newInThisLesson: string;
    playChar: string;
    prev: string;
    next: string;
  };
  settings: {
    title: string;
    groupLength: string;
    groups: string;
    wpm: string;
    effectiveSpeed: string;
    toneFreq: string;
    volume: string;
    noise: string;
    noiseVol: string;
    random: string;
    rnd: string;
  };
  footer: {
    poweredBy: string;
    copyright: string;
    de: string;
  };
}

const en: Locale = {
  header: {
    title1: "CW",
    title2: "Koch Method Trainer",
    by: "by",
  },
  practice: {
    play: "Play",
    stop: "Stop",
    audioText: "Audio Text",
    inputPlaceholder: "Type what you hear …",
    check: "Check",
    showAnswer: "Show Answer",
    next: "Next",
    newSequence: "New Sequence",
  },
  lesson: {
    title: "Lesson",
    category: "Category",
    newInThisLesson: "New in this lesson",
    playChar: "Play",
    prev: "Prev",
    next: "Next",
  },
  settings: {
    title: "Settings",
    groupLength: "Group Length",
    groups: "Groups",
    wpm: "WPM",
    effectiveSpeed: "Effective Speed",
    toneFreq: "Tone Freq",
    volume: "Volume",
    noise: "QRN",
    noiseVol: "QRN Level",
    random: "Random",
    rnd: "Rnd",
  },
  footer: {
    poweredBy: "Powered by GitHub Pages",
    copyright: "©2026 Xinrui Wan",
    de: "VY73 de",
  },
};

export default en;

