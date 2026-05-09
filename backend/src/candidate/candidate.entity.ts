import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('candidates')
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** ФИО */
  @Column()
  fullName: string;

  @Column({ type: 'date' })
  birthDate: string;

  /** Желаемая зарплата, руб./мес. */
  @Column({ type: 'integer' })
  desiredSalary: number;

  /** Контакт */
  @Column({ default: '' })
  email: string;

  @Column({ default: '' })
  phone: string;

  /** Желаемая должность / направление */
  @Column({ default: '' })
  desiredPosition: string;

  @CreateDateColumn()
  createdAt: Date;
}
