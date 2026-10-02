import React, { useState } from 'react';
import { Calculator, Plus, Trash2, RotateCcw, Award, CheckCircle, HelpCircle, TrendingUp } from 'lucide-react';

const GRADE_POINTS = [
  { grade: 'S', points: 10, label: 'Outstanding (10)' },
  { grade: 'A', points: 9, label: 'Excellent (9)' },
  { grade: 'B', points: 8, label: 'Very Good (8)' },
  { grade: 'C', points: 7, label: 'Good (7)' },
  { grade: 'D', points: 6, label: 'Above Average (6)' },
  { grade: 'E', points: 5, label: 'Average / Pass (5)' },
  { grade: 'F', points: 0, label: 'Fail (0)' },
];

export function CgpaCalculator() {
  const [calcMode, setCalcMode] = useState('sgpa'); // 'sgpa' | 'cgpa'
  
  // SGPA Course rows
  const [courses, setCourses] = useState([
    { id: 1, name: 'Core Subject 1', credits: 4, grade: 'S' },
    { id: 2, name: 'Core Subject 2', credits: 4, grade: 'A' },
    { id: 3, name: 'Department Elective', credits: 3, grade: 'A' },
    { id: 4, name: 'Math / Analytics', credits: 3, grade: 'B' },
    { id: 5, name: 'Laboratory 1', credits: 2, grade: 'S' },
  ]);

  // CGPA Accumulator fields
  const [prevCgpa, setPrevCgpa] = useState('8.50');
  const [prevCredits, setPrevCredits] = useState('40');
  const [targetCgpa, setTargetCgpa] = useState('9.00');
  const [remainingCredits, setRemainingCredits] = useState('20');

  // Compute SGPA
  const { totalCredits, totalPoints, sgpa } = React.useMemo(() => {
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
    return { totalCredits: creds, totalPoints: points, sgpa: calculated };
  }, [courses]);

  // Compute CGPA
  const combinedCgpa = React.useMemo(() => {
    const pC = parseFloat(prevCgpa) || 0;
    const pCreds = parseFloat(prevCredits) || 0;
    const curSgpa = parseFloat(sgpa) || 0;
    const curCreds = totalCredits;

    const totalCredsAll = pCreds + curCreds;
    if (totalCredsAll === 0) return '0.00';

    const grandPoints = (pC * pCreds) + (curSgpa * curCreds);
    return (grandPoints / totalCredsAll).toFixed(2);
  }, [prevCgpa, prevCredits, sgpa, totalCredits]);

  // Target SGPA needed
  const requiredSgpaForTarget = React.useMemo(() => {
    const pC = parseFloat(prevCgpa) || 0;
    const pCreds = parseFloat(prevCredits) || 0;
    const target = parseFloat(targetCgpa) || 0;
    const remCreds = parseFloat(remainingCredits) || 0;

    if (remCreds <= 0) return null;
    const targetTotalPoints = target * (pCreds + remCreds);
    const neededPoints = targetTotalPoints - (pC * pCreds);
    const neededSgpa = neededPoints / remCreds;
    return neededSgpa.toFixed(2);
  }, [prevCgpa, prevCredits, targetCgpa, remainingCredits]);

  const addCourse = () => {
    const nextId = courses.length > 0 ? Math.max(...courses.map(c => c.id)) + 1 : 1;
    setCourses([...courses, { id: nextId, name: `Course ${nextId}`, credits: 3, grade: 'A' }]);
  };

  const removeCourse = (id) => {
    if (courses.length <= 1) return;
    setCourses(courses.filter(c => c.id !== id));
  };

  const updateCourse = (id, field, value) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const resetCourses = () => {
    setCourses([
      { id: 1, name: 'Subject 1', credits: 4, grade: 'S' },
      { id: 2, name: 'Subject 2', credits: 4, grade: 'A' },
      { id: 3, name: 'Subject 3', credits: 3, grade: 'A' },
      { id: 4, name: 'Subject 4', credits: 3, grade: 'B' },
    ]);
  };

  return (
    <div className="calculator-section container">
      {/* Top Header */}
      <div className="calculator-header-box">
        <div className="badge-neon-blue inline-flex-badge">
          <Calculator size={14} />
          <span>Academic Performance Utility</span>
        </div>
        <h2 className="calc-main-title">
          <span>University </span>
          <span className="gradient-text-blue">SGPA & CGPA</span>
          <span> Calculator</span>
        </h2>
        <p className="calc-subtitle">
          Based on the 10-point relative/absolute grading system. Compute your current semester score
          and find out what you need to hit your target CGPA.
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="calc-tabs-row">
        <button 
          className={`calc-mode-btn ${calcMode === 'sgpa' ? 'active-mode' : ''}`}
          onClick={() => setCalcMode('sgpa')}
        >
          <Award size={16} />
          <span>Semester SGPA Calculator</span>
        </button>

        <button 
          className={`calc-mode-btn ${calcMode === 'cgpa' ? 'active-mode' : ''}`}
          onClick={() => setCalcMode('cgpa')}
        >
          <TrendingUp size={16} />
          <span>Overall CGPA & Target Predictor</span>
        </button>
      </div>

      <div className="calculator-grid-layout">
        {/* Left Column: Input Panel */}
        <div className="calc-left-col glass-panel">
          <div className="calc-panel-header">
            <h3>{calcMode === 'sgpa' ? 'Course Grades & Credits' : 'Semester Aggregation'}</h3>
            <button className="reset-calc-btn" onClick={resetCourses} title="Reset courses">
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
                    placeholder="e.g. Data Structures"
                    onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                  />

                  <select
                    className="course-credits-select mono"
                    value={course.credits}
                    onChange={(e) => updateCourse(course.id, 'credits', Number(e.target.value))}
                  >
                    {[1, 2, 3, 4, 5, 6].map(cr => (
                      <option key={cr} value={cr}>{cr} Cr</option>
                    ))}
                  </select>

                  <select
                    className="course-grade-select mono"
                    value={course.grade}
                    onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                  >
                    {GRADE_POINTS.map(g => (
                      <option key={g.grade} value={g.grade}>
                        {g.grade} ({g.points})
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
              <span>Add Another Course</span>
            </button>
          </div>

          {/* If CGPA mode, show previous CGPA input fields */}
          {calcMode === 'cgpa' && (
            <div className="cgpa-extra-inputs">
              <h4 className="cgpa-extra-title">Previous Academic History</h4>
              <div className="input-pair-grid">
                <div className="input-field-group">
                  <label className="input-label mono">Prior CGPA:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="calc-num-input mono"
                    value={prevCgpa}
                    onChange={(e) => setPrevCgpa(e.target.value)}
                  />
                </div>

                <div className="input-field-group">
                  <label className="input-label mono">Prior Credits Completed:</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    className="calc-num-input mono"
                    value={prevCredits}
                    onChange={(e) => setPrevCredits(e.target.value)}
                  />
                </div>
              </div>

              <h4 className="cgpa-extra-title" style={{ marginTop: '20px' }}>Target CGPA Forecast</h4>
              <div className="input-pair-grid">
                <div className="input-field-group">
                  <label className="input-label mono">Desired Target CGPA:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="10"
                    className="calc-num-input mono"
                    value={targetCgpa}
                    onChange={(e) => setTargetCgpa(e.target.value)}
                  />
                </div>

                <div className="input-field-group">
                  <label className="input-label mono">Credits Remaining:</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    className="calc-num-input mono"
                    value={remainingCredits}
                    onChange={(e) => setRemainingCredits(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Score Display Card */}
        <div className="calc-right-col">
          {/* Main SGPA Score Box */}
          <div className="score-summary-card glass-panel">
            <span className="score-label-sub">Calculated Semester SGPA</span>
            <div className="huge-score-display mono gradient-text-dual">
              {sgpa}
              <span className="score-denominator"> / 10.0</span>
            </div>

            <div className="score-breakdown-row mono">
              <div className="breakdown-stat">
                <span className="stat-name">Total Credits:</span>
                <span className="stat-val text-neon-cyan">{totalCredits}</span>
              </div>
              <div className="breakdown-stat">
                <span className="stat-name">Grade Points:</span>
                <span className="stat-val text-neon-red">{totalPoints}</span>
              </div>
            </div>

            {/* Performance status text */}
            <div className="performance-pill-badge">
              {parseFloat(sgpa) >= 9.0 ? (
                <span className="perf-distinction">🌟 Distinction / Top Tier</span>
              ) : parseFloat(sgpa) >= 8.0 ? (
                <span className="perf-firstclass">✨ First Class with Distinction</span>
              ) : parseFloat(sgpa) >= 7.0 ? (
                <span className="perf-good">👍 First Class</span>
              ) : (
                <span className="perf-pass">⚠️ Passing Grade</span>
              )}
            </div>
          </div>

          {/* If CGPA mode, show cumulative results */}
          {calcMode === 'cgpa' && (
            <div className="score-summary-card glass-panel" style={{ marginTop: '16px' }}>
              <span className="score-label-sub">Projected Cumulative CGPA</span>
              <div className="huge-score-display mono text-neon-cyan">
                {combinedCgpa}
                <span className="score-denominator"> / 10.0</span>
              </div>

              {requiredSgpaForTarget && (
                <div className="target-forecast-box">
                  <div className="target-forecast-header">
                    <TrendingUp size={16} className="text-neon-red" />
                    <span>Target {targetCgpa} Forecast</span>
                  </div>
                  <p className="forecast-text">
                    You need an average SGPA of{' '}
                    <strong className="mono text-neon-red">{requiredSgpaForTarget}</strong> across your next{' '}
                    {remainingCredits} credits.
                  </p>
                  {parseFloat(requiredSgpaForTarget) > 10.0 && (
                    <span className="impossible-warning mono">
                      ⚠️ Target mathematically requires &gt; 10.0 SGPA with given credits.
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Grading Scale Legend */}
          <div className="grading-scale-legend glass-panel">
            <span className="legend-title mono">10-Point Scale Legend</span>
            <div className="legend-grid mono">
              {GRADE_POINTS.map(g => (
                <div key={g.grade} className="legend-item">
                  <span className="legend-grade">{g.grade}</span>
                  <span className="legend-pts">{g.points} pts</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
