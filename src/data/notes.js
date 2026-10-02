/**
 * Auto-loads all note metadata files.
 * Primary: Each subject folder inside public/notes/ (e.g. public/notes/physics/notes.json)
 * Fallback: src/data/subjects/*.json
 * 
 * Works seamlessly:
 * - If you write "file": "unit-1.pdf" inside public/notes/physics/notes.json,
 *   it automatically normalizes it to "physics/unit-1.pdf".
 * - If you wrote "file": "physics/unit-1.pdf", it preserves it.
 */
const publicNotesModules = import.meta.glob('../../public/notes/**/*.json', { eager: true });
const subjectModules = import.meta.glob('./subjects/*.json', { eager: true });

function parseModules(modules, isPublic = false) {
  return Object.entries(modules).flatMap(([pathKey, mod]) => {
    const content = mod.default || mod;
    const items = Array.isArray(content) ? content : [content];
    
    // Extract folder name from path
    const normalizedKey = pathKey.replace(/\\/g, '/');
    let folderName = '';
    if (isPublic) {
      const match = normalizedKey.match(/public\/notes\/([^/]+)\//);
      folderName = match ? match[1] : '';
    } else {
      const match = normalizedKey.match(/subjects\/([^/]+)\.json$/);
      folderName = match ? match[1] : '';
    }

    return items.map(item => {
      let filePath = item.file || '';
      if (folderName && !filePath.includes('/') && !filePath.includes('\\')) {
        filePath = `${folderName}/${filePath}`;
      }
      return {
        ...item,
        file: filePath
      };
    });
  });
}

const publicNotes = parseModules(publicNotesModules, true);
const subjectNotes = parseModules(subjectModules, false);

export const allNotes = publicNotes.length > 0 ? publicNotes : subjectNotes;
export default allNotes;
