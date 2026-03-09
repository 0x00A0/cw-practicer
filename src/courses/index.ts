/**
 * ── Course Definition ──
 *
 * Edit this file to add/modify courses.
 *
 * Structure:
 *   Category (大课) → Lesson[] (小课)
 *   Each lesson has:
 *     - newChars: characters introduced in THIS lesson
 *     - chars:    ALL characters available for practice (cumulative)
 *
 * The `id` field is used for localStorage persistence.
 * The `name` field is an i18n key — translations go in src/i18n/*.ts
 */

export interface Lesson {
  id: string;
  name: Record<string, string>;      // { en, zh, sv, ... }
  newChars: string[];                 // characters introduced in this lesson
  chars: string[];                    // all chars for practice (cumulative)
}

export interface Category {
  id: string;
  name: Record<string, string>;      // { en, zh, sv, ... }
  /** "char" = single-char groups, group length adjustable
   *  "phrase" = each item is a phrase/prosign, group length locked to 1 */
  mode: "char" | "phrase";
  lessons: Lesson[];
}

/* ────────── Morse code table ────────── */

export const MORSE: Record<string, string> = {
  A: ".-",    B: "-...",  C: "-.-.",  D: "-..",   E: ".",
  F: "..-.",  G: "--.",   H: "....",  I: "..",    J: ".---",
  K: "-.-",   L: ".-..",  M: "--",    N: "-.",    O: "---",
  P: ".--.",  Q: "--.-",  R: ".-.",   S: "...",   T: "-",
  U: "..-",   V: "...-",  W: ".--",   X: "-..-",  Y: "-.--",
  Z: "--..",
  "0": "-----", "1": ".----", "2": "..---", "3": "...--", "4": "....-",
  "5": ".....", "6": "-....", "7": "--...", "8": "---..", "9": "----.",
  ".": ".-.-.-", ",": "--..--", "?": "..--..", "/": "-..-.",
  "=": "-...-",  "+": ".-.-.",

  /* ── Prosigns (sent as one symbol, no inter-character gap) ── */
  "AR": ".-.-.",      // End of message
  "SK": "...-.-",     // End of contact
  "BT": "-...-",      // Pause / break (same as =)
  "KN": "-.--.",      // Go ahead, named station only
  "AS": ".-...",      // Wait
  "HH": "........", // Disregard
};

/* ────────── Koch order ────────── */

const KOCH = [
  "K","M","R","S","U","A","P","T","L","O",
  "W","I",".","N","J","E","F","0","Y",",",
  "V","G","5","/","Q","9","Z","H","3","8",
  "B","?","4","2","7","C","1","D","6","X",
];

/* ────────── Helper: build Koch character lessons ────────── */

function buildKochLessons(): Lesson[] {
  const lessons: Lesson[] = [];
  for (let i = 1; i < KOCH.length; i++) {
    const newChar = KOCH[i];
    const cumulative = KOCH.slice(0, i + 1);
    lessons.push({
      id: `char-${i}`,
      name: {
        en: `Char-${i}`,
        zh: `字符-${i}`,
        sv: `Tecken-${i}`,
      },
      newChars: i === 1 ? [KOCH[0], KOCH[1]] : [newChar],
      chars: cumulative,
    });
  }

  return lessons;
}

/* ────────── Course data ────────── */

export const courses: Category[] = [
  {
    id: "characters",
    name: {
      en: "Characters",
      zh: "字符",
      sv: "Tecken",
    },
    mode: "char",
    lessons: buildKochLessons(),
  },
  {
    id: "prosigns",
    name: {
      en: "Prosigns",
      zh: "程序简语",
      sv: "Prosign",
    },
    mode: "phrase",
    lessons: [
      {
        id: "prosign-1",
        name: { en: "Prosign-1", zh: "程序简语-1", sv: "Prosign-1" },
        newChars: ["AR", "BT"],
        chars: ["AR", "BT"],
      },
      {
        id: "prosign-2",
        name: { en: "Prosign-2", zh: "程序简语-2", sv: "Prosign-2" },
        newChars: ["SK", "KN"],
        chars: ["AR", "BT", "SK", "KN"],
      },
      {
        id: "prosign-3",
        name: { en: "Prosign-3", zh: "程序简语-3", sv: "Prosign-3" },
        newChars: ["AS", "HH"],
        chars: ["AR", "BT", "SK", "KN", "AS", "HH"],
      },
    ],
  },
    {
        id: "abbreviations",
        name: {
            en: "Abbreviations",
            zh: "缩略语",
            sv: "Förkortningar",
        },
        mode: "phrase",
        lessons: [
            {
                id: "abbr-1",
                name: { en: "Abbr-1", zh: "缩略语-1", sv: "Förk-1" },
                newChars: ["CQ", "DE"],
                chars: ["CQ", "DE"],
            },
            {
                id: "abbr-2",
                name: { en: "Abbr-2", zh: "缩略语-2", sv: "Förk-2" },
                newChars: ["RST", "UR"],
                chars: ["CQ", "DE", "RST", "UR"],
            },
            {
                id: "abbr-3",
                name: { en: "Abbr-3", zh: "缩略语-3", sv: "Förk-3" },
                newChars: ["QTH", "QSL"],
                chars: ["CQ", "DE", "RST", "UR", "QTH", "QSL"],
            },
            {
                id: "abbr-4",
                name: { en: "Abbr-4", zh: "缩略语-4", sv: "Förk-4" },
                newChars: ["TNX", "FB"],
                chars: ["CQ", "DE", "RST", "UR", "QTH", "QSL", "TNX", "FB"],
            },
            {
                id: "abbr-5",
                name: { en: "Abbr-5", zh: "缩略语-5", sv: "Förk-5" },
                newChars: ["73", "88"],
                chars: ["CQ", "DE", "RST", "UR", "QTH", "QSL", "TNX", "FB", "73", "88"],
            },
            {
                id: "abbr-6",
                name: { en: "Abbr-6", zh: "缩略语-6", sv: "Förk-6" },
                newChars: ["NAME", "OP"],
                chars: ["CQ", "DE", "RST", "UR", "QTH", "QSL", "TNX", "FB", "73", "88", "NAME", "OP"],
            },
            {
                id: "abbr-7",
                name: { en: "Abbr-7", zh: "缩略语-7", sv: "Förk-7" },
                newChars: ["RIG", "ANT"],
                chars: ["CQ", "DE", "RST", "UR", "QTH", "QSL", "TNX", "FB", "73", "88", "NAME", "OP", "RIG", "ANT"],
            },
            {
                id: "abbr-8",
                name: { en: "Abbr-8", zh: "缩略语-8", sv: "Förk-8" },
                newChars: ["PWR", "WX"],
                chars: ["CQ", "DE", "RST", "UR", "QTH", "QSL", "TNX", "FB", "73", "88", "NAME", "OP", "RIG", "ANT", "PWR", "WX"],
            },
            {
                id: "abbr-9",
                name: { en: "Abbr-9", zh: "缩略语-9", sv: "Förk-9" },
                newChars: ["HR", "AGN"],
                chars: ["CQ", "DE", "RST", "UR", "QTH", "QSL", "TNX", "FB", "73", "88", "NAME", "OP", "RIG", "ANT", "PWR", "WX", "HR", "AGN"],
            },
            {
                id: "abbr-10",
                name: { en: "Abbr-10", zh: "缩略语-10", sv: "Förk-10" },
                newChars: ["PSE", "BK"],
                chars: ["CQ", "DE", "RST", "UR", "QTH", "QSL", "TNX", "FB", "73", "88", "NAME", "OP", "RIG", "ANT", "PWR", "WX", "HR", "AGN", "PSE", "BK"],
            },
            {
                id: "abbr-11",
                name: { en: "Abbr-11", zh: "缩略语-11", sv: "Förk-11" },
                newChars: ["GM", "GA"],
                chars: ["CQ", "DE", "RST", "UR", "QTH", "QSL", "TNX", "FB", "73", "88", "NAME", "OP", "RIG", "ANT", "PWR", "WX", "HR", "AGN", "PSE", "BK", "GM", "GA"],
            },
            {
                id: "abbr-12",
                name: { en: "Abbr-12", zh: "缩略语-12", sv: "Förk-12" },
                newChars: ["GE", "GN"],
                chars: ["CQ", "DE", "RST", "UR", "QTH", "QSL", "TNX", "FB", "73", "88", "NAME", "OP", "RIG", "ANT", "PWR", "WX", "HR", "AGN", "PSE", "BK", "GM", "GA", "GE", "GN"],
            },
            {
                id: "abbr-13",
                name: { en: "Abbr-13", zh: "缩略语-13", sv: "Förk-13" },
                newChars: ["DX", "TEST"],
                chars: ["CQ", "DE", "RST", "UR", "QTH", "QSL", "TNX", "FB", "73", "88", "NAME", "OP", "RIG", "ANT", "PWR", "WX", "HR", "AGN", "PSE", "BK", "GM", "GA", "GE", "GN", "DX", "TEST"],
            },
            {
                id: "abbr-14",
                name: { en: "Abbr-14", zh: "缩略语-14", sv: "Förk-14" },
                newChars: ["NR", "TU"],
                chars: ["CQ", "DE", "RST", "UR", "QTH", "QSL", "TNX", "FB", "73", "88", "NAME", "OP", "RIG", "ANT", "PWR", "WX", "HR", "AGN", "PSE", "BK", "GM", "GA", "GE", "GN", "DX", "TEST", "NR", "TU"],
            },
            {
                id: "abbr-15",
                name: { en: "Abbr-15", zh: "缩略语-15", sv: "Förk-15" },
                newChars: ["CUL", "GL"],
                chars: ["CQ", "DE", "RST", "UR", "QTH", "QSL", "TNX", "FB", "73", "88", "NAME", "OP", "RIG", "ANT", "PWR", "WX", "HR", "AGN", "PSE", "BK", "GM", "GA", "GE", "GN", "DX", "TEST", "NR", "TU", "CUL", "GL"],
            }
        ]
},
    {
        id: "qcodes",
        name: {
            en: "Q Codes",
            zh: "Q简码",
            sv: "Q-koder",
        },
        mode: "phrase",
        lessons: [
            {
                id: "q-1",
                name: { en: "QCode-1", zh: "Q简码-1", sv: "Qkod-1" },
                newChars: ["QRL", "QRM"],
                chars: ["QRL", "QRM"],
            },
            {
                id: "q-2",
                name: { en: "QCode-2", zh: "Q简码-2", sv: "Qkod-2" },
                newChars: ["QRN", "QSB"],
                chars: ["QRL", "QRM", "QRN", "QSB"],
            },
            {
                id: "q-3",
                name: { en: "QCode-3", zh: "Q简码-3", sv: "Qkod-3" },
                newChars: ["QTH", "QSL"],
                chars: ["QRL", "QRM", "QRN", "QSB", "QTH", "QSL"],
            },
            {
                id: "q-4",
                name: { en: "QCode-4", zh: "Q简码-4", sv: "Qkod-4" },
                newChars: ["QSY", "QRG"],
                chars: ["QRL", "QRM", "QRN", "QSB", "QTH", "QSL", "QSY", "QRG"],
            },
            {
                id: "q-5",
                name: { en: "QCode-5", zh: "Q简码-5", sv: "Qkod-5" },
                newChars: ["QRZ", "QSO"],
                chars: ["QRL", "QRM", "QRN", "QSB", "QTH", "QSL", "QSY", "QRG", "QRZ", "QSO"],
            },
            {
                id: "q-6",
                name: { en: "QCode-6", zh: "Q简码-6", sv: "Qkod-6" },
                newChars: ["QRX", "QRT"],
                chars: [
                    "QRL","QRM","QRN","QSB","QTH","QSL",
                    "QSY","QRG","QRZ","QSO","QRX","QRT"
                ],
            },
            {
                id: "q-7",
                name: { en: "QCode-7", zh: "Q简码-7", sv: "Qkod-7" },
                newChars: ["QRS", "QRQ"],
                chars: [
                    "QRL","QRM","QRN","QSB","QTH","QSL",
                    "QSY","QRG","QRZ","QSO","QRX","QRT",
                    "QRS","QRQ"
                ],
            },
            {
                id: "q-8",
                name: { en: "QCode-8", zh: "Q简码-8", sv: "Qkod-8" },
                newChars: ["QRP", "QRO"],
                chars: [
                    "QRL","QRM","QRN","QSB","QTH","QSL",
                    "QSY","QRG","QRZ","QSO","QRX","QRT",
                    "QRS","QRQ","QRP","QRO"
                ],
            },
            {
                id: "q-9",
                name: { en: "QCode-9", zh: "Q简码-9", sv: "Qkod-9" },
                newChars: ["QRV", "QRA"],
                chars: [
                    "QRL","QRM","QRN","QSB","QTH","QSL",
                    "QSY","QRG","QRZ","QSO","QRX","QRT",
                    "QRS","QRQ","QRP","QRO","QRV","QRA"
                ],
            },
            {
                id: "q-10",
                name: { en: "QCode-10", zh: "Q简码-10", sv: "Qkod-10" },
                newChars: ["QTR", "QTC"],
                chars: [
                    "QRL","QRM","QRN","QSB","QTH","QSL",
                    "QSY","QRG","QRZ","QSO","QRX","QRT",
                    "QRS","QRQ","QRP","QRO","QRV","QRA",
                    "QTR","QTC"
                ],
            },
        ],
    }
];

/* ────────── Helpers ────────── */

/** Find a category + lesson by their IDs */
export function findLesson(catId: string, lessonId: string): { category: Category; lesson: Lesson } | null {
  const cat = courses.find(c => c.id === catId);
  if (!cat) return null;
  const les = cat.lessons.find(l => l.id === lessonId);
  if (!les) return null;
  return { category: cat, lesson: les };
}

/** Get display name for current language, fallback to en */
export function getName(names: Record<string, string>, lang: string): string {
  return names[lang] ?? names["en"] ?? Object.values(names)[0] ?? "";
}

