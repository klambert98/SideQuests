import 'dotenv/config';
import { AppDataSource } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

const runSqlMigration = async (filename: string) => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const migrationPath = path.join(__dirname, '../../migrations', filename);
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log(`Running migration: ${filename}`);
    await AppDataSource.query(sql);
    console.log(`✅ Migration ${filename} completed successfully`);
  } catch (error) {
    console.error(`❌ Error running migration ${filename}:`, error);
    throw error;
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

// Run the bucket list migration
runSqlMigration('007_add_bucket_list_items.sql');
