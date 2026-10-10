// Keep this edition's bank stable. Publish editorial changes under a new version.
export const EDITION_VERSION = "v2";
export const departments = [
  {
    name: "The dashboard",
    count: 3,
    era: "2010–2015",
    icon: "♡",
    description: "Reblog chains, gifsets & your very first OTP.",
    tag: "Tumblr years",
  },
  {
    name: "Band girl files",
    count: 3,
    era: "2011–2016",
    icon: "★",
    description: "1D, 5SOS & the fan account you never deleted.",
    tag: "Fandom forever",
  },
  {
    name: "YouTube sleepover",
    count: 2,
    era: "2010–2019",
    icon: "▷",
    description: "British YouTube, collabs & comfort-video lore.",
    tag: "You had to be there",
  },
  {
    name: "The new lore",
    count: 2,
    era: "2020–now",
    icon: "✿",
    description: "Slushy Noobz, Vanilla Mace & your current tabs.",
    tag: "Still in the group chat",
  },
];
// Original prompts; editorial sources and limitations are recorded in CONTENT.md.
const rows = [
  [
    0,
    "Three fandoms in one trench coat. What did “SuperWhoLock” combine?",
    [
      "Supernatural, Doctor Who & Sherlock",
      "Supergirl, The Who & Sherlock",
      "Supernatural, House & Loki",
      "Superman, Doctor Who & Loki",
    ],
    0,
    "SuperWhoLock was the early-2010s Tumblr crossover shorthand for Supernatural, Doctor Who, and Sherlock.",
  ],
  [
    0,
    "A fanfic tagged “coffee shop AU” is set in…",
    [
      "An alternate universe",
      "An anonymous upload",
      "An audio-only universe",
      "An archived update",
    ],
    0,
    "AU means alternate universe: familiar characters, a different world. In this one, somebody is probably a barista.",
  ],
  [
    0,
    "Your Tumblr mutual says “that’s my OTP.” What do they mean?",
    [
      "One true pairing",
      "Original Tumblr post",
      "Official tour playlist",
      "Online trending picture",
    ],
    0,
    "One true pairing: the pairing they are especially invested in. The gifset evidence is extensive.",
  ],
  [
    0,
    "Which button put someone else’s Tumblr post onto your blog?",
    ["Reblog", "Retweet", "Repin", "Repost story"],
    0,
    "Reblogging was the engine of the dashboard, often with tags or commentary of your own.",
  ],
  [
    0,
    "A Tumblr “gifset” is usually…",
    [
      "A post containing several animated GIFs",
      "A private group chat",
      "A custom blog URL",
      "A playlist of fanfiction",
    ],
    0,
    "A gifset arranges animated GIFs into a post, often capturing a scene, an interview, or a very important glance.",
  ],
  [
    0,
    "On a fandom blog, what is an “askbox”?",
    [
      "The place visitors send questions or messages",
      "A folder for saved GIFs",
      "A deleted-post archive",
      "A shared fanfic document",
    ],
    0,
    "An askbox lets readers send questions and messages. Anonymous asks depend on the blog’s settings.",
  ],
  [
    0,
    "What does “canon” mean in a fandom discussion?",
    [
      "What is established in the original work",
      "A fan’s invented backstory",
      "A ship popularity poll",
      "A camera used for fan edits",
    ],
    0,
    "Canon is what the source work establishes. A headcanon is a fan’s own interpretation or imagined detail.",
  ],
  [
    0,
    "Two people following each other are…",
    ["Mutuals", "Mods", "Lurkers", "Alts"],
    0,
    "Mutuals follow each other. Whether you ever actually message is a separate story.",
  ],
  [
    0,
    "A “headcanon” is…",
    [
      "A fan’s personal interpretation or imagined detail",
      "The first episode of a show",
      "An official character biography",
      "A deleted scene that was released",
    ],
    0,
    "Headcanons add a personal interpretation that isn’t necessarily confirmed by the source material.",
  ],
  [
    0,
    "You open a fic marked “WIP.” You should expect…",
    [
      "A work in progress",
      "A completed one-shot",
      "An official script",
      "A password-protected account",
    ],
    0,
    "WIP means work in progress. The cliffhanger might be followed by a very long wait.",
  ],
  [
    0,
    "Your comfort character is your “blorbo.” Where did that term become a fandom staple?",
    ["Tumblr", "LinkedIn", "Google Maps", "eBay"],
    0,
    "“Blorbo from my shows” became a Tumblr shorthand for a beloved character you can’t stop posting about.",
  ],
  [
    0,
    "In fanfic tags, “slow burn” promises…",
    [
      "A relationship that develops gradually",
      "A very short chapter",
      "An account that posts rarely",
      "A story that is only dialogue",
    ],
    0,
    "Slow burn takes its time building a relationship. Yes, the hand-touch can take twenty chapters.",
  ],
  [
    1,
    "Where were the members of One Direction put together as a group in 2010?",
    [
      "The X Factor UK",
      "The Voice UK",
      "Britain’s Got Talent",
      "American Idol",
    ],
    0,
    "One Direction formed on the 2010 series of The X Factor UK, after the members auditioned individually.",
  ],
  [
    1,
    "Your “No Control” campaign era was a campaign for which band?",
    ["One Direction", "5 Seconds of Summer", "The Vamps", "Big Time Rush"],
    0,
    "Directioners organized a 2015 fan-led campaign around “No Control,” an album track from Four.",
  ],
  [
    1,
    "One Direction’s debut album was…",
    ["Up All Night", "Take Me Home", "Midnight Memories", "Four"],
    0,
    "Up All Night arrived in 2011. Your old fan account probably had opinions about every track.",
  ],
  [
    1,
    "“She Looks So Perfect” belongs to which band?",
    ["5 Seconds of Summer", "One Direction", "The Vamps", "The 1975"],
    0,
    "“She Looks So Perfect” was a breakout single for 5 Seconds of Summer in 2014.",
  ],
  [
    1,
    "Which country did 5 Seconds of Summer form in?",
    ["Australia", "United Kingdom", "New Zealand", "United States"],
    0,
    "5SOS formed in Sydney, Australia. The Australian accents were a fairly significant clue.",
  ],
  [
    1,
    "Who is the drummer in 5SOS?",
    ["Ashton Irwin", "Luke Hemmings", "Calum Hood", "Michael Clifford"],
    0,
    "Ashton Irwin is the drummer. Luke, Calum, and Michael round out the four-member band.",
  ],
  [
    1,
    "Which 1D album is home to “Best Song Ever”?",
    ["Midnight Memories", "Up All Night", "Four", "Made in the A.M."],
    0,
    "“Best Song Ever” appears on Midnight Memories, released in 2013.",
  ],
  [
    1,
    "Which 5SOS album shares its name with a 2018 hit single?",
    ["Youngblood", "Sounds Good Feels Good", "CALM", "5SOS5"],
    0,
    "Youngblood is both the 2018 album title and the single that led that era.",
  ],
  [
    1,
    "Which One Direction album came after Four?",
    ["Made in the A.M.", "Take Me Home", "Midnight Memories", "Up All Night"],
    0,
    "Made in the A.M. was released in 2015, following Four.",
  ],
  [
    1,
    "“What Makes You Beautiful” was One Direction’s…",
    ["Debut single", "Final single", "Third album title", "First concert film"],
    0,
    "It was the group’s debut single in 2011. The opening guitar riff still does something to a fandom brain.",
  ],
  [
    1,
    "Ariana Grande first played Cat Valentine on…",
    ["Victorious", "iCarly", "Hannah Montana", "Good Luck Charlie"],
    0,
    "Cat debuted on Victorious, before the character appeared in Sam & Cat.",
  ],
  [
    1,
    "Which movie gets a homage in Ariana’s “thank u, next” video?",
    ["Mean Girls", "Twilight", "The Hunger Games", "Clueless"],
    0,
    "The video references Mean Girls, Bring It On, 13 Going on 30, and Legally Blonde.",
  ],
  [
    2,
    "AmazingPhil is the channel name of…",
    ["Phil Lester", "Dan Howell", "Joe Sugg", "Alfie Deyes"],
    0,
    "Phil Lester posts as AmazingPhil. His collaborations with Dan are part of British YouTube fandom history.",
  ],
  [
    2,
    "Before using his full name, Daniel Howell’s channel was known as…",
    ["danisnotonfire", "AmazingPhil", "ThatcherJoe", "PointlessBlog"],
    0,
    "Dan’s original channel name was danisnotonfire. An extremely recognizable name on a 2013 dashboard.",
  ],
  [
    2,
    "Dan and Phil’s shared gaming channel is called…",
    ["DanAndPhilGAMES", "The Gaming Bros", "Phan Plays", "Pixel Sleepover"],
    0,
    "DanAndPhilGAMES launched in 2014, adding gaming videos to the fandom’s watch list.",
  ],
  [
    2,
    "Zoella is the online name associated with…",
    ["Zoe Sugg", "Tanya Burr", "Louise Pentland", "Niomi Smart"],
    0,
    "Zoe Sugg became known online as Zoella, a major name in the 2010s British YouTube era.",
  ],
  [
    2,
    "ThatcherJoe was the YouTube name of…",
    ["Joe Sugg", "Caspar Lee", "Marcus Butler", "Jim Chapman"],
    0,
    "Joe Sugg used the channel name ThatcherJoe, a nod to his work as a roof thatcher.",
  ],
  [
    2,
    "PointlessBlog was the channel name associated with…",
    ["Alfie Deyes", "Tyler Oakley", "Troye Sivan", "Connor Franta"],
    0,
    "Alfie Deyes built his YouTube presence under PointlessBlog.",
  ],
  [
    2,
    "Which creator released the album Blue Neighbourhood in 2015?",
    ["Troye Sivan", "Tyler Oakley", "Connor Franta", "Caspar Lee"],
    0,
    "Troye Sivan released Blue Neighbourhood in 2015 after building an audience on YouTube.",
  ],
  [
    2,
    "A 2010s video titled “the boyfriend tag” was usually…",
    [
      "A partner answering relationship questions",
      "A livestream wedding",
      "A music-video reaction",
      "A gaming speedrun",
    ],
    0,
    "Tag videos followed a shared set of questions or prompts. The boyfriend tag invited a partner to join.",
  ],
  [
    2,
    "Which event became a major meeting place for online-video creators and fans?",
    ["VidCon", "Comic-Con’s film premiere", "The Met Gala", "The BRIT Awards"],
    0,
    "VidCon brings together online-video creators, audiences, and industry participants.",
  ],
  [
    2,
    "What did viewers mean by a “collab” video?",
    [
      "Creators making a video together",
      "A deleted upload",
      "A fan-made subtitle track",
      "A paid subscription tier",
    ],
    0,
    "Collabs brought creators together and introduced their audiences to one another.",
  ],
  [
    2,
    "Which creator’s channel was called SprinkleofGlitter?",
    ["Louise Pentland", "Zoe Sugg", "Tanya Burr", "Grace Helbig"],
    0,
    "Louise Pentland was known online as SprinkleofGlitter before moving to her own name.",
  ],
  [
    2,
    "In fandom, the name “Phan” refers to which creator pairing?",
    [
      "Phil Lester and Dan Howell",
      "PewDiePie and Jacksepticeye",
      "Joe Sugg and Caspar Lee",
      "Rhett and Link",
    ],
    0,
    "Phan is the fandom pairing name for Phil and Dan. A pairing name describes fan culture, not proof of a private relationship.",
  ],
  [
    3,
    "Slushy Noobz is the shared channel of…",
    ["Hamzah and Martin", "Rhett and Link", "Dan and Phil", "Drew and Danny"],
    0,
    "Hamzah and Martin make videos together as Slushy Noobz. Welcome to the newer end of the lore archive.",
  ],
  [
    3,
    "Which podcast is associated with Hamzah from Slushy Noobz?",
    ["Out of Character", "Anything Goes", "Very Really Good", "The TryPod"],
    0,
    "Out of Character is Hamzah’s podcast, part of the wider creator world around Slushy Noobz.",
  ],
  [
    3,
    "The creator handle @vanillamace belongs to…",
    ["Vanilla Mace", "Emma Chamberlain", "Brittany Broski", "Drew Afualo"],
    0,
    "Vanilla Mace uses the name in the handle. This one is a creator-roll-call question.",
  ],
  [
    3,
    "“Anything Goes” is a podcast by…",
    ["Emma Chamberlain", "Brittany Broski", "Kurtis Conner", "Danny Gonzalez"],
    0,
    "Anything Goes with Emma Chamberlain extends her creator world into a conversational podcast.",
  ],
  [
    3,
    "“Very Really Good” is associated with which creator?",
    ["Kurtis Conner", "Drew Gooden", "Danny Gonzalez", "Phil Lester"],
    0,
    "Very Really Good is Kurtis Conner’s podcast. Commentary YouTube has its own extended universe.",
  ],
  [
    3,
    "Danny Gonzalez calls his fan community…",
    ["Greg", "The Slushies", "The Directioners", "The Try Guys"],
    0,
    "Danny Gonzalez uses “Greg” as the name for his audience.",
  ],
  [
    3,
    "Good Mythical Morning is hosted by…",
    ["Rhett and Link", "Hamzah and Martin", "Drew and Danny", "Dan and Phil"],
    0,
    "Rhett and Link host Good Mythical Morning, an enduring part of comfort-video watch lists.",
  ],
  [
    3,
    "In a creator comment section, “lore” usually means…",
    [
      "The backstory behind recurring references",
      "The upload resolution",
      "A copyright license",
      "An editing application",
    ],
    0,
    "Lore is the accumulated backstory that helps an inside joke make sense. Keep fact and fandom speculation separate.",
  ],
  [
    3,
    "A video your favorite creator uploaded in 2021 is resurfacing. “This aged like milk” means…",
    [
      "Later events made it look worse",
      "The video has better sound now",
      "The creator filmed a recipe",
      "It became a livestream",
    ],
    0,
    "The expression says something hasn’t held up well with time. “Aged like wine” usually means the opposite.",
  ],
  [
    3,
    "A creator’s “comfort video” is…",
    [
      "A video you return to for familiar enjoyment",
      "A video only available by subscription",
      "A video with no comments",
      "A video recorded on a phone",
    ],
    0,
    "Comfort videos are the familiar ones you enjoy revisiting. The same vlog again? Understandable.",
  ],
  [
    3,
    "Your mutual says “my parasocial bestie posted.” “Parasocial” describes…",
    [
      "A one-sided feeling of connection to a public figure",
      "An offline friendship between two creators",
      "A private group account",
      "A video shared without subtitles",
    ],
    0,
    "A parasocial relationship is a one-sided sense of connection to someone you know through media.",
  ],
  [
    3,
    "Someone comments “the crossover episode!” under two creators’ collab. They mean…",
    [
      "Two familiar creator worlds have met",
      "The video is a TV episode",
      "One creator deleted a channel",
      "The upload is an advertisement",
    ],
    0,
    "It borrows the TV crossover idea: two separate worlds appearing together. Your subscriptions have collided.",
  ],
];
export const bank = rows.map((q, id) => ({
  id,
  category: departments[q[0]].name,
  question: q[1],
  options: q[2],
  answer: q[3],
  explanation: q[4],
}));
export const dayKey = (date = new Date()) => date.toISOString().slice(0, 10);
export const nextReset = (date = new Date()) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1),
  );
function random(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(items, rand) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function dailyQuestions(day) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(day) ||
    !Number.isFinite(Date.parse(day)) ||
    dayKey(new Date(day)) !== day
  )
    throw new Error("Invalid issue date");
  const dayNumber = Math.floor(Date.parse(day) / 86400000);
  const rand = random(
    [...day].reduce((s, c) => (Math.imul(s, 31) + c.charCodeAt(0)) | 0, 0),
  );
  return departments
    .flatMap((dept, categoryIndex) => {
      const pool = shuffle(
        bank.filter((q) => q.category === dept.name),
        random(12013 + categoryIndex),
      );
      // Consecutive blocks prevent questions repeating on adjacent days.
      return Array.from(
        { length: dept.count },
        (_, i) =>
          pool[
            (((dayNumber * dept.count + i) % pool.length) + pool.length) %
              pool.length
          ],
      );
    })
    .map((q) => {
      const choices = shuffle(
        q.options.map((text, index) => ({ text, correct: index === q.answer })),
        rand,
      );
      return {
        ...q,
        options: choices.map((c) => c.text),
        answer: choices.findIndex((c) => c.correct),
      };
    });
}
export function validAnswers(value, questions) {
  return (
    Array.isArray(value) &&
    value.length <= questions.length &&
    Array.from(value).every(
      (a, i) =>
        Number.isInteger(a) && a >= 0 && a < questions[i].options.length,
    )
  );
}
export function rank(score) {
  return [
    "Casual Lurker",
    "Certified Mutual",
    "Fandom Archivist",
    "Keeper of the Lore",
    "The Deepest Cut",
  ][Math.min(4, Math.floor(score / 2.5))];
}
export function scoreAnswers(questions, answers) {
  return questions.reduce(
    (n, q, i) => n + (answers[i] === q.answer ? 1 : 0),
    0,
  );
}
