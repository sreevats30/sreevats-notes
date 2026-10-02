import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, ArrowRight, Eye, Download, Layers, GraduationCap } from 'lucide-react';
import { FILES_BASE_URL, getNoteTags } from '../config';

export function SearchModal({ isOpen, onClose, notes, onSelectNote }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter all resources (notes + exam papers)
  const filteredResources = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return notes.filter(n => {
      const matchTitle = n.title?.toLowerCase().includes(q);
      const matchFileName = n.fileName?.toLowerCase().includes(q);
      const matchSubj = n.subject?.toLowerCase().includes(q);
      const matchUnit = n.unit?.toLowerCase().includes(q);
      const matchCode = n.subjectCode?.toLowerCase().includes(q);
      const matchType = n.type?.toLowerCase().includes(q);
      const tags = getNoteTags(n);
      const matchTags = tags.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchFileName || matchSubj || matchUnit || matchCode || matchType || matchTags;
    }).slice(0, 10); // Top 10 matches
  }, [query, notes]);

  if (!isOpen) return null;

  return (
    <div className="search-modal-backdrop" onClick={onClose}>
      <div 
        className="search-modal-card glass-panel" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Search Input Bar */}
        <div className="search-modal-header">
          <Search size={20} className="text-neon-cyan search-input-icon" />
          <input
            ref={inputRef}
            type="text"
            className="search-modal-input"
            placeholder="Search all notes, question papers, PYQs, units..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query ? (
            <button className="search-modal-clear" onClick={() => setQuery('')}>
              <X size={18} />
            </button>
          ) : (
            <span className="search-modal-esc mono">ESC</span>
          )}
        </div>

        {/* Search Results List */}
        <div className="search-modal-body">
          {query.trim() === '' ? (
            <div className="search-empty-prompt">
              <span className="prompt-title">Quick Search Command Palette</span>
              <p className="prompt-sub">Search across all notes, question papers, formula sheets, and solved PYQs.</p>
              <div className="quick-suggestions-row">
                {['Physics', 'Chemistry', 'PYQ', 'Exam', 'Mathematics', 'Formula Sheet'].map(term => (
                  <button 
                    key={term} 
                    className="suggestion-chip"
                    onClick={() => setQuery(term)}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className="search-no-results">
              <FileText size={32} className="text-muted" />
              <p>No matching resources found for "{query}"</p>
              <span>Try checking spelling or search by subject name.</span>
            </div>
          ) : (
            <div className="search-results-list">
              <div className="results-count-bar">
                Found {filteredResources.length} matching resource{filteredResources.length > 1 ? 's' : ''}
              </div>
              {filteredResources.map(n => {
                const isExam = n.isExamPaper || n.subject === 'Exam Prep';
                const isPyq = n.type === 'PYQ Solution' || n.unit === 'PYQ';

                return (
                  <div 
                    key={n.id} 
                    className="search-result-item"
                    onClick={() => { onSelectNote(n); onClose(); }}
                  >
                    <div className="result-text-col">
                      <div className="result-tags-line">
                        <span className="result-subj-badge">{n.subject}</span>
                        {n.subjectCode && <span className="result-code-badge mono">{n.subjectCode}</span>}
                        <span className={`result-unit-badge ${isExam ? 'badge-exam' : isPyq ? 'badge-red' : 'badge-blue'} mono`}>
                          {n.unit || (isExam ? 'Question Paper' : 'Note')}
                        </span>
                      </div>

                      <h4 className="result-title">{n.title}</h4>

                      <div className="result-meta-line mono">
                        {n.pages && (
                          <>
                            <span>{n.pages} pages</span>
                            <span>•</span>
                          </>
                        )}
                        {n.sizeMB && (
                          <>
                            <span>{n.sizeMB} MB</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{n.type || 'PDF Document'}</span>
                        {n.fileName && !n.pages && (
                          <>
                            <span>•</span>
                            <span className="text-dim">{n.fileName}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="result-actions-col">
                      <button 
                        className="btn-result-preview" 
                        onClick={(e) => { e.stopPropagation(); onSelectNote(n); onClose(); }}
                      >
                        <Eye size={15} />
                        <span>Preview</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="search-modal-footer">
          <div className="shortcut-hint">
            <kbd>ESC</kbd> to close
          </div>
          <div className="shortcut-hint">
            <kbd>Click</kbd> to preview in-browser
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchModal;
