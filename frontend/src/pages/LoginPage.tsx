import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { api, getToken, setToken } from '../api/client';

function messageFromError(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const data = (err as { response?: { data?: { message?: unknown } } }).response?.data;
    const m = data?.message;
    if (Array.isArray(m)) {
      return m.join(', ');
    }
    if (typeof m === 'string') {
      return m;
    }
  }
  return 'Не удалось выполнить вход. Проверьте соединение.';
}

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const token = getToken();
  const from = (location.state as { from?: string } | null)?.from ?? '/candidates';

  if (token) {
    return <Navigate to={from} replace />;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus(null);
    setBusy(true);
    try {
      const { data } = await api.post<{
        success: boolean;
        message: string;
        access_token: string;
      }>('/auth/login', { username, password });
      setToken(data.access_token);
      setStatus({ type: 'ok', text: data.message });
      navigate(from, { replace: true });
    } catch (err) {
      setStatus({ type: 'err', text: messageFromError(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page narrow">
      <div className="card">
        <h1>Вход</h1>
        <p className="muted">
          Тестовый аккаунт: <code>admin</code> / <code>admin123</code>
        </p>
        <form onSubmit={onSubmit} className="form">
          <label>
            Логин
            <input
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={busy}
            />
          </label>
          <label>
            Пароль
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={busy}
            />
          </label>
          <button type="submit" disabled={busy} className="btn primary">
            {busy ? 'Вход…' : 'Войти'}
          </button>
        </form>
        {status && (
          <div className={`banner ${status.type === 'ok' ? 'banner-ok' : 'banner-err'}`}>
            {status.text}
          </div>
        )}
      </div>
      <p className="center muted tiny">
        <Link to="/candidates">К кандидатам</Link> (требуется авторизация)
      </p>
    </div>
  );
}
