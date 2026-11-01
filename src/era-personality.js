const profiles=(era,items)=>items.map(([id,name,description])=>({id,name,description,suggestion:'Open your era folder for the collage, memories and a few more references.',era}));
const questions=items=>items.map(([question,...texts],i)=>({id:`choice-${i+1}`,question,options:texts.map((text,profile)=>({text,profile}))}));
export const eraPersonalityQuizzes=[
 {id:'fandom-personality',era:'fandom-years',type:'personality',title:'what kind of 2010s internet girl were you?',description:'Eight very specific choices from the dashboard you never really logged out of.',profiles:profiles('fandom-years',[
  ['gifset-romantic','the gifset romantic','You could tell a whole story in eight looping frames. The Robbers edit, the black-and-white dashboard and a very carefully chosen lyric were your emotional filing system. You made the internet feel like a shared diary.'],
  ['fan-account','the fan-account historian','You remember the tour dates, the inside jokes and the exact year a username changed. Whether it was 1D, 5SOS or a bedroom-camera YouTuber, you kept receipts because those communities mattered to you.'],
  ['fic-tab','the thirty-tab daydreamer','Your browser was a map of alternate universes. A fic, an anonymous ask, a new rabbit hole: every tab had a reason to stay open. You found belonging in the tiny worlds other fans built.']
 ]),questions:questions([
  ['It’s 2014. Your dashboard background is…','A grainy Arctic Monkeys or The 1975 gifset.','A tour photo with a watermark only your mutuals recognise.','An HTML theme you spent the whole evening adjusting.'],
  ['Your sacred saved folder contains…','Black-and-white concert edits set to Robbers.','One Direction video diaries and 5SOS cover clips.','A masterlist of fics with extremely specific tags.'],
  ['The notification that stops everything…','A mutual reblogged your edit with emotional tags.','Your band announced another tour date.','The next chapter of your 80k-word slow burn is up.'],
  ['Pick a late-night tab.','Lana Del Rey and a custom playlist player.','A Dan and Phil video you can quote from memory.','AO3, sorted by a very particular trope.'],
  ['Your contribution to the fandom…','An eight-panel gifset and the perfect caption.','A timeline of every important interview moment.','A coffee-shop AU that got wonderfully out of hand.'],
  ['The relic you’d save from an old laptop…','A folder of VSCO-style edits before you knew the name.','A screenshot of your first fan-account follow.','Your old Tumblr theme code and fic bookmarks.'],
  ['Your tagging habits were…','Whole feelings hidden under a reblog.','Names, dates and an organised tour tag.','An alternate universe explained in six increasingly long tags.'],
  ['The part you miss most…','How a song and a gif could become a whole mood.','Having people who knew the exact same tiny references.','Falling into another story until 2 a.m.']
 ])},
 {id:'influencer-personality',era:'influencer-era',type:'personality',title:'what was your 2017–2020 internet personality?',description:'Eight choices from the era of jump cuts, disposable cameras and one more comfort video.',profiles:profiles('influencer-era',[
  ['comfort-tab','the comfort-video regular','An Emma Chamberlain upload, a familiar gaming intro, the sound of someone making coffee: you liked the internet when it felt like hanging out. Your subscription box was less a feed and more a room full of familiar voices.'],
  ['camera-curator','the camera-roll curator','Tiny sunglasses, a Wildflower case and a photo edit you could recognise instantly. You noticed the visual details that made an era. Your saved images tell a story before anyone reads a caption.'],
  ['playlist-explorer','the playlist rabbit hole','You followed a sound from a Vine memory to TikTok to someone’s SoundCloud page. A Flower Boy sleeve or a Clairo track could open a whole new folder. Your best discoveries always came with a “wait, listen to this.”']
 ]),questions:questions([
  ['A 2018 afternoon starts with…','Emma Chamberlain making the ordinary feel funny.','Saving another Devon Carlson outfit photo.','Flower Boy playing while you open a new music tab.'],
  ['Your most-used saved folder…','Comfort videos and gaming uploads.','HUJI photos, Wildflower cases and tiny sunglasses.','Clairo, Rex Orange County and songs from your For You page.'],
  ['Pick one detail to bring back.','The chaotic zoom in an Emma jump cut.','The date stamp on a disposable-camera-style photo.','The first seconds of a song everyone used on Musical.ly.'],
  ['Your friend needs a recommendation.','A Markiplier or Jacksepticeye series they can settle into.','A VSCO edit recipe and the exact phone case.','A SoundCloud link that will turn into a whole playlist.'],
  ['Your 2019 starter pack…','Headphones and an unreasonably long Watch Later list.','A scrunchie, Hydro Flask and camera roll full of friends.','A playlist named after a lyric, all lowercase.'],
  ['A new upload you’d click instantly…','A familiar creator doing absolutely nothing in particular.','A beauty shelf tour with great lighting.','A live session from an artist you just discovered.'],
  ['Your archive would have a whole drawer for…','Creator friend groups and old collab videos.','Butterfly clips and every version of your saved aesthetic.','Early TikTok audio and 2019 album discoveries.'],
  ['What made a post worth keeping?','It felt like spending time with a friend.','One tiny detail captured the entire year.','It introduced you to your next favourite song.']
 ])},
 {id:'current-personality',era:'current-lore',type:'personality',title:'what is your current internet DNA?',description:'Eight choices for the pop folders, niche creator lore and screenshot-heavy group chat.',profiles:profiles('current-lore',[
  ['pop-archivist','the pop-folder archivist','PinkPantheress tracklists, KATSEYE edits and a release-week group chat: you connect eras through the music. You can keep a favourite deep cut and still celebrate the chorus everybody knows.'],
  ['lore-scout','the group-chat lore scout','You know why that Slushy Noobz clip is funny, and you can explain the Emergency Intercom reference with supporting screenshots. Your internet is made of small communities and jokes that grow more specific every week.'],
  ['moodboard-maker','the digital moodboard maker','You see how a case, a colour, a creator and a song fit together. Your archive is personal rather than trend-perfect: part camera roll, part playlist, part evidence that a tiny detail can define a whole summer.']
 ]),questions:questions([
  ['A tab you refuse to close…','A PinkPantheress tracklist or KATSEYE performance.','A Slushy Noobz video with a joke you need to send.','A saved collection that is slowly becoming a whole moodboard.'],
  ['A screenshot you immediately share…','A new album announcement or tour date.','A creator comment that needs three screenshots of context.','An outfit, an image or a tiny perfect colour combination.'],
  ['Your group-chat speciality…','Knowing which song belongs over that edit.','Explaining the Enya and Drew reference.','Finding the image that describes the whole situation.'],
  ['Choose a recent-era rabbit hole.','Chappell’s stage looks, then the songs behind them.','Vanilla Mace clips, then all the comments.','Tracing a trend from a camera roll back to an old Tumblr post.'],
  ['What gets a folder of its own?','Deep cuts, alternate versions and favourite live performances.','The creator universe with lore you can’t explain briefly.','Little images that make sense together only to you.'],
  ['A friend says “you had to be there.”','You remember exactly which song was playing.','You have the clip and the original comment saved.','You can picture the whole visual mood of that week.'],
  ['Your dream archive discovery…','The older track that inspired your newest favourite.','A forgotten collab that explains an ongoing inside joke.','The original image behind a familiar moodboard.'],
  ['What keeps you online?','Shared excitement when a favourite artist drops something.','Finding mutuals who speak your very specific joke language.','Making a little collection that feels like your own corner.']
 ])}
];
