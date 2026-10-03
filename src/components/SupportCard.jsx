import React, { useState, useEffect } from 'react';
import { Heart, QrCode, X, Coffee, Sparkles } from 'lucide-react';

export function QrModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ modal: 'qr-modal' }, '');

    const handlePopState = () => {
      onClose();
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
      if (window.history.state?.modal === 'qr-modal') {
        window.history.back();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="qr-modal-backdrop" onClick={onClose}>
      <div
        className="qr-modal-card glass-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="qr-modal-header">
          <div className="qr-modal-title-group">
            <Coffee size={18} className="text-neon-cyan" />
            <h3 className="qr-modal-title">Support Sreevats Notes</h3>
          </div>
          <button
            className="qr-modal-close-btn"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="qr-modal-body">
          <p className="qr-modal-desc">
            Scan using any UPI app
          </p>

          <div className="qr-image-wrapper">
            <img
              src="/qr.jpg"
              alt="UPI QR Code"
              className="qr-code-image"
              onError={(e) => {
                e.target.style.display = 'none';
                const fallback = document.getElementById('qr-fallback-msg');
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div id="qr-fallback-msg" className="qr-fallback-box" style={{ display: 'none' }}>
              <QrCode size={48} className="text-neon-cyan" />
              <p>Place your <code>qr.jpg</code> inside <code>public/qr.jpg</code></p>
            </div>
          </div>

          <div className="qr-modal-footer-note">
            <Sparkles size={14} className="text-neon-cyan" />
            <span>Every contribution keeps the domain and handwritten notes alive!</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SupportCard({ onOpenQr, className = '' }) {
  return (
    <div className={`support-banner-card ${className}`}>
      <div className="support-banner-left">
        <div className="support-banner-title-row">
          <span className="support-dot-indicator"></span>
          <h4 className="support-banner-title">Found these notes helpful?</h4>
        </div>
        <p className="support-banner-text">
          If these handwritten notes, formula sheets, or PYQ solutions helped you prepare for exams, consider contributing to keep the domain and resources updated.
        </p>
      </div>

      <div className="support-banner-right">
        <button
          className="support-upi-btn"
          onClick={onOpenQr}
        >
          <Coffee size={16} className="support-btn-icon" />
          <span>Support via UPI</span>
        </button>
      </div>
    </div>
  );
}
