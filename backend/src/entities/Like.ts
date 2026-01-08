import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { Entry } from './Entry';
import { User } from './User';

@Entity('likes')
@Index(['entryId', 'userId'], { unique: true })
export class Like {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  entryId: string;

  @Column()
  userId: string;

  // Link to the correct relation array on Entry: `userLikes`
  @ManyToOne(() => Entry, (entry) => entry.userLikes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entryId' })
  entry: Entry;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;
}
