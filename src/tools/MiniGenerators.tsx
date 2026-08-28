import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { RefreshCw } from "lucide-react";
import { Btn, Card, CopyButton, Toggle, cx } from "../components/ui";
import { pick, randInt, shuffle } from "../lib/random";
import { textColorFor } from "../lib/themes";
import { useLocalStorage } from "../lib/hooks";
import { playPop, playWin, unlockAudio } from "../lib/sound";
import { loadSettings } from "../lib/storage";

/* ------------------------------ Letter generator ----------------------------- */

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const DIGITS = "0123456789".split("");

export function LetterTool() {
  const [withDigits, setWithDigits] = useState(false);
  const [count, setCount] = useState(1);
  const [result, setResult] = useState<string[]>([]);
  const [genId, setGenId] = useState(0);

  const charset = withDigits ? [...LETTERS, ...DIGITS] : LETTERS;

  const generate = () => {
    setResult(Array.from({ length: count }, () => pick(charset)));
    setGenId((n) => n + 1);
    if (loadSettings().sound) {
      unlockAudio();
      playWin();
    }
  };

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <label className="flex items-center gap-2.5 text-sm font-semibold text-ink-700">
          <Toggle checked={withDigits} onChange={setWithDigits} label="Include digits" /> Include digits 0–9
        </label>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-ink-700">Characters</span>
          <div className="flex items-center rounded-full border border-ink-200 bg-white">
            <button type="button" aria-label="Fewer characters" onClick={() => setCount((c) => Math.max(1, c - 1))} className="px-3.5 py-1.5 text-lg font-bold text-ink-500 hover:text-ink-950">−</button>
            <span className="w-8 text-center font-display text-lg font-bold">{count}</span>
            <button type="button" aria-label="More characters" onClick={() => setCount((c) => Math.min(8, c + 1))} className="px-3.5 py-1.5 text-lg font-bold text-ink-500 hover:text-ink-950">+</button>
          </div>
        </div>
      </div>

      <div key={genId} className="mt-6 flex min-h-[130px] flex-wrap items-center justify-center gap-3 rounded-2xl bg-ink-50/60 p-6" aria-live="polite">
        {result.length === 0 ? (
          <p className="text-sm text-ink-400">Random letters will appear here.</p>
        ) : (
          result.map((l, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0.5, opacity: 0, rotate: -8 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ delay: i * 0.07, type: "spring", stiffness: 320, damping: 18 }}
              className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white font-display text-5xl font-bold text-brand-500 shadow-soft"
            >
              {l}
            </motion.span>
          ))
        )}
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2.5">
        <Btn size="lg" onClick={generate} className="min-w-44">Generate</Btn>
        {result.length > 0 && <CopyButton text={result.join("")} label="Copy" size="md" />}
      </div>
    </Card>
  );
}

/* ------------------------------ Color generator ------------------------------ */

function hslToHex(h: number, s: number, l: number): string {
  const sn = s / 100;
  const ln = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sn * Math.min(ln, 1 - ln);
  const f = (n: number) => ln - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (v: number) => Math.round(v * 255).toString(16).padStart(2, "0");
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

function randomColor(): string {
  return hslToHex(randInt(0, 359), randInt(52, 92), randInt(40, 64));
}

export function ColorTool() {
  const [color, setColor] = useState<string>(() => randomColor());
  const [history, setHistory] = useLocalStorage<string[]>("da.colors", []);

  const generate = () => {
    const next = randomColor();
    setColor(next);
    setHistory((h) => [next, ...h.filter((c) => c !== next)].slice(0, 10));
    if (loadSettings().sound) {
      unlockAudio();
      playPop();
    }
  };

  const rgb = useMemo(() => {
    const h = color.replace("#", "");
    return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
  }, [color]);

  return (
    <Card className="overflow-hidden">
      <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 p-8 transition-colors duration-300" style={{ background: color }} aria-live="polite">
        <motion.p key={color} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="font-display text-4xl font-bold tracking-tight uppercase sm:text-5xl" style={{ color: textColorFor(color) }}>
          {color}
        </motion.p>
        <p className="text-sm font-semibold" style={{ color: textColorFor(color), opacity: 0.75 }}>
          rgb({rgb.r}, {rgb.g}, {rgb.b})
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2.5 p-6">
        <Btn size="lg" onClick={generate} className="min-w-44">
          <RefreshCw className="h-4.5 w-4.5" aria-hidden /> Generate color
        </Btn>
        <CopyButton text={color} label="Copy HEX" size="md" />
        <CopyButton text={`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`} label="Copy RGB" size="md" />
      </div>
      {history.length > 0 && (
        <div className="flex items-center gap-2 border-t border-ink-100 px-6 py-4">
          <span className="mr-1 text-xs font-bold tracking-wide text-ink-400 uppercase">Recent</span>
          {history.map((c) => (
            <button key={c} type="button" title={c} aria-label={`Select ${c}`} onClick={() => setColor(c)} className="h-7 w-7 rounded-full border-2 border-white shadow transition-transform hover:scale-115" style={{ background: c }} />
          ))}
        </div>
      )}
    </Card>
  );
}

/* ----------------------------- Question generator ---------------------------- */

const QUESTION_SETS: Record<string, string[]> = {
  Icebreakers: [
    "What's the best meal you've ever had?",
    "What skill would you love to learn instantly?",
    "What's your most-used emoji?",
    "What was your first concert or live event?",
    "If you could teleport anywhere right now, where would you go?",
    "What's a small thing that made you smile this week?",
    "What's your go-to comfort show?",
    "What job did you want as a kid?",
    "What's the best compliment you've ever received?",
    "Coffee, tea, or something else entirely?",
    "What's a place everyone should visit once?",
    "What's your hidden talent?",
    "What song is stuck in your head lately?",
    "What's your favorite season and why?",
    "What's the last photo you took on your phone?",
  ],
  Classroom: [
    "If you could ask the author of any book one question, what would it be?",
    "What's one thing you learned this week that surprised you?",
    "How would you explain today's topic to a younger student?",
    "What question do you still have about this unit?",
    "If this topic were a movie, what would its title be?",
    "What's the hardest part of what we're learning, and why?",
    "Give a real-life example of today's lesson.",
    "What would you add to today's lesson if you were the teacher?",
    "Which idea from today would you most like to explore further?",
    "What's one mistake that helped you learn something?",
    "How does today's topic connect to something outside school?",
    "If you had to teach this in 60 seconds, what would you say?",
    "What part of today's lesson would make a good test question?",
    "What's one thing you agree or disagree with from today?",
    "What should we review again tomorrow?",
  ],
  "Would you rather": [
    "Would you rather always be 10 minutes late or 20 minutes early?",
    "Would you rather be able to fly or be invisible?",
    "Would you rather live without music or without movies?",
    "Would you rather have a rewind button or a pause button for life?",
    "Would you rather explore space or the deep ocean?",
    "Would you rather never use social media or never watch streaming again?",
    "Would you rather speak every language or play every instrument?",
    "Would you rather have breakfast for dinner or dinner for breakfast?",
    "Would you rather win an award or give the acceptance speech for someone you admire?",
    "Would you rather always know the answer or always know the right question?",
    "Would you rather teleport anywhere or never need sleep?",
    "Would you rather be famous or be friends with someone famous?",
    "Would you rather have perfect memory or perfect focus?",
    "Would you rather live in a treehouse or a houseboat?",
    "Would you rather be the funniest person in the room or the smartest?",
  ],
  Fun: [
    "What's the weirdest food combination you actually enjoy?",
    "If animals could talk, which species would be the rudest?",
    "What's the most useless thing you're great at?",
    "If your life had a theme song, what would it be?",
    "What's the strangest thing you've ever bought?",
    "If you were a kitchen appliance, which one would you be?",
    "What conspiracy theory would you invent if you had to?",
    "What's the worst movie you've ever seen all the way through?",
    "If you had to eat one cuisine forever, what would it be?",
    "What's a trend you never understood?",
    "What fictional character would make a terrible roommate?",
    "What's the funniest word you know?",
    "If you opened a shop, what would it sell?",
    "What's your most controversial food opinion?",
    "What would your superhero name be?",
  ],
  Deep: [
    "What's a belief you changed your mind about this year?",
    "What does a perfect day look like for you?",
    "What's something you're proud of that nobody sees?",
    "What advice would you give your younger self?",
    "What's one habit that improved your life more than expected?",
    "When do you feel most like yourself?",
    "What's a fear you'd like to outgrow?",
    "What do you want to be remembered for?",
    "What's something you've never tried but want to?",
    "Who has influenced you the most, and how?",
    "What does success mean to you, honestly?",
    "What's one thing you'd do if you knew you couldn't fail?",
    "What's a lesson that took you too long to learn?",
    "What are you grateful for today?",
    "What's worth waiting for?",
  ],
};

const CATEGORY_COLORS: Record<string, string> = {
  Icebreakers: "#38bdf8",
  Classroom: "#6d4aff",
  "Would you rather": "#ff6b5e",
  Fun: "#ffb020",
  Deep: "#2dd4a7",
};

export function QuestionTool() {
  const [category, setCategory] = useState<keyof typeof QUESTION_SETS>("Icebreakers");
  const [question, setQuestion] = useState<string | null>(null);
  const deckRef = useRef<string[]>([]);

  const next = (cat: keyof typeof QUESTION_SETS = category) => {
    if (deckRef.current.length === 0) {
      deckRef.current = shuffle(QUESTION_SETS[cat]);
    }
    const q = deckRef.current.pop()!;
    setQuestion(q);
    if (loadSettings().sound) {
      unlockAudio();
      playPop();
    }
  };

  const switchCategory = (cat: keyof typeof QUESTION_SETS) => {
    setCategory(cat);
    deckRef.current = [];
    setQuestion(null);
  };

  const color = CATEGORY_COLORS[category];

  return (
    <Card className="p-6 sm:p-8">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Question category">
        {Object.keys(QUESTION_SETS).map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => switchCategory(cat)}
            aria-pressed={category === cat}
            className={cx("rounded-full border px-4 py-2 text-sm font-semibold transition", category === cat ? "border-transparent text-white" : "border-ink-200 bg-white text-ink-600 hover:border-ink-300")}
            style={category === cat ? { background: CATEGORY_COLORS[cat] } : undefined}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-6 flex min-h-[160px] items-center justify-center rounded-2xl p-8" style={{ background: `${color}14` }} aria-live="polite">
        {question ? (
          <motion.p key={question} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center font-display text-2xl leading-snug font-bold text-ink-950 text-balance sm:text-3xl">
            {question}
          </motion.p>
        ) : (
          <p className="text-center text-sm text-ink-400">Press the button to draw a {category.toLowerCase()} question.</p>
        )}
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2.5">
        <Btn size="lg" onClick={() => next()} className="min-w-48 hover:brightness-110 active:brightness-95" style={{ background: color }}>
          {question ? "New question" : "Get a question"}
        </Btn>
        {question && <CopyButton text={question} label="Copy" size="md" />}
      </div>
    </Card>
  );
}
