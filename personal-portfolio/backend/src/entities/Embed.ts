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

  @Column({ nullable: true, type: 'text' })
  embedCode: string;

  @Column({ nullable: true, type: 'varchar' })
  thumbnail: string;

  @Column({ nullable: true, type: 'varchar' })
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Entry, (entry) => entry.embeds, { onDelete: 'CASCADE' })
  @JoinColumn()
  entry: Entry;

  @Column({ nullable: true, type: 'uuid' })
  entryId: string;

  @CreateDateColumn()
  createdAt: Date;
}
