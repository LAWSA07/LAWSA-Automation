import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import { useState } from 'react';
import WorkflowEditor from './components/WorkflowEditor';

const Home: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <h1 style={{ fontSize: 48, fontWeight: 900, letterSpacing: 2, marginBottom: 16 }}>lawsa</h1>
      <div style={{ fontSize: 20, color: '#bbb', marginBottom: 36, fontWeight: 400, textAlign: 'center', maxWidth: 400 }}>
        The minimalist automation platform.<br />Build, connect, and automate—simply.
      </div>
      <button
        style={{ background: '#fff', color: '#000', border: 'none', borderRadius: 8, padding: '16px 40px', fontSize: 22, fontWeight: 700, cursor: 'pointer', marginBottom: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}
        onClick={() => navigate('/register')}
      >
        Get Started
      </button>
    </div>
  );
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const handleRegister = async () => {
    setError('');
    const res = await fetch('http://localhost:8000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    let data;
    try {
      data = await res.json();
    } catch {
      setError('Server error or invalid response');
      return;
    }
    if (data.success) {
      navigate('/login');
    } else {
      setError(data.error || 'Registration failed');
    }
  };
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: 36, minWidth: 320, maxWidth: 400, width: '100%' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24, textAlign: 'center' }}>Register</h2>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: 16, padding: 12, borderRadius: 8, border: '1.5px solid #bbb', width: '100%', fontSize: 17 }} />
        <div style={{ position: 'relative', marginBottom: 18 }}>
          <input placeholder="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} style={{ padding: 12, borderRadius: 8, border: '1.5px solid #bbb', width: '100%', fontSize: 17 }} />
          <button onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 'none', color: '#888', fontSize: 15, cursor: 'pointer' }}>{showPassword ? 'Hide' : 'Show'}</button>
        </div>
        {error && <div style={{ color: '#f00', marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        <button style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontSize: 18, fontWeight: 700, cursor: 'pointer', marginBottom: 16, width: '100%' }} onClick={handleRegister}>Register</button>
        <div style={{ textAlign: 'center', color: '#888', margin: '12px 0' }}>or</div>
        <button style={{ background: 'none', color: '#000', border: 'none', fontSize: 15, cursor: 'pointer', textDecoration: 'underline', width: '100%' }} onClick={() => navigate('/login')}>Already have an account? Login</button>
      </div>
    </div>
  );
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const handleLogin = async () => {
    setError('');
    const res = await fetch('http://localhost:8000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    let data;
    try {
      data = await res.json();
    } catch {
      setError('Server error or invalid response');
      return;
    }
    if (data.access_token) {
      localStorage.setItem('lawsa_token', data.access_token);
      navigate('/automation');
    } else {
      setError(data.error || 'Login failed');
    }
  };
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: 36, minWidth: 320, maxWidth: 400, width: '100%' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24, textAlign: 'center' }}>Login</h2>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ marginBottom: 16, padding: 12, borderRadius: 8, border: '1.5px solid #bbb', width: '100%', fontSize: 17 }} />
        <div style={{ position: 'relative', marginBottom: 18 }}>
          <input placeholder="Password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} style={{ padding: 12, borderRadius: 8, border: '1.5px solid #bbb', width: '100%', fontSize: 17 }} />
          <button onClick={() => setShowPassword(v => !v)} style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 'none', color: '#888', fontSize: 15, cursor: 'pointer' }}>{showPassword ? 'Hide' : 'Show'}</button>
        </div>
        {error && <div style={{ color: '#f00', marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        <button style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 32px', fontSize: 18, fontWeight: 700, cursor: 'pointer', marginBottom: 16, width: '100%' }} onClick={handleLogin}>Login</button>
        <div style={{ textAlign: 'center', color: '#888', margin: '12px 0' }}>or</div>
        <button style={{ background: 'none', color: '#000', border: 'none', fontSize: 15, cursor: 'pointer', textDecoration: 'underline', width: '100%' }} onClick={() => navigate('/register')}>Don't have an account? Register</button>
      </div>
    </div>
  );
};

const Automation: React.FC = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('lawsa_token');
    navigate('/login');
  };
  return (
    <div style={{ minHeight: '100vh', background: '#fff', color: '#000' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 24 }}>
        <button onClick={handleLogout} style={{ background: '#000', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 24px', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>Logout</button>
      </div>
      <WorkflowEditor />
    </div>
  );
};

const App: React.FC = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/automation" element={<Automation />} />
    </Routes>
  </Router>
);

export default App; 