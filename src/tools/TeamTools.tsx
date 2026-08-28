import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { Btn, Card, CopyButton, cx } from "../components/ui";
import { useLocalStorage } from "../lib/hooks";
import { parseList, shuffle } from "../lib/random";
import { paletteFor } from "../lib/themes";
import { playWin } from "../lib/sound";
import { loadSettings } from "../lib/storage";

type Mode = "teams" | "size";

const TEAM_COLORS = paletteFor("classic");

export default function TeamTool({ defaultMode = "teams" }: { defaultMode?: Mode }) {
  const [text, setText] = useLocalStorage<string>("da.people", "Ava\nLiam\nMaya\nNoah\nZoe\nEthan\nIvy\nLucas\nNora\nOwen\nRuby\nFelix");
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [teamCount, setTeamCount] = useState(2);
  const [teamSize, setTeamSize] = useState(3);
  const [teams, setTeams] = useState<string[][] | null>(null);
  const [genId, setGenId] = useState(0);

  const people = useMemo(() => parseList(text), [text]);

  const generate = () => {
    if (people.length < 2) return;
    const shuffled = shuffle(people);
    const k = mode === "teams" ? Math.max(1, Math.min(teamCount, people.length)) : Math.max(1, Math.ceil(people.length / Math.max(1, teamSize)));
    const buckets: string[][] = Array.from({ length: k }, () => []);
    shuffled.forEach((p, i) => buckets[i % k].push(p));
    setTeams(buckets);
    setGenId((n) => n + 1);
    if (loadSettings().sound) playWin();
  };

  const copyText = teams
    ? teams.map((t, i) => `Team ${i + 1}: ${t.join(", ")}`).join("\n")
    : "";

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      {/* Input */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-bold">
          People <span className="text-sm font-semibold text-ink-400">({people.length})</span>
        </h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={9}
          placeholder="One name per line…"
          aria-label="List of people"
          className="thin-scroll mt-3 w-full resize-y rounded-2xl border border-ink-200 bg-ink-50/40 p-4 font-mono text-sm leading-relaxed outline-none focus:border-brand-300 focus:bg-white"
        />

        <div className="mt-4 flex rounded-full border border-ink-200 bg-ink-50 p-1" role="group" aria-label="Split mode">
          {(["teams", "size"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={cx("flex-1 rounded-full px-4 py-2 text-sm font-semibold transition", mode === m ? "bg-white text-ink-950 shadow-soft" : "text-ink-500 hover:text-ink-950")}
            >
              {m === "teams" ? "Number of teams" : "Team size"}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-sm font-bold text-ink-700">{mode === "teams" ? "Teams" : "People per team"}</span>
          <div className="flex items-center rounded-full border border-ink-200 bg-white">
            <button
              type="button"
              aria-label="Decrease"
              onClick={() => (mode === "teams" ? setTeamCount((c) => Math.max(2, c - 1)) : setTeamSize((c) => Math.max(2, c - 1)))}
              className="px-3.5 py-1.5 text-lg font-bold text-ink-500 hover:text-ink-950"
            >
              −
            </button>
            <span className="w-8 text-center font-display text-lg font-bold">{mode === "teams" ? teamCount : teamSize}</span>
            <button
              type="button"
              aria-label="Increase"
              onClick={() => (mode === "teams" ? setTeamCount((c) => Math.min(16, c + 1)) : setTeamSize((c) => Math.min(12, c + 1)))}
              className="px-3.5 py-1.5 text-lg font-bold text-ink-500 hover:text-ink-950"
            >
              +
            </button>
          </div>
        </div>

        <Btn size="lg" onClick={generate} disabled={people.length < 2} className="mt-5 w-full">
          <Users className="h-5 w-5" aria-hidden /> {teams ? "Shuffle again" : "Generate teams"}
        </Btn>
        {people.length < 2 && <p className="mt-2 text-center text-xs text-ink-400">Add at least 2 people to split.</p>}
      </Card>

      {/* Results */}
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Teams</h2>
          {teams && <CopyButton text={copyText} label="Copy results" />}
        </div>

        {!teams ? (
          <div className="flex min-h-[220px] items-center justify-center rounded-2xl bg-ink-50/60 p-6">
            <p className="text-center text-sm text-ink-400">
              Balanced random teams will appear here.
              <br />
              Sizes differ by at most one person — nobody gets left out.
            </p>
          </div>
        ) : (
          <div key={genId} className="grid gap-3 sm:grid-cols-2">
            {teams.map((team, i) => {
              const color = TEAM_COLORS[i % TEAM_COLORS.length];
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="rounded-2xl border border-ink-100 bg-white p-4 shadow-soft"
                >
                  <p className="mb-2.5 flex items-center gap-2 font-display text-sm font-bold text-ink-950">
                    <span className="h-3 w-3 rounded-full" style={{ background: color }} aria-hidden />
                    Team {i + 1}
                    <span className="ml-auto text-xs font-semibold text-ink-400">{team.length}</span>
                  </p>
                  <ul className="space-y-1">
                    {team.map((p, j) => (
                      <li key={`${p}-${j}`} className="rounded-lg bg-ink-50 px-3 py-1.5 text-sm font-semibold text-ink-800">
                        {p}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
