import React from 'react';
import { FileText, CheckCircle2, Zap, ArrowDown, Download, Eye } from 'lucide-react';
import { SITE_CONFIG } from '../config';

export function Hero({ totalNotes, totalPages, totalSubjects, onExploreClick }) {
  return (
    <section className="hero-section">
      <div className="container hero-container">

        {/* Main Heading */}
        <h1 className="hero-title">
          <span>Stop panicking before exams.</span> <br />
          <span className="gradient-text-dual">Ace with high-yield notes.</span>
        </h1>

        {/* Subtitle */}
        <p className="hero-subtitle">
          Clean handwritten summaries, formula cheat sheets, and verified previous year question 
          solutions—free to read in-browser or download directly.
        </p>

        {/* Stat Badges Row */}
        <div className="hero-stats-row">
          <div className="stat-card">
            <span className="stat-number text-neon-cyan">{totalNotes}</span>
            <span className="stat-label">Notes & PYQs</span>
          </div>

          <div className="stat-card">
            <span className="stat-number gradient-text-red">{totalPages}+</span>
            <span className="stat-label">Total Pages</span>
          </div>

          <div className="stat-card">
            <span className="stat-number text-neon-cyan">{totalSubjects}</span>
            <span className="stat-label">Subjects</span>
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
