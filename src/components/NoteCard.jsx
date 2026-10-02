import React from 'react';
import { Eye, Download, FileText, Calendar, Hash, Layers } from 'lucide-react';
import { FILES_BASE_URL, getNoteTags } from '../config';

export function NoteCard({ note, onPreview }) {
  const activeTags = React.useMemo(() => getNoteTags(note), [note]);

  const isExamAlert = 
    note.type === 'PYQ Solution' || 
    note.unit === 'PYQ' || 
    activeTags.some(t => /last-minute|practice|endsem|pyq|midsem/i.test(t));

  const getTagColorClass = (tag) => {
    const t = tag.toLowerCase();
    if (t.includes('practice')) return 'card-tag-orange';
    if (t.includes('chem')) return 'card-tag-purple';
    if (t.includes('common')) return 'card-tag-green';
    if (t.includes('formula') || t.includes('credit')) return 'card-tag-amber';
    if (t.includes('digital') || t.includes('slide')) return 'card-tag-purple';
    return 'card-tag-blue';
  };

  const downloadUrl = `${FILES_BASE_URL}${note.file}`;

  return (
    <article className={`note-card glass-panel ${isExamAlert ? 'border-accent-red' : 'border-accent-blue'}`}>
      {/* Card Header: Subject Code / Branch */}
      <div className="card-top-row">
        <div className="subject-meta-group">
          {note.subjectCode && (
            <span className="subject-code-tag mono">{note.subjectCode}</span>
          )}
          <span className="subject-name-tag">{note.subject}</span>
          {note.unit && (
            <span className={`unit-tag ${isExamAlert ? 'unit-tag-red' : 'unit-tag-blue'} mono`}>
              {note.unit}
            </span>
          )}
        </div>
      </div>

      {/* Note Title */}
      <h3 className="note-card-title" title={note.title}>
        {note.title}
      </h3>

      {/* Tags row */}
      {activeTags.length > 0 && (
        <div className="card-tags-list">
          {activeTags.map((tag, idx) => (
            <span 
              key={idx} 
              className={`card-tag ${getTagColorClass(tag)}`}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Card Meta Stats (Pages, Size, Added Date, Type) */}
      <div className="card-meta-row">
        <div className="meta-item" title="Page count">
          <Layers size={14} className="meta-icon" />
          <span className="mono">{note.pages} pages</span>
        </div>

        <div className="meta-item" title="File size">
          <FileText size={14} className="meta-icon" />
          <span className="mono">{note.sizeMB} MB</span>
        </div>

        <div className="meta-item note-type-pill" title="Note Format">
          <span>{note.type}</span>
        </div>
      </div>

      {/* Card Footer: Dual Actions Preview & Download */}
      <div className="card-actions-row">
        <button
          className="btn-preview"
          onClick={() => onPreview(note)}
          title="Open in-browser PDF reader"
        >
          <Eye size={16} />
          <span>Preview</span>
        </button>

        <a
          href={downloadUrl}
          download={note.file.split('/').pop()}
          className="btn-download"
          title="Download watermarked PDF directly"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Download size={16} />
          <span>Download</span>
        </a>
      </div>
    </article>
  );
}
