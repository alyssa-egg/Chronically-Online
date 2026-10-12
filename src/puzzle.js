// Original clue sets. Change the version when editing a published puzzle archive.
export const PUZZLE_VERSION = "v1";
import { getIssue } from "./game.js";
export const MAX_TURNS = 6;
const entries = [
  [
    "Tumblr",
    [],
    [
      "A place where your interests could become your whole personality.",
      "People collected posts instead of putting everything in one group chat.",
      "GIFs and fandoms felt very at home here.",
      "Your page could have a custom theme and an ask box.",
      "Passing a post along is called reblogging.",
      "This blogging platform's logo is a lowercase t.",
    ],
  ],
  [
    "One Direction",
    ["1D"],
    [
      "A group whose fan accounts became an internet institution.",
      "Five individual auditions led to one shared act.",
      "Their earliest chapter played out on British television.",
      "Their debut album was Up All Night.",
      "What Makes You Beautiful was their debut single.",
      "The original lineup was Harry, Liam, Louis, Niall, and Zayn.",
    ],
  ],
  [
    "5 Seconds of Summer",
    ["5SOS"],
    [
      "This band's early story included homemade YouTube covers.",
      "A major boy band invited them on tour.",
      "Unlike that boy band, they played instruments onstage.",
      "Youngblood is one of their album titles.",
      "Luke, Michael, Calum, and Ashton are the four members.",
      "Their name is five seconds long, but the season is summer.",
    ],
  ],
  [
    "Dan and Phil",
    ["Dan & Phil", "DanAndPhil", "Phan"],
    [
      "A duo that turned watching a screen into a comfort ritual.",
      "Their friendship inspired a very dedicated online fandom.",
      "They shared a gaming channel as well as their individual channels.",
      "Their book title begins The Amazing Book Is Not on Fire.",
      "One early username was danisnotonfire; the other was AmazingPhil.",
      "Their first names are Dan and Phil.",
    ],
  ],
  [
    "Vine",
    [],
    [
      "An app whose jokes outlived the app itself.",
      "Its videos could be wonderfully strange and very short.",
      "They looped when they reached the end.",
      "A cucumber delivery is part of its collective memory.",
      "The original video limit was six seconds.",
      "Its name is also a climbing plant.",
    ],
  ],
  [
    "Wattpad",
    [],
    [
      "A reading platform that held a lot of fandom daydreams.",
      "Stories were often published one chapter at a time.",
      "Readers could react in the comments.",
      "Original fiction lived alongside fanfiction.",
      "Its logo and app are associated with orange.",
      "Its name combines watt with pad.",
    ],
  ],
  [
    "Archive of Our Own",
    ["AO3", "The Archive of Our Own"],
    [
      "A home for an enormous amount of fan creativity.",
      "You can search by fandom, relationship, and additional tags.",
      "Readers often leave a small sign of appreciation.",
      "That sign of appreciation is called kudos.",
      "The Organization for Transformative Works runs it.",
      "Its common abbreviation is AO3.",
    ],
  ],
  [
    "Zoella",
    ["Zoe Sugg"],
    [
      "A creator associated with an early British YouTube era.",
      "Beauty, lifestyle, and cozy uploads were part of the appeal.",
      "She is related to another member of that creator circle.",
      "Her brother is Joe Sugg.",
      "She wrote the debut novel Girl Online.",
      "Zoe Sugg's original online name starts with Zoe and ends with ella.",
    ],
  ],
  [
    "Troye Sivan",
    ["Troye"],
    [
      "A performer whose internet beginnings preceded a major music career.",
      "Early fans also knew him from YouTube videos.",
      "His 2015 debut studio album used the Australian spelling of a neighborhood.",
      "That album is Blue Neighbourhood.",
      "Later releases include Bloom and Something to Give Each Other.",
      "His first name is Troye and his surname is Sivan.",
    ],
  ],
  [
    "The X Factor",
    ["X Factor", "XFactor"],
    [
      "A televised competition that left a big mark on fandom history.",
      "Singers auditioned in front of a judging panel.",
      "The UK edition included acts coached in different categories.",
      "Five solo contestants were grouped together in 2010.",
      "Those contestants became One Direction.",
      "The show's name is The X followed by Factor.",
    ],
  ],
  [
    "Victorious",
    [],
    [
      "An after-school TV comfort watch with a musical setting.",
      "Most of its central characters attended an arts school.",
      "The school was called Hollywood Arts.",
      "Victoria Justice played Tori Vega.",
      "Ariana Grande played Cat Valentine.",
      "This Nickelodeon show's title is Victorious.",
    ],
  ],
  [
    "Ariana Grande",
    ["Ariana"],
    [
      "A performer who moved from television into pop stardom.",
      "Her early TV character had bright red hair.",
      "That character was Cat Valentine.",
      "Her debut album was Yours Truly.",
      "A later video referenced Mean Girls and Legally Blonde.",
      "She sings thank u, next and positions.",
    ],
  ],
  [
    "Phil Lester",
    ["Phil", "AmazingPhil"],
    [
      "A British creator with a long history of talking to a camera.",
      "His best-known online partnership also included a gaming channel.",
      "He co-authored The Amazing Book Is Not on Fire.",
      "His collaborator is Dan Howell.",
      "His original channel name is AmazingPhil.",
      "His first name is Phil; his surname is Lester.",
    ],
  ],
  [
    "Dan Howell",
    ["Dan", "Daniel Howell", "danisnotonfire"],
    [
      "A British creator whose early username had a fire joke in it.",
      "His uploads often mixed awkward stories and humor.",
      "He co-authored a book with another longtime YouTuber.",
      "That collaborator is Phil Lester.",
      "He originally uploaded as danisnotonfire.",
      "His first name is Dan; his surname is Howell.",
    ],
  ],
  [
    "Tyler Oakley",
    ["Tyler"],
    [
      "A creator whose career began with personal YouTube uploads.",
      "He became a familiar face in the collab-video era.",
      "His public work has included LGBTQ advocacy.",
      "He published the essay collection Binge.",
      "He co-hosted Psychobabble with Korey Kuhl.",
      "His first name is Tyler; his surname is Oakley.",
    ],
  ],
  [
    "VidCon",
    [],
    [
      "A place where online fandom could become an in-person experience.",
      "It brings creators and viewers together.",
      "Panels and meet-and-greets are part of the event.",
      "The Green brothers founded it.",
      "Its first event took place in Los Angeles in 2010.",
      "Its name combines video with convention: VidCon.",
    ],
  ],
  [
    "Jenna Marbles",
    ["Jenna Mourey", "Jenna"],
    [
      "A creator remembered for humorous, often wonderfully odd uploads.",
      "Her videos frequently featured her dogs.",
      "One dog was named Kermit.",
      "She also shared videos featuring Julien Solomita.",
      "Her surname in her real name is Mourey.",
      "Her YouTube name is Jenna Marbles.",
    ],
  ],
  [
    "Lilly Singh",
    ["Lilly", "Superwoman", "IISuperwomanII"],
    [
      "A creator who built an audience through comedy sketches.",
      "Her early username referenced a superhero.",
      "She also published How to Be a Bawse.",
      "Her later television show was A Little Late.",
      "Her original channel name was IISuperwomanII.",
      "Her first name is Lilly; her surname is Singh.",
    ],
  ],
  [
    "Joey Graceffa",
    ["Joey"],
    [
      "A creator associated with vlogs and scripted YouTube projects.",
      "He also appeared on The Amazing Race.",
      "His memoir was titled In Real Life.",
      "He released a music video called Don't Wait.",
      "He created and starred in Escape the Night.",
      "His first name is Joey; his surname is Graceffa.",
    ],
  ],
  [
    "Emma Chamberlain",
    ["Emma"],
    [
      "A creator whose casual editing style became widely recognizable.",
      "Her uploads helped make everyday vlogs feel conversational.",
      "Her public interests include fashion and coffee.",
      "Her coffee brand uses her surname.",
      "She hosts the podcast Anything Goes.",
      "Her first name is Emma; her surname is Chamberlain.",
    ],
  ],
  [
    "Kurtis Conner",
    ["Kurtis"],
    [
      "A Canadian creator whose comedy career included short-form videos.",
      "His YouTube uploads often discuss internet oddities.",
      "His fans have their own imaginary hometown.",
      "That community is called Kurtistown.",
      "His podcast is Very Really Good.",
      "His first name is Kurtis; his surname is Conner.",
    ],
  ],
  [
    "Danny Gonzalez",
    ["Danny"],
    [
      "A comedy creator who moved from short videos into YouTube commentary.",
      "His channel also includes original comic songs.",
      "He toured with a creator people often confused him with.",
      "That tour was We Are Two Different People.",
      "He calls his fan community Greg.",
      "His first name is Danny; his surname is Gonzalez.",
    ],
  ],
  [
    "Drew Gooden",
    ["Drew"],
    [
      "A creator whose internet history includes a very quotable road sign.",
      "He later became known for YouTube commentary.",
      "He toured with Danny Gonzalez.",
      "Their tour insisted they were two different people.",
      "His Vine joke begins Road work ahead.",
      "His first name is Drew; his surname is Gooden.",
    ],
  ],
  [
    "Brittany Broski",
    ["Brittany", "Broski"],
    [
      "A creator whose breakthrough involved tasting something on camera.",
      "Her reaction became a widely shared meme.",
      "The drink was kombucha.",
      "She later built a large comedy audience.",
      "Her podcast is The Broski Report.",
      "Her online name is Brittany Broski.",
    ],
  ],
  [
    "Slushy Noobz",
    ["SlushyNoobz"],
    [
      "A duo with a very recognizable corner of newer creator fandom.",
      "Their shared channel includes gaming and other videos.",
      "They also have a podcast together.",
      "The podcast is Out of Character.",
      "The two creators are Martin and Hamzah.",
      "Their channel name is Slushy Noobz.",
    ],
  ],
  [
    "Nerdy Nummies",
    [],
    [
      "An online series where creative projects end up edible.",
      "Games and fandoms often inspire the designs.",
      "It belongs to the baking side of YouTube.",
      "Rosanna Pansino hosts it.",
      "Its name suggests snacks for nerds.",
      "The series is called Nerdy Nummies.",
    ],
  ],
  [
    "Girl Online",
    [],
    [
      "A book associated with the British YouTube boom.",
      "Its protagonist is a teenage blogger.",
      "The protagonist is called Penny Porter.",
      "It was published in 2014.",
      "The author named on its cover is Zoe Sugg.",
      "Its two-word title is Girl Online.",
    ],
  ],
  [
    "Take Me Home",
    [],
    [
      "An album from an especially busy boy-band era.",
      "It followed that band's debut studio album.",
      "Its singles include Kiss You.",
      "Little Things is another of its singles.",
      "One Direction released it in 2012.",
      "Its title is Take Me Home.",
    ],
  ],
  [
    "Youngblood",
    [],
    [
      "An album title that is also the title of a major single.",
      "It marked a move toward a more pop-focused sound.",
      "Want You Back is on its track list.",
      "It was released in 2018.",
      "The band is 5 Seconds of Summer.",
      "Its one-word title is Youngblood.",
    ],
  ],
  [
    "SuperWhoLock",
    ["Super Who Lock"],
    [
      "A name for a very particular fandom overlap.",
      "It combined three television fandoms.",
      "Those shows involved monsters, time travel, and detective work.",
      "One of the shows was Supernatural.",
      "The other two were Doctor Who and Sherlock.",
      "The combined fandom name is SuperWhoLock.",
    ],
  ],
];
export const puzzles = entries.map(([answer, aliases, clues], index) => ({
  id: `ask-${index}`,
  answer,
  aliases,
  clues,
  explanation: `The reference was ${answer}. File this one in your mental archive. ♡`,
}));
export function validDay(day) {
  return (
    typeof day === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(day) &&
    Number.isFinite(Date.parse(day)) &&
    new Date(day).toISOString().slice(0, 10) === day
  );
}
export function dailyPuzzle(day) {
  if (!validDay(day)) throw new Error("Invalid issue date");
  if (getIssue(day)?.ask) return getIssue(day).ask;
  const index = Math.floor(Date.parse(day) / 86400000);
  return puzzles[
    (((index * 7) % puzzles.length) + puzzles.length) % puzzles.length
  ];
}
export function normalizeGuess(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}
export function matches(puzzle, guess) {
  return (
    typeof guess === "string" &&
    [puzzle.answer, ...puzzle.aliases].some(
      (alias) => normalizeGuess(alias) === normalizeGuess(guess),
    )
  );
}
export function puzzleStatus(puzzle, guesses) {
  if (guesses.some((guess) => matches(puzzle, guess))) return "won";
  return guesses.length >= MAX_TURNS ? "lost" : "playing";
}
export function validGuesses(value, puzzle) {
  if (!Array.isArray(value) || value.length > MAX_TURNS) return false;
  const seen = new Set();
  return Array.from(value).every((guess, index) => {
    if (guess === null) return true;
    if (
      typeof guess !== "string" ||
      guess.length > 80 ||
      !normalizeGuess(guess)
    )
      return false;
    const normalized = normalizeGuess(guess);
    if (seen.has(normalized)) return false;
    seen.add(normalized);
    return !matches(puzzle, guess) || index === value.length - 1;
  });
}
export function submitGuess(puzzle, guesses, guess) {
  if (
    !validGuesses(guesses, puzzle) ||
    puzzleStatus(puzzle, guesses) !== "playing"
  )
    throw new Error("This ask is already filed.");
  if (guess !== null) {
    if (
      typeof guess !== "string" ||
      guess.length > 80 ||
      !normalizeGuess(guess)
    )
      throw new Error("Type a reference first, or pass to open another clue.");
    guess = guess.trim();
    if (
      guesses.some(
        (previous) =>
          previous !== null &&
          normalizeGuess(previous) === normalizeGuess(guess),
      )
    )
      throw new Error(
        "You already tried that reference. Try another, or pass for a clue.",
      );
  }
  return [...guesses, guess];
}
export function puzzleShare(puzzle, guesses, day, link) {
  const status = puzzleStatus(puzzle, guesses);
  const tiles = guesses
    .map((guess) =>
      matches(puzzle, guess) ? "💗" : guess === null ? "🤍" : "🩶",
    )
    .join("");
  return `The Fandom Files <3 · The Anonymous Ask\n${day}\n${status === "won" ? guesses.length : "X"}/6 ${tiles}\nyou had to be there.\nYour turn → ${link}`;
}
// A reading streak counts completed days, regardless of score. No accounts needed.
export function diaryStats(value, today) {
  if (!validDay(today)) throw new Error("Invalid diary date");
  const days = [
    ...new Set(
      Array.isArray(value)
        ? value.filter((day) => validDay(day) && day <= today)
        : [],
    ),
  ].sort();
  let best = 0,
    run = 0,
    previous;
  for (const date of days) {
    const number = Date.parse(date) / 86400000;
    run = number === previous + 1 ? run + 1 : 1;
    best = Math.max(best, run);
    previous = number;
  }
  const dates = new Set(days);
  let cursor = Date.parse(today),
    streak = 0;
  if (!dates.has(today)) cursor -= 86400000;
  while (dates.has(new Date(cursor).toISOString().slice(0, 10))) {
    streak++;
    cursor -= 86400000;
  }
  return {
    days,
    total: days.length,
    streak,
    best,
    completedToday: dates.has(today),
  };
}
