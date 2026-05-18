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

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'STUDENT',
    terms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (!formData.terms) { setError('You must agree to the Terms of Service'); return; }
    setLoading(true);
    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      first_name: formData.firstName,
      last_name: formData.lastName,
      role: formData.role,
    });
    if (result.success) {
      const role = result.user.role;
      if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'TUTOR') navigate('/tutor/dashboard');
    } else {
      setError(typeof result.error === 'string' ? result.error : 'Registration failed');
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
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 11,
    fontWeight: 800,
    color: C.sub,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: 500, maxWidth: '100%', paddingTop: 24, paddingBottom: 24 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>📖</div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: 0 }}>
            <em style={{ fontStyle: 'normal' }}>Course</em><b style={{ color: C.blue }}>Correct</b>
          </h1>
          <p style={{ fontSize: 12, color: C.sub, margin: '4px 0 0' }}>NYU</p>
        </div>

        {/* Card */}
        <div style={{ background: 'white', borderRadius: 16, padding: '32px 28px', border: `1.5px solid ${C.border}`, boxShadow: '0 4px 24px rgba(21,101,192,0.08)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 900, color: C.text, margin: '0 0 24px' }}>Create Account</h2>

          {error && (
            <div style={{ background: '#FFEBEE', border: '1.5px solid #FFCDD2', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 13, color: '#C62828', fontWeight: 600 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Role */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>I am a...</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[
                  { value: 'STUDENT', icon: '👨‍🎓', label: 'Student', desc: 'Submit assignments' },
                  { value: 'TUTOR', icon: '👨‍🏫', label: 'Tutor', desc: 'Correct assignments' },
                ].map(({ value, icon, label, desc }) => (
                  <label
                    key={value}
                    style={{
                      display: 'block',
                      padding: '14px',
                      borderRadius: 10,
                      border: `1.5px solid ${formData.role === value ? C.blue : C.border}`,
                      background: formData.role === value ? '#E3F2FD' : 'white',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input type="radio" name="role" value={value} checked={formData.role === value} onChange={handleChange} style={{ display: 'none' }} />
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{label}</div>
                    <div style={{ fontSize: 11, color: C.sub }}>{desc}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Name */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={labelStyle}>First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required placeholder="Alex" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required placeholder="Morgan" style={inputStyle} />
              </div>
            </div>

            {/* Username */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>Username</label>
              <input type="text" name="username" value={formData.username} onChange={handleChange} required placeholder="alex.morgan" style={inputStyle} />
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <label style={labelStyle}>University Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="alex.morgan@nyu.edu" style={inputStyle} />
            </div>

            {/* Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} required minLength={8} placeholder="Min 8 characters" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="••••••••" style={inputStyle} />
              </div>
            </div>

            {/* Terms */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 20 }}>
              <input
                type="checkbox"
                id="terms"
                name="terms"
                checked={formData.terms}
                onChange={handleChange}
                style={{ marginTop: 2, accentColor: C.blue, width: 16, height: 16, flexShrink: 0 }}
              />
              <label htmlFor="terms" style={{ fontSize: 12, color: C.sub, cursor: 'pointer', lineHeight: 1.5 }}>
                I agree to the{' '}
                <Link to="/terms" style={{ color: C.blue, fontWeight: 700, textDecoration: 'none' }}>Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" style={{ color: C.blue, fontWeight: 700, textDecoration: 'none' }}>Privacy Policy</Link>
              </label>
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
              }}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: C.sub }}>
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 800, color: C.blue, textDecoration: 'none' }}>Sign in</Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: C.muted, marginTop: 16 }}>
          © 2025 CourseCorrect — NYU
        </p>
      </div>
    </div>
  );
}
