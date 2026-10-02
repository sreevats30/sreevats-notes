import React from 'react';
import { BookOpen, Heart, Shield, Mail, ArrowUp } from 'lucide-react';
import { SITE_CONFIG } from '../config';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="site-footer">
      <div className="container footer-container">
        <div className="footer-top-grid">
          {/* Brand Col */}
          <div className="footer-brand-col">
            <div className="footer-brand-header">
              <BookOpen size={20} className="text-neon-cyan" />
              <span className="footer-brand-name">{SITE_CONFIG.name}</span>
            </div>
            <p className="footer-tagline">
              Curated handwritten notes, derivations, and exam blueprints. Built to help students study smarter and master engineering exams.
            </p>
            <span className="footer-author-pill mono">
              Created & maintained by <strong>{SITE_CONFIG.author}</strong>
            </span>
          </div>

          {/* Quick Disclaimer & Legal Col */}
          <div className="footer-legal-col">
            <div className="legal-header">
              <Shield size={16} className="text-neon-red" />
              <span>Academic Integrity & Takedown</span>
            </div>
            <p className="legal-text">
              All notes uploaded here are original student-created study summaries, derivations, and open educational solutions. No copyrighted textbooks or paid course materials are hosted.
            </p>
            <p className="takedown-text">
              If you have any feedback or notice any material needing attribution/removal, please contact: <span className="mono text-neon-cyan">{SITE_CONFIG.contactEmail}</span>
            </p>
          </div>
        </div>

        {/* Bottom row */}
        <div className="footer-bottom-row">
          <div className="copyright-text">
            © {new Date().getFullYear()} {SITE_CONFIG.name} • 100% Free Educational Resource
          </div>

          <button className="scroll-top-btn" onClick={scrollToTop} title="Scroll to top">
            <span>Back to top</span>
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}
