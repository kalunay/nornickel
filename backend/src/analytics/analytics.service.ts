import { Injectable } from '@nestjs/common';
import { CandidatesService } from '../candidates/candidates.service';

export type SalaryBucket = { range: string; count: number };
export type AgeBucket = { range: string; count: number };
export type RankRow = {
  rank: number;
  id: string;
  fullName: string;
  desiredSalary: number;
  age: number;
};

function ageYears(birthDate: string): number {
  const d = new Date(birthDate);
  const t = new Date();
  let a = t.getFullYear() - d.getFullYear();
  const m = t.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && t.getDate() < d.getDate())) {
    a -= 1;
  }
  return Math.max(0, a);
}

function salaryRangeLabel(s: number): string {
  if (s < 80_000) return 'до 80 000';
  if (s < 120_000) return '80 000 – 120 000';
  if (s < 180_000) return '120 000 – 180 000';
  if (s < 250_000) return '180 000 – 250 000';
  return 'от 250 000';
}

function ageRangeLabel(a: number): string {
  if (a < 25) return 'до 25 лет';
  if (a < 35) return '25–34 года';
  if (a < 45) return '35–44 года';
  return '45+ лет';
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly candidates: CandidatesService) {}

  async getDashboard() {
    const list = await this.candidates.findAll();
    const count = list.length;
    if (count === 0) {
      return {
        count: 0,
        salary: { min: 0, max: 0, avg: 0 },
        ranking: [] as RankRow[],
        salaryHistogram: [] as SalaryBucket[],
        ageHistogram: [] as AgeBucket[],
        byPosition: [] as { position: string; count: number; avgSalary: number }[],
      };
    }

    const salaries = list.map((c) => c.desiredSalary);
    const min = Math.min(...salaries);
    const max = Math.max(...salaries);
    const avg = Math.round(salaries.reduce((s, x) => s + x, 0) / count);

    const withAge = list.map((c) => ({
      c,
      age: ageYears(c.birthDate),
    }));

    const sorted = [...withAge].sort(
      (a, b) => b.c.desiredSalary - a.c.desiredSalary,
    );
    const ranking: RankRow[] = sorted.map((row, i) => ({
      rank: i + 1,
      id: row.c.id,
      fullName: row.c.fullName,
      desiredSalary: row.c.desiredSalary,
      age: row.age,
    }));

    const salaryMap = new Map<string, number>();
    for (const c of list) {
      const key = salaryRangeLabel(c.desiredSalary);
      salaryMap.set(key, (salaryMap.get(key) ?? 0) + 1);
    }
    const salaryOrder = [
      'до 80 000',
      '80 000 – 120 000',
      '120 000 – 180 000',
      '180 000 – 250 000',
      'от 250 000',
    ];
    const salaryHistogram: SalaryBucket[] = salaryOrder
      .filter((k) => (salaryMap.get(k) ?? 0) > 0 || list.length > 0)
      .map((range) => ({ range, count: salaryMap.get(range) ?? 0 }));

    const ageMap = new Map<string, number>();
    for (const { age } of withAge) {
      const key = ageRangeLabel(age);
      ageMap.set(key, (ageMap.get(key) ?? 0) + 1);
    }
    const ageOrder = ['до 25 лет', '25–34 года', '35–44 года', '45+ лет'];
    const ageHistogram: AgeBucket[] = ageOrder.map((range) => ({
      range,
      count: ageMap.get(range) ?? 0,
    }));

    const posMap = new Map<string, { count: number; sum: number }>();
    for (const c of list) {
      const p = (c.desiredPosition || 'Не указано').trim() || 'Не указано';
      const cur = posMap.get(p) ?? { count: 0, sum: 0 };
      cur.count += 1;
      cur.sum += c.desiredSalary;
      posMap.set(p, cur);
    }
    const byPosition = [...posMap.entries()]
      .map(([position, v]) => ({
        position,
        count: v.count,
        avgSalary: Math.round(v.sum / v.count),
      }))
      .sort((a, b) => b.count - a.count);

    return {
      count,
      salary: { min, max, avg },
      ranking,
      salaryHistogram,
      ageHistogram,
      byPosition,
    };
  }
}
