import React, { useState, useMemo } from 'react';
import { Calculator, Plus, Trash2, RotateCcw, Award, BookOpen, Sparkles, Check, TrendingUp } from 'lucide-react';

const GRADE_POINTS = [
  { grade: 'S', points: 10, marks: '90 - 100%', label: 'Outstanding (10)' },
  { grade: 'A', points: 9, marks: '80 - 89%', label: 'Excellent (9)' },
  { grade: 'B', points: 8, marks: '70 - 79%', label: 'Very Good (8)' },
  { grade: 'C', points: 7, marks: '60 - 69%', label: 'Good (7)' },
  { grade: 'D', points: 6, marks: '50 - 59%', label: 'Above Average (6)' },
  { grade: 'E', points: 5, marks: '40 - 49%', label: 'Pass (5)' },
  { grade: 'F', points: 0, marks: '< 40%', label: 'Fail (0)' },
];

const INITIAL_SEMESTERS = [
  { sem: 1, sgpa: '8.60', credits: 24 },
  { sem: 2, sgpa: '8.80', credits: 24 },
  { sem: 3, sgpa: '', credits: 24 },
  { sem: 4, sgpa: '', credits: 24 },
  { sem: 5, sgpa: '', credits: 24 },
  { sem: 6, sgpa: '', credits: 24 },
  { sem: 7, sgpa: '', credits: 24 },
  { sem: 8, sgpa: '', credits: 24 },
];

// Default courses: two 5-credit, three 4-credit, one 2-credit
const DEFAULT_COURSES = [
  { id: 1, name: 'Subject 1', credits: 5, grade: 'S' },
  { id: 2, name: 'Subject 2', credits: 5, grade: 'A' },
  { id: 3, name: 'Subject 3', credits: 4, grade: 'A' },
  { id: 4, name: 'Subject 4', credits: 4, grade: 'B' },
  { id: 5, name: 'Subject 5', credits: 4, grade: 'B' },
  { id: 6, name: 'Subject 6', credits: 2, grade: 'S' },
];

export function CgpaCalculator() {
  const [calcMode, setCalcMode] = useState('sgpa'); // 'sgpa' | 'cgpa' | 'guide'

  // ==========================================
  // 1. SGPA (Single Semester) Calculator State
  // ==========================================
  const [courses, setCourses] = useState(DEFAULT_COURSES);

  const { totalSgpaCredits, totalSgpaPoints, computedSgpa } = useMemo(() => {
    let creds = 0;
    let points = 0;
    courses.forEach(c => {
      const cCredits = Number(c.credits) || 0;
      const gObj = GRADE_POINTS.find(g => g.grade === c.grade);
      const cPoints = gObj ? gObj.points : 0;
      creds += cCredits;
      points += cCredits * cPoints;
    });
    const calculated = creds > 0 ? (points / creds).toFixed(2) : '0.00';
    return { totalSgpaCredits: creds, totalSgpaPoints: points, computedSgpa: calculated };
  }, [courses]);

  const addCourse = () => {
    const nextId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;
    setCourses([...courses, { id: nextId, name: `Subject ${nextId}`, credits: 4, grade: 'A' }]);
  };

  const removeCourse = (id) => {
    if (courses.length <= 1) return;
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id, field, value) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const resetCourses = () => {
    setCourses(DEFAULT_COURSES);
  };

  // ==========================================
  // 2. CGPA (Semester-by-Semester) Calculator
  // ==========================================
  const [semesters, setSemesters] = useState(INITIAL_SEMESTERS);

  const updateSemester = (semIndex, field, value) => {
    setSemesters(prev => {
      const next = [...prev];
      next[semIndex] = { ...next[semIndex], [field]: value };
      return next;
    });
  };

  const resetSemesters = () => {
    setSemesters(INITIAL_SEMESTERS);
  };

  const clearAllSemesters = () => {
    setSemesters(prev => prev.map(s => ({ ...s, sgpa: '' })));
  };

  // CGPA calculation: sum(credits * sgpa) / sum(credits) for completed semesters
  const { completedCredits, completedPoints, computedCgpa, completedCount } = useMemo(() => {
    let creds = 0;
    let points = 0;
    let count = 0;

    semesters.forEach(s => {
      const semCredits = parseFloat(s.credits) || 0;
      const semSgpa = parseFloat(s.sgpa);

      if (!isNaN(semSgpa) && semSgpa > 0 && semCredits > 0) {
        creds += semCredits;
        points += semSgpa * semCredits;
        count++;
      }
    });

    const cgpa = creds > 0 ? (points / creds).toFixed(2) : '0.00';
    return {
      completedCredits: creds,
      completedPoints: points,
      computedCgpa: cgpa,
      completedCount: count
    };
  }, [semesters]);

  return (
    <div className="calculator-section container">
      {/* Top Header */}
      <div className="calculator-header-box">
        <div className="badge-neon-blue inline-flex-badge">
          <Calculator size={14} />
          <span>Academic Performance & GPA System</span>
        </div>
        <h2 className="calc-main-title">
          <span>University </span>
          <span className="gradient-text-blue">CGPA & SGPA</span>
          <span> Calculator</span>
        </h2>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="calc-tabs-row">
        <button
          className={`calc-mode-btn ${calcMode === 'sgpa' ? 'active-mode' : ''}`}
          onClick={() => setCalcMode('sgpa')}
        >
          <Award size={16} />
          <span>Single Semester - SGPA Calculator</span>
        </button>

        <button
          className={`calc-mode-btn ${calcMode === 'cgpa' ? 'active-mode' : ''}`}
          onClick={() => setCalcMode('cgpa')}
        >
          <TrendingUp size={16} />
          <span>Semester-wise CGPA Calculator</span>
        </button>

        <button
          className={`calc-mode-btn ${calcMode === 'guide' ? 'active-mode' : ''}`}
          onClick={() => setCalcMode('guide')}
        >
          <BookOpen size={16} />
          <span>Grading Scale & Formulas</span>
        </button>
      </div>

      {/* TAB 1: SGPA Calculator (Single Semester by Course) */}
      {calcMode === 'sgpa' && (
        <div className="calculator-grid-layout">
          {/* Left Column: Course Rows */}
          <div className="calc-left-col glass-panel">
            <div className="calc-panel-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Semester Courses & Grades</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Default workload: two 5-credit, three 4-credit, and one 2-credit courses (24 credits total).
                </p>
              </div>
              <button className="reset-calc-btn" onClick={resetCourses} title="Reset to default courses">
                <RotateCcw size={14} />
                <span>Reset</span>
              </button>
            </div>

            {/* Courses Table */}
            <div className="courses-table-container">
              <div className="courses-table-head mono">
                <span>Course Name</span>
                <span>Credits</span>
                <span>Grade</span>
                <span></span>
              </div>

              <div className="courses-table-body">
                {courses.map((course) => (
                  <div key={course.id} className="course-input-row">
                    <input
                      type="text"
                      className="course-name-input"
                      value={course.name}
                      placeholder="e.g. Mathematics"
                      onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                    />

                    <select
                      className="course-credits-select mono"
                      value={course.credits}
                      onChange={(e) => updateCourse(course.id, 'credits', Number(e.target.value))}
                    >
                      {[1, 2, 3, 4, 5, 6].map(cr => (
                        <option key={cr} value={cr}>{cr} Credits</option>
                      ))}
                    </select>

                    <select
                      className="course-grade-select mono"
                      value={course.grade}
                      onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                    >
                      {GRADE_POINTS.map(g => (
                        <option key={g.grade} value={g.grade}>
                          Grade {g.grade} ({g.points} pts)
                        </option>
                      ))}
                    </select>

                    <button
                      className="remove-course-btn"
                      onClick={() => removeCourse(course.id)}
                      disabled={courses.length <= 1}
                      title="Remove course"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>

              <button className="add-course-btn" onClick={addCourse}>
                <Plus size={16} />
                <span>Add Another Subject</span>
              </button>
            </div>
          </div>

          {/* Right Column: SGPA Score Display */}
          <div className="calc-right-col">
            <div className="score-summary-card glass-panel">
              <span className="score-label-sub">Semester SGPA Score</span>
              <div className="huge-score-display mono gradient-text-dual">
                {computedSgpa}
                <span className="score-denominator"> / 10.0</span>
              </div>

              <div className="score-breakdown-row mono" style={{ marginBottom: 0 }}>
                <div className="breakdown-stat">
                  <span className="stat-name">Total Credits:</span>
                  <span className="stat-val text-neon-cyan">{totalSgpaCredits}</span>
                </div>
                <div className="breakdown-stat">
                  <span className="stat-name">Grade Points:</span>
                  <span className="stat-val text-neon-red">{totalSgpaPoints}</span>
                </div>
              </div>
            </div>

            {/* Grading Scale Legend */}
            <div className="grading-scale-legend glass-panel">
              <span className="legend-title mono">Grade Points Breakdown</span>
              <div className="legend-grid mono">
                {GRADE_POINTS.map(g => (
                  <div key={g.grade} className="legend-item">
                    <span className="legend-grade" style={{ fontWeight: 700, color: g.points >= 9 ? 'var(--neon-blue)' : g.points >= 7 ? '#34d399' : 'var(--text-main)' }}>
                      Grade {g.grade}
                    </span>
                    <span className="legend-pts">{g.points} pts ({g.marks})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CGPA Calculator (Semester-by-Semester like PESU-pedia) */}
      {calcMode === 'cgpa' && (
        <div className="calculator-grid-layout">
          {/* Left Column: Semester Table */}
          <div className="calc-left-col glass-panel">
            <div className="calc-panel-header">
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Semester Performance Breakdown</h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Enter your SGPA for the semesters you've finished. Leave upcoming semesters blank.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="reset-calc-btn" onClick={clearAllSemesters} title="Clear all SGPA values">
                  <span>Clear</span>
                </button>
                <button className="reset-calc-btn" onClick={resetSemesters} title="Reset to sample values">
                  <RotateCcw size={13} />
                  <span>Sample</span>
                </button>
              </div>
            </div>

            {/* Semester Table */}
            <div className="semesters-table-container">
              <div className="semesters-table-head mono">
                <span>Semester</span>
                <span>SGPA (0 - 10)</span>
                <span>Credits</span>
                <span>Status</span>
              </div>

              <div className="semesters-table-body">
                {semesters.map((s, idx) => {
                  const isFilled = parseFloat(s.sgpa) > 0;
                  return (
                    <div key={s.sem} className={`semester-input-row ${isFilled ? 'row-active' : ''}`}>
                      <div className="sem-label mono">
                        <span className="sem-number-pill">Sem {s.sem}</span>
                      </div>

                      <div className="sem-sgpa-wrapper">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="10"
                          placeholder="e.g. 8.75"
                          className="sem-sgpa-input mono"
                          value={s.sgpa}
                          onChange={(e) => updateSemester(idx, 'sgpa', e.target.value)}
                        />
                      </div>

                      <div className="sem-credits-wrapper">
                        <select
                          className="sem-credits-select mono"
                          value={s.credits}
                          onChange={(e) => updateSemester(idx, 'credits', Number(e.target.value))}
                        >
                          {[16, 18, 20, 21, 22, 23, 24, 25, 26, 28].map(cr => (
                            <option key={cr} value={cr}>{cr} Cr</option>
                          ))}
                        </select>
                      </div>

                      <div className="sem-status-cell mono">
                        {isFilled ? (
                          <span className="status-badge-done">
                            <Check size={12} />
                            <span>{(parseFloat(s.sgpa) * s.credits).toFixed(0)} pts</span>
                          </span>
                        ) : (
                          <span className="status-badge-pending">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: CGPA Score Display */}
          <div className="calc-right-col">
            <div className="score-summary-card glass-panel">
              <span className="score-label-sub">CGPA</span>
              <div className="huge-score-display mono gradient-text-dual">
                {computedCgpa}
                <span className="score-denominator"> / 10.0</span>
              </div>
            </div>

            {/* Quick Helper / Info Card */}
            <div className="glass-panel" style={{ padding: '18px 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--neon-cyan)', fontWeight: 700, marginBottom: '8px' }}>
                <Sparkles size={15} />
                <span>How CGPA is Calculated</span>
              </div>
              <p style={{ lineHeight: 1.5, margin: 0 }}>
                CGPA is the weighted average of your semester SGPAs weighted by the credits of each semester:
              </p>
              <div className="mono" style={{ background: 'rgba(0,0,0,0.4)', padding: '8px 12px', borderRadius: '6px', margin: '10px 0', fontSize: '0.78rem', color: 'var(--neon-blue)' }}>
                CGPA = Σ(SGPA × Sem Credits) / Σ(Total Credits)
              </div>
              <p style={{ fontSize: '0.78rem', margin: 0, color: 'var(--text-dim)' }}>
                Standard B.Tech degree requires <strong>160 credits</strong> across 8 semesters.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Academic Guide & Explanation (PESU-pedia style) */}
      {calcMode === 'guide' && (
        <div className="glass-panel" style={{ padding: '36px 32px' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '16px' }} className="gradient-text-blue">
              How the University GPA & Credit System Works
            </h3>

            <section style={{ marginBottom: '28px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                1. The 160-Credit Degree Rule
              </h4>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.92rem' }}>
                To obtain your B.Tech engineering degree, you must earn a minimum of <strong>160 credits</strong> across 4 years (8 semesters). Credits act as weights that determine the relative importance of each subject.
              </p>
            </section>

            <section style={{ marginBottom: '28px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                2. Grading Scale Table
              </h4>
              <div style={{ overflowX: 'auto', margin: '14px 0' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }} className="mono">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.06)', borderBottom: '1px solid var(--border-subtle)', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px' }}>Letter Grade</th>
                      <th style={{ padding: '10px 14px' }}>Grade Points</th>
                      <th style={{ padding: '10px 14px' }}>Raw Marks Band</th>
                      <th style={{ padding: '10px 14px' }}>Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {GRADE_POINTS.map((g, i) => (
                      <tr key={g.grade} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                        <td style={{ padding: '10px 14px', fontWeight: 700, color: 'var(--neon-blue)' }}>Grade {g.grade}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--neon-cyan)' }}>{g.points}.0</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{g.marks}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-main)' }}>{g.label.split('(')[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>
                3. The Math Formulas
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }} className="mono">
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--neon-cyan)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Semester SGPA:</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: 0 }}>
                    SGPA = Σ(Credits_course × Grade_course) / Σ(Credits_course)
                  </p>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.4)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ color: 'var(--neon-red)', fontWeight: 700, display: 'block', marginBottom: '6px' }}>Cumulative CGPA:</span>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', margin: 0 }}>
                    CGPA = Σ(Sem_Credits × Sem_SGPA) / Σ(Total_Credits)
                  </p>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

export default CgpaCalculator;
