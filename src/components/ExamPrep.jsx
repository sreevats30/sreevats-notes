import React, { useState, useMemo } from 'react';
import { FileText, Search, Download, Eye, Sparkles, FolderOpen, AlertCircle, HelpCircle } from 'lucide-react';
import { getExamPapers } from '../data/examPapers';

export function ExamPrep({ onPreview }) {
  const [papers] = useState(() => getExamPapers());
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPapers = useMemo(() => {
    if (!searchQuery.trim()) return papers;
    const q = searchQuery.toLowerCase();
    return papers.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.fileName.toLowerCase().includes(q)
    );
  }, [papers, searchQuery]);

  return (
    <section className="container exam-prep-container">
      {/* Header Banner */}
      <div className="exam-prep-header">
        <div className="exam-title-badge">
          <Sparkles size={14} className="text-neon-cyan" />
          <span className="mono">EXAM VAULT • QUESTION PAPERS</span>
        </div>

        <h2 className="exam-main-title">
          Exam Prep &amp; <span className="gradient-text-dual">Question Papers</span>
        </h2>
        
        <p className="exam-subtitle">
          Direct repository for previous year university exam papers, mid-sems, and model solutions.
        </p>
      </div>

      {/* Control Bar: Search & Counts */}
      <div className="exam-controls-bar glass-panel">
        <div className="exam-search-box">
          <Search size={18} className="search-icon text-muted" />
          <input
            type="text"
            placeholder="Search exam papers by subject name"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="exam-search-input"
          />
          {searchQuery && (
            <button 
              className="clear-search-btn mono" 
              onClick={() => setSearchQuery('')}
            >
              Clear
            </button>
          )}
        </div>

        <div className="exam-count-badge mono">
          <span className="count-num text-neon-cyan">{filteredPapers.length}</span>
          <span className="count-label">Resources Available</span>
        </div>
      </div>

      {/* Papers Grid */}
      {filteredPapers.length > 0 ? (
        <div className="exam-papers-grid">
          {filteredPapers.map((paper) => (
            <div key={paper.id} className="exam-paper-card glass-panel">
              <div className="paper-card-top">
                <div className="paper-icon-box">
                  <FileText size={22} className="text-neon-cyan" />
                </div>
                <div className="paper-meta-col">
                  <span className="paper-type-badge mono">PDF Document</span>
                </div>
              </div>

              <h3 className="paper-title" title={paper.title}>
                {paper.title}
              </h3>

              <div className="paper-filename mono">
                <span>{paper.fileName}</span>
              </div>

              <div className="paper-card-actions">
                <button
                  className="btn-preview-paper"
                  onClick={() => onPreview(paper)}
                  title="Read in-browser canvas viewer"
                >
                  <Eye size={15} />
                  <span>Preview</span>
                </button>

                <a
                  href={paper.file}
                  download={paper.fileName}
                  className="btn-download-paper"
                  title="Download PDF"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Download size={15} />
                  <span>Download</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : papers.length === 0 ? (
        /* Empty state when no PDFs in public/exam/ */
        <div className="exam-empty-state glass-panel">
          <div className="empty-icon-wrap">
            <FolderOpen size={48} className="text-neon-cyan" />
          </div>
          <h3>Exam Papers Directory Ready</h3>
          <p>
            No question papers have been uploaded yet. To add question papers, simply place your PDF files into the:
          </p>
          <code className="exam-code-badge mono">public/exam/</code>
          <p className="empty-subtext">
            They will automatically show up here with full in-browser continuous-scroll reading and download capabilities!
          </p>
        </div>
      ) : (
        /* Search has 0 results */
        <div className="exam-empty-state glass-panel">
          <AlertCircle size={40} className="text-neon-red" />
          <h3>No exam papers match "{searchQuery}"</h3>
          <p>Try searching with another keyword or subject code.</p>
          <button 
            className="btn-neon-blue" 
            onClick={() => setSearchQuery('')}
            style={{ marginTop: '14px' }}
          >
            Clear Search
          </button>
        </div>
      )}
    </section>
  );
}

export default ExamPrep;
