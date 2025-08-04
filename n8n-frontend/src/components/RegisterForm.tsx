import React, { useState } from 'react';

const RegisterForm: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await fetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          username: form.username,
          hashed_password: form.password,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Registration failed');
      }
      setSuccess(true);
      setForm({ name: '', email: '', username: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      maxWidth: 380,
      margin: '40px auto',
      background: 'rgba(30,30,40,0.98)',
      borderRadius: 12,
      boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
      padding: 32,
      display: 'flex',
      flexDirection: 'column',
      gap: 18,
      color: '#fff',
    }}>
      <h2 style={{ margin: 0, marginBottom: 12, fontWeight: 800, fontSize: 26, color: '#FFD700', textAlign: 'center' }}>Register</h2>
      <input
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        required
        style={{ padding: 12, borderRadius: 8, border: '1.5px solid #444', fontSize: 16, background: '#181820', color: '#fff' }}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        style={{ padding: 12, borderRadius: 8, border: '1.5px solid #444', fontSize: 16, background: '#181820', color: '#fff' }}
      />
      <input
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={handleChange}
        required
        style={{ padding: 12, borderRadius: 8, border: '1.5px solid #444', fontSize: 16, background: '#181820', color: '#fff' }}
      />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
        style={{ padding: 12, borderRadius: 8, border: '1.5px solid #444', fontSize: 16, background: '#181820', color: '#fff' }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          background: 'linear-gradient(90deg, #FFD700 0%, #43D675 100%)',
          color: '#23232b',
          border: 'none',
          borderRadius: 8,
          padding: '12px 0',
          fontWeight: 700,
          fontSize: 18,
          cursor: 'pointer',
          marginTop: 8,
        }}
      >
        {loading ? 'Registering...' : 'Register'}
      </button>
      {error && <div style={{ color: '#ff4d4f', fontWeight: 600, marginTop: 4 }}>{error}</div>}
      {success && <div style={{ color: '#43D675', fontWeight: 600, marginTop: 4 }}>Registration successful! You can now log in.</div>}
    </form>
  );
};

export default RegisterForm; 