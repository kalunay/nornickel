import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from '../candidate/candidate.entity';
import { CreateCandidateDto } from './dto/create-candidate.dto';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private readonly repo: Repository<Candidate>,
  ) {}

  findAll(): Promise<Candidate[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  create(dto: CreateCandidateDto): Promise<Candidate> {
    const row = this.repo.create({
      fullName: dto.fullName.trim(),
      birthDate: dto.birthDate.slice(0, 10),
      desiredSalary: dto.desiredSalary,
      email: dto.email?.trim() ?? '',
      phone: dto.phone?.trim() ?? '',
      desiredPosition: dto.desiredPosition?.trim() ?? '',
    });
    return this.repo.save(row);
  }
}
