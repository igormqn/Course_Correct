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
  red: '#C62828',
};

function UrgencyTag({ urgency }) {
  if (urgency === 'urgent') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFEBEE', color: C.red, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 800 }}>
      🔴 Urgent
    </span>
  );
  if (urgency === 'soon') return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#FFF3E0', color: C.orange, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 800 }}>
      ⚡ Due soon
    </span>
  );
  return null;
}

function StatusBadge({ status }) {
  const map = {
    PENDING:     { bg: '#FFF8E1', color: '#E65100', label: '⏳ Pending' },
    IN_PROGRESS: { bg: '#E3F2FD', color: '#1565C0', label: '✍️ In Progress' },
    COMPLETED:   { bg: '#E8F5E9', color: '#2E7D32', label: '✅ Completed' },
  };
  const s = map[status] || { bg: '#f5f5f5', color: '#9e9e9e', label: status };
  return (
    <span style={{ display: 'inline-block', background: s.bg, color: s.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 800 }}>
      {s.label}
    </span>
  );
}

export default function TutorDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [myCorrections, setMyCorrections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('to-correct');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [toCorrectData, correctionsData] = await Promise.all([
        assignmentAPI.getToCorrect(),
        correctionAPI.getAll(),
      ]);
      setAssignments(toCorrectData);
      setMyCorrections(correctionsData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getUrgency = (assignment) => {
    const hours = assignment.service?.turnaround_hours || 168;
    const passed = (Date.now() - new Date(assignment.submitted_at)) / 3600000;
    const remaining = hours - passed;
    if (remaining < 24) return 'urgent';
    if (remaining < 48) return 'soon';
    return 'normal';
  };

  const stats = {
    toCorrect: assignments.length,
    urgent: assignments.filter(a => getUrgency(a) === 'urgent').length,
    completed: myCorrections.filter(c => c.status === 'COMPLETED').length,
  };

  const filtered = assignments.filter(a => {
    if (filter === 'URGENT') return getUrgency(a) === 'urgent';
    if (filter === 'PREMIUM') return a.service?.is_premium;
    return true;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: `3px solid ${C.border}`, borderTopColor: C.blue, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}></div>
          <p style={{ color: C.sub, fontWeight: 600 }}>Loading your assignments...</p>
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
            <span style={{ fontSize: 18 }}>👨‍🏫</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{user?.first_name} {user?.last_name?.[0]}.</span>
            <span style={{ fontSize: 10, background: '#E8F5E9', color: C.green, borderRadius: 10, padding: '1px 7px', fontWeight: 800 }}>Tutor</span>
          </div>
          <button onClick={logout} style={{ fontSize: 12, fontWeight: 700, color: C.muted, background: 'none', border: 'none', cursor: 'pointer' }}>
            Sign out
          </button>
        </div>
      </nav>

      {/* Hero Banner */}
      <div style={{ background: `linear-gradient(135deg, ${C.dark}, ${C.blueMid})`, padding: '24px 32px', display: 'flex', alignItems: 'center', gap: 20, color: 'white' }}>
        <div style={{ fontSize: 52 }}>👨‍🏫</div>
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 2px', color: 'white' }}>
            {user?.first_name} {user?.last_name}
          </h2>
          <p style={{ fontSize: 12, opacity: 0.75, margin: 0 }}>Tutor · NYU</p>
        </div>
        <div style={{ display: 'flex', gap: 24, marginLeft: 'auto' }}>
          {[
            { value: stats.toCorrect, label: 'To Correct' },
            { value: stats.urgent, label: 'Urgent', colored: stats.urgent > 0 },
            { value: stats.completed, label: 'Completed' },
          ].map(({ value, label, colored }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: colored ? '#FFCC02' : 'white' }}>{value}</div>
              <div style={{ fontSize: 11, opacity: 0.7 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px 32px' }}>

        {/* Tabs */}
        <div style={{ display: 'inline-flex', gap: 2, marginBottom: 20, background: 'white', borderRadius: 10, padding: 4, border: `1.5px solid ${C.border}` }}>
          {[
            { key: 'to-correct', label: `📋 To Correct (${stats.toCorrect})` },
            { key: 'completed', label: `✅ Completed (${stats.completed})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                padding: '7px 18px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 800,
                cursor: 'pointer',
                border: 'none',
                background: activeTab === key ? C.blue : 'transparent',
                color: activeTab === key ? 'white' : C.sub,
                fontFamily: 'Nunito, sans-serif',
                transition: 'all 0.2s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'to-correct' && (
          <>
            {/* Filters */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
              {[
                { key: 'ALL', label: `All (${assignments.length})` },
                { key: 'URGENT', label: `🔴 Urgent (${stats.urgent})` },
                { key: 'PREMIUM', label: '⭐ Premium' },
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

            {filtered.length === 0 ? (
              <div style={{ background: 'white', borderRadius: 14, border: `2px dashed ${C.border}`, padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>All caught up!</h3>
                <p style={{ fontSize: 13, color: C.sub }}>No assignments to correct right now. Great work!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {filtered.map(assignment => {
                  const urgency = getUrgency(assignment);
                  const isPremium = assignment.service?.is_premium;
                  const icon = assignment.course?.subject?.icon || '📚';
                  return (
                    <div
                      key={assignment.id}
                      style={{ background: 'white', borderRadius: 12, border: `1.5px solid ${urgency === 'urgent' ? '#FFCDD2' : C.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s', display: 'flex' }}
                      onClick={() => navigate(`/tutor/correct/${assignment.id}`)}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(21,101,192,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                    >
                      {/* Urgency bar */}
                      <div style={{ width: 4, background: urgency === 'urgent' ? C.red : urgency === 'soon' ? C.orange : C.green, flexShrink: 0 }}></div>

                      <div style={{ flex: 1, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ fontSize: 28 }}>{icon}</div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 14, fontWeight: 900, color: C.text }}>
                              {assignment.course?.subject?.code} – {assignment.course?.subject?.name}
                            </span>
                            {isPremium && (
                              <span style={{ background: '#F3E5F5', color: '#6A1B9A', borderRadius: 20, padding: '2px 8px', fontSize: 11, fontWeight: 800 }}>⭐ Premium</span>
                            )}
                            <UrgencyTag urgency={urgency} />
                          </div>
                          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: C.sub }}>
                            <span>👤 {assignment.student?.first_name} {assignment.student?.last_name}</span>
                            <span>📅 Submitted {new Date(assignment.submitted_at).toLocaleDateString('en-US')}</span>
                          </div>
                          <div style={{ marginTop: 6 }}>
                            <StatusBadge status={assignment.status} />
                          </div>
                        </div>

                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/tutor/correct/${assignment.id}`); }}
                          style={{ background: C.blue, color: 'white', border: 'none', borderRadius: 9, padding: '9px 18px', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Nunito, sans-serif', whiteSpace: 'nowrap' }}
                        >
                          {assignment.status === 'IN_PROGRESS' ? '✍️ Continue' : '✍️ Start'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'completed' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {myCorrections.filter(c => c.status === 'COMPLETED').length === 0 ? (
              <div style={{ background: 'white', borderRadius: 14, border: `2px dashed ${C.border}`, padding: '48px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: C.text, marginBottom: 6 }}>No completed corrections yet</h3>
                <p style={{ fontSize: 13, color: C.sub }}>Start correcting assignments to see them here!</p>
              </div>
            ) : (
              myCorrections.filter(c => c.status === 'COMPLETED').map(correction => (
                <div
                  key={correction.id}
                  style={{ background: 'white', borderRadius: 12, border: `1.5px solid ${C.border}`, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                  onClick={() => navigate(`/tutor/correction/${correction.id}`)}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(21,101,192,0.12)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <div style={{ fontSize: 28 }}>✅</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 900, color: C.text }}>{correction.assignment?.course?.subject?.code}</div>
                    <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>
                      {correction.assignment?.student?.first_name} {correction.assignment?.student?.last_name} ·{' '}
                      Corrected {new Date(correction.corrected_at).toLocaleDateString('en-US')}
                    </div>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{correction.grade}/20</div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
