export interface ToolPageContent {
  intro: string;
  howTo: string[];
  tips?: string[];
  faq: { q: string; a: string }[];
}

export const TOOL_PAGES: Record<string, ToolPageContent> = {
  "wheel-spinner": {
    intro:
      "The WheelNamesArena wheel spinner turns any list into a spinning decision wheel. Add names, choices, prizes or questions, hit SPIN, and the pointer picks a winner with sound, confetti and a full-screen mode that looks great on a stream. Everything is saved in your browser — no account, no cost.",
    howTo: [
      "Type or paste your entries — one per line — in the entries panel.",
      "Press SPIN (or the space bar) and watch the wheel slow to a winner.",
      "Keep the winner, remove them from the wheel, or spin again right away.",
      "Share the wheel with a link, go full-screen, or save it for later.",
    ],
    tips: [
      "Use Shuffle before a live draw so nobody can predict the order.",
      "Full-screen mode plus the Hide controls toggle is perfect for OBS browser sources.",
      "Save multiple wheels — one per class, show or giveaway.",
    ],
    faq: [
      { q: "Is the spin truly random?", a: "Yes. Every spin picks a uniformly random landing angle with the Web Crypto-friendly Math.random, so each entry has an equal chance on every spin." },
      { q: "How many entries can a wheel hold?", a: "The wheel handles hundreds of entries smoothly. Labels stay readable up to about 40 entries; beyond that the wheel still spins fairly, labels just thin out." },
      { q: "Can I share my wheel with others?", a: "Yes — the Share button builds a link that carries your entries. Anyone who opens it gets an identical wheel, no account needed." },
      { q: "Do my entries get uploaded anywhere?", a: "No. Entries live in your browser's local storage and in share links you create yourself. WheelNamesArena has no database of your lists." },
    ],
  },
  "random-name-picker": {
    intro:
      "Paste any list of names and draw one at random. The random name picker is ideal for choosing who goes first, assigning prizes, or picking a volunteer — with a satisfying reveal animation and optional removal of picked names so nobody is drawn twice.",
    howTo: [
      "Enter names in the list, one per line.",
      "Press Pick and watch the names shuffle to a stop.",
      "Copy the result or remove the winner from the list for the next round.",
    ],
    faq: [
      { q: "Is every name equally likely?", a: "Yes. The draw uses a uniform random selection, so each name in the list has exactly the same chance of being picked." },
      { q: "Can I stop a name being picked twice?", a: "Turn on 'Remove picked name' and each winner is moved out of the pool automatically. Restore everyone with one click." },
      { q: "Does the list save between visits?", a: "Yes, your list is stored locally in your browser, so it's waiting for you next time — on the same device and browser." },
    ],
  },
  "random-choice-picker": {
    intro:
      "Pizza or pasta? Movie night or board games? The random choice picker settles everyday dilemmas in seconds. Add two or more options, press pick, and accept the verdict — no more endless debates.",
    howTo: [
      "Add every option you're torn between, one per line.",
      "Press Pick to get a random winner.",
      "Not happy with the result? Spin again — or accept fate.",
    ],
    faq: [
      { q: "How is this different from the decision maker?", a: "They're siblings: the choice picker is built for quick either/or lists, while the decision maker focuses on larger option sets with a chip-style editor." },
      { q: "Can I weight an option?", a: "Duplicate it in the list — an option listed twice gets twice the chance." },
      { q: "Is it really 50/50 with two options?", a: "Yes, with two options each has an exact 50% chance on every pick." },
    ],
  },
  "random-number-generator": {
    intro:
      "Generate one random number or a whole batch between any minimum and maximum. Perfect for raffles, seating numbers, dice-free game mechanics, statistics sampling, or picking a winner from numbered entries.",
    howTo: [
      "Set your minimum and maximum values.",
      "Choose how many numbers you need and whether they must be unique.",
      "Press Generate — copy the results whenever you need them.",
    ],
    faq: [
      { q: "Are the endpoints included?", a: "Yes. A range of 1–10 can produce both 1 and 10." },
      { q: "Can numbers repeat?", a: "Only if you allow it. Switch on 'Unique numbers' and every draw is different — great for raffles." },
      { q: "What's the largest range supported?", a: "Anything within ±1,000,000,000, which covers virtually every real-world use case." },
    ],
  },
  "random-team-generator": {
    intro:
      "Enter your players and get perfectly balanced random teams in one click. Choose how many teams you want, or set a team size and let the generator work out the rest. Great for PE classes, pickup games, quizzes and hackathons.",
    howTo: [
      "Paste player names, one per line.",
      "Pick 'Number of teams' or 'Team size' mode.",
      "Press Generate — reshuffle as many times as you like.",
      "Copy the results to share in chat or on the board.",
    ],
    faq: [
      { q: "Are the teams balanced?", a: "Yes. Players are shuffled and dealt round-robin, so team sizes differ by at most one person." },
      { q: "Can I make teams of exactly 4?", a: "Switch to 'Team size' mode and set 4. If players don't divide evenly, the last team takes the remainder." },
      { q: "Do results change every time?", a: "Every Generate press reshuffles from scratch, so you get a fresh random draw." },
    ],
  },
  "random-group-generator": {
    intro:
      "The group generator splits any list — students, attendees, tasks — into random groups of a size you choose. It's the fastest way to form pairs, trios or project groups without the usual haggling.",
    howTo: [
      "Enter everyone's name, one per line.",
      "Choose a group size (2 for pairs, 3 for trios, and so on).",
      "Generate, review, reshuffle if needed.",
    ],
    faq: [
      { q: "What happens to leftovers?", a: "If the list doesn't divide evenly, the final group is slightly smaller — or you can reshuffle until you like the layout." },
      { q: "Is this different from the team generator?", a: "Slightly: team generator starts from a number of teams, group generator starts from a group size. Use whichever matches how you think." },
      { q: "Can I use it for things other than people?", a: "Absolutely — tasks, topics, presentation order, anything that can be listed can be grouped." },
    ],
  },
  "random-student-picker": {
    intro:
      "A fair, friendly way to call on students. Load your class roster once, then pick names at random throughout the lesson. Set picked students aside so everyone gets a turn, and restore the class with one tap for the next round.",
    howTo: [
      "Paste your class roster — it's saved in your browser for next time.",
      "Press Pick a student to draw a name.",
      "Use 'Set aside' mode to ensure every student is called once per round.",
      "Restore everyone when a new round begins.",
    ],
    tips: [
      "Project the picker full-screen and let a student press the button — instant engagement.",
      "Keep one roster per class by saving different lists in a note and pasting as needed.",
    ],
    faq: [
      { q: "Does random calling actually help participation?", a: "Teachers report wider participation because every student knows they could be next. Pairing it with 'set aside' mode guarantees coverage across the class." },
      { q: "Is my roster private?", a: "Completely. The roster is stored only in your browser's local storage and never sent to a server." },
      { q: "Can students see who's already been picked?", a: "Yes — the set-aside list is visible, which makes the process feel transparent and fair." },
    ],
  },
  "giveaway-picker": {
    intro:
      "Run a professional giveaway draw without any software. Paste your participant list, remove duplicates automatically, choose how many winners to draw, and reveal them one by one with confetti. Multi-round mode removes previous winners from the pool so every prize goes to someone new.",
    howTo: [
      "Paste participants — one per line (comments, emails, tickets…).",
      "Tap Remove duplicates to clean the pool.",
      "Set the number of winners and press Draw.",
      "Reveal winners one at a time, then copy or share the results.",
    ],
    tips: [
      "Doing multiple prizes? Turn on 'Remove winners from pool' and draw round after round.",
      "Go full-screen before you go live so the reveal fills the stream.",
    ],
    faq: [
      { q: "Is the draw verifiably random?", a: "Each draw is a uniform random sample from the current pool. Anyone can check that duplicates were removed and winners were excluded between rounds." },
      { q: "How many participants can it handle?", a: "Thousands. Pasting and de-duplicating large lists is handled instantly in your browser." },
      { q: "Can I export the winner list?", a: "Yes — Copy results gives you a clean text list ready to paste anywhere." },
    ],
  },
  "decision-maker": {
    intro:
      "When the group chat can't agree, the decision maker will. Add your options as chips, press decide, and get an instant verdict — with a dramatic shuffle reveal. Use it for dinner, movies, travel plans, or anything a committee is stuck on.",
    howTo: [
      "Add each option as a chip (2–12 options).",
      "Press Decide and watch the options race.",
      "Accept the result — or run it back.",
    ],
    faq: [
      { q: "What if I only have two options?", a: "It works perfectly as a 50/50 — or jump to the coin flip for the classic experience." },
      { q: "Can I remove an option quickly?", a: "Yes, click the × on any chip to drop it before deciding." },
      { q: "Is the result truly random?", a: "Every option has an equal probability on every run — no memory, no bias." },
    ],
  },
  "yes-no-picker": {
    intro:
      "The fastest answer machine on the internet. Type your question, press the button, and get a decisive YES or NO with a satisfying animation. Perfect for quick calls, party games, and settling bets.",
    howTo: [
      "Type your yes-or-no question (optional, but fun).",
      "Press Get my answer.",
      "Read the verdict. Ask again as many times as you dare.",
    ],
    faq: [
      { q: "Is it exactly 50/50?", a: "Yes — a fair virtual coin under the hood: 50% yes, 50% no, every time." },
      { q: "Can it land on 'maybe'?", a: "No maybes here. Sometimes the most useful answer is a forced one." },
      { q: "Does it remember my questions?", a: "No. Questions stay on screen and are never stored or sent anywhere." },
    ],
  },
  "coin-flip": {
    intro:
      "A beautifully animated coin toss with real physics-feel — flip it to settle who kicks off, who pays for lunch, or which way to go. Keeps a running tally of heads and tails so you can prove it was fair.",
    howTo: [
      "Press Flip coin.",
      "Watch the coin tumble and land.",
      "Check the running heads/tails tally, reset whenever.",
    ],
    faq: [
      { q: "Are heads and tails equally likely?", a: "Exactly 50/50 on every flip, with no streak memory." },
      { q: "Can I call it before the flip?", a: "Call it out loud like the real thing — the coin won't wait." },
      { q: "Why keep a tally?", a: "For bragging rights and for settling 'best of five' disputes properly." },
    ],
  },
  "dice-roller": {
    intro:
      "Roll up to eight dice with crisp pip animations — no dice bag required. Great for board games, classroom probability experiments, RPG moments, or deciding anything on a d6.",
    howTo: [
      "Choose how many dice to roll (1–8).",
      "Press Roll.",
      "Read individual dice and the total.",
    ],
    faq: [
      { q: "Is each die independent?", a: "Yes — every die is an independent uniform roll from 1 to 6." },
      { q: "Can I roll other dice like d20?", a: "This roller focuses on classic six-sided dice. For wider ranges, use the random number generator with min 1, max 20." },
      { q: "Does the total update automatically?", a: "Yes, the total below the dice updates with every roll." },
    ],
  },
  "random-letter-generator": {
    intro:
      "Draw random letters of the alphabet for word games, charades prompts, category challenges, or alliteration day. Optionally include digits for license-plate style games.",
    howTo: [
      "Choose letters only, or letters plus digits.",
      "Pick how many characters to draw.",
      "Press Generate and copy the result if you need it.",
    ],
    faq: [
      { q: "Is every letter equally likely?", a: "Yes, A through Z are drawn with equal probability (plus 0–9 when digits are enabled)." },
      { q: "Can letters repeat?", a: "Yes — each draw is independent, just like pulling from an infinite alphabet." },
      { q: "What games work well with this?", a: "Categories ('name an animal starting with M'), charades, Scattergories-style rounds, and spelling games." },
    ],
  },
  "random-color-generator": {
    intro:
      "Generate pleasing random colors with one click — complete with HEX, RGB and HSL values ready to copy. Handy for designers exploring palettes, artists beating blank-canvas syndrome, and anyone assigning colors to teams or tasks.",
    howTo: [
      "Press Generate color.",
      "Copy the HEX, RGB or HSL value with one click.",
      "Browse your recent colors in the history strip.",
    ],
    faq: [
      { q: "Why do the colors look nice?", a: "Instead of pure random RGB noise, colors are generated in HSL space with constrained saturation and lightness — so every result is usable." },
      { q: "Can I use these commercially?", a: "Colors aren't copyrightable — use any result anywhere, freely." },
      { q: "Does it save my colors?", a: "Your recent colors are kept in your browser so you can revisit them on the same device." },
    ],
  },
  "random-question-generator": {
    intro:
      "Never stare at a silent room again. The random question generator serves icebreakers, classroom discussion prompts, would-you-rather dilemmas and deeper conversation starters at random — one tap at a time.",
    howTo: [
      "Pick a category: icebreakers, classroom, would you rather, fun or deep.",
      "Press New question.",
      "Discuss — then draw the next one.",
    ],
    faq: [
      { q: "How many questions are there?", a: "Over 70 hand-written questions across five categories, drawn without immediate repeats." },
      { q: "Are they classroom-safe?", a: "Yes — every question is written to be appropriate for school and work settings." },
      { q: "Can I suggest questions?", a: "We'd love that — use the contact page to send your favorites." },
    ],
  },
};
