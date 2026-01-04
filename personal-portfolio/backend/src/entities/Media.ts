import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Entry } from './Entry';

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  DOCUMENT = 'document',
}

@Entity('media')
export class Media {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  filename: string;

  @Column()
  originalName: string;

  @Column()
  mimetype: string;

  @Column({ enum: MediaType })
  type: MediaType;

  @Column()
  size: number;

  @Column()
  url: string;

  @Column({ nullable: true })
  thumbnailUrl: string | null;

  @Column({ nullable: true })
  width: number | null;

  @Column({ nullable: true })
  height: number | null;

  @Column({ nullable: true })
  description: string | null;

  @ManyToOne(() => Entry, (entry) => entry.media, { onDelete: 'CASCADE' })
  @JoinColumn()
  entry: Entry;

  @Column({ nullable: true })
  entryId: string;

  @CreateDateColumn()
  createdAt: Date;
}
