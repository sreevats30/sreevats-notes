import React from 'react';
import { Filter, X, Sparkles, BookOpen, Layers, Check, SlidersHorizontal } from 'lucide-react';

export function SubjectFilter({
  notes,
  selectedSubject,
  setSelectedSubject,
  selectedUnit,
  setSelectedUnit,
  selectedType,
  setSelectedType,
  selectedBranch,
  setSelectedBranch,
  selectedSemester,
  setSelectedSemester,
  sortBy,
  setSortBy,
  onResetFilters
}) {
  // Extract dynamic subject options and counts
  const subjectsWithCounts = React.useMemo(() => {
    const counts = {};
    notes.forEach(n => {
      counts[n.subject] = (counts[n.subject] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  // Extract units for selected subject (or all if none selected)
  const availableUnits = React.useMemo(() => {
    const list = selectedSubject 
      ? notes.filter(n => n.subject === selectedSubject)
      : notes;
    const units = Array.from(new Set(list.map(n => n.unit).filter(Boolean)));
    // Sort logically: Unit 1, Unit 2, Formula Sheet, PYQ
    return units.sort((a, b) => {
      if (a.startsWith('Unit') && b.startsWith('Unit')) return a.localeCompare(b);
      if (a.startsWith('Unit')) return -1;
      if (b.startsWith('Unit')) return 1;
      return a.localeCompare(b);
    });
  }, [notes, selectedSubject]);

  // Extract types
  const availableTypes = React.useMemo(() => {
    return Array.from(new Set(notes.map(n => n.type).filter(Boolean)));
  }, [notes]);

  // Check optional fields: branch & semester
  const availableBranches = React.useMemo(() => {
    const branches = Array.from(new Set(notes.map(n => n.branch).filter(Boolean)));
    return branches;
  }, [notes]);

  const availableSemesters = React.useMemo(() => {
    const sems = Array.from(new Set(notes.map(n => n.semester).filter(Boolean)));
    return sems.sort((a, b) => a - b);
  }, [notes]);

  const hasActiveFilters = Boolean(
    selectedSubject || selectedUnit || selectedType || selectedBranch || selectedSemester
  );

  return (
    <div className="filter-matrix-wrapper glass-panel">
      {/* Top Filter Header */}
      <div className="filter-header-bar">
        <div className="filter-title-group">
          <SlidersHorizontal size={18} className="text-neon-cyan" />
          <h2 className="filter-heading">Browse by Subject & Unit</h2>
          {hasActiveFilters && (
            <span className="active-filter-indicator">Filtered</span>
          )}
        </div>

        <div className="filter-sort-group">
          <label htmlFor="sort-select" className="sort-label">Sort by:</label>
          <select 
            id="sort-select"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-dropdown mono"
          >
            <option value="recent">Recently Added</option>
            <option value="pages-high">Pages (High → Low)</option>
            <option value="size-low">File Size (Smallest)</option>
            <option value="title-az">Title (A → Z)</option>
          </select>

          {hasActiveFilters && (
            <button className="reset-filter-btn" onClick={onResetFilters} title="Reset all filters">
              <X size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Optional Branch & Semester Pills (only shown if present in notes) */}
      {(availableBranches.length > 0 || availableSemesters.length > 0) && (
        <div className="optional-filters-row">
          {availableBranches.length > 0 && (
            <div className="sub-filter-group">
              <span className="sub-filter-label">Branch:</span>
              <button 
                className={`pill-btn ${!selectedBranch ? 'active' : ''}`}
                onClick={() => setSelectedBranch('')}
              >
                All
              </button>
              {availableBranches.map(b => (
                <button
                  key={b}
                  className={`pill-btn ${selectedBranch === b ? 'active' : ''}`}
                  onClick={() => setSelectedBranch(selectedBranch === b ? '' : b)}
                >
                  {b}
                </button>
              ))}
            </div>
          )}

          {availableSemesters.length > 0 && (
            <div className="sub-filter-group">
              <span className="sub-filter-label">Semester:</span>
              <button 
                className={`pill-btn ${!selectedSemester ? 'active' : ''}`}
                onClick={() => setSelectedSemester('')}
              >
                All
              </button>
              {availableSemesters.map(sem => (
                <button
                  key={sem}
                  className={`pill-btn ${selectedSemester === sem ? 'active' : ''}`}
                  onClick={() => setSelectedSemester(selectedSemester === sem ? '' : sem)}
                >
                  Sem {sem}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Primary Subjects Horizontal Scroll / Pills */}
      <div className="subjects-pills-row">
        <button
          className={`subject-pill-btn ${!selectedSubject ? 'active' : ''}`}
          onClick={() => { setSelectedSubject(''); setSelectedUnit(''); }}
        >
          <BookOpen size={15} />
          <span>All Subjects</span>
          <span className="pill-count">{notes.length}</span>
        </button>

        {subjectsWithCounts.map(([subj, count]) => {
          const isSelected = selectedSubject === subj;
          return (
            <button
              key={subj}
              className={`subject-pill-btn ${isSelected ? 'active' : ''}`}
              onClick={() => {
                if (isSelected) {
                  setSelectedSubject('');
                  setSelectedUnit('');
                } else {
                  setSelectedSubject(subj);
                  setSelectedUnit('');
                }
              }}
            >
              <span>{subj}</span>
              <span className="pill-count">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Secondary Cascading: Units & Type filter */}
      <div className="secondary-filters-bar">
        {/* Units / Note categories */}
        <div className="unit-filter-scroll">
          <span className="unit-scroll-label">Unit/Topic:</span>
          <button
            className={`unit-pill-btn ${!selectedUnit ? 'active' : ''}`}
            onClick={() => setSelectedUnit('')}
          >
            All Units
          </button>
          {availableUnits.map(unit => {
            const isRed = /pyq|formula/i.test(unit);
            return (
              <button
                key={unit}
                className={`unit-pill-btn ${selectedUnit === unit ? 'active' : ''} ${isRed ? 'pill-red-highlight' : ''}`}
                onClick={() => setSelectedUnit(selectedUnit === unit ? '' : unit)}
              >
                {unit}
              </button>
            );
          })}
        </div>

        {/* Note format types */}
        <div className="type-filter-group">
          <span className="unit-scroll-label">Type:</span>
          {availableTypes.map(type => (
            <button
              key={type}
              className={`type-pill-btn ${selectedType === type ? 'active' : ''}`}
              onClick={() => setSelectedType(selectedType === type ? '' : type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
