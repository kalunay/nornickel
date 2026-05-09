export type Candidate = {
  id: string;
  fullName: string;
  birthDate: string;
  desiredSalary: number;
  email: string;
  phone: string;
  desiredPosition: string;
  createdAt: string;
};

export type Dashboard = {
  count: number;
  salary: { min: number; max: number; avg: number };
  ranking: {
    rank: number;
    id: string;
    fullName: string;
    desiredSalary: number;
    age: number;
  }[];
  salaryHistogram: { range: string; count: number }[];
  ageHistogram: { range: string; count: number }[];
  byPosition: { position: string; count: number; avgSalary: number }[];
};
