import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api, setToken } from '../api/client';
import type { Candidate } from '../types';

function formatDate(isoDate: string) {
  return isoDate.slice(0, 10);
}

function formatRub(n: number) {
  return new Intl.NumberFormat('ru-RU').format(n);
}

export function CandidatesPage() {
  const [list, setList] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [desiredSalary, setDesiredSalary] = useState<number>(120000);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [desiredPosition, setDesiredPosition] = useState('');
  const [formMsg, setFormMsg] = useState<{ ok: boolean; text: string } | null>(
    null,
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Candidate[]>('/candidates');
      setList(data);
    } catch {
      setError('Не удалось загрузить список.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormMsg(null);
    try {
      await api.post<Candidate>('/candidates', {
        fullName,
        birthDate,
        desiredSalary,
        email: email || undefined,
        phone: phone || undefined,
        desiredPosition: desiredPosition || undefined,
      });
      setFormMsg({ ok: true, text: 'Кандидат добавлен.' });
      setFullName('');
      setBirthDate('');
      setDesiredSalary(120000);
      setEmail('');
      setPhone('');
      setDesiredPosition('');
      await load();
    } catch (err: unknown) {
      const data = err as {
        response?: { data?: { message?: unknown } };
      };
      const m = data.response?.data?.message;
      const text = Array.isArray(m) ? m.join(', ') : (m as string) || 'Ошибка сохранения.';
      setFormMsg({ ok: false, text });
    }
  }

  function logout() {
    setToken(null);
    window.location.href = '/login';
  }

  return (
    <div className="page">
      <header className="toolbar">
        <div>
          <h1>Кандидаты</h1>
          <p className="muted tiny">Форма №2 — список и добавление записей</p>
        </div>
        <nav className="toolbar-actions">
          <Link className="btn secondary" to="/analytics">
            Аналитика
          </Link>
          <button type="button" className="btn ghost" onClick={logout}>
            Выйти
          </button>
        </nav>
      </header>

      <div className="grid two">
        <section className="card">
          <h2>Новый кандидат</h2>
          <p className="muted small">
            Обязательные поля: ФИО, дата рождения, желаемая зарплата. Дополнительно: email,
            телефон, желаемая должность.
          </p>
          <form onSubmit={onSubmit} className="form">
            <label>
              ФИО *
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                minLength={3}
                placeholder="Иванов Иван Иванович"
              />
            </label>
            <label>
              Дата рождения *
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                required
              />
            </label>
            <label>
              Желаемая ЗП, ₽/мес. *
              <input
                type="number"
                min={0}
                step={5000}
                value={desiredSalary}
                onChange={(e) => setDesiredSalary(Number(e.target.value))}
                required
              />
            </label>
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.ru"
              />
            </label>
            <label>
              Телефон
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+79001234567"
              />
            </label>
            <label>
              Желаемая должность / направление
              <input
                value={desiredPosition}
                onChange={(e) => setDesiredPosition(e.target.value)}
                placeholder="Инженер-программист"
              />
            </label>
            <button type="submit" className="btn primary">
              Сохранить
            </button>
          </form>
          {formMsg && (
            <div className={formMsg.ok ? 'banner banner-ok' : 'banner banner-err'}>
              {formMsg.text}
            </div>
          )}
        </section>

        <section className="card table-card">
          <div className="row-between">
            <h2>Список</h2>
            <button type="button" className="btn ghost small" onClick={load}>
              Обновить
            </button>
          </div>
          {loading && <p className="muted">Загрузка…</p>}
          {error && <p className="banner banner-err">{error}</p>}
          {!loading && !error && list.length === 0 && (
            <p className="muted">Кандидатов пока нет.</p>
          )}
          {!loading && list.length > 0 && (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>ФИО</th>
                    <th>Дата рождения</th>
                    <th>ЗП</th>
                    <th>Должность</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((c) => (
                    <tr key={c.id}>
                      <td>{c.fullName}</td>
                      <td>{formatDate(c.birthDate)}</td>
                      <td>{formatRub(c.desiredSalary)}</td>
                      <td>{c.desiredPosition || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <footer className="muted small center footer-hint">
        <Link to="/analytics">Форма №3 — перейти к аналитике и графикам</Link>
      </footer>
    </div>
  );
}
