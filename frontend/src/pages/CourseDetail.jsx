import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI } from '../services/api';

const C = {
  blue: '#1565C0', dark: '#0D47A1', blueMid: '#1976D2',
  blueLight: '#E3F2FD', text: '#1A237E', sub: '#546E7A',
  muted: '#90A4AE', border: '#E8EAF6', bg: '#f8f9ff',
  green: '#2E7D32', greenLight: '#E8F5E9',
};

const STATUS_CFG = {
  active:   { bg: 'rgba(255,255,255,0.18)', color: 'white', label: '● ACTIVE' },
  upcoming: { bg: 'rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.85)', label: '◎ UPCOMING' },
  past:     { bg: 'rgba(255,255,255,0.10)', color: 'rgba(255,255,255,0.6)',  label: '● PAST' },
};

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
          <span onClick={() => navigate('/courses')} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>Courses</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {user ? (
            <button onClick={() => navigate(dashPath)} style={{ background: C.blue, color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>My Dashboard →</button>
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

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    courseAPI.getById(id)
      .then(setCourse)
      .catch(() => setError('Course not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Nunito, sans-serif' }}>
      <NavBar user={user} navigate={navigate} />
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, color: C.muted, fontSize: 14 }}>Loading course…</div>
    </div>
  );

  if (error || !course) return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Nunito, sans-serif' }}>
      <NavBar user={user} navigate={navigate} />
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
        <div style={{ fontWeight: 800, fontSize: 18, color: C.text, marginBottom: 8 }}>Course not found</div>
        <button onClick={() => navigate('/courses')} style={{ background: C.blue, color: 'white', border: 'none', borderRadius: 10, padding: '11px 24px', fontWeight: 800, cursor: 'pointer', fontSize: 13 }}>
          Back to Courses
        </button>
      </div>
    </div>
  );

  const status     = course.status || 'past';
  const cfg        = STATUS_CFG[status] || STATUS_CFG.past;
  const tutor      = course.tutor_assignments?.[0]?.tutor;
  const isActive   = status === 'active';
  const submitPath = user ? `/student/submit?course=${course.id}` : '/login';

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Nunito, sans-serif' }}>
      <NavBar user={user} navigate={navigate} />

      {/* ── Hero header ──────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${C.dark}, ${C.blueMid})`, padding: '40px 24px 36px' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          {/* Breadcrumb */}
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 700, marginBottom: 20, display: 'flex', gap: 6 }}>
            <span onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>Home</span>
            <span>/</span>
            <span onClick={() => navigate('/courses')} style={{ cursor: 'pointer' }}>Courses</span>
            <span>/</span>
            <span style={{ color: 'rgba(255,255,255,0.85)' }}>{course.subject?.code}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
            <div>
              <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 20, padding: '4px 12px', fontSize: 11, fontWeight: 800 }}>{cfg.label}</span>
              <h1 style={{ color: 'white', fontSize: 34, fontWeight: 900, margin: '14px 0 6px' }}>{course.subject?.code}</h1>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, margin: 0 }}>{course.semester} · {course.subject?.name}</p>
            </div>
            <div style={{ display: 'flex', gap: 10, flexShrink: 0 }}>
              {[['34', 'Students'], ['6', 'Handouts'], ['4.8★', 'Rating']].map(([val, lbl]) => (
                <div key={lbl} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 16px', textAlign: 'center' }}>
                  <div style={{ color: val.includes('★') ? '#90CAF9' : 'white', fontSize: 16, fontWeight: 900 }}>{val}</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 10 }}>{lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>

          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Description */}
            <div style={{ background: 'white', borderRadius: 14, border: `1.5px solid ${C.border}`, padding: '24px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 12 }}>DESCRIPTION</div>
              <p style={{ color: C.text, fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                {course.description?.trim()
                  ? course.description
                  : `This course covers ${course.subject?.name} as taught at NYU during ${course.semester}. Students enrolled in this course can submit their assignments for professional correction and detailed feedback.`}
              </p>
            </div>

            {/* Tutor */}
            {tutor && (
              <div style={{ background: 'white', borderRadius: 14, border: `1.5px solid ${C.border}`, padding: '24px' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 14 }}>ASSIGNED TUTOR</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 52, height: 52, background: C.blueLight, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>👨‍🏫</div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: C.text }}>{tutor.first_name} {tutor.last_name}</div>
                    <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>{course.subject?.name} Tutor</div>
                    <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>NYU Academic Staff</div>
                  </div>
                </div>
              </div>
            )}

            {/* Course info grid */}
            <div style={{ background: 'white', borderRadius: 14, border: `1.5px solid ${C.border}`, padding: '24px' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 14 }}>COURSE DETAILS</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  ['📚', 'Subject Code', course.subject?.code],
                  ['🏫', 'Department',   course.subject?.name],
                  ['📅', 'Semester',     course.semester],
                  ['📊', 'Status',       status.charAt(0).toUpperCase() + status.slice(1)],
                ].map(([icon, label, value]) => (
                  <div key={label} style={{ background: C.bg, borderRadius: 10, padding: '12px 14px' }}>
                    <div style={{ fontSize: 10, color: C.muted, fontWeight: 700, marginBottom: 4 }}>{icon} {label}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column — CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {isActive ? (
              <div style={{ background: 'white', borderRadius: 14, border: `1.5px solid ${C.border}`, padding: '24px', position: 'sticky', top: 80 }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: C.muted, letterSpacing: 1, marginBottom: 12 }}>SUBMIT FOR THIS COURSE</div>
                <div style={{ background: C.blueLight, borderRadius: 10, padding: '12px', marginBottom: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: 22 }}>📤</div>
                  <div style={{ fontSize: 12, color: C.blue, fontWeight: 800, marginTop: 4 }}>Corrections open</div>
                </div>
                <p style={{ fontSize: 12, color: C.sub, lineHeight: 1.6, marginBottom: 16 }}>
                  Submit your assignment for this course and receive professional feedback from your assigned tutor.
                </p>
                <button
                  onClick={() => {
                    if (!user) { navigate('/login'); return; }
                    navigate(`/student/submit?course=${course.id}`);
                  }}
                  style={{ width: '100%', background: C.blue, color: 'white', border: 'none', borderRadius: 10, padding: '14px', fontSize: 14, fontWeight: 900, cursor: 'pointer', marginBottom: 10 }}>
                  📤 Submit Assignment
                </button>
                {!user && (
                  <p style={{ fontSize: 11, color: C.muted, textAlign: 'center', margin: 0 }}>
                    You need to <span onClick={() => navigate('/login')} style={{ color: C.blue, cursor: 'pointer', fontWeight: 700 }}>sign in</span> first
                  </p>
                )}
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 14, border: `1.5px solid ${C.border}`, padding: '24px' }}>
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{status === 'upcoming' ? '⏰' : '🔒'}</div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: C.text, marginBottom: 6 }}>
                    {status === 'upcoming' ? 'Opening soon' : 'Course ended'}
                  </div>
                  <div style={{ fontSize: 12, color: C.sub, lineHeight: 1.6 }}>
                    {status === 'upcoming'
                      ? 'Submissions will open once this course becomes active.'
                      : 'This course is no longer accepting new submissions.'}
                  </div>
                </div>
              </div>
            )}

            {/* Browse more */}
            <button onClick={() => navigate('/courses')}
              style={{ width: '100%', background: 'transparent', color: C.blue, border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '12px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
              ← Browse all courses
            </button>
          </div>
        </div>
      </div>

      <footer style={{ background: C.dark, padding: '24px', textAlign: 'center', marginTop: 40 }}>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>© 2025 CourseCorrect — NYU</div>
      </footer>
    </div>
  );
}
