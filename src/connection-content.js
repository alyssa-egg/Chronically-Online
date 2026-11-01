// Edit the JSON, keep published IDs stable, and run npm test before deploying.
import content from './connection-puzzles.json' with {type:'json'};
export const CONNECTION_ANCHOR=content.anchor;
export const connectionPuzzles=content.puzzles;
export const connectionSchedule=content.schedule;
export const connectionOverrides=content.overrides;
