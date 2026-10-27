import { deepCutQuestions } from './deep-cut-questions.js';
import { discoveryEras } from './era-discoveries.js';
export const QUIZ_VERSION='v1';
export const quizKey=id=>`fandom-files-quiz-${QUIZ_VERSION}-${id}`;
const names={
 'fandom-years':[['dashboard-detective','how well do you know the fandom years?','YouTube bedrooms, first fan accounts, and the original lore.'],['fandom-language','name that fandom reference.','Gaming creators, fanfiction language, and dashboard habits.']],
 'influencer-era':[['influencer-receipts','the influencer-era receipts.','Comfort videos, camera-roll aesthetics, and internet music.'],['camera-roll','saved to your 2019 camera roll.','A second little file from the Influencer Era.']],
 'current-lore':[['current-lore-check','how deep is your current lore?','New music, creator universes, and the references in the group chat.'],['pop-folder','the pop-culture folder.','Artists, albums, and comfort-watch lore from 2021–now.']],
};
export const knowledgeQuizzes=discoveryEras.flatMap(era=>names[era.id].map(([id,title,description],index)=>({id,title,description,era:era.id,type:'knowledge',questions:deepCutQuestions.filter(question=>question.era===era.id).slice(index*5,index*5+5).map(question=>{const offset=[...question.id].reduce((sum,char)=>sum+char.charCodeAt(0),0)%4;return {...question,options:[...question.options.slice(offset),...question.options.slice(0,offset)],answer:(question.answer-offset+4)%4};})})));
export const eraProfiles=[
 {id:'fandom-years',name:'the dashboard archivist',description:'You keep a reference because of the feeling attached to it. Your internet is made of fan edits, shared obsessions, playlists, and a very carefully tagged memory.',suggestion:'Start with the fandom years: the old dashboard still has a file for you.'},
 {id:'influencer-era',name:'the camera-roll curator',description:'You notice the details that make a whole era: a colour palette, a creator’s editing style, the coffee order in the background. Your saved folder tells a story before anyone reads the caption.',suggestion:'Open the influencer era for comfort videos, style tags, and camera-roll nostalgia.'},
 {id:'current-lore',name:'the group-chat scout',description:'You bring the next reference into the chat. New artists, niche creators, and a joke that needs four screenshots of context all belong in your mental archive.',suggestion:'Explore the current lore: there is always one more connection to make.'},
];
const choices=(f,i,c)=>[{text:f,era:'fandom-years'},{text:i,era:'influencer-era'},{text:c,era:'current-lore'}];
export const personalityQuiz={id:'internet-girl',type:'personality',title:'what kind of internet girl are you?',description:'Six choices, three different ways to keep the lore. No right answers.',questions:[
 {id:'saved-tab',question:'A tab you keep open for far too long…',options:choices('A comfort fic or a fan-edit playlist.','A video with exactly the right room decor.','A deep dive into a creator’s newest inside joke.')},
 {id:'perfect-folder',question:'Your ideal saved folder is full of…',options:choices('Old concert photos and a perfectly tagged gifset.','Tiny style details and everyday camera-roll moments.','New music, screenshots, and a reference to send later.')},
 {id:'group-chat',question:'Your role in the group chat is…',options:choices('Remembering the exact moment this all started.','Finding a visual that captures the whole mood.','Sending the clip everyone will quote next week.')},
 {id:'time-capsule',question:'You get one digital time capsule. You choose…',options:choices('A dashboard from your biggest fandom phase.','Your old subscriptions and a 2019 playlist.','A record of what your mutuals are obsessed with now.')},
 {id:'first-instinct',question:'A new obsession arrives. Your first move…',options:choices('Find the lore, the fan accounts, and the edit archive.','Figure out the visual mood and save a few references.','Learn the joke, find the community, send it to someone.')},
 {id:'kept-receipt',question:'The receipt you would never delete…',options:choices('The fan project that made you feel part of something.','A photo that instantly brings a specific year back.','The first message where you predicted the next big thing.')},
]};
export const launchQuizzes=[...knowledgeQuizzes,personalityQuiz];
export const findLaunchQuiz=id=>launchQuizzes.find(quiz=>quiz.id===id);
export function validQuizAnswers(quiz,value,finished=false){return Array.isArray(value)&&value.length<=quiz.questions.length&&(!finished||value.length===quiz.questions.length)&&Array.from(value).every((answer,i)=>Number.isInteger(answer)&&answer>=0&&answer<quiz.questions[i].options.length);}
export function knowledgeResult(quiz,answers){if(!validQuizAnswers(quiz,answers,true))throw new Error('Complete this quiz first.');return {score:answers.filter((answer,i)=>answer===quiz.questions[i].answer).length,total:quiz.questions.length};}
export function personalityResult(answers){
 if(!validQuizAnswers(personalityQuiz,answers,true))throw new Error('Complete all six choices.');
 const counts=Object.fromEntries(eraProfiles.map(profile=>[profile.id,0]));answers.forEach((answer,i)=>counts[personalityQuiz.questions[i].options[answer].era]++);
 const first=personalityQuiz.questions[0].options[answers[0]].era;
 const profile=[...eraProfiles].sort((a,b)=>counts[b.id]-counts[a.id]||(a.id===first?-1:b.id===first?1:eraProfiles.indexOf(a)-eraProfiles.indexOf(b)))[0];
 return {...profile,counts};
}
