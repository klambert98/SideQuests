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

  @Column({ nullable: true, type: 'varchar' })
  thumbnailUrl: string | null;

  @Column({ nullable: true, type: 'integer' })
  width: number | null;

  @Column({ nullable: true, type: 'integer' })
  height: number | null;

  @Column({ nullable: true, type: 'varchar' })
  description: string | null;

  @ManyToOne(() => Entry, (entry) => entry.media, { onDelete: 'CASCADE' })
  @JoinColumn()
  entry: Entry;

  @Column({ nullable: true, type: 'uuid' })
  entryId: string;

  @CreateDateColumn()
  createdAt: Date;
}
