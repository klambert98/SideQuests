import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './User';
import { Media } from './Media';
import { Embed } from './Embed';

@Entity('entries')
@Index(['status', 'entryDate'])
@Index(['authorId', 'status'])
@Index(['entryDate'])
export class Entry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  @Index({ unique: true })
  slug: string;

  @Column({ default: 'draft', enum: ['draft', 'published', 'archived'] })
  @Index()
  status: 'draft' | 'published' | 'archived';

  @Column({ type: 'date' })
  @Index()
  entryDate: Date;

  @Column({ nullable: true, type: 'varchar' })
  summary: string;

  @Column('simple-array', { default: '' })
  tags: string[];

  @Column({ default: 0 })
  views: number;

  @ManyToOne(() => User)
  @JoinColumn()
  author: User;

  @Column()
  @Index()
  authorId: string;

  @OneToMany(() => Media, (media) => media.entry, { eager: true, onDelete: 'CASCADE' })
  media: Media[];

  @OneToMany(() => Embed, (embed) => embed.entry, { eager: true, onDelete: 'CASCADE' })
  embeds: Embed[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
