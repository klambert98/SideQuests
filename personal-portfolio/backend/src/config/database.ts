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
  // Connection pooling configuration for scalability
  extra: {
    max: 20, // Maximum number of connections in the pool
    min: 2, // Minimum number of connections in the pool
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
    statementTimeout: 30000, // Cancel queries that take longer than 30 seconds
  },
  // Retry logic for connection failures
  maxQueryExecutionTime: 10000, // Log slow queries (> 10 seconds)
});
