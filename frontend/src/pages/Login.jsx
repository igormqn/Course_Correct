import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const C = {
  blue: '#1565C0',
  dark: '#0D47A1',
  text: '#1A237E',
  sub: '#546E7A',
  muted: '#90A4AE',
  border: '#E8EAF6',
  bg: '#f8f9ff',
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await login({ username: formData.username, password: formData.password });
    if (result.success) {
      const role = result.user.role;
      if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'TUTOR') navigate('/tutor/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  const inputStyle = {
    border: `1.5px solid ${C.border}`,
    borderRadius: 10,
    padding: '10px 14px',
    width: '100%',
    fontSize: 13,
    fontWeight: 600,
    color: C.text,
    outline: 'none',
    background: 'white',
    fontFamily: 'Nunito, sans-serif',
    transition: 'border-color 0.2s',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: 400, maxWidth: '100%' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>📖</div>
          <h1 style={{ fontSize: 28, fontWeight: 900, color: C.text, margin: 0 }}>
            <em style={{ fontStyle: 'normal' }}>Course</em>
            <b style={{ color: C.blue }}>Correct</b>
          </h1>
          <p style={{ fontSize: 12, color: C.sub, margin: '4px 0 0' }}>NYU</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 16, padding: '32px 28px', border: `1.5px solid ${C.border}`, boxShadow: '0 4px 24px rgba(21,101,192,0.08)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: C.text, margin: '0 0 24px' }}>Welcome back!</h2>

          {error && (
            <div style={{ background: '#FFEBEE', border: '1.5px solid #FFCDD2', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#C62828', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: C.sub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="alex.morgan"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = C.blue}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: C.sub, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = C.blue}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </div>

            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <Link to="/forgot-password" style={{ fontSize: 12, fontWeight: 700, color: C.blue, textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? C.muted : C.blue,
                color: 'white',
                border: 'none',
                borderRadius: 10,
                padding: '12px',
                fontSize: 14,
                fontWeight: 800,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'Nunito, sans-serif',
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: C.sub }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ fontWeight: 800, color: C.blue, textDecoration: 'none' }}>Sign up</Link>
          </div>
        </div>

        {/* Test Accounts */}
        <div style={{ marginTop: 16, background: 'white', borderRadius: 14, padding: '16px 20px', border: `1.5px solid ${C.border}` }}>
          <p style={{ fontSize: 10, fontWeight: 800, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>
            Test Accounts
          </p>
          {[
            { icon: '👨‍🎓', label: 'Student', creds: 'alex.morgan / student123' },
            { icon: '👨‍🏫', label: 'Tutor', creds: 'james.williams / tutor123' },
            { icon: '👨‍💼', label: 'Admin', creds: 'admin / admin123' },
          ].map(({ icon, label, creds }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px', borderRadius: 8, background: C.bg, marginBottom: 6, fontSize: 12 }}>
              <span style={{ fontWeight: 700, color: C.text }}>{icon} {label}</span>
              <code style={{ color: C.blue, fontWeight: 700 }}>{creds}</code>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: C.muted, marginTop: 16 }}>
          © 2025 CourseCorrect — NYU
        </p>
      </div>
    </div>
  );
}
