import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  fullDescription: string;

  @Column({ nullable: true })
  imageUrl: string;

  /** Дата начала (YYYY-MM-DD), выводится как есть без таймзон */
  @Column({ type: 'varchar', length: 10, nullable: true })
  startDate: string;

  /** Время начала (HH:mm), выводится как есть */
  @Column({ type: 'varchar', length: 5, nullable: true })
  startTime: string;

  /** Дата окончания (YYYY-MM-DD) */
  @Column({ type: 'varchar', length: 10, nullable: true })
  endDate: string;

  /** Время окончания (HH:mm) */
  @Column({ type: 'varchar', length: 5, nullable: true })
  endTime: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
