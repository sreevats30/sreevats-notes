/**
 * Automatically scans and lists all PDF documents placed inside the /public/exam/ folder.
 * 
 * No JSON files or tags required! Simply drop your question papers/solutions
 * into public/exam/ and Vite will immediately detect and display them.
 */

const examModules = import.meta.glob('/public/exam/**/*.{pdf,PDF}', { eager: true, query: '?url' });

export function getExamPapers() {
  const entries = Object.keys(examModules);
  
  return entries.map((filePath, index) => {
    const fileNameWithExt = filePath.split('/').pop() || `Exam Paper ${index + 1}`;
    const fileNameWithoutExt = fileNameWithExt.replace(/\.[^/.]+$/, "");
    const displayTitle = fileNameWithoutExt.replace(/_/g, ' ');
    const relativeUrl = filePath.replace('/public', '');

    return {
      id: `exam-${index + 1}-${fileNameWithoutExt}`,
      title: displayTitle,
      fileName: fileNameWithExt,
      file: relativeUrl, // e.g. /exam/Filename.pdf
      subject: 'Exam Prep',
      unit: 'Question Paper',
      type: 'Exam Paper',
    };
  });
}

export default getExamPapers;
