import React, { useState, useEffect, useMemo } from 'react';
import rawNotesData from './data/notes.json';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SubjectFilter } from './components/SubjectFilter';
import { NoteCard } from './components/NoteCard';
import { SearchModal } from './components/SearchModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { CgpaCalculator } from './components/CgpaCalculator';
import { Footer } from './components/Footer';
import { BookOpen, Search, Sparkles, FilterX, HelpCircle, Layers, ArrowRight } from 'lucide-react';
import { getNoteTags } from './config';

export function App() {
  const [notes] = useState(rawNotesData);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' | 'calculator'
  
  // Filter states
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  // Modals
  const [searchOpen, setSearchOpen] = useState(false);
  const [previewNote, setPreviewNote] = useState(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const resetAllFilters = () => {
    setSelectedSubject('');
    setSelectedUnit('');
    setSelectedType('');
    setSelectedBranch('');
    setSelectedSemester('');
    setSelectedTag('');
    setSortBy('recent');
  };

  // Filter & sort notes
  const filteredNotes = useMemo(() => {
    let result = notes.filter(n => {
      if (selectedSubject && n.subject !== selectedSubject) return false;
      if (selectedUnit && n.unit !== selectedUnit) return false;
      if (selectedType && n.type !== selectedType) return false;
      if (selectedBranch && n.branch !== selectedBranch) return false;
      if (selectedSemester && n.semester !== Number(selectedSemester)) return false;
      if (selectedTag) {
        const noteTags = getNoteTags(n);
        if (!noteTags.includes(selectedTag)) return false;
      }
      return true;
    });

    // Sorting
    return result.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.addedOn || '2026-01-01') - new Date(a.addedOn || '2026-01-01');
      }
      if (sortBy === 'pages-high') {
        return (b.pages || 0) - (a.pages || 0);
      }
      if (sortBy === 'size-low') {
        return (a.sizeMB || 0) - (b.sizeMB || 0);
      }
      if (sortBy === 'title-az') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });
  }, [notes, selectedSubject, selectedUnit, selectedType, selectedBranch, selectedSemester, selectedTag, sortBy]);

  // Stats calculation
  const totalPages = useMemo(() => {
    return notes.reduce((acc, n) => acc + (n.pages || 0), 0);
  }, [notes]);

  const totalSubjects = useMemo(() => {
    return new Set(notes.map(n => n.subject)).size;
  }, [notes]);

  return (
    <div className="app-root">
      {/* Top Navbar */}
      <Navbar
        onOpenSearch={() => setSearchOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="main-content-flow">
        {activeTab === 'notes' ? (
          <>
            {/* Hero Section */}
            <Hero
              totalNotes={notes.length}
              totalPages={totalPages}
              totalSubjects={totalSubjects}
              onExploreClick={() => {
                const el = document.getElementById('notes-explorer-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            {/* Notes Explorer Section */}
            <section id="notes-explorer-section" className="container notes-explorer-section">
              {/* Cascading Filter Matrix */}
              <SubjectFilter
                notes={notes}
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
                selectedUnit={selectedUnit}
                setSelectedUnit={setSelectedUnit}
                selectedType={selectedType}
                setSelectedType={setSelectedType}
                selectedBranch={selectedBranch}
                setSelectedBranch={setSelectedBranch}
                selectedSemester={selectedSemester}
                setSelectedSemester={setSelectedSemester}
                selectedTag={selectedTag}
                setSelectedTag={setSelectedTag}
                sortBy={sortBy}
                setSortBy={setSortBy}
                onResetFilters={resetAllFilters}
              />

              {/* Notes Grid Header */}
              <div className="notes-grid-header">
                <div className="grid-count-info">
                  <span className="showing-text">Showing</span>
                  <span className="count-number mono text-neon-cyan">{filteredNotes.length}</span>
                  <span className="showing-text">of {notes.length} notes</span>
                  {selectedSubject && (
                    <span className="active-subj-tag">in {selectedSubject}</span>
                  )}
                  {selectedTag && (
                    <span className="active-subj-tag">#{selectedTag}</span>
                  )}
                </div>

                <div className="quick-help-pill mono">
                  <Sparkles size={13} className="text-neon-cyan" />
                  <span>Preview in-browser or download copy</span>
                </div>
              </div>

              {/* Notes Cards Grid */}
              {filteredNotes.length === 0 ? (
                <div className="no-notes-box glass-panel">
                  <FilterX size={44} className="text-neon-red" />
                  <h3>No notes match your current filters</h3>
                  <p>Try clearing your Unit or Type filter to see all notes for this subject.</p>
                  <button className="btn-neon-blue" onClick={resetAllFilters} style={{ marginTop: '16px' }}>
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="notes-cards-grid">
                  {filteredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onPreview={(n) => setPreviewNote(n)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          /* CGPA Calculator Tab */
          <div className="tab-pane-fade">
            <CgpaCalculator />
          </div>
        )}
      </main>

      {/* Global Command Palette / Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        notes={notes}
        onSelectNote={(note) => setPreviewNote(note)}
      />

      {/* In-Browser PDF.js Canvas Viewer Modal */}
      <PdfViewerModal
        note={previewNote}
        isOpen={Boolean(previewNote)}
        onClose={() => setPreviewNote(null)}
      />

      {/* Site Footer */}
      <Footer />
    </div>
  );
}

export default App;
