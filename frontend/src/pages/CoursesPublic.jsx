import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, subjectAPI } from '../services/api';

const C = {
  blue: '#1565C0', dark: '#0D47A1', blueMid: '#1976D2',
  blueLight: '#E3F2FD', text: '#1A237E', sub: '#546E7A',
  muted: '#90A4AE', border: '#E8EAF6', bg: '#f8f9ff',
  green: '#2E7D32', greenLight: '#E8F5E9',
  orange: '#E65100', orangeLight: '#FFF8E1',
};

const STATUS_CFG = {
  active:   { bg: '#E8F5E9', color: '#2E7D32', label: '● Active',   bar: '#2E7D32' },
  upcoming: { bg: '#E3F2FD', color: '#1565C0', label: '◎ Upcoming', bar: '#1565C0' },
  past:     { bg: '#F5F5F5', color: '#9E9E9E', label: '● Past',     bar: '#BDBDBD' },
};

const FILTERS = ['ALL', 'active', 'upcoming', 'past'];
const FILTER_LABELS = { ALL: 'All Courses', active: 'Active', upcoming: 'Upcoming', past: 'Past' };

function NavBar({ user, navigate }) {
  const dashPath = user?.role === 'TUTOR' ? '/tutor/dashboard' : user?.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard';
  return (
    <nav style={{ background: C.dark, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 60, gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span style={{ fontSize: 20 }}>📖</span>
          <span style={{ color: 'white', fontWeight: 300, fontSize: 17 }}>Course</span>
          <span style={{ color: 'white', fontWeight: 900, fontSize: 17, marginLeft: -4 }}>Correct</span>
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 28 }}>
          <span onClick={() => navigate('/courses')} style={{ color: 'white', fontSize: 13, fontWeight: 800, cursor: 'pointer', borderBottom: '2px solid rgba(255,255,255,0.5)', paddingBottom: 2 }}>Courses</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {user ? (
            <button onClick={() => navigate(dashPath)} style={{ background: C.blue, color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
              My Dashboard →
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')} style={{ background: 'transparent', color: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Sign In</button>
              <button onClick={() => navigate('/register')} style={{ background: C.blue, color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>Sign Up</button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function CoursesPublic() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [subjectFilter, setSubjectFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    Promise.all([courseAPI.getAll(), subjectAPI.getAll()])
      .then(([c, s]) => { setCourses(c); setSubjects(s); })
      .catch(() => setApiError(true))
      .finally(() => setLoading(false));
  }, []);

  const visible = courses.filter(c => {
    const statusOk  = filter === 'ALL' || c.status === filter;
    const subjectOk = subjectFilter === 'ALL' || String(c.subject?.id) === subjectFilter;
    const searchOk  = !search || c.subject?.code?.toLowerCase().includes(search.toLowerCase())
                              || c.subject?.name?.toLowerCase().includes(search.toLowerCase());
    return statusOk && subjectOk && searchOk;
  });

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Nunito, sans-serif' }}>
      <NavBar user={user} navigate={navigate} />

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${C.dark}, ${C.blueMid})`, padding: '44px 24px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: 700, marginBottom: 8, letterSpacing: 0.5 }}>
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span> / Courses
          </div>
          <h1 style={{ color: 'white', fontSize: 32, fontWeight: 900, margin: '0 0 8px' }}>All Courses</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0 }}>
            {loading ? '…' : `${courses.length} courses available — past, active and upcoming`}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 24px' }}>
        {/* Search + filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by code or subject…"
            style={{ flex: '1 1 220px', minWidth: 200, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '10px 16px', fontSize: 13, fontWeight: 600, color: C.text, background: 'white', outline: 'none', fontFamily: 'Nunito, sans-serif' }}
          />

          {/* Status filter */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                style={{ background: filter === f ? C.blue : 'white', color: filter === f ? 'white' : C.sub, border: `1.5px solid ${filter === f ? C.blue : C.border}`, borderRadius: 20, padding: '6px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                {FILTER_LABELS[f]}
              </button>
            ))}
          </div>

          {/* Subject filter */}
          {subjects.length > 0 && (
            <select
              value={subjectFilter}
              onChange={e => setSubjectFilter(e.target.value)}
              style={{ border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '9px 14px', fontSize: 12, fontWeight: 700, color: C.text, background: 'white', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', outline: 'none' }}>
              <option value="ALL">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={String(s.id)}>{s.icon} {s.name}</option>)}
            </select>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.muted }}>Loading courses…</div>
        ) : apiError ? (
          <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: 16, border: `1.5px solid ${C.border}` }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
            <div style={{ fontWeight: 800, color: C.text, fontSize: 16 }}>Sign in to browse courses</div>
            <div style={{ color: C.sub, fontSize: 13, marginTop: 8, marginBottom: 24 }}>Create a free NYU account to access all available courses.</div>
            <button onClick={() => navigate('/register')} style={{ background: C.blue, color: 'white', border: 'none', borderRadius: 10, padding: '11px 28px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
              Create Account
            </button>
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: C.muted }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
            <div style={{ fontWeight: 800, fontSize: 15, color: C.text }}>No courses found</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Try adjusting your search or filters</div>
          </div>
        ) : (
          <>
            <div style={{ color: C.sub, fontSize: 12, fontWeight: 700, marginBottom: 16 }}>
              {visible.length} course{visible.length !== 1 ? 's' : ''} found
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
              {visible.map(course => {
                const status = course.status || 'past';
                const cfg = STATUS_CFG[status] || STATUS_CFG.past;
                const tutor = course.tutor_assignments?.[0]?.tutor;
                return (
                  <div key={course.id}
                    onClick={() => navigate(`/courses/${course.id}`)}
                    style={{ background: 'white', borderRadius: 14, border: `1.5px solid ${C.border}`, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 8px rgba(21,101,192,0.04)', transition: 'box-shadow 0.18s' }}
                    onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(21,101,192,0.13)'}
                    onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(21,101,192,0.04)'}
                  >
                    {/* Top color bar */}
                    <div style={{ height: 4, background: cfg.bar }} />
                    <div style={{ padding: '18px 20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                          <div style={{ width: 44, height: 44, background: C.blueLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                            {course.subject?.icon || '📚'}
                          </div>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{course.subject?.code}</div>
                            <div style={{ fontSize: 12, color: C.sub }}>{course.subject?.name}</div>
                          </div>
                        </div>
                        <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{cfg.label}</span>
                      </div>

                      {tutor ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: C.bg, borderRadius: 8, marginBottom: 12 }}>
                          <div style={{ width: 28, height: 28, background: C.blueLight, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👨‍🏫</div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 800, color: C.text }}>{tutor.first_name} {tutor.last_name}</div>
                            <div style={{ fontSize: 10, color: C.muted }}>Assigned Tutor</div>
                          </div>
                        </div>
                      ) : (
                        <div style={{ height: 12 }} />
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{course.semester}</span>
                        <span style={{ fontSize: 12, color: C.blue, fontWeight: 800 }}>View details →</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      <footer style={{ background: C.dark, padding: '24px', textAlign: 'center', marginTop: 40 }}>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>© 2025 CourseCorrect — NYU</div>
      </footer>
    </div>
  );
}
