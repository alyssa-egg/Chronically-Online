# Fandom Files · The Deep Cut launch version

The homepage now leads with the five-prompt **The Deep Cut**: “The obvious answer won’t get you very far.” The existing vanilla JavaScript app, Node server, Netlify functions, Render configuration, logo, sounds, fonts, era discoveries, sharing/export helpers, and useful older games are reused. No framework rewrite or judging API was added.

## What is live in the code

- `/play/`: five daily open-answer prompts, one completed file per Eastern date, up to 500 points, actual answer feedback and a saved results card. The optional 25-second timer is off by default and never submits, hides an answer, advances a prompt, or changes points. Players can turn it off at any time.
- `/archive/` and `/eras/fandom-years/`, `/eras/influencer-era/`, `/eras/current-lore/`: original collages, existing clickable reference files, two free knowledge quizzes per era, personal quiz stamps, and related game/era links.
- `/quizzes/`: six five-question knowledge quizzes and a six-choice personality quiz with three distinct profiles. Quizzes are free and untimed, resumable, repeatable, and independent of the daily file. Knowledge results show correct answers and explanations. Personality results describe preferences, not factual correctness, and ties use the first choice among tied profiles.
- `/my-files/`: completed daily results, current/best streak information, personal best, daily history, four milestone stamps, optional-quiz results, and saved era references. The original Sideblog, collectibles, purchase restoration and moderated Memories remain under a secondary disclosure.
- Five main navigation items: **HOME · THE DEEP CUT · THE ERAS · QUIZZES · MY FILES**. Article/news sections are absent. Old editorial source and Studio schemas are retained for preservation; unused editorial reader modules are no longer copied into the public site build.

Main headings keep lowercase Helvetica Bold, with the existing Helvetica Neue/Arial fallbacks; secondary text uses bundled DM Sans. The existing logo file is unchanged. Each era’s original published Sanity collage was downloaded **without transformations** into `src/assets/eras/`. The bundled copies are used when the CMS identifies that same original; later image uploads can still override them. With the CMS unavailable, all three originals and the free game remain usable. No image was regenerated or edited with AI.

## Daily schedule and scoring

The initial bank has **35 curated topics, 140 distinct prompts, and 28 daily files**. Each file mixes all three eras. [DEEP_CUT_CALENDAR.md](DEEP_CUT_CALENDAR.md) lists the first 28 days, starting **October 27, 2026**, ending **November 23, 2026**. Dates reset at midnight in **America/New_York**, including daylight-saving changes, using the app’s existing date/reset helpers.

After 28 days the prepared archive repeats unless you schedule additional dated files. This is not an automatically replenishing question service. Add new overrides before November 24 if you want the next cycle to contain new prompts. The file number counts days since the anchor; it does not count visitors or completed games.

Each accepted answer has one curated tier:

| Tier | Points | Meaning |
| --- | --- | --- |
| `40` | 40 | obvious reference |
| `60` | 60 | familiar file |
| `80` | 80 | niche reference |
| `100` | 100 | deep cut |
| `"accepted"` | 100 | full category match, without claiming obscurity |

The fixed-lineup topics use `"accepted"`, so no member is ranked as more obscure than another. These matches do **not** count toward “deep cuts found.” The tiers are editorial choices in the answer bank, never live answer percentages. The lists are intentionally finite; an unrecognised answer earns zero with an explanation that it may fit but is not listed. There is no fuzzy guesswork, AI judgement, public ranking or fabricated player count.

Matching removes case, punctuation, spacing and accents. Common names and alternate spellings are explicit aliases. Players type one answer of up to 120 characters per prompt. Empty, whitespace-only, control-character, overly long and incomplete submissions are rejected without completing the round. The finish action is guarded against repeat submissions and another tab completing the same file.

Completed files store a validated score/explanation snapshot. A later alias or tier correction does not retroactively change an already completed result. Keep already-published prompt IDs, prompt wording, and dated challenge IDs stable so saved files remain associated with their original questions.

## Add a reasonable answer variation

Open [src/open-cut-content.js](src/open-cut-content.js). The local helper is:

```js
answer('Robbers', 80, ['robbers by the 1975'])
```

The first argument is the canonical answer, the second the curated tier, the third an array of accepted variations, and the optional fourth a short explanation specific to that answer. Case/punctuation/spacing variations already match automatically; aliases are for different wordings, nicknames, abbreviations or alternate spellings.

Do not add an alias that could match a different answer in the same prompt. Run the tests: they check alias collisions, tiers, accepted answers and scoring. Avoid changing the current date’s lists mid-round. Use new prompts and future dated overrides for substantial content changes. Accepted lists live in code; the game does not collect everybody’s submissions or produce real population rarity statistics.

## Add future prompts and daily files

1. Add a new `topic(...)` entry to `openCutTopics` with a stable new ID, one of the three era IDs, a short context/explanation, four distinct prompt wordings that all fit the same curated answer list, and accepted answers. A prompt gets IDs such as `new-topic-1` through `new-topic-4`.
2. Keep the first 35 topics in their existing order; the initial archive uses that order. New topics can be appended.
3. Add a **future** date to `challengeOverrides` at the bottom of the file, with exactly five prompt IDs. For example, after creating the referenced new topics:

```js
export const challengeOverrides = {
  '2026-11-24': {
    id: 'volume-2-01',
    title: 'a new little rabbit hole',
    promptIds: [
      'your-new-topic-1',
      'another-new-topic-1',
      'a-third-topic-1',
      'a-fourth-topic-1',
      'a-fifth-topic-1',
    ],
  },
};
```

Those sample IDs are instructions, not existing live questions; replace them with real IDs. Dated overrides add future files without shifting earlier dates. Test and deploy before their Eastern start date. Keep a backup and regenerate the calendar if you alter any first-month file.

## Add an optional quiz

[src/quiz-library.js](src/quiz-library.js) defines the library. The six launch knowledge quizzes reuse existing original questions from `src/deep-cut-questions.js`, with stable rotated options that retain the correct answer and its explanation. Add a knowledge quiz object to `knowledgeQuizzes` before `launchQuizzes` is assembled:

```js
knowledgeQuizzes.push({
  id: 'your-quiz-id',
  type: 'knowledge',
  era: 'current-lore',
  title: 'your quiz title.',
  description: 'A short, specific invitation.',
  questions: [/* five real questions; no empty placeholder questions */],
});
```

Each question needs a stable `id`, `question`, four distinct `options`, zero-based correct `answer` index, and `explanation`. The library, era cards and My Files use this data automatically. Keep released quiz IDs/questions stable, or use a new ID for a substantially changed quiz, so prior results do not silently change. Personality choices and profile explanations are also in this file; no external personality service is used.

## Personal data and existing features

- New daily keys use `fandom-files-open-cut-v1-*` and `fandom-files-open-cut-history-v1`. Quiz keys use `fandom-files-quiz-v1-*`. Older guesses, quiz scores, collectibles and purchase data are not deleted or re-keyed. Personal daily history keeps the most recent 366 completed files to bound browser storage use.
- Streaks count consecutive completed Eastern dates through today or yesterday; a missed day resets the current streak, while history, best streak and stamps stay. The seven-file stamp counts different completed days, so it does not require a perfect week.
- If storage is blocked/full, an in-memory fallback supports the current visit and the site explains that progress will not survive leaving. Results are browser-local, editable by the device owner, and not a competition or cloud-synced account record.
- Older free/purchased collections remain under **Quizzes → the original game files**. The former six-clue main game is now **Name That Reference**, at `/play/?game=name-that-reference`; the four-choice game remains **Quick Cut**, at `/play/?game=quick-cut`.
- The existing Memories service is retained as an optional secondary feature. It still needs its server token to accept submissions and still requires your Sanity publication approval. See [MEMORIES_GUIDE.md](MEMORIES_GUIDE.md). No new database, subscription, judging API, account service or package dependency is required for the launch games.

## Verify and deploy

```sh
npm test
npm run check
npm run content:deep-cut-calendar
npm run build
npm start
```

The existing Netlify build/functions setup is retained, with direct-route rules added for the quiz library and My Files. Render continues to run the same Node server. Use the existing build command **`npm --prefix studio ci --no-fund --no-audit && npm run build`**, start command **`npm start`**, and Node **24.19.0**. Studio builds because the original-image editor and optional moderation tools are preserved; the daily game does not depend on Studio login or an article CMS.

On **Render**, choose your service → **Manual Deploy → Deploy latest commit**, wait for **Live**, then refresh. On **Netlify**, use the Git-connected production deployment for `main`. Provider credits, service limits, account settings and payment test/live state are separate from a code push. No new real charge was made and no public-host deployment was performed by these changes.

Before sharing publicly, check `/`, `/play/`, `/archive/`, all three era pages, `/quizzes/`, a quiz detail URL and `/my-files/` on your actual host, including refreshing direct links. Keep existing paid-access restoration available if anyone has bought it. Payment launch instructions remain [STRIPE_INTEGRATION_TODO.md](STRIPE_INTEGRATION_TODO.md).
