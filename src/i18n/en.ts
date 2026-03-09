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
    charPrefix: string;
  };
  settings: {
    title: string;
    groupLength: string;
    groups: string;
    wpm: string;
    effectiveSpeed: string;
    toneFreq: string;
    volume: string;
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
    title2: "Practice Tool",
    by: "By",
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
    charPrefix: "Char",
  },
  settings: {
    title: "Settings",
    groupLength: "Group Length",
    groups: "Groups",
    wpm: "WPM",
    effectiveSpeed: "Effective Speed",
    toneFreq: "Tone Freq",
    volume: "Volume",
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

