import React, { useState } from 'react';
import { BookOpen, Search, Calculator, Menu, X, Sparkles, GraduationCap, Heart } from 'lucide-react';
import { SITE_CONFIG } from '../config';

export function Navbar({ onOpenSearch, activeTab, setActiveTab }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className="navbar-wrapper">
        <div className="container navbar-container">
          {/* Brand */}
          <div className="brand-logo">
            <a 
              href="https://en.wikipedia.org/wiki/Phoenix_(mythology)" 
              target="_blank" 
              rel="noopener noreferrer"
              className="logo-icon-box"
              title="Phoenix (mythology) - Wikipedia"
              onClick={(e) => e.stopPropagation()}
            >
              <img 
                src="/phoenix-logo.jpg" 
                alt="Phoenix Logo" 
                className="logo-phoenix-img"
              />
            </a>
            <div 
              className="brand-text-col"
              onClick={() => handleTabSwitch('notes')}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
            >
              <span className="brand-title">{SITE_CONFIG.name}</span>
            </div>
          </div>

          {/* Desktop Nav Actions */}
          <nav className="desktop-nav">
            <button 
              className={`nav-link ${activeTab === 'notes' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('notes')}
            >
              <BookOpen size={16} />
              <span>Notes Library</span>
            </button>

            <button 
              className={`nav-link ${activeTab === 'examprep' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('examprep')}
            >
              <GraduationCap size={16} />
              <span>Exam Prep</span>
            </button>

            <button 
              className={`nav-link ${activeTab === 'calculator' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('calculator')}
            >
              <Calculator size={16} />
              <span>CGPA Calculator</span>
            </button>

            <button 
              className={`nav-link ${activeTab === 'credits' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('credits')}
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
              onClick={() => handleTabSwitch('notes')}
            >
              <BookOpen size={18} />
              <span>Notes Library</span>
            </button>

            <button 
              className={`mobile-nav-link ${activeTab === 'examprep' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('examprep')}
            >
              <GraduationCap size={18} />
              <span>Exam Prep & PYQs</span>
            </button>

            <button 
              className={`mobile-nav-link ${activeTab === 'calculator' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('calculator')}
            >
              <Calculator size={18} />
              <span>CGPA / SGPA Calculator</span>
            </button>

            <button 
              className={`mobile-nav-link ${activeTab === 'credits' ? 'active' : ''}`}
              onClick={() => handleTabSwitch('credits')}
            >
              <Heart size={18} />
              <span>Credits & Contributors</span>
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

      {/* Mobile Bottom Navigation Bar */}
      <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
        <button 
          className={`mobile-bottom-item ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('notes')}
        >
          <BookOpen size={20} className="bottom-nav-icon" />
          <span className="bottom-nav-label">Notes</span>
        </button>

        <button 
          className={`mobile-bottom-item ${activeTab === 'examprep' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('examprep')}
        >
          <GraduationCap size={20} className="bottom-nav-icon" />
          <span className="bottom-nav-label">Exam Prep</span>
        </button>

        <button 
          className={`mobile-bottom-item ${activeTab === 'calculator' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('calculator')}
        >
          <Calculator size={20} className="bottom-nav-icon" />
          <span className="bottom-nav-label">CGPA</span>
        </button>

        <button 
          className={`mobile-bottom-item ${activeTab === 'credits' ? 'active' : ''}`}
          onClick={() => handleTabSwitch('credits')}
        >
          <Heart size={20} className="bottom-nav-icon" />
          <span className="bottom-nav-label">Credits</span>
        </button>
      </nav>
    </>
  );
}
