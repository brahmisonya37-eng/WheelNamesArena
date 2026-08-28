import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getTool } from "../lib/tools";
import { ToolPage } from "../components/ToolPage";
import ListPickTool from "../tools/ListPickTool";
import DecisionTool from "../tools/DecisionTool";
import YesNoTool from "../tools/YesNoTool";
import TeamTool from "../tools/TeamTools";
import GiveawayTool from "../tools/GiveawayTool";
import { CoinFlipTool, DiceTool, NumberTool } from "../tools/NumberDiceCoin";
import { ColorTool, LetterTool, QuestionTool } from "../tools/MiniGenerators";

const DEFAULT_NAMES = ["Ava", "Liam", "Maya", "Noah", "Zoe", "Ethan", "Ivy", "Lucas", "Nora", "Owen"];

function toolComponent(slug: string): ReactNode {
  switch (slug) {
    case "random-name-picker":
      return <ListPickTool storageKey="da.names" nounPlural="names" cta="Pick a name" defaults={DEFAULT_NAMES} accent="#ff6b5e" allowSetAside />;
    case "random-choice-picker":
      return <ListPickTool storageKey="da.choices" nounPlural="choices" cta="Pick one" defaults={["Pizza", "Sushi", "Tacos", "Burgers", "Ramen"]} accent="#38bdf8" placeholder={"One option per line…"} />;
    case "random-student-picker":
      return <ListPickTool storageKey="da.roster" nounPlural="students" cta="Pick a student" defaults={DEFAULT_NAMES} accent="#6d4aff" allowSetAside setAsideDefault setAsideNoun="everyone picked" placeholder={"Paste your class roster — one student per line…"} />;
    case "decision-maker":
      return <DecisionTool />;
    case "yes-no-picker":
      return <YesNoTool />;
    case "random-number-generator":
      return <NumberTool />;
    case "coin-flip":
      return <CoinFlipTool />;
    case "dice-roller":
      return <DiceTool />;
    case "random-team-generator":
      return <TeamTool defaultMode="teams" />;
    case "random-group-generator":
      return <TeamTool defaultMode="size" />;
    case "giveaway-picker":
      return <GiveawayTool />;
    case "random-letter-generator":
      return <LetterTool />;
    case "random-color-generator":
      return <ColorTool />;
    case "random-question-generator":
      return <QuestionTool />;
    default:
      return null;
  }
}

export default function ToolPageRoute({ slug }: { slug: string }) {
  const meta = getTool(slug);
  const body = toolComponent(slug);
  if (!meta || body === null) return <Navigate to="/tools" replace />;
  return <ToolPage meta={meta}>{body}</ToolPage>;
}
