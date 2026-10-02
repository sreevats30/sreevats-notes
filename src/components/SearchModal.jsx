import React, { useState, useEffect, useRef } from 'react';
import { Search, X, FileText, ArrowRight, Eye, Download, Layers } from 'lucide-react';
import { FILES_BASE_URL } from '../config';

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

  // Filter notes
  const filteredNotes = React.useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return notes.filter(n => {
      const matchTitle = n.title?.toLowerCase().includes(q);
      const matchSubj = n.subject?.toLowerCase().includes(q);
      const matchUnit = n.unit?.toLowerCase().includes(q);
      const matchCode = n.subjectCode?.toLowerCase().includes(q);
      const matchType = n.type?.toLowerCase().includes(q);
      const matchTags = n.tags?.some(t => t.toLowerCase().includes(q));
      return matchTitle || matchSubj || matchUnit || matchCode || matchType || matchTags;
    }).slice(0, 8); // Top 8 matches
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
            placeholder="Type a subject, unit, PYQ, or topic..."
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
              <p className="prompt-sub">Try searching: "Physics", "PYQ", "Unit 1", "PHY101", "Formula"</p>
              <div className="quick-suggestions-row">
                {['Physics', 'Formula Sheet', 'PYQ', 'Chemistry', 'Data Structures'].map(term => (
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
          ) : filteredNotes.length === 0 ? (
            <div className="search-no-results">
              <FileText size={32} className="text-muted" />
              <p>No matching notes found for "{query}"</p>
              <span>Try checking spelling or browse subjects directly.</span>
            </div>
          ) : (
            <div className="search-results-list">
              <div className="results-count-bar">
                Found {filteredNotes.length} matching note{filteredNotes.length > 1 ? 's' : ''}
              </div>
              {filteredNotes.map(n => {
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
                        <span className={`result-unit-badge ${isPyq ? 'badge-red' : 'badge-blue'} mono`}>
                          {n.unit}
                        </span>
                      </div>
                      <h4 className="result-title">{n.title}</h4>
                      <div className="result-meta-line mono">
                        <span>{n.pages} pages</span>
                        <span>•</span>
                        <span>{n.sizeMB} MB</span>
                        <span>•</span>
                        <span>{n.type}</span>
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
            <kbd>Click</kbd> to preview note
          </div>
        </div>
      </div>
    </div>
  );
}
