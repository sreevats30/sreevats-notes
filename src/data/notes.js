/**
 * Automatically gathers and merges all note entries from every subject file
 * inside src/data/subjects/*.json
 * 
 * To add a new subject, simply create a new <subject>.json file in src/data/subjects/!
 * Vite will instantly detect and load it automatically.
 */
const subjectModules = import.meta.glob('./subjects/*.json', { eager: true });

export const allNotes = Object.values(subjectModules).flatMap(mod => {
  const content = mod.default || mod;
  return Array.isArray(content) ? content : [content];
});

export default allNotes;
