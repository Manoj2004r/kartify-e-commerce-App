import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Banner } from '../components/Feedback';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(form.email, form.password);
    if (res.success) {
      navigate(location.state?.from?.pathname || '/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-1 font-display text-2xl font-bold">Welcome back</h1>
      <p className="mb-6 text-sm text-ink/50">Sign in to continue to Kartify.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium">Email</label>
          <input
            id="email"
            type="email"
            required
            className="input"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1 block text-sm font-medium">Password</label>
          <input
            id="password"
            type="password"
            required
            className="input"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
        </div>
        {error && <Banner type="error">{error}</Banner>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">
        Demo account: <strong>demo@kartify.dev</strong> / <strong>Demo@1234</strong>
      </p>

      <p className="mt-6 text-center text-sm text-ink/60">
        New to Kartify?{' '}
        <Link to="/register" className="font-medium text-brand-500 hover:underline">Create an account</Link>
      </p>
    </div>
  );
}
