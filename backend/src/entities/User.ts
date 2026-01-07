import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, OneToMany } from 'typeorm';
import { BucketListItem } from './BucketListItem';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @Index({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ default: 'Admin' })
  name: string;

  @Column({ type: 'varchar', default: 'user' })
  role: 'admin' | 'user';

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  bio: string;

  @OneToMany(() => BucketListItem, (item) => item.user)
  bucketListItems: BucketListItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
