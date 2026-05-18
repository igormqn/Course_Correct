import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentAPI, correctionAPI } from '../services/api';

const C = {
  blue: '#1565C0',
  dark: '#0D47A1',
  blueMid: '#1976D2',
  text: '#1A237E',
  sub: '#546E7A',
  muted: '#90A4AE',
  border: '#E8EAF6',
  bg: '#f8f9ff',
  green: '#2E7D32',
  orange: '#E65100',
};

function StatusBadge({ status }) {
  const map = {
    PENDING:     { bg: '#FFF8E1', color: '#E65100', dot: '#FFB300', label: 'Submitted' },
    IN_PROGRESS: { bg: '#E3F2FD', color: '#1565C0', dot: '#1976D2', label: 'In Progress' },
    CORRECTED:   { bg: '#E8F5E9', color: '#2E7D32', dot: '#43A047', label: 'Graded' },
  };
  const s = map[status] || { bg: '#f5f5f5', color: '#9e9e9e', dot: '#9e9e9e', label: status };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.bg, color: s.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 800 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, flexShrink: 0 }}></span>
      {s.label}
    </span>
  );
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [corrections, setCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [assignmentsData, correctionsData] = await Promise.all([
        assignmentAPI.getMyAssignments(),
        correctionAPI.getAll(),
      ]);
      setAssignments(assignmentsData);
      setCorrections(correctionsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: assignments.length,
    graded: assignments.filter(a => a.status === 'CORRECTED').length,
  };

  const correctedOnes = corrections.filter(c => c.grade);
  const avgGrade = correctedOnes.length > 0
    ? (correctedOnes.reduce((sum, c) => sum + c.grade, 0) / correctedOnes.length).toFixed(1)
    : '—';

  const filtered = assignments.filter(a => filter === 'ALL' || a.status === filter);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: `3px solid ${C.border}`, borderTopColor: C.blue, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}></div>
          <p style={{ color: C.sub, fontWeight: 600 }}>Loading your dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>

      {/* Top Nav */}
      <nav style={{ background: 'white', borderBottom: `1.5px solid ${C.border}`, padding: '0 32px', display: 'flex', alignItems: 'center', height: 56, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontWeight: 900, fontSize: 16, color: C.text, display: 'flex', alignItems: 'center', gap: 8 }}>
          📖 <em style={{ fontStyle: 'normal' }}>Course</em><b style={{ color: C.blue }}>Correct</b>
        </div>
        <div style={{ flex: 1 }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 24, padding: '6px 14px' }}>
            <span style={{ fontSize: 18 }}>👤</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{user?.first_name} {user?.last_name?.[0]}.</span>
          </div>
          <button onClick={logout} style={{ fontSize: 12, fontWeight: 700, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Dashboard Hero */}
      <div style={{ background: `linear-gradient(135deg, ${C.dark}, ${C.blueMid})`, padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 20, color: 'white' }}>
        <div style={{ fontSize: 52 }}>👤</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 2px', color: 'white' }}>
            {user?.first_name} {user?.last_name}
          </h2>
          <p style={{ fontSize: 12, opacity: 0.75, margin: 0 }}>Student · NYU</p>
        </div>
        <div style={{ display: 'flex', gap: 24, marginLeft: 'auto' }}>
          {[
            { value: stats.total, label: 'Assignments' },
            { value: stats.graded, label: 'Graded' },
            { value: avgGrade, label: 'Avg./20', colored: true },
          ].map(({ value, label, colored }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: colored ? '#90CAF9' : 'white' }}>{value}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 32px' }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 900, color: C.text, margin: '0 0 2px' }}>Assignment History</h3>
            <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>All your submitted assignments</p>
          </div>
          <button
            onClick={() => navigate('/student/submit')}
            style={{ background: C.blue, color: 'white', border: 'none', borderRadius: 10, padding: '9px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            + Submit Assignment
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {[
            { key: 'ALL', label: `All (${stats.total})` },
            { key: 'PENDING', label: 'Submitted' },
            { key: 'IN_PROGRESS', label: 'In Progress' },
            { key: 'CORRECTED', label: 'Graded' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                border: `1.5px solid ${filter === key ? C.blue : C.border}`,
                background: filter === key ? C.blue : 'white',
                color: filter === key ? 'white' : C.sub,
                fontFamily: 'Nunito, sans-serif',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div style={{ background: 'white', borderRadius: 14, border: `2px dashed ${C.border}`, padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>No assignments found</h3>
            <p style={{ fontSize: 13, color: C.sub, marginBottom: 20 }}>
              {filter === 'ALL' ? "You haven't submitted any assignments yet." : `No ${filter.toLowerCase().replace('_', ' ')} assignments.`}
            </p>
            <button
              onClick={() => navigate('/student/submit')}
              style={{ background: C.blue, color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}
            >
              Submit Your First Assignment
            </button>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 14, border: `1.5px solid ${C.border}`, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  {['Course', 'Submitted', 'Service', 'Grade', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1.5px solid ${C.border}` }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((assignment, i) => {
                  const correction = corrections.find(c => c.assignment.id === assignment.id);
                  const grade = correction?.grade;
                  const gradeColor = grade >= 16 ? C.green : grade >= 12 ? C.blue : grade >= 10 ? C.orange : '#C62828';
                  const icon = assignment.course?.subject?.icon || '📚';
                  return (
                    <tr
                      key={assignment.id}
                      style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = C.bg}
                      onMouseLeave={e => e.currentTarget.style.background = 'white'}
                      onClick={() => navigate(`/student/assignment/${assignment.id}`)}
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 18 }}>{icon}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{assignment.course?.subject?.code}</div>
                            <div style={{ fontSize: 11, color: C.sub }}>{assignment.course?.subject?.name}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, color: C.sub }}>
                        {new Date(assignment.submitted_at).toLocaleDateString('en-US', { day:'2-digit', month:'2-digit', year:'2-digit' })}
                      </td>
                      <td style={{ padding: '14px 16px', fontSize: 12, fontWeight: 700, color: C.text }}>
                        {assignment.service?.is_premium ? '⭐ Premium' : 'Standard'}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        {grade != null ? (
                          <span style={{ fontSize: 14, fontWeight: 900, color: gradeColor }}>{grade}/20</span>
                        ) : (
                          <span style={{ color: C.muted }}>—</span>
                        )}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <StatusBadge status={assignment.status} />
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/student/assignment/${assignment.id}`); }}
                          style={{ background: 'none', border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '5px 14px', fontSize: 12, fontWeight: 700, color: C.sub, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}
                        >
                          View →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
