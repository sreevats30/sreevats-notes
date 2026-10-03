import React, { useState } from 'react';
import { Sparkles, Heart, Instagram, Linkedin, ExternalLink, GraduationCap, Clock } from 'lucide-react';
import { contributors, IS_COMING_SOON } from '../data/credits';
import { SupportCard, QrModal } from './SupportCard';

export function Credits() {
  const [qrOpen, setQrOpen] = useState(false);

  // Format social URLs safely
  const getInstagramUrl = (handleOrUrl) => {
    if (!handleOrUrl) return null;
    if (handleOrUrl.startsWith('http')) return handleOrUrl;
    const clean = handleOrUrl.replace(/^@/, '').trim();
    return `https://instagram.com/${clean}`;
  };

  const getLinkedInUrl = (handleOrUrl) => {
    if (!handleOrUrl) return null;
    if (handleOrUrl.startsWith('http')) return handleOrUrl;
    const clean = handleOrUrl.replace(/^@/, '').trim();
    return `https://linkedin.com/in/${clean}`;
  };

  return (
    <section className="container credits-section">
      {/* Header Banner */}
      <div className="credits-header">
        <div className="credits-pill-badge">
          <Heart size={14} className="text-neon-red" />
          <span className="mono">COMMUNITY • CONTRIBUTORS</span>
        </div>

        <h2 className="credits-main-title">
          Credits &amp; <span className="gradient-text-dual">Contributors</span>
        </h2>
      </div>

      {/* Support / Tip Banner */}
      <SupportCard 
        onOpenQr={() => setQrOpen(true)} 
        className="credits-support-wrap"
      />

      {/* QR Modal */}
      <QrModal 
        isOpen={qrOpen} 
        onClose={() => setQrOpen(false)} 
      />

      {IS_COMING_SOON || contributors.length === 0 ? (
        /* Hidden / Under Update State */
        <div className="credits-updating-box glass-panel">
          <div className="updating-icon-wrap">
            <Clock size={44} className="text-neon-cyan animate-pulse" />
          </div>

          <h3 className="updating-title">To Be Updated</h3>

          <p className="updating-desc">
            Contributor profiles, branch details, and social links are currently being curated and will be updated here soon.
          </p>

          <div className="updating-pill mono">
            <Sparkles size={14} className="text-neon-cyan" />
            <span>Stay tuned for upcoming updates</span>
          </div>
        </div>
      ) : (
        /* Active Contributors Grid */
        <div className="credits-grid">
          {contributors.map((person) => {
            const igUrl = getInstagramUrl(person.instagram);
            const liUrl = getLinkedInUrl(person.linkedin);

            return (
              <div key={person.id} className="contributor-card glass-panel">
                {/* Top Accent Glow Bar */}
                <div className="card-top-accent"></div>

                {/* Avatar Box */}
                <div className="contributor-avatar-wrap">
                  {person.image ? (
                    <img
                      src={person.image}
                      alt={person.name}
                      className="contributor-avatar-img"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="contributor-avatar-fallback mono"
                    style={{ display: person.image ? 'none' : 'flex' }}
                  >
                    {person.name
                      ? person.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                      : 'NS'}
                  </div>
                </div>

                {/* Info Column */}
                <div className="contributor-info">
                  <h3 className="contributor-name">{person.name}</h3>

                  <div className="contributor-tags-row">
                    {person.branch && (
                      <span className="branch-badge mono">
                        <GraduationCap size={13} />
                        <span>{person.branch}</span>
                      </span>
                    )}
                    {person.role && (
                      <span className="role-badge mono">{person.role}</span>
                    )}
                  </div>

                  {person.bio && (
                    <p className="contributor-bio">{person.bio}</p>
                  )}
                </div>

                {/* Social Buttons */}
                <div className="contributor-socials">
                  {igUrl && (
                    <a
                      href={igUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn instagram-btn"
                      title={`Instagram: ${person.instagram}`}
                    >
                      <Instagram size={16} />
                      <span>Instagram</span>
                      <ExternalLink size={12} className="ext-icon" />
                    </a>
                  )}

                  {liUrl && (
                    <a
                      href={liUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-btn linkedin-btn"
                      title={`LinkedIn: ${person.linkedin}`}
                    >
                      <Linkedin size={16} />
                      <span>LinkedIn</span>
                      <ExternalLink size={12} className="ext-icon" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Credits;
