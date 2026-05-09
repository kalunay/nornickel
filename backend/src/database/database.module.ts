import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Candidate } from '../candidate/candidate.entity';
import { User } from '../user/user.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Candidate])],
  providers: [SeedService],
  exports: [SeedService],
})
export class DatabaseModule {}
