export interface GuideSection {
  heading?: string;
  paragraphs?: string[];
  list?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  category: string;
  readTime: string;
  updated: string;
  sections: GuideSection[];
  relatedTools: string[];
}

export const GUIDES: Guide[] = [
  {
    slug: "how-to-pick-a-random-student",
    title: "How to Pick a Random Student (Fairly and Without Tears)",
    description: "A practical guide to random student selection: why it works, how to set up a roster, and routines that keep every voice in the game.",
    category: "Classroom",
    readTime: "4 min read",
    updated: "2025-01-10",
    relatedTools: ["random-student-picker", "wheel-spinner", "random-team-generator"],
    sections: [
      {
        paragraphs: [
          "Calling on volunteers rewards the confident, and calling from memory favors the front row. Random selection fixes both problems: every student knows they could be next, so everyone stays engaged, and the teacher is off the hook for who gets picked.",
          "The trick is making randomness feel fair. Done well, it becomes a fun classroom ritual instead of a source of anxiety.",
        ],
      },
      {
        heading: "Set up your roster once",
        paragraphs: [
          "Open the Random Student Picker and paste your class list — one name per line. The roster is saved in your browser, so it's ready every lesson with zero setup. Teach multiple classes? Keep each roster in a note and paste the right one in seconds.",
        ],
      },
      {
        heading: "Run it like a game show",
        list: [
          "Project the picker full-screen so the whole class sees the draw.",
          "Let a student press the pick button — instant buy-in.",
          "Use 'set aside' mode so every student is called exactly once per round.",
          "Restore everyone at the start of the next activity and go again.",
        ],
      },
      {
        heading: "Keep it low-stakes",
        paragraphs: [
          "Pair random calling with think time: announce that a name will be drawn, give 30 seconds to think or discuss with a partner, then pick. Students answer with confidence because they've had a moment to prepare.",
          "If a student is genuinely stuck, allow one 'phone a friend' pass. The goal is participation, not ambush.",
        ],
      },
      {
        heading: "Mix up your routines",
        list: [
          "Wheel of names for questions that need different answers.",
          "Random team generator for group work — no more friend-only groups.",
          "Dice roller to decide which question number the class answers.",
          "Yes/No picker for quick-fire revision rounds.",
        ],
      },
    ],
  },
  {
    slug: "how-to-run-a-giveaway",
    title: "How to Run a Giveaway Draw on Stream (Step by Step)",
    description: "Collect entries, remove duplicates, draw winners live and keep the draw transparent. A complete giveaway workflow for streamers and creators.",
    category: "Streaming",
    readTime: "5 min read",
    updated: "2025-01-18",
    relatedTools: ["giveaway-picker", "wheel-spinner", "random-number-generator"],
    sections: [
      {
        paragraphs: [
          "A giveaway is only as good as its draw. If your audience can't see that the winner was picked fairly, the whole promotion backfires. The good news: a transparent, on-screen random draw is easy to run with zero software budget.",
        ],
      },
      {
        heading: "1. Collect entries in one format",
        paragraphs: [
          "Whatever your platform — chat commands, comment threads, form responses — export the entries as plain text with one entry per line. Consistent formatting makes everything downstream painless.",
        ],
      },
      {
        heading: "2. Clean the pool",
        list: [
          "Paste entries into the Giveaway Picker.",
          "Press Remove duplicates — people always enter twice.",
          "Manually remove ineligible entries (bots, alt accounts) before the draw.",
        ],
      },
      {
        heading: "3. Draw live",
        paragraphs: [
          "Set the number of winners, go full-screen, and hit Draw. Revealing winners one at a time builds suspense and gives your audience something to react to. If you're giving away multiple prizes, enable 'remove winners from pool' and run one round per prize.",
        ],
      },
      {
        heading: "4. Make it verifiable",
        list: [
          "Show the participant count on screen before drawing.",
          "Record the draw — clip it and post it with the announcement.",
          "Copy and publish the winner list so anyone can cross-check.",
          "Have a backup winner ready in case the first doesn't claim the prize.",
        ],
      },
      {
        heading: "5. Announce and follow up",
        paragraphs: [
          "Announce winners on the same platform you collected entries, state how to claim the prize, and set a claim deadline. A clean follow-through is what makes people trust your next giveaway.",
        ],
      },
    ],
  },
  {
    slug: "classroom-randomizer-ideas",
    title: "21 Classroom Randomizer Ideas Teachers Actually Use",
    description: "From random groups to mystery questions — practical randomizer routines that make lessons livelier without extra prep.",
    category: "Classroom",
    readTime: "6 min read",
    updated: "2025-02-02",
    relatedTools: ["random-student-picker", "random-group-generator", "random-question-generator", "dice-roller"],
    sections: [
      {
        paragraphs: [
          "Randomness is a teacher's secret weapon: it's fair, it's fast, and students find it genuinely exciting. Here are routines you can start using tomorrow — each one maps to a free tool on WheelNamesArena.",
        ],
      },
      {
        heading: "Participation & calling",
        list: [
          "Random student picker for questions and reading turns.",
          "Wheel spinner with student names for 'lucky caller' days.",
          "Yes/No picker for rapid-fire comprehension checks.",
          "Coin flip to choose between two class rewards.",
        ],
      },
      {
        heading: "Groups & teams",
        list: [
          "Random groups of 2 for think-pair-share.",
          "Teams of 4 for quiz bowl and relay games.",
          "Random pairs for peer review swaps.",
          "House-vs-house splits for long-term point systems.",
        ],
      },
      {
        heading: "Content & practice",
        list: [
          "Number generator (1–30) to pick which exercise to solve.",
          "Dice roller to choose how many minutes a revision round lasts.",
          "Random question generator for bell-ringer discussions.",
          "Letter generator for category and alliteration word games.",
          "Wheel of vocabulary words for definition duels.",
        ],
      },
      {
        heading: "Classroom culture",
        list: [
          "Random compliment wheel to start morning meetings.",
          "Decision maker for choosing the Friday activity.",
          "Mystery job wheel for classroom responsibilities.",
          "Random seat shuffler using the team generator with 'seat numbers'.",
        ],
      },
      {
        paragraphs: [
          "The pattern behind all of these: take a decision that would consume energy or invite bias, and hand it to a visible, impartial randomizer. Students argue less, participate more, and the lesson keeps moving.",
        ],
      },
    ],
  },
  {
    slug: "wheel-ideas-for-teachers-and-streamers",
    title: "30+ Wheel Ideas for Teachers and Streamers",
    description: "What should you put on a spinning wheel? Here are ready-made wheel ideas for classrooms, live streams, giveaways and parties.",
    category: "Ideas",
    readTime: "5 min read",
    updated: "2025-02-14",
    relatedTools: ["wheel-spinner", "giveaway-picker", "random-question-generator"],
    sections: [
      {
        paragraphs: [
          "A wheel is the most theatrical randomizer there is — everyone can see the options, everyone watches it slow down, and the reveal lands with a satisfying snap. Here's what to put on yours.",
        ],
      },
      {
        heading: "For teachers",
        list: [
          "Student names for questions and jobs",
          "Question numbers from the worksheet",
          "Group roles: leader, writer, presenter, timekeeper",
          "Review games: kahoot, whiteboards, charades, quiz",
          "Classroom rewards: free time, sticker, DJ for 5 minutes",
          "Icebreaker questions for the first week",
          "Reading genres for book club selection",
        ],
      },
      {
        heading: "For streamers",
        list: [
          "Giveaway participants (or ticket numbers)",
          "Chat dares and challenges",
          "Next game / next map selection",
          "Donation shout-out order",
          "Penalty wheel for losing a match",
          "Viewer-submitted topics for just-chatting segments",
          "Sub-gift raffle segments",
        ],
      },
      {
        heading: "For parties & teams",
        list: [
          "Who makes the snacks",
          "Karaoke song assignment",
          "Secret Santa pairings (spin, remove, repeat)",
          "Team names for trivia night",
          "Who presents first (yes, it helps at work too)",
        ],
      },
      {
        paragraphs: [
          "Pro tip: save a wheel per use case. WheelNamesArena stores wheels in your browser, so your classroom wheel on Monday is exactly where you left it — and your stream wheel is one click away on Friday night.",
        ],
      },
    ],
  },
  {
    slug: "how-to-make-balanced-teams",
    title: "How to Make Balanced Teams in Seconds",
    description: "Why random round-robin dealing beats captain's pick every time, and how to generate fair teams for sports, quizzes and group projects.",
    category: "Games",
    readTime: "3 min read",
    updated: "2025-01-25",
    relatedTools: ["random-team-generator", "random-group-generator", "coin-flip"],
    sections: [
      {
        paragraphs: [
          "Captain's pick is a ritual, but it's also slow, biased, and demoralizing for whoever is picked last. Random dealing solves all three problems at once — and it takes about five seconds.",
        ],
      },
      {
        heading: "The fairest algorithm",
        paragraphs: [
          "WheelNamesArena's team generator shuffles your player list and deals names round-robin across teams, like dealing cards. The result: every team's size differs by at most one player, every player had an equal chance of landing anywhere, and nobody gets to feel left out because chance — not a captain — decided.",
        ],
      },
      {
        heading: "Choosing teams vs. team size",
        list: [
          "Know how many teams you need (e.g., 4 quiz teams)? Use 'Number of teams'.",
          "Know the ideal size (e.g., pairs for lab work)? Use 'Team size'.",
          "Odd numbers are fine — the last team simply takes the remainder.",
        ],
      },
      {
        heading: "Making it feel fair",
        list: [
          "Show the shuffle happening on screen so everyone sees it's random.",
          "Reshuffle openly if someone is absent — transparency builds trust.",
          "Flip a coin for side selection after teams are set.",
        ],
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
