import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Entry } from './Entry';
import { User } from './User';

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

@Entity('comments')
@Index(['entryId', 'createdAt'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entryId: string;

  @Column()
  userId: string;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ 
    type: 'varchar', 
    length: 20, 
    default: 'pending' // Comments require approval by default
  })
  moderationStatus: ModerationStatus;

  @Column({ type: 'text', nullable: true })
  moderationReason: string | null;

  @Column({ type: 'uuid', nullable: true })
  moderatedBy: string | null;

  @Column({ type: 'timestamp', nullable: true })
  moderatedAt: Date | null;

  @ManyToOne(() => Entry, (entry) => entry.comments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entryId' })
  entry: Entry;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
