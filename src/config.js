/**
 * Global Configuration for College Notes Portal
 * 
 * Rules:
 * - Build every PDF URL from a single setting, FILES_BASE_URL (default '/notes/'),
 *   plus the 'file' path from notes.json.
 * - If you later move PDFs to another host or CDN, only this value changes.
 * - Never hardcode PDF paths anywhere else.
 */
export const FILES_BASE_URL = '/notes/';

export const SITE_CONFIG = {
  name: 'notes-sreevats',
  shortName: 'notes-sreevats',
  tagline: 'High-Yield College Notes & Exam Blueprints',
  description: 'Clean, verified handwritten notes, previous year question solutions, and quick formula sheets for engineering and science.',
  author: 'Sreevats',
  authorRole: 'Student & Creator',
  watermarkText: 'NOTES-SREEVATS • FREE STUDENT RESOURCE',
  contactEmail: 'sreevats30@gmail.com',
  githubUrl: 'https://github.com',
};

/**
 * Extracts active tags from a note.
 * Supports:
 * - 1/0 toggle object: { "Endsem": 1, "Midsem": 0, "Derivations": 1 }
 * - array of strings: ["Endsem", "Derivations"]
 */
export function getNoteTags(note) {
  if (!note || !note.tags) return [];
  if (Array.isArray(note.tags)) return note.tags;
  if (typeof note.tags === 'object') {
    return Object.entries(note.tags)
      .filter(([_, val]) => val === 1 || val === '1' || val === true)
      .map(([tag]) => tag);
  }
  return [];
}

