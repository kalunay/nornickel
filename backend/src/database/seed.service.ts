import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Candidate } from '../candidate/candidate.entity';
import { User } from '../user/user.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly log = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Candidate)
    private readonly candidates: Repository<Candidate>,
  ) {}

  async onModuleInit() {
    await this.seedUsers();
    await this.seedDemoCandidates();
  }

  private async seedUsers() {
    const count = await this.users.count();
    if (count > 0) {
      return;
    }
    const passwordHash = await bcrypt.hash('admin123', 10);
    await this.users.save(
      this.users.create({ username: 'admin', passwordHash }),
    );
    this.log.log('Создан тестовый пользователь: admin / admin123');
  }

  private async seedDemoCandidates() {
    const count = await this.candidates.count();
    if (count > 0) {
      return;
    }
    const rows: Partial<Candidate>[] = [
      {
        fullName: 'Иванов Иван Иванович',
        birthDate: '1992-03-15',
        desiredSalary: 150_000,
        email: 'ivanov@example.com',
        phone: '+79001112233',
        desiredPosition: 'Backend-разработчик',
      },
      {
        fullName: 'Петрова Мария Сергеевна',
        birthDate: '1988-07-22',
        desiredSalary: 220_000,
        email: 'petrova@example.com',
        phone: '+79002223344',
        desiredPosition: 'Аналитик данных',
      },
      {
        fullName: 'Сидоров Пётр Алексеевич',
        birthDate: '1999-11-08',
        desiredSalary: 95_000,
        email: 'sidorov@example.com',
        phone: '+79003334455',
        desiredPosition: 'Junior разработчик',
      },
    ];
    await this.candidates.save(rows.map((r) => this.candidates.create(r)));
    this.log.log(`Загружено демо-кандидатов: ${rows.length}`);
  }
}
