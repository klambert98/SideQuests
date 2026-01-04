import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './User';
import { Media } from './Media';
import { Embed } from './Embed';

@Entity('entries')
export class Entry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column()
  slug: string;

  @Column({ default: 'draft', enum: ['draft', 'published', 'archived'] })
  status: 'draft' | 'published' | 'archived';

  @Column({ type: 'date' })
  entryDate: Date;

  @Column({ nullable: true })
  summary: string;

  @Column('simple-array', { default: '' })
  tags: string[];

  @Column({ default: 0 })
  views: number;

  @ManyToOne(() => User)
  @JoinColumn()
  author: User;

  @Column()
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
