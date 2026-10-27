import {writeFile} from 'node:fs/promises';
import {dailyOpenCut,OPEN_CUT_ANCHOR} from '../src/open-cut.js';
const lines=['# The Deep Cut: first 28 daily files','','All dates reset at midnight **America/New_York**. These are prepared game files, not live player statistics. The first date is the schedule anchor; deploying later does not move earlier files.','','Review full accepted lists and aliases in [src/open-cut-content.js](src/open-cut-content.js). This calendar is for review; generating it does not publish a website or approve the older dated ten-question quiz issues.','','| Eastern date | File | Five prompts |','| --- | --- | --- |'];
for(let i=0;i<28;i++){
 const day=new Date(Date.parse(OPEN_CUT_ANCHOR)+i*86400000).toISOString().slice(0,10),challenge=dailyOpenCut(day);
 lines.push(`| ${day} | ${challenge.number} | ${challenge.prompts.map((prompt,j)=>`${j+1}. ${prompt.question.replaceAll('|','\\|')}`).join('<br>')} |`);
}
lines.push('','The default archive repeats after these 28 files. Prepare new dated overrides before the next cycle for a continuing supply of new prompts. See [DEEP_CUT_LAUNCH.md](DEEP_CUT_LAUNCH.md).','');
await writeFile(new URL('../DEEP_CUT_CALENDAR.md',import.meta.url),lines.join('\n'));
console.log('Wrote DEEP_CUT_CALENDAR.md with 28 dated files and 140 prompts.');
