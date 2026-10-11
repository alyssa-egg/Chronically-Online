export function validIssueDate(day) {
  return (
    typeof day === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    Number.isFinite(Date.parse(day)) &&
    new Date(day).toISOString().slice(0, 10) === day
  );
}
export function validateIssue(issue) {
  const fail = (message) => {
    throw new Error(`${issue?.date || "Issue"}: ${message}`);
  };
  if (!validIssueDate(issue?.date)) fail("invalid date");
  if (
    !issue.id ||
    !Number.isInteger(issue.revision) ||
    issue.revision < 1 ||
    !issue.theme
  )
    fail("missing identity, revision, or theme");
  if (!["draft", "approved", "hold"].includes(issue.status))
    fail("invalid review status");
  if (issue.status === "approved") {
    if (
      !issue.reviewedBy?.trim() ||
      !Number.isFinite(Date.parse(issue.approvedAt)) ||
      !issue.sourcesConfirmed
    )
      fail("approval needs a reviewer, timestamp, and confirmed sources");
    const parts = Object.fromEntries(
      new Intl.DateTimeFormat("en", {
        timeZone: "America/New_York",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
        .formatToParts(new Date(issue.approvedAt))
        .map((p) => [p.type, p.value]),
    );
    const approvedDay = `${parts.year}-${parts.month}-${parts.day}`;
    if (approvedDay >= issue.date)
      fail("approve before the issue's Eastern publication day");
  }
  const ids = new Set();
  for (const [mode, count] of Object.entries({
    daily: 10,
    tumblr: 5,
    youtube: 5,
    modern: 5,
  })) {
    const questions = issue.games?.[mode];
    if (!Array.isArray(questions) || questions.length !== count)
      fail(`${mode} needs ${count} questions`);
    for (const q of questions) {
      if (!q.id || ids.has(q.id))
        fail("question IDs must be unique within the issue");
      ids.add(q.id);
      if (
        !q.question ||
        !q.explanation ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        new Set(q.options).size !== 4 ||
        !Number.isInteger(q.answer) ||
        q.answer < 0 ||
        q.answer > 3
      )
        fail(`invalid question ${q.id}`);
      if (
        !Number.isInteger(q.department) ||
        q.department < 0 ||
        q.department > 3
      )
        fail(`invalid category ${q.id}`);
      if (
        !Array.isArray(q.sources) ||
        !q.sources.length ||
        q.sources.some((source) => !/^https:\/\//.test(source))
      )
        fail(`source needed for ${q.id}`);
      if (q.image) {
        const image = q.image;
        if (
          !/^\.\/src\/assets\/[a-z0-9-]+\.(svg|png|jpg|webp)$/.test(
            image.src,
          ) ||
          !image.alt ||
          !image.credit ||
          !["original", "licensed", "permission", "public-domain"].includes(
            image.rights,
          )
        )
          fail(
            `image needs a local file, alt text, credit, and usage rights: ${q.id}`,
          );
        if (
          image.rights !== "original" &&
          !/^https:\/\//.test(image.source || "")
        )
          fail(`image source needed: ${q.id}`);
      }
    }
  }
  const ask = issue.ask;
  if (
    !ask?.id ||
    !ask.answer ||
    !Array.isArray(ask.aliases) ||
    !Array.isArray(ask.clues) ||
    ask.clues.length !== 6 ||
    new Set(ask.clues).size !== 6 ||
    !ask.clues.every((clue) => typeof clue === "string" && clue.trim()) ||
    !ask.explanation ||
    !ask.theme ||
    ask.theme !== issue.theme ||
    !Array.isArray(ask.sources) ||
    !ask.sources.length ||
    ask.sources.some((source) => !/^https:\/\//.test(source))
  )
    fail("ask needs six clues, sources, and the same theme as the main quiz");
  return issue;
}
