import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { api, setToken } from '../api/client';
import type { Dashboard } from '../types';

const rub = (n: number) => new Intl.NumberFormat('ru-RU').format(n);

export function AnalyticsPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data: dash } = await api.get<Dashboard>('/analytics/dashboard');
        if (alive) setData(dash);
      } catch {
        if (alive) setError('Не удалось загрузить аналитику.');
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const rankingChart = useMemo(() => {
    if (!data?.ranking?.length) return [];
    return [...data.ranking]
      .sort((a, b) => b.desiredSalary - a.desiredSalary)
      .map((r) => ({
        name:
          r.fullName.length > 22 ? `${r.fullName.slice(0, 20)}…` : r.fullName,
        fullName: r.fullName,
        ЗП: r.desiredSalary,
        Возраст: r.age,
        Место: r.rank,
      }));
  }, [data]);

  function logout() {
    setToken(null);
    window.location.href = '/login';
  }

  return (
    <div className="page">
      <header className="toolbar">
        <div>
          <h1>Аналитика</h1>
          <p className="muted tiny">Форма №3 — рейтинг и распределения по ЗП и возрасту</p>
        </div>
        <nav className="toolbar-actions">
          <Link className="btn secondary" to="/candidates">
            К кандидатам
          </Link>
          <button type="button" className="btn ghost" onClick={logout}>
            Выйти
          </button>
        </nav>
      </header>

      {error && <p className="banner banner-err">{error}</p>}

      {data && data.count === 0 && (
        <p className="muted card">Нет данных для анализа. Добавьте кандидатов на предыдущей странице.</p>
      )}

      {data && data.count > 0 && (
        <>
          <section className="stats">
            <div className="stat card">
              <div className="stat-label">Кандидатов</div>
              <div className="stat-value">{data.count}</div>
            </div>
            <div className="stat card">
              <div className="stat-label">Средняя ЗП</div>
              <div className="stat-value">{rub(data.salary.avg)}</div>
            </div>
            <div className="stat card">
              <div className="stat-label">Мин / макс ЗП</div>
              <div className="stat-value small">
                {rub(data.salary.min)} — {rub(data.salary.max)}
              </div>
            </div>
          </section>

          <section className="card chart-block">
            <h2>Рейтинг по желаемой ЗП</h2>
            <p className="muted small">
              Столбцы отсортированы по убыванию ожиданий по зарплате; подпись — сокращённое ФИО.
            </p>
            <div className="chart-h">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rankingChart} margin={{ top: 8, right: 8, left: 8, bottom: 64 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} angle={-28} textAnchor="end" height={72} />
                  <YAxis tickFormatter={(v) => rub(Number(v))} width={88} />
                  <Tooltip
                    formatter={(value, name) => {
                      const n = typeof value === 'number' ? value : Number(value);
                      const label = typeof name === 'string' ? name : String(name ?? '');
                      if (label === 'ЗП') {
                        return [`${rub(n)} ₽`, label];
                      }
                      return [n, label];
                    }}
                    labelFormatter={(_, p) => {
                      const row = p?.[0]?.payload as { fullName?: string } | undefined;
                      return row?.fullName ?? '';
                    }}
                  />
                  <Legend />
                  <Bar dataKey="ЗП" fill="var(--accent)" name="Желаемая ЗП" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>

          <div className="grid two">
            <section className="card chart-block">
              <h2>Распределение по вилкам ЗП</h2>
              <div className="chart-m">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.salaryHistogram} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--accent-2)" name="Кол-во" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="card chart-block">
              <h2>Возрастные группы</h2>
              <div className="chart-m">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.ageHistogram} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" fill="var(--accent-3)" name="Кол-во" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </div>

          {data.byPosition.length > 0 && (
            <section className="card chart-block">
              <h2>По желаемой должности</h2>
              <p className="muted small">Количество кандидатов и средняя ожидаемая ЗП по направлению.</p>
              <div className="chart-m">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data.byPosition.map((p) => ({
                      position:
                        p.position.length > 24 ? `${p.position.slice(0, 22)}…` : p.position,
                      full: p.position,
                      count: p.count,
                      avg: p.avgSalary,
                    }))}
                    margin={{ top: 8, right: 8, left: 8, bottom: 72 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="position" interval={0} angle={-24} textAnchor="end" height={80} />
                    <YAxis yAxisId="left" allowDecimals={false} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tickFormatter={(v) => rub(Number(v))}
                    />
                    <Tooltip
                      formatter={(value, name) => {
                        const n = typeof value === 'number' ? value : Number(value);
                        const label = typeof name === 'string' ? name : String(name ?? '');
                        if (label === 'Средняя ЗП') {
                          return [`${rub(n)} ₽`, label];
                        }
                        return [n, label];
                      }}
                      labelFormatter={(_, payload) =>
                        (payload?.[0]?.payload as { full?: string }).full ?? ''
                      }
                    />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="var(--accent)" name="Кол-во" />
                    <Bar yAxisId="right" dataKey="avg" fill="var(--accent-3)" name="Средняя ЗП" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
