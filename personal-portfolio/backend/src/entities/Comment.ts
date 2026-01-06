import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Entry } from './Entry';
import { User } from './User';

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

@Entity('comments')
@Index(['entryId', 'createdAt'])
@Index(['sessionToken'])
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entryId: string;

  @Column({ nullable: true })
  userId: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionToken: string | null;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string | null;

  @Column({ 
    name: 'moderation_status',
    type: 'varchar', 
    length: 20, 
    default: 'pending' // Comments require approval by default
  })
  moderationStatus: ModerationStatus;

  @Column({ name: 'moderation_reason', type: 'text', nullable: true })
  moderationReason: string | null;

  @Column({ name: 'moderated_by', type: 'uuid', nullable: true })
  moderatedBy: string | null;

  @Column({ name: 'moderated_at', type: 'timestamp', nullable: true })
  moderatedAt: Date | null;

  @ManyToOne(() => Entry, (entry) => entry.comments, { onDelete: 'CASCADE' })
  @JoinColumn()
  entry: Entry;

  @ManyToOne(() => User, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn()
  user: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
