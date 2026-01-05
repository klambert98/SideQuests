import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Entry } from '../entities/Entry';
import { Media } from '../entities/Media';
import { Embed } from '../entities/Embed';
import { Like } from '../entities/Like';
import { Comment } from '../entities/Comment';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/portfolio',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Entry, Media, Embed, Like, Comment],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
});
