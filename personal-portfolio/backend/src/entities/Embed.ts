import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Entry } from './Entry';

export enum EmbedType {
  INSTAGRAM = 'instagram',
  YOUTUBE = 'youtube',
  TWITTER = 'twitter',
  TIKTOK = 'tiktok',
  VIMEO = 'vimeo',
  SPOTIFY = 'spotify',
  CUSTOM = 'custom',
}

@Entity('embeds')
export class Embed {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ enum: EmbedType })
  type: EmbedType;

  @Column()
  url: string;

  @Column({ nullable: true })
  embedCode: string;

  @Column({ nullable: true })
  thumbnail: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Entry, (entry) => entry.embeds, { onDelete: 'CASCADE' })
  @JoinColumn()
  entry: Entry;

  @Column({ nullable: true })
  entryId: string;

  @CreateDateColumn()
  createdAt: Date;
}
