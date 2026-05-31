import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', confirm_password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirm_password } = formData;
    if (username.trim().length < 3)      { toast.error('Username must be at least 3 characters.'); return; }
    if (!/\S+@\S+\.\S+/.test(email))     { toast.error('Please enter a valid email.'); return; }
    if (password.length < 8)             { toast.error('Password must be at least 8 characters.'); return; }
    if (password !== confirm_password)   { toast.error('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register/', formData);
      if (data.success) {
        login(data.user, data.access, data.refresh);
        toast.success('Account created! Welcome to your diary 📖');
        navigate('/dashboard');
      }
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) Object.values(errors).flat().forEach((msg) => toast.error(msg));
      else toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const strength = (() => {
    const p = formData.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8)       s++;
    if (/[A-Z]/.test(p))     s++;
    if (/[0-9]/.test(p))     s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'][strength];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Georgia', serif",
      overflow: 'hidden',
      position: 'relative',
      padding: '24px 16px',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lato:wght@300;400;700&display=swap');
        * { box-sizing: border-box; }

        .orb { position:absolute; border-radius:50%; filter:blur(80px); animation:drift2 8s ease-in-out infinite alternate; pointer-events:none; }
        .orb-a { width:350px;height:350px;background:rgba(99,102,241,0.25);top:-80px;right:-60px;animation-delay:0s; }
        .orb-b { width:280px;height:280px;background:rgba(6,182,212,0.2);bottom:-60px;left:-40px;animation-delay:3s; }
        .orb-c { width:180px;height:180px;background:rgba(236,72,153,0.15);top:50%;left:30%;animation-delay:1.5s; }
        @keyframes drift2 {
          from { transform:translate(0,0) scale(1); }
          to   { transform:translate(-25px,20px) scale(1.1); }
        }
        .star { position:absolute;background:white;border-radius:50%;animation:twinkle2 3s ease-in-out infinite; }
        @keyframes twinkle2 { 0%,100%{opacity:.15;transform:scale(1)} 50%{opacity:.9;transform:scale(1.6)} }

        .reg-card {
          background: rgba(255,255,255,0.06);
          backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 28px;
          padding: 44px;
          width: 100%;
          max-width: 460px;
          box-shadow: 0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1);
          transition: opacity 0.4s ease, transform 0.4s ease;
        }
        .reg-enter { opacity:0; transform:translateY(32px); }
        .reg-ready { opacity:1; transform:translateY(0); }

        .logo-hex {
          width: 80px; height: 80px;
          background: linear-gradient(135deg, #6366f1, #06b6d4, #ec4899);
          border-radius: 20px;
          display: flex; align-items:center; justify-content:center;
          margin: 0 auto 12px;
          box-shadow: 0 0 40px rgba(99,102,241,0.5);
          animation: rock 4s ease-in-out infinite;
          transform-origin: center bottom;
        }
        @keyframes rock {
          0%,100% { transform:rotate(-3deg); }
          50%      { transform:rotate(3deg); }
        }

        .lbl { display:block; font-size:11px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:rgba(200,200,255,.65); margin-bottom:7px; font-family:'Lato',sans-serif; }
        .inp {
          width:100%; background:rgba(255,255,255,.07); border:1px solid rgba(255,255,255,.12);
          border-radius:13px; padding:13px 14px 13px 44px; color:#fff; font-size:14px;
          font-family:'Lato',sans-serif; outline:none;
          transition:border-color .3s,background .3s,box-shadow .3s;
        }
        .inp::placeholder { color:rgba(255,255,255,.22); }
        .inp:focus { border-color:rgba(99,102,241,.7); background:rgba(255,255,255,.1); box-shadow:0 0 0 3px rgba(99,102,241,.2); }
        .inp-wrap { position:relative; margin-bottom:16px; }
        .ico { position:absolute; left:13px; top:50%; transform:translateY(-50%); opacity:.4; pointer-events:none; }
        .ico-r { position:absolute; right:13px; top:50%; transform:translateY(-50%); background:none; border:none; color:white; cursor:pointer; opacity:.4; transition:opacity .2s; padding:0; }
        .ico-r:hover { opacity:.85; }

        .strength-bar { display:flex; gap:4px; margin-top:6px; }
        .strength-seg { height:3px; flex:1; border-radius:2px; transition:background .3s; }

        .btn {
          width:100%; padding:15px; background:linear-gradient(135deg,#6366f1,#06b6d4);
          border:none; border-radius:13px; color:white; font-size:15px; font-weight:700;
          letter-spacing:.06em; cursor:pointer; margin-top:6px; position:relative; overflow:hidden;
          transition:transform .2s,box-shadow .2s;
          box-shadow:0 8px 24px rgba(99,102,241,.4);
          font-family:'Lato',sans-serif;
        }
        .btn::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,.15),transparent); opacity:0; transition:opacity .3s; }
        .btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 12px 32px rgba(99,102,241,.55); }
        .btn:hover::before { opacity:1; }
        .btn:disabled { opacity:.55; cursor:not-allowed; }
        .btn.ld::after { content:''; position:absolute; top:0; left:-100%; width:100%; height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.2),transparent); animation:shim 1.2s infinite; }
        @keyframes shim { to { left:100%; } }

        .foot { color:rgba(200,200,255,.4); font-size:13px; text-align:center; margin-top:22px; font-family:'Lato',sans-serif; }
        .foot a { color:#a5b4fc; font-weight:700; text-decoration:none; border-bottom:1px solid rgba(165,180,252,.4); padding-bottom:1px; transition:color .2s; }
        .foot a:hover { color:#c7d2fe; }

        .welcome-line { font-family:'Playfair Display',serif; font-size:13px; font-style:italic; color:rgba(165,180,252,.8); text-align:center; margin-bottom:2px; }
        .app-title { font-family:'Playfair Display',serif; font-size:27px; font-weight:700; color:#fff; text-align:center; margin:0 0 4px; text-shadow:0 0 40px rgba(165,180,252,.4); }
        .app-sub { font-size:13px; color:rgba(200,200,255,.4); text-align:center; margin-bottom:28px; font-family:'Lato',sans-serif; }
        .card-title { font-family:'Playfair Display',serif; font-size:21px; font-weight:700; color:#fff; margin:0 0 24px; }

        .two-col { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
      `}</style>

      <div className="orb orb-a" />
      <div className="orb orb-b" />
      <div className="orb orb-c" />

      {Array.from({ length: 35 }).map((_, i) => (
        <div key={i} className="star" style={{
          left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
          width: `${1+Math.random()*2}px`, height: `${1+Math.random()*2}px`,
          animationDelay: `${Math.random()*3}s`, animationDuration: `${2+Math.random()*3}s`,
        }} />
      ))}

      <div style={{ width:'100%', maxWidth:460, position:'relative', zIndex:10 }}>
        {/* Top branding */}
        <div style={{ marginBottom: 20 }}>
          <div className="logo-hex">
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none">
              {/* Open book */}
              <path d="M21 10 C21 10 14 8 7 10 L7 32 C14 30 21 32 21 32" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M21 10 C21 10 28 8 35 10 L35 32 C28 30 21 32 21 32" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinejoin="round"/>
              <line x1="21" y1="10" x2="21" y2="32" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5"/>
              {/* Lines on left page */}
              <line x1="11" y1="16" x2="19" y2="15" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round"/>
              <line x1="11" y1="20" x2="19" y2="19" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round"/>
              <line x1="11" y1="24" x2="17" y2="23" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round"/>
              {/* Lines on right page */}
              <line x1="23" y1="15" x2="31" y2="16" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round"/>
              <line x1="23" y1="19" x2="31" y2="20" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round"/>
              <line x1="25" y1="23" x2="31" y2="24" stroke="rgba(255,255,255,0.6)" strokeWidth="1" strokeLinecap="round"/>
              {/* Pen / quill */}
              <line x1="30" y1="10" x2="36" y2="4" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="30" cy="10" r="2" fill="#fbbf24"/>
            </svg>
          </div>
          <p className="welcome-line">Begin your journey with</p>
          <h1 className="app-title">My Diary</h1>
          <p className="app-sub">A private space for your thoughts, feelings & memories</p>
        </div>

        <div className={`reg-card ${mounted ? 'reg-ready' : 'reg-enter'}`}>
          <h2 className="card-title">Create your account</h2>

          <form onSubmit={handleSubmit}>
            <div className="two-col">
              {/* Username */}
              <div>
                <label className="lbl">Username</label>
                <div className="inp-wrap" style={{ marginBottom: 0 }}>
                  <span className="ico">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </span>
                  <input className="inp" name="username" value={formData.username} onChange={handleChange} placeholder="johndoe" />
                </div>
              </div>
              {/* Email */}
              <div>
                <label className="lbl">Email</label>
                <div className="inp-wrap" style={{ marginBottom: 0 }}>
                  <span className="ico">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 7L2 7"/></svg>
                  </span>
                  <input className="inp" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
                </div>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="lbl">Password</label>
              <div className="inp-wrap" style={{ marginBottom: 0 }}>
                <span className="ico">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input className="inp" type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange} placeholder="Min. 8 characters" style={{ paddingRight: 44 }} />
                <button type="button" className="ico-r" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
              {/* Strength bar */}
              {formData.password && (
                <div>
                  <div className="strength-bar">
                    {[1,2,3,4].map((n) => (
                      <div key={n} className="strength-seg" style={{ background: n <= strength ? strengthColor : 'rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                  <p style={{ fontSize:11, color: strengthColor, marginTop:4, fontFamily:"'Lato',sans-serif" }}>{strengthLabel} password</p>
                </div>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="lbl">Confirm Password</label>
              <div className="inp-wrap">
                <span className="ico">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M9 12l2 2 4-4"/><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input className="inp" type={showPassword ? 'text' : 'password'} name="confirm_password"
                  value={formData.confirm_password} onChange={handleChange} placeholder="Repeat password" />
                {formData.confirm_password && (
                  <span style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)' }}>
                    {formData.password === formData.confirm_password
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M20 6L9 17l-5-5"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    }
                  </span>
                )}
              </div>
            </div>

            <button type="submit" className={`btn ${loading ? 'ld' : ''}`} disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p className="foot">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
      </div>
    </div>
  );
}
