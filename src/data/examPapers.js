import pdfMeta from './pdf-meta.json';

const examModules = import.meta.glob('/public/exam/**/*.{pdf,PDF}', { eager: true, query: '?url' });

export function getExamPapers() {
  const entries = Object.keys(examModules);
  
  return entries.map((filePath, index) => {
    const mod = examModules[filePath];
    const resolvedUrl = (mod && typeof mod === 'object' && mod.default) 
      ? mod.default 
      : (typeof mod === 'string' ? mod : filePath.replace(/^\/public/, ''));

    const fileNameWithExt = filePath.split('/').pop() || `Exam Paper ${index + 1}`;
    const fileNameWithoutExt = fileNameWithExt.replace(/\.[^/.]+$/, "");
    const displayTitle = fileNameWithoutExt.replace(/_/g, ' ');

    const meta = pdfMeta[`exam/${fileNameWithExt}`] || 
                 pdfMeta[fileNameWithExt] || 
                 pdfMeta[`/exam/${fileNameWithExt}`] || 
                 pdfMeta[filePath.replace(/^\/public\//, '')] || 
                 {};

    return {
      id: `exam-${index + 1}-${fileNameWithoutExt}`,
      title: displayTitle,
      fileName: fileNameWithExt,
      file: resolvedUrl,
      subject: 'Exam Prep',
      unit: 'Question Paper',
      type: 'Exam Paper',
      pages: meta.pages || 0,
      sizeMB: meta.sizeMB || 0.01,
      isExamPaper: true,
    };
  });
}

export default getExamPapers;
