// Evergreen editorial seed content. Edit these short files independently of the layout.
// Public era pages are separate from the existing paid game collections.
export const discoveryEras = [
  { id: 'fandom-years', number: '01', title: 'the fandom years', years: '2010–2016', articleEra: '2010-2016', legacyEras: [], description: 'Tumblr dashboards, first fan accounts, bedroom-wall posters, and the videos you watched after school.', references: ['One Direction', '5SOS', 'Bethany Mota', 'Tumblr'], discoveries: [
    { id: 'reblog', title: 'the reblog button', kind: 'dashboard object', x: 32, y: 44, text: 'A reblog put somebody else’s post onto your own Tumblr. Tags could become a second conversation: reactions, fandom jokes, and very specific feelings tucked underneath the post.', source: 'https://help.tumblr.com/reblogs/' },
    { id: 'bethany', title: 'the Macbarbie07 rabbit hole', kind: 'creator file', x: 37, y: 49, text: 'Before her own-name channel became familiar, Bethany Mota uploaded as Macbarbie07. Hauls, room decor, and back-to-school videos made the bedroom feel like a whole creative studio.', source: 'https://www.youtube.com/@bethanymota' },
    { id: '5sos', title: 'four boys, one very loud dashboard', kind: 'music memory', x: 31, y: 79, text: '5 Seconds of Summer formed in Sydney in 2011. Their early covers and the One Direction touring connection helped turn a band discovery into a fan-account personality trait.', source: 'https://5sos.com/' },
    { id: 'fanfic', title: 'a whole other universe', kind: 'fandom vocabulary', x: 14, y: 28, text: 'AU means alternate universe. A coffee-shop AU could take characters you already loved and move them into a new setting. The lore kept going long after the original episode ended.', source: 'https://fanlore.org/wiki/Alternate_Universe' },
  ] },
  { id: 'influencer-era', number: '02', title: 'the influencer era', years: '2017–2020', articleEra: '2017-2020', legacyEras: ['2017-2019'], description: 'Comfort vlogs, SoundCloud discoveries, tiny sunglasses, VSCO edits, and a For You page taking shape.', references: ['Emma Chamberlain', 'VSCO', 'SoundCloud', 'early TikTok'], discoveries: [
    { id: 'emma', title: 'coffee, jump cuts, repeat', kind: 'creator file', x: 45, y: 51, text: 'Emma Chamberlain’s videos made casual, self-aware editing feel like its own language: jump cuts, zooms, and everyday moments left deliberately imperfect. Chamberlain Coffee launched in 2019.', source: 'https://chamberlaincoffee.com/' },
    { id: 'vsco', title: 'the camera-roll moodboard', kind: 'aesthetic file', x: 15, y: 23, text: 'VSCO began as a photo-editing and sharing app. By 2019 its name also described an online aesthetic: edited camera rolls, scrunchies, reusable bottles, and the familiar “and I oop” joke.', source: 'https://www.vsco.co/' },
    { id: 'flowerboy', title: 'the sunflower album cover', kind: 'music object', x: 80, y: 49, text: 'Tyler, the Creator released Flower Boy in 2017. Its sunflower-filled cover became an instantly recognizable part of the era’s saved-image folders and music moodboards.', source: 'https://www.listentotyler.com/' },
    { id: 'musically', title: 'before the For You page', kind: 'platform memory', x: 53, y: 84, text: 'Musical.ly accounts moved into TikTok when the apps merged in 2018. Lip-sync fandom and short-form creator culture carried on under a new name.', source: 'https://newsroom.tiktok.com/en-us/musical-ly-and-tiktok-unite-to-debut-new-worldwide-short-form-video-platform' },
  ] },
  { id: 'current-lore', number: '03', title: 'the current lore', years: '2021–now', articleEra: '2021-now', legacyEras: ['2020-now'], description: 'New artists, niche creators, micro-trends, and the little references that become your whole group chat.', references: ['KATSEYE', 'PinkPantheress', 'Slushy Noobz', 'pop girl lore'], discoveries: [
    { id: 'brat', title: 'a very specific shade of green', kind: 'music memory / 2024', x: 8, y: 15, text: 'Charli xcx released Brat in June 2024. The lowercase title and bright green artwork travelled far beyond the album cover. This is an archive entry about that moment, not a new release alert.', source: 'https://www.charlixcx.com/' },
    { id: 'katseye', title: 'the Dream Academy connection', kind: 'fandom file', x: 40, y: 46, text: 'KATSEYE formed through The Debut: Dream Academy, the 2023 HYBE and Geffen project. Their 2024 debut brought a new set of performances, edits, and fan accounts to learn.', source: 'https://www.katseye.world/' },
    { id: 'pinkpantheress', title: 'the short-song replay button', kind: 'music file', x: 25, y: 40, text: 'PinkPantheress released the mixtape to hell with it in 2021. Its short tracks and UK dance influences made a full song feel like the reference you immediately wanted to replay.', source: 'https://www.pantheress.pink/' },
    { id: 'slushy', title: 'the comfort-video tab stays open', kind: 'creator file', x: 37, y: 71, text: 'Slushy Noobz is the duo of Martin and Hamzah. Their channel belongs to a newer comfort-video world, with its own recurring jokes and comment-section vocabulary.', source: 'https://www.youtube.com/@SlushyNoobz' },
  ] },
];
export const eraURL = id => `/eras/${encodeURIComponent(id)}/`;
export const discoveryEra = id => discoveryEras.find(era => era.id === id);

// Exact copies of the owner’s original Sanity uploads, with no image processing.
const originalCollageRefs = {
 'fandom-years':'image-d56739a6bb75f8d7965bb1c086146f8bd61ca345-2048x1152-jpg',
 'influencer-era':'image-34257b1bd4d58edf9b98654d8724f0b1df09d175-1920x1080-jpg',
 'current-lore':'image-1de2df23a12757c591ac0b2c627bbdc22e0056b5-1920x1080-jpg',
};
for (const era of discoveryEras) era.collage = { src: `/src/assets/eras/${era.id}.jpg`, asset:{_ref:originalCollageRefs[era.id]}, alt: `${era.title} original collage` };
