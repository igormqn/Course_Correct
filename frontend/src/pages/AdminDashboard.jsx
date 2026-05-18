import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { assignmentAPI, courseAPI, serviceAPI } from '../services/api';
import api from '../services/api';

const C = {
  blue: '#1565C0',
  dark: '#0D47A1',
  text: '#1A237E',
  sub: '#546E7A',
  muted: '#90A4AE',
  border: '#E8EAF6',
  bg: '#f8f9ff',
  green: '#2E7D32',
  orange: '#E65100',
};

const MENU = [
  { key: 'overview',  icon: '📊', label: 'Dashboard' },
  { key: 'courses',   icon: '🎓', label: 'Courses' },
  { key: 'users',     icon: '👥', label: 'Students' },
  { key: 'tutors',    icon: '👨‍🏫', label: 'Tutors' },
  { key: 'services',  icon: '⚙️', label: 'Services' },
];

function StatusBadge({ status }) {
  const map = {
    PENDING:     { bg: '#FFF8E1', color: '#E65100', dot: '#FFB300', label: 'Pending' },
    IN_PROGRESS: { bg: '#E3F2FD', color: '#1565C0', dot: '#1976D2', label: 'In Progress' },
    CORRECTED:   { bg: '#E8F5E9', color: '#2E7D32', dot: '#43A047', label: 'Graded' },
    active:      { bg: '#E8F5E9', color: '#2E7D32', dot: '#43A047', label: '● Active' },
    upcoming:    { bg: '#E3F2FD', color: '#1565C0', dot: '#1976D2', label: '◎ Upcoming' },
    past:        { bg: '#f5f5f5', color: '#9e9e9e', dot: '#9e9e9e', label: '● Past' },
  };
  const s = map[status] || { bg: '#f5f5f5', color: '#9e9e9e', dot: '#9e9e9e', label: status };
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: s.bg, color: s.color, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 800 }}>
      {s.label}
    </span>
  );
}

function KPICard({ icon, value, label, sub, warn }) {
  return (
    <div style={{ background: 'white', borderRadius: 12, padding: 16, border: `1.5px solid ${C.border}` }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color: C.text }}>{value}</div>
      <div style={{ fontSize: 11, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 10, marginTop: 4, color: warn ? C.orange : C.green }}>{sub}</div>}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [services, setServices] = useState([]);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [usersRes, assignData, courseData, serviceData] = await Promise.all([
        api.get('/users/'),
        assignmentAPI.getAll(),
        courseAPI.getAll(),
        serviceAPI.getAll(),
      ]);
      setUsers(usersRes.data);
      setAssignments(assignData);
      setCourses(courseData);
      setServices(serviceData);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const students = users.filter(u => u.role === 'STUDENT');
  const tutors = users.filter(u => u.role === 'TUTOR');
  const pending = assignments.filter(a => a.status === 'PENDING').length;
  const activeCourses = courses.filter(c => c.status === 'active').length;

  const tabLabel = { overview: 'Dashboard', courses: 'Courses', users: 'Students', tutors: 'Tutors', services: 'Services' };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, border: `3px solid ${C.border}`, borderTopColor: C.blue, borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }}></div>
          <p style={{ color: C.sub, fontWeight: 600 }}>Loading dashboard...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* Sidebar */}
      <div style={{ width: 210, background: C.dark, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px 18px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <p style={{ fontWeight: 900, fontSize: 14, color: 'white', margin: '0 0 2px' }}>📖 CourseCorrect</p>
          <small style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>NYU Administration</small>
        </div>

        <nav style={{ padding: '10px 0', flex: 1 }}>
          {MENU.map(({ key, icon, label }) => (
            <div
              key={key}
              onClick={() => setActiveTab(key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 20px',
                fontSize: 12,
                fontWeight: 700,
                color: activeTab === key ? 'white' : 'rgba(255,255,255,0.7)',
                background: activeTab === key ? C.blue : 'transparent',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { if (activeTab !== key) e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}
              onMouseLeave={e => { if (activeTab !== key) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 14 }}>{icon}</span>
              {label}
            </div>
          ))}
        </nav>

        <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: 'white', fontWeight: 800 }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'white' }}>{user?.first_name} {user?.last_name}</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.55)' }}>Administrator</div>
            </div>
          </div>
          <button
            onClick={logout}
            style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Nunito, sans-serif', padding: 0 }}
          >
            🚪 Sign out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, background: C.bg, display: 'flex', flexDirection: 'column', overflow: 'auto' }}>

        {/* Top bar */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '14px 24px', borderBottom: `1.5px solid ${C.border}`, background: 'white' }}>
          <h2 style={{ fontSize: 16, fontWeight: 900, color: C.text, margin: 0 }}>{tabLabel[activeTab]}</h2>
          {activeTab === 'overview' && (
            <button
              style={{ marginLeft: 'auto', background: C.blue, color: 'white', border: 'none', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}
            >
              + New Course
            </button>
          )}
        </div>

        <div style={{ padding: 24 }}>

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                <KPICard icon="👨‍🎓" value={students.length} label="Students" sub="↑ Active" />
                <KPICard icon="👨‍🏫" value={tutors.length} label="Active Tutors" sub="↑ This semester" />
                <KPICard icon="📋" value={pending} label="Pending Assignments" sub={pending > 0 ? '⚠ To process' : '✓ All handled'} warn={pending > 0} />
                <KPICard icon="📚" value={activeCourses} label="Active Courses" sub={`${courses.length} total`} />
              </div>

              <div style={{ background: 'white', borderRadius: 12, border: `1.5px solid ${C.border}`, overflow: 'hidden' }}>
                <div style={{ padding: '14px 20px', borderBottom: `1.5px solid ${C.border}` }}>
                  <span style={{ fontSize: 13, fontWeight: 900, color: C.text }}>Recent Courses</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: C.bg }}>
                      {['Course', 'Tutor', 'Students', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1.5px solid ${C.border}` }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {courses.slice(0, 8).map((course, i) => {
                      const tutor = course.tutor_assignments?.[0]?.tutor;
                      return (
                        <tr key={course.id} style={{ borderBottom: i < Math.min(courses.length, 8) - 1 ? `1px solid ${C.border}` : 'none' }}>
                          <td style={{ padding: '12px 16px' }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{course.subject?.icon} {course.subject?.code}: {course.name.replace(course.subject?.name + ' - ', '')}</div>
                            <div style={{ fontSize: 11, color: C.sub }}>{course.subject?.name}</div>
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: C.sub }}>
                            {tutor ? `${tutor.first_name} ${tutor.last_name}` : <span style={{ color: C.muted }}>Unassigned</span>}
                          </td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: C.sub }}>—</td>
                          <td style={{ padding: '12px 16px' }}>
                            <StatusBadge status={course.status} />
                          </td>
                          <td style={{ padding: '12px 16px', display: 'flex', gap: 6 }}>
                            <button style={{ background: 'none', border: `1.5px solid ${C.border}`, borderRadius: 7, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: C.sub, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>Edit</button>
                            <button style={{ background: 'none', border: `1.5px solid ${C.border}`, borderRadius: 7, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: C.blue, cursor: 'pointer', fontFamily: 'Nunito, sans-serif' }}>Tutors</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* COURSES TAB */}
          {activeTab === 'courses' && (
            <div style={{ background: 'white', borderRadius: 12, border: `1.5px solid ${C.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.bg }}>
                    {['Course', 'Subject', 'Tutor', 'Semester', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1.5px solid ${C.border}` }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {courses.map((course, i) => {
                    const tutor = course.tutor_assignments?.[0]?.tutor;
                    return (
                      <tr key={course.id} style={{ borderBottom: i < courses.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 800, color: C.text }}>
                          {course.subject?.icon} {course.subject?.code}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: C.sub }}>{course.subject?.name}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: C.sub }}>
                          {tutor ? `${tutor.first_name} ${tutor.last_name}` : '—'}
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: C.sub }}>{course.semester}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <StatusBadge status={course.status} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* STUDENTS TAB */}
          {activeTab === 'users' && (
            <div style={{ background: 'white', borderRadius: 12, border: `1.5px solid ${C.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.bg }}>
                    {['Student', 'Email', 'Role', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1.5px solid ${C.border}` }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.filter(u => u.role !== 'ADMIN').map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: i < users.filter(x => x.role !== 'ADMIN').length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: u.role === 'STUDENT' ? '#E3F2FD' : '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                            {u.role === 'STUDENT' ? '👨‍🎓' : '👨‍🏫'}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{u.first_name} {u.last_name}</div>
                            <div style={{ fontSize: 11, color: C.muted }}>@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 12, color: C.sub }}>{u.email}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: u.role === 'STUDENT' ? '#E3F2FD' : '#E8F5E9', color: u.role === 'STUDENT' ? C.blue : C.green }}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: u.is_active ? '#E8F5E9' : '#FFEBEE', color: u.is_active ? C.green : '#C62828' }}>
                          {u.is_active ? '● Active' : '● Inactive'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* TUTORS TAB */}
          {activeTab === 'tutors' && (
            <div style={{ background: 'white', borderRadius: 12, border: `1.5px solid ${C.border}`, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: C.bg }}>
                    {['Tutor', 'Email', 'Assigned Courses', 'Status'].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 800, color: C.sub, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: `1.5px solid ${C.border}` }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tutors.map((u, i) => {
                    const assignedCourses = courses.filter(c => c.tutor_assignments?.some(ta => ta.tutor.id === u.id));
                    return (
                      <tr key={u.id} style={{ borderBottom: i < tutors.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>👨‍🏫</div>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{u.first_name} {u.last_name}</div>
                              <div style={{ fontSize: 11, color: C.muted }}>@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: C.sub }}>{u.email}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: C.sub }}>
                          {assignedCourses.length > 0
                            ? assignedCourses.map(c => c.subject?.code).join(', ')
                            : <span style={{ color: C.muted }}>Unassigned</span>
                          }
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800, background: '#E8F5E9', color: C.green }}>
                            ● Active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* SERVICES TAB */}
          {activeTab === 'services' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {services.map(service => (
                <div key={service.id} style={{ background: service.is_premium ? C.dark : 'white', borderRadius: 14, padding: 24, border: `1.5px solid ${service.is_premium ? C.blue : C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>{service.is_premium ? '⭐' : '📝'}</div>
                      <h3 style={{ fontSize: 18, fontWeight: 900, color: service.is_premium ? 'white' : C.text, margin: '0 0 4px' }}>{service.name}</h3>
                      <p style={{ fontSize: 12, color: service.is_premium ? 'rgba(255,255,255,0.65)' : C.sub, margin: 0 }}>{service.description}</p>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 900, color: service.is_premium ? '#90CAF9' : C.blue }}>${service.price}</div>
                  </div>
                  <div style={{ borderTop: `1px solid ${service.is_premium ? 'rgba(255,255,255,0.15)' : C.border}`, paddingTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: service.is_premium ? 'rgba(255,255,255,0.6)' : C.sub }}>Turnaround</span>
                      <span style={{ fontWeight: 800, color: service.is_premium ? 'white' : C.text }}>
                        {service.turnaround_hours}h ({Math.floor(service.turnaround_hours / 24)} days)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
