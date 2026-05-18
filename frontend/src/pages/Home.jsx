import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, serviceAPI } from '../services/api';

const C = {
  blue: '#1565C0', dark: '#0D47A1', blueMid: '#1976D2',
  blueLight: '#E3F2FD', text: '#1A237E', sub: '#546E7A',
  muted: '#90A4AE', border: '#E8EAF6', bg: '#f8f9ff',
  green: '#2E7D32', greenLight: '#E8F5E9',
};

const STATUS_CFG = {
  active:   { bg: '#E8F5E9', color: '#2E7D32', label: '● Active' },
  upcoming: { bg: '#E3F2FD', color: '#1565C0', label: '◎ Upcoming' },
  past:     { bg: '#F5F5F5', color: '#9E9E9E', label: '● Past' },
};

function NavBar({ user, navigate }) {
  const dashPath =
    user?.role === 'TUTOR' ? '/tutor/dashboard'
    : user?.role === 'ADMIN' ? '/admin/dashboard'
    : '/student/dashboard';

  return (
    <nav style={{ background: C.dark, position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 2px 12px rgba(0,0,0,0.15)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 60, gap: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => navigate('/')}>
          <span style={{ fontSize: 20 }}>📖</span>
          <span style={{ color: 'white', fontWeight: 300, fontSize: 17, letterSpacing: -0.3 }}>Course</span>
          <span style={{ color: 'white', fontWeight: 900, fontSize: 17, marginLeft: -4 }}>Correct</span>
        </div>
        <div style={{ flex: 1, display: 'flex', gap: 28 }}>
          {[['Courses', '/courses']].map(([label, path]) => (
            <span key={label} onClick={() => navigate(path)}
              style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              onMouseOver={e => e.target.style.color = 'white'}
              onMouseOut={e => e.target.style.color = 'rgba(255,255,255,0.75)'}
            >{label}</span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {user ? (
            <button onClick={() => navigate(dashPath)}
              style={{ background: C.blue, color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
              My Dashboard →
            </button>
          ) : (
            <>
              <button onClick={() => navigate('/login')}
                style={{ background: 'transparent', color: 'rgba(255,255,255,0.85)', border: '1.5px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                Sign In
              </button>
              <button onClick={() => navigate('/register')}
                style={{ background: C.blue, color: 'white', border: 'none', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    Promise.all([courseAPI.getAll(), serviceAPI.getAll()])
      .then(([c, s]) => { setCourses(c.slice(0, 6)); setServices(s); })
      .catch(() => setApiError(true))
      .finally(() => setLoading(false));
  }, []);

  const submitPath = user ? '/student/submit' : '/register';

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: 'Nunito, sans-serif' }}>
      <NavBar user={user} navigate={navigate} />

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section style={{ background: `linear-gradient(135deg, ${C.dark} 0%, ${C.blueMid} 100%)`, padding: '80px 24px 72px' }}>
        <div style={{ maxWidth: 860, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', borderRadius: 20, padding: '5px 14px', marginBottom: 28 }}>
            <span style={{ fontSize: 13 }}>🎓</span>
            <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>NYU ACADEMIC PLATFORM</span>
          </div>
          <h1 style={{ color: 'white', fontSize: 50, fontWeight: 900, margin: '0 0 20px', lineHeight: 1.15 }}>
            Expert Assignment<br />
            <span style={{ color: '#90CAF9' }}>Corrections</span> for NYU
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 17, lineHeight: 1.7, maxWidth: 540, margin: '0 auto 40px' }}>
            Submit your assignments and receive detailed, professional feedback from expert tutors within 24–72 hours.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate(submitPath)}
              style={{ background: 'white', color: C.dark, border: 'none', borderRadius: 12, padding: '15px 34px', fontSize: 15, fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.18)' }}>
              📤 Submit Assignment
            </button>
            <button onClick={() => navigate('/courses')}
              style={{ background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.35)', borderRadius: 12, padding: '15px 28px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
              Browse Courses
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────────────────── */}
      <section style={{ background: 'white', borderBottom: `1.5px solid ${C.border}` }}>
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 24px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16 }}>
          {[['500+', 'Students Served'], ['4.9★', 'Avg. Rating'], ['48h', 'Avg. Turnaround'], ['100%', 'Satisfaction']].map(([v, l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 24, fontWeight: 900, color: C.text }}>{v}</div>
              <div style={{ fontSize: 11, color: C.sub, marginTop: 2 }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── COURSES PREVIEW ────────────────────────────────────────── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '56px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: 0 }}>Available Courses</h2>
            <p style={{ color: C.sub, fontSize: 13, marginTop: 4, marginBottom: 0 }}>Browse current and upcoming courses open for corrections</p>
          </div>
          <button onClick={() => navigate('/courses')}
            style={{ background: 'transparent', color: C.blue, border: `1.5px solid ${C.blue}`, borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
            View all →
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted, fontSize: 14 }}>Loading courses…</div>
        ) : apiError ? (
          <div style={{ textAlign: 'center', padding: '40px', background: 'white', borderRadius: 14, border: `1.5px solid ${C.border}` }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
            <div style={{ fontWeight: 800, color: C.text, fontSize: 15 }}>Sign in to browse courses</div>
            <div style={{ color: C.sub, fontSize: 13, marginTop: 6, marginBottom: 20 }}>Create a free account to access all available courses</div>
            <button onClick={() => navigate('/register')}
              style={{ background: C.blue, color: 'white', border: 'none', borderRadius: 10, padding: '10px 24px', fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>
              Create Account
            </button>
          </div>
        ) : courses.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: C.muted, fontSize: 14 }}>No courses available yet.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {courses.map(course => {
              const status = course.status || 'past';
              const cfg = STATUS_CFG[status] || STATUS_CFG.past;
              const tutor = course.tutor_assignments?.[0]?.tutor;
              return (
                <div key={course.id}
                  onClick={() => navigate(`/courses/${course.id}`)}
                  style={{ background: 'white', borderRadius: 14, border: `1.5px solid ${C.border}`, padding: '20px', cursor: 'pointer', transition: 'box-shadow 0.18s', boxShadow: '0 2px 8px rgba(21,101,192,0.04)' }}
                  onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(21,101,192,0.13)'}
                  onMouseOut={e => e.currentTarget.style.boxShadow = '0 2px 8px rgba(21,101,192,0.04)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ width: 44, height: 44, background: C.blueLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                        {course.subject?.icon || '📚'}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 900, color: C.text }}>{course.subject?.code}</div>
                        <div style={{ fontSize: 12, color: C.sub }}>{course.subject?.name}</div>
                      </div>
                    </div>
                    <span style={{ background: cfg.bg, color: cfg.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{cfg.label}</span>
                  </div>
                  {tutor && (
                    <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>👨‍🏫</span>
                      <span style={{ fontSize: 12, color: C.sub, fontWeight: 700 }}>{tutor.first_name} {tutor.last_name}</span>
                    </div>
                  )}
                  <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: C.muted }}>{course.semester}</span>
                    <span style={{ fontSize: 12, color: C.blue, fontWeight: 700 }}>View details →</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── SERVICES ───────────────────────────────────────────────── */}
      <section style={{ background: C.dark, padding: '56px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ color: 'white', fontSize: 24, fontWeight: 900, textAlign: 'center', margin: '0 0 8px' }}>Correction Services</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, textAlign: 'center', marginBottom: 36 }}>Choose the service that fits your needs and timeline</p>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {services.map(s => (
              <div key={s.id} style={{ background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(255,255,255,0.12)', borderRadius: 16, padding: '28px 24px', flex: '1 1 200px', maxWidth: 300 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>{s.is_premium ? '⭐' : '📝'}</div>
                <div style={{ color: 'white', fontSize: 16, fontWeight: 900, marginBottom: 4 }}>{s.name}</div>
                {s.is_premium && (
                  <span style={{ background: 'rgba(255,255,255,0.15)', color: '#90CAF9', borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 800 }}>PREMIUM</span>
                )}
                <div style={{ color: '#90CAF9', fontSize: 28, fontWeight: 900, marginTop: 14 }}>${parseFloat(s.price).toFixed(2)}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 4 }}>
                  {Math.floor(s.turnaround_hours / 24)} day{Math.floor(s.turnaround_hours / 24) !== 1 ? 's' : ''} turnaround
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────── */}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '56px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: C.text, margin: '0 0 8px' }}>How It Works</h2>
        <p style={{ color: C.sub, fontSize: 13, marginBottom: 40 }}>Three simple steps to get your assignment corrected</p>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            ['📤', '1. Submit', 'Upload your assignment, choose a course and a correction service.'],
            ['👨‍🏫', '2. Expert Review', 'A qualified tutor reads, annotates and grades your work.'],
            ['✅', '3. Get Feedback', 'Receive your grade, detailed comments and improvement tips.'],
          ].map(([icon, title, desc]) => (
            <div key={title} style={{ flex: '1 1 200px', maxWidth: 280, background: 'white', borderRadius: 16, padding: '28px 20px', border: `1.5px solid ${C.border}`, boxShadow: '0 2px 12px rgba(21,101,192,0.05)' }}>
              <div style={{ fontSize: 36, marginBottom: 14 }}>{icon}</div>
              <div style={{ fontSize: 15, fontWeight: 900, color: C.text, marginBottom: 10 }}>{title}</div>
              <div style={{ fontSize: 13, color: C.sub, lineHeight: 1.65 }}>{desc}</div>
            </div>
          ))}
        </div>
        <button onClick={() => navigate(submitPath)}
          style={{ marginTop: 40, background: C.blue, color: 'white', border: 'none', borderRadius: 12, padding: '15px 40px', fontSize: 15, fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 20px rgba(21,101,192,0.3)' }}>
          {user ? '📤 Submit an Assignment' : '🎓 Create Free Account'}
        </button>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────── */}
      <footer style={{ background: C.dark, padding: '24px', textAlign: 'center' }}>
        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>© 2025 CourseCorrect — NYU · All rights reserved</div>
      </footer>
    </div>
  );
}
