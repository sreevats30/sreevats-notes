import React from 'react';
import { FileText, CheckCircle2, Zap, ArrowDown, Download, Eye } from 'lucide-react';
import { SITE_CONFIG } from '../config';

export function Hero({ 
  totalNotes = 0, 
  totalExamPapers = 0, 
  totalResources = 0, 
  totalPages = 0, 
  notesPages = 0, 
  examPages = 0, 
  totalSubjects = 0, 
  onExploreClick 
}) {
  const displayTotalResources = totalResources || (totalNotes + totalExamPapers);

  return (
    <section className="hero-section">
      <div className="container hero-container">

        {/* Main Heading */}
        <h1 className="hero-title">
          <span>Stop panicking and</span> <br />
          <span className="gradient-text-dual">study what actually matters</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Handwritten notes, formula sheets, slides, previous year questions. All organized here ;)
        </p>

        {/* Stat Badges Row */}
        <div className="hero-stats-row">
          <div className="stat-card">
            <span className="stat-number text-neon-cyan">{displayTotalResources}</span>
            <span className="stat-label">Notes &amp; PYQs</span>
            <div className="stat-split-pill mono">
              <span className="split-val cyan">{totalNotes}</span> <span className="split-text">Notes</span>
              <span className="split-sep">•</span>
              <span className="split-val red">{totalExamPapers}</span> <span className="split-text">PYQs</span>
            </div>
          </div>

          <div className="stat-card stat-card-highlight">
            <span className="stat-number gradient-text-red">{totalPages}+</span>
            <span className="stat-label">Total Pages</span>
            <div className="stat-split-pill mono">
              <span className="split-val cyan">{notesPages}</span> <span className="split-text">Notes</span>
              <span className="split-sep">•</span>
              <span className="split-val red">{examPages}</span> <span className="split-text">Exam Prep</span>
            </div>
          </div>

          <div className="stat-card">
            <span className="stat-number text-neon-cyan">{totalSubjects}</span>
            <span className="stat-label">Subjects</span>
            <div className="stat-split-pill mono">
              <span className="split-val cyan">100%</span> <span className="split-text">Syllabus</span>
            </div>
          </div>
        </div>

        {/* CTAs */}
        <div className="hero-actions">
          <button className="btn-neon-blue hero-btn" onClick={onExploreClick}>
            <Zap size={18} />
            <span>Browse Notes</span>
            <ArrowDown size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
