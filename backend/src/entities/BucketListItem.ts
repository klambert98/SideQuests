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

@Entity('bucket_list_items')
@Index(['userId', 'category'])
@Index(['userId', 'completed'])
@Index(['createdAt'])
@Index(['userId', 'category', 'subcategory'])
export class BucketListItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  @Index()
  userId: string;

  @ManyToOne(() => User, (user) => user.bucketListItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  category: string;

  @Column({ nullable: true })
  subcategory: string;

  @Column({ default: false })
  completed: boolean;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ nullable: true })
  timelineEntryId: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  parentId: string;

  @ManyToOne(() => BucketListItem, (item) => item.children, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parentId' })
  parent: BucketListItem;

  @OneToMany(() => BucketListItem, (item) => item.parent)
  children: BucketListItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
