import React from 'react';
import { Eye, Download, FileText, Calendar, Hash, Layers } from 'lucide-react';
import { FILES_BASE_URL } from '../config';

export function NoteCard({ note, onPreview }) {
  const isExamAlert = 
    note.type === 'PYQ Solution' || 
    note.unit === 'PYQ' || 
    note.tags?.some(t => /endsem|pyq|midsem/i.test(t));

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
      {note.tags && note.tags.length > 0 && (
        <div className="card-tags-list">
          {note.tags.map((tag, idx) => {
            const isRedTag = /endsem|pyq|high-yield|important|derivation/i.test(tag);
            return (
              <span 
                key={idx} 
                className={`card-tag ${isRedTag ? 'card-tag-red' : 'card-tag-blue'}`}
              >
                #{tag}
              </span>
            );
          })}
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
