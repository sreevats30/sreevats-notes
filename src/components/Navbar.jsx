import React, { useState } from 'react';
import { BookOpen, Search, Calculator, Menu, X, Sparkles, GraduationCap, Heart } from 'lucide-react';
import { SITE_CONFIG } from '../config';

export function Navbar({ onOpenSearch, activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="navbar-wrapper">
      <div className="container navbar-container">
        {/* Brand */}
        <div 
          className="brand-logo" 
          onClick={() => { setActiveTab('notes'); setMobileMenuOpen(false); }}
          role="button"
          tabIndex={0}
        >
          <div className="logo-icon-box">
            <img 
              src="/phoenix-logo.jpg" 
              alt="Phoenix Logo" 
              className="logo-phoenix-img"
            />
          </div>
          <div className="brand-text-col">
            <span className="brand-title">{SITE_CONFIG.name}</span>
          </div>
        </div>

        {/* Desktop Nav Actions */}
        <nav className="desktop-nav">
          <button 
            className={`nav-link ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => setActiveTab('notes')}
          >
            <BookOpen size={16} />
            <span>Notes Library</span>
          </button>

          <button 
            className={`nav-link ${activeTab === 'examprep' ? 'active' : ''}`}
            onClick={() => setActiveTab('examprep')}
          >
            <GraduationCap size={16} />
            <span>Exam Prep</span>
          </button>

          <button 
            className={`nav-link ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculator')}
          >
            <Calculator size={16} />
            <span>CGPA Calculator</span>
          </button>

          <button 
            className={`nav-link ${activeTab === 'credits' ? 'active' : ''}`}
            onClick={() => setActiveTab('credits')}
          >
            <Heart size={16} />
            <span>Credits</span>
          </button>
        </nav>

        {/* Search trigger & Mobile toggle */}
        <div className="navbar-right">
          <button 
            className="search-trigger-btn"
            onClick={onOpenSearch}
            title="Quick search (Ctrl+K)"
          >
            <Search size={16} className="search-icon" />
            <span className="search-placeholder">Search notes, codes, units...</span>
            <kbd className="search-kbd">Ctrl+K</kbd>
          </button>

          <button 
            className="mobile-menu-btn" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <button 
            className={`mobile-nav-link ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => { setActiveTab('notes'); setMobileMenuOpen(false); }}
          >
            <BookOpen size={18} />
            <span>Notes Library</span>
          </button>

          <button 
            className={`mobile-nav-link ${activeTab === 'examprep' ? 'active' : ''}`}
            onClick={() => { setActiveTab('examprep'); setMobileMenuOpen(false); }}
          >
            <GraduationCap size={18} />
            <span>Exam Prep</span>
          </button>

          <button 
            className={`mobile-nav-link ${activeTab === 'calculator' ? 'active' : ''}`}
            onClick={() => { setActiveTab('calculator'); setMobileMenuOpen(false); }}
          >
            <Calculator size={18} />
            <span>CGPA / SGPA Calculator</span>
          </button>

          <button 
            className={`mobile-nav-link ${activeTab === 'credits' ? 'active' : ''}`}
            onClick={() => { setActiveTab('credits'); setMobileMenuOpen(false); }}
          >
            <Heart size={18} />
            <span>Credits</span>
          </button>

          <button 
            className="mobile-search-btn"
            onClick={() => { onOpenSearch(); setMobileMenuOpen(false); }}
          >
            <Search size={18} />
            <span>Search All Notes (Ctrl+K)</span>
          </button>
        </div>
      )}
    </header>
  );
}
