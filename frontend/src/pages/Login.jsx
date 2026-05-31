import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState('');
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) { toast.error('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login/', formData);
      if (data.success) {
        login(data.user, data.access, data.refresh);
        toast.success(`Welcome back, ${data.user.username}!`);
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Login failed.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Georgia', 'Times New Roman', serif",
      overflow: 'hidden',
      position: 'relative',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400&display=swap');

        * { box-sizing: border-box; }

        .auth-wrap {
          font-family: 'Lato', sans-serif;
        }

        /* Floating orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          animation: drift 8s ease-in-out infinite alternate;
          pointer-events: none;
        }
        .orb1 { width: 400px; height: 400px; background: rgba(120,80,255,0.25); top: -100px; left: -100px; animation-delay: 0s; }
        .orb2 { width: 300px; height: 300px; background: rgba(0,200,255,0.2);   bottom: -80px; right: -80px; animation-delay: 2s; }
        .orb3 { width: 200px; height: 200px; background: rgba(255,100,150,0.15); top: 40%; left: 60%; animation-delay: 4s; }

        @keyframes drift {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(30px, 20px) scale(1.08); }
        }

        /* Stars */
        .star {
          position: absolute;
          width: 2px; height: 2px;
          background: white;
          border-radius: 50%;
          animation: twinkle 3s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%,100% { opacity: 0.2; transform: scale(1); }
          50%      { opacity: 1;   transform: scale(1.5); }
        }

        /* Card */
        .card {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 28px;
          padding: 48px 44px;
          width: 100%;
          max-width: 440px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
          transition: transform 0.4s ease, opacity 0.4s ease;
        }
        .card-enter { opacity: 0; transform: translateY(32px); }
        .card-ready { opacity: 1; transform: translateY(0); }

        /* Logo */
        .logo-ring {
          width: 80px; height: 80px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #2563eb, #06b6d4);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 8px;
          box-shadow: 0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(37,99,235,0.3);
          animation: pulse-glow 3s ease-in-out infinite;
          position: relative;
        }
        @keyframes pulse-glow {
          0%,100% { box-shadow: 0 0 40px rgba(124,58,237,0.5), 0 0 80px rgba(37,99,235,0.3); }
          50%      { box-shadow: 0 0 60px rgba(124,58,237,0.8), 0 0 120px rgba(37,99,235,0.5); }
        }
        .logo-ring::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid transparent;
          background: linear-gradient(135deg, #7c3aed, #06b6d4) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: destination-out;
          mask-composite: exclude;
          animation: spin 6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Input */
        .field-wrap { position: relative; margin-bottom: 20px; }
        .field-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(200,200,255,0.7);
          margin-bottom: 8px;
        }
        .field-input {
          width: 100%;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 14px;
          padding: 14px 44px 14px 44px;
          color: #fff;
          font-size: 15px;
          font-family: 'Lato', sans-serif;
          outline: none;
          transition: border-color 0.3s, background 0.3s, box-shadow 0.3s;
        }
        .field-input::placeholder { color: rgba(255,255,255,0.25); }
        .field-input:focus {
          border-color: rgba(124,58,237,0.7);
          background: rgba(255,255,255,0.1);
          box-shadow: 0 0 0 3px rgba(124,58,237,0.2);
        }
        .field-icon {
          position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
          opacity: 0.45; pointer-events: none;
        }
        .field-icon-right {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          cursor: pointer; opacity: 0.45; transition: opacity 0.2s;
          background: none; border: none; color: white; padding: 0;
        }
        .field-icon-right:hover { opacity: 0.85; }

        /* Button */
        .btn-submit {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #7c3aed, #2563eb);
          border: none;
          border-radius: 14px;
          color: white;
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0.06em;
          cursor: pointer;
          margin-top: 8px;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 8px 24px rgba(124,58,237,0.4);
        }
        .btn-submit::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }
        .btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px rgba(124,58,237,0.5); }
        .btn-submit:hover::before { opacity: 1; }
        .btn-submit:active:not(:disabled) { transform: translateY(0); }
        .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Shimmer loading */
        .btn-submit.loading::after {
          content: '';
          position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          animation: shimmer 1.2s infinite;
        }
        @keyframes shimmer { to { left: 100%; } }

        .divider-text {
          color: rgba(200,200,255,0.4);
          font-size: 13px;
          text-align: center;
          margin-top: 24px;
        }
        .divider-text a {
          color: #a78bfa;
          font-weight: 700;
          text-decoration: none;
          border-bottom: 1px solid rgba(167,139,250,0.4);
          padding-bottom: 1px;
          transition: color 0.2s, border-color 0.2s;
        }
        .divider-text a:hover { color: #c4b5fd; border-color: #c4b5fd; }

        /* Heading */
        .welcome-line {
          font-family: 'Playfair Display', serif;
          font-size: 13px;
          font-style: italic;
          color: rgba(167,139,250,0.8);
          text-align: center;
          letter-spacing: 0.05em;
          margin-bottom: 2px;
        }
        .app-title {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
          text-align: center;
          margin: 0 0 4px;
          text-shadow: 0 0 40px rgba(167,139,250,0.4);
        }
        .app-sub {
          font-size: 13px;
          color: rgba(200,200,255,0.45);
          text-align: center;
          margin-bottom: 36px;
          letter-spacing: 0.03em;
        }
        .card-title {
          font-family: 'Playfair Display', serif;
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 28px;
        }
      `}</style>

      {/* Background orbs */}
      <div className="orb orb1" />
      <div className="orb orb2" />
      <div className="orb orb3" />

      {/* Stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="star" style={{
          left: `${Math.random() * 100}%`,
          top:  `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 3}s`,
          animationDuration: `${2 + Math.random() * 3}s`,
          width: `${1 + Math.random() * 2}px`,
          height: `${1 + Math.random() * 2}px`,
        }} />
      ))}

      <div style={{ width: '100%', maxWidth: 440, padding: '0 16px', position: 'relative', zIndex: 10 }}>
        {/* Logo + title above card */}
        <div style={{ marginBottom: 24 }}>
          <div className="logo-ring" style={{ marginBottom: 16 }}>
            {/* Custom diary SVG icon */}
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="8" y="5" width="22" height="30" rx="3" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
              <rect x="5" y="7" width="5" height="26" rx="2" fill="rgba(255,255,255,0.3)" stroke="rgba(255,255,255,0.5)" strokeWidth="1"/>
              <line x1="13" y1="13" x2="25" y2="13" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="13" y1="18" x2="25" y2="18" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="13" y1="23" x2="21" y2="23" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="29" cy="29" r="6" fill="#7c3aed"/>
              <line x1="29" y1="26" x2="29" y2="32" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="26" y1="29" x2="32" y2="29" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="welcome-line">Welcome to</p>
          <h1 className="app-title">My Diary</h1>
          <p className="app-sub">Your private sanctuary for thoughts & memories</p>
        </div>

        <div className={`card auth-wrap ${mounted ? 'card-ready' : 'card-enter'}`}>
          <h2 className="card-title">Sign in</h2>

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="field-wrap">
              <label className="field-label">Email address</label>
              <div style={{ position: 'relative' }}>
                <span className="field-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/>
                  </svg>
                </span>
                <input className="field-input" type="email" name="email"
                  value={formData.email} onChange={handleChange}
                  placeholder="you@example.com"
                  onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-wrap">
              <label className="field-label">Password</label>
              <div style={{ position: 'relative' }}>
                <span className="field-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input className="field-input" type={showPassword ? 'text' : 'password'}
                  name="password" value={formData.password} onChange={handleChange}
                  placeholder="••••••••"
                  onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                />
                <button type="button" className="field-icon-right" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword
                    ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            <button type="submit" className={`btn-submit ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p className="divider-text">
            Don't have an account? <Link to="/register">Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
