# LoreDial

A daily internet-culture quiz styled as a glossy retro magazine inside a desktop window. Original text and CSS graphics; no celebrity photos, audio clips, or copied quiz assets. Working name only: availability has not been checked.

## Run

Requires Node.js 22 or later. No dependencies or install step.

```sh
cd /workspace/Chronically-Online
npm start
```

The server listens on port 3000; override with `PORT=3001 npm start`. Run `npm test` and `npm run check` for validation. Deploy to a Node-capable host with `npm start`, or serve `index.html` and `src/` on a static host. Set the production URL before sharing publicly. Never expose the whole repository through a static server.

## Included

- Ten deterministic daily questions: three Tumblr, three stan culture, two feed literacy, two deep cuts.
- Shuffled answer positions, explanations, scoring, and five ranks.
- Daily progress saved in localStorage. Completed issues reopen as results; a reload after the final answer still preserves completion.
- Native device sharing or clipboard fallback; downloadable SVG score card. SVG may need conversion to PNG for social apps.
- Responsive layout, keyboard buttons, progress indicator, live answer feedback, and a review of every answer.
- Local counters for starts, resumes, completions, shares, and card downloads under `loredial-activity`. These are device-only diagnostic counts, not aggregate analytics.

## Limits

The 20-question starter bank repeats across days. No global rank, multiplayer, payment, server-side score validation, or live trend ingestion. Google Fonts is optional; system fonts work when unavailable. Local results can be edited by a user; do not use them for prizes. State is device-specific and the issue switches at midnight UTC when the page loads.

Content is in `src/game.js`. Add original multiple-choice questions with one unambiguous correct answer and an explanation. Verify facts and record sources before public launch. See [ACTION_PLAN.md](ACTION_PLAN.md).
