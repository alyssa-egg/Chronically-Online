# Your day-before review ♡

You have the final say on Deep Cut’s questions. I can draft and edit issues when you send ideas in this chat; nothing automatically writes new questions while we’re away. The first nine broader issues, October 11–19, 2026, are **drafts awaiting your approval**.

Open [QUESTION_SCHEDULE.md](QUESTION_SCHEDULE.md) to see every question, answer, explanation, and Anonymous Ask clue. Main themes now cover beauty YouTube, gaming, internet-girl moodboards, Emma, Enya/Drew, Vine/TikTok, KATSEYE/global pop girls, PinkPantheress/bedroom pop, and the original fangirl group chat. The main quiz and its Ask share a theme. The three era quizzes keep their own era boundaries and separate questions.

## Each day, before publication

1. Review tomorrow’s issue. In GitHub, open **Actions → Tomorrow’s Deep Cut review → latest run → Summary**. It runs around **9 a.m. Eastern**, with both UTC schedules accommodating daylight saving. GitHub scheduled runs can be delayed; you can also use **Run workflow** or read the Markdown calendar anytime.
2. Send your edits here, such as “October 14 Q5: use this Emma clip instead,” or edit `content/issues/YYYY-MM-DD.json` in GitHub. Send a public source link with niche references and visual ideas. I can turn them into a clear prompt, plausible choices, an explanation, and matching Ask clues.
3. Check the source links, correct answers, distractors, and image rights. Draft links are reference destinations; this environment could not fetch the original source sites. They are **not live fact-checked**. `sourcesConfirmed` stays false until a reviewer checks them.
4. Explicitly approve a **complete dated issue**. “Approve October 14, including all games and the Ask” is enough for me to record approval after your source review. Unresolved individual questions should keep the whole issue in draft.
5. Record approval before its publication date in Eastern time, build, commit, and push. On a Git-connected Netlify site this triggers deployment. Approved content appears on its date at **midnight Eastern**; future approved dates are already packaged in the build, so no midnight rebuild is required.

On your Mac, after reviewing a future issue:

```sh
npm run content:check
npm run content:approve -- YYYY-MM-DD --reviewer Alyssa --sources-reviewed
npm run content:review
npm test
npm run build
git add content/issues QUESTION_SCHEDULE.md
git commit -m "Approve the next Deep Cut issue"
git push origin main
```

Replace `YYYY-MM-DD` with the future issue’s date. The approval command requires the reviewer and source-review flag. It refuses past/current Eastern days and already approved issues. Do not run it before you’ve reviewed the complete issue.

**Unapproved or missing date:** the existing rotating archive remains playable. A draft never becomes live just because its date arrives. This keeps the site available, but fallback days do not guarantee a matching quiz/Ask theme. Add more dated drafts to extend the nine-day draft calendar; there is no unreviewed automatic question generation.

## Authoring and edits

Each JSON contains `id`, `date`, `revision`, `theme`, `status`, review metadata, `games`, and `ask`. Counts are main 10; each era 5; Ask 6 clues. Every question needs four distinct choices, an answer index 0–3, an explanation, a department index 0–3, and HTTPS sources. Every Ask needs an answer, aliases, six distinct clues, sources, and the same theme as its main quiz.

Run `npm run content:review` after JSON edits to regenerate the Markdown. Markdown note fields are for review; **JSON is what the game uses**, so transfer approved edits into JSON before regenerating. Keep published IDs, revisions, questions, and answers stable so saved attempts stay valid. Make changes in a new future issue. Hold an issue with `status: "hold"` if it needs more work.

For deeper lore, send the original video/post, a timestamp, what the question should test, and the answer you intend. We can rotate formats—old usernames, collaborations, upload titles, products, public moments, and visual clues—to avoid several versions of the same fact. Specific Vanilla Mace references need source clips before I can write reliable questions.

## Pictures

An optional question `image` supports a local asset, alt text, a caption, creator credit, and usage rights:

```json
{
  "src": "./src/assets/your-image.webp",
  "alt": "A useful description of the clue image",
  "caption": "Your short magazine-style caption",
  "credit": "Photographer or illustrator name",
  "rights": "permission",
  "source": "https://example.com/permission-or-original-source"
}
```

Put the file in `src/assets/` using lowercase letters, numbers, and hyphens. Accepted formats: SVG, PNG, JPG, WebP. Rights must be `original`, `licensed`, `permission`, or `public-domain`; non-original work needs an HTTPS source. A source URL alone does not grant permission. The October 13 draft contains an original phone-case doodle showing the visual layout.

The browser build contains only approved free issue content; premium question sets are served after the backend checks access. The GitHub review files contain future answers and premium questions. If the repository is public, that review material is public too. The access system controls gameplay, not secrecy of a public repository.
