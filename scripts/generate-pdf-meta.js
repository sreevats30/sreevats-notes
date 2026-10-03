import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const publicDir = path.join(rootDir, 'public');
const publicNotesDir = path.join(publicDir, 'notes');
const publicExamDir = path.join(publicDir, 'exam');
const outputMetaFile = path.join(rootDir, 'src', 'data', 'pdf-meta.json');

function getAllPdfFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllPdfFiles(fullPath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.pdf')) {
      files.push(fullPath);
    }
  }
  return files;
}

export async function generatePdfMeta() {
  const notesFiles = getAllPdfFiles(publicNotesDir);
  const examFiles = getAllPdfFiles(publicExamDir);
  const allPdfFiles = [...new Set([...notesFiles, ...examFiles])];
  const metadataMap = {};

  for (const fullPath of allPdfFiles) {
    const relFromPublic = path.relative(publicDir, fullPath).split(path.sep).join('/');
    const stat = fs.statSync(fullPath);
    const sizeMB = Math.max(0.01, +(stat.size / (1024 * 1024)).toFixed(2));

    let pages = 1;
    try {
      const data = new Uint8Array(fs.readFileSync(fullPath));
      const doc = await pdfjs.getDocument({ data }).promise;
      pages = doc.numPages;
    } catch {
      try {
        const buf = fs.readFileSync(fullPath);
        const matches = buf.toString('latin1').match(/\/Type\s*\/Page\b/g);
        if (matches && matches.length > 0) {
          pages = matches.length;
        }
      } catch {
        pages = 1;
      }
    }

    const metaInfo = {
      pages,
      sizeMB,
      bytes: stat.size
    };

    // Store relative to public ("notes/chem/unit-1.pdf", "exam/Chem ESA PYQs.pdf")
    metadataMap[relFromPublic] = metaInfo;
    metadataMap[`/${relFromPublic}`] = metaInfo;

    // If inside notes/, also store relative to notes/ ("chem/unit-1.pdf")
    if (fullPath.startsWith(publicNotesDir)) {
      const relFromNotes = path.relative(publicNotesDir, fullPath).split(path.sep).join('/');
      metadataMap[relFromNotes] = metaInfo;
      metadataMap[`/${relFromNotes}`] = metaInfo;
    }

    // If inside exam/, also store relative to exam/ ("Chem ESA PYQs.pdf")
    if (fullPath.startsWith(publicExamDir)) {
      const relFromExam = path.relative(publicExamDir, fullPath).split(path.sep).join('/');
      metadataMap[relFromExam] = metaInfo;
      metadataMap[`/${relFromExam}`] = metaInfo;
    }

    // Also store by pure filename as fallback
    const fileName = path.basename(fullPath);
    if (!metadataMap[fileName]) {
      metadataMap[fileName] = metaInfo;
    }
  }

  // Ensure directory exists
  const outDir = path.dirname(outputMetaFile);
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  fs.writeFileSync(outputMetaFile, JSON.stringify(metadataMap, null, 2) + '\n', 'utf8');
  return metadataMap;
}

// CLI execution support
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  console.log('⚡ Scanning all PDFs and generating page count & size metadata...');
  generatePdfMeta().then(meta => {
    const totalFiles = Object.keys(meta).length;
    const totalPages = Object.values(meta).reduce((sum, m) => sum + (m.pages || 0), 0);
    console.log(`✅ Generated metadata for ${totalFiles} PDFs (${totalPages} total pages).`);
  });
}
