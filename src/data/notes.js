/**
 * Automatically gathers and merges all note entries from every subject file
 * inside src/data/subjects/*.json
 * 
 * To add a new subject, simply create a new <subject>.json file in src/data/subjects/!
 * Vite will instantly detect and load it automatically.
 */
import pdfMeta from './pdf-meta.json';

const subjectModules = import.meta.glob('./subjects/*.json', { eager: true });

export const allNotes = Object.values(subjectModules).flatMap(mod => {
  const content = mod.default || mod;
  const items = Array.isArray(content) ? content : [content];
  return items.map(note => {
    if (!note || !note.file) return note;
    const normalizedFile = note.file.replace(/^[/\\]+/, '').replace(/\\/g, '/');
    const meta = pdfMeta[normalizedFile] || {};
    return {
      ...note,
      pages: note.pages ?? meta.pages ?? 0,
      sizeMB: note.sizeMB ?? meta.sizeMB ?? 0.01,
    };
  });
});

export default allNotes;

