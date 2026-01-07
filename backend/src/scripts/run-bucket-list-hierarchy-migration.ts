/**
 * Run the bucket list hierarchy migration
 * This script applies migration 009 to add parent-child relationships and subcategories
 */

import { AppDataSource } from '../config/database';
import * as fs from 'fs';
import * as path from 'path';

async function runMigration() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Database connected');

    const migrationPath = path.join(__dirname, '..', 'migrations', '009_add_bucket_list_hierarchy.sql');
    
    if (!fs.existsSync(migrationPath)) {
      throw new Error(`Migration file not found: ${migrationPath}`);
    }

    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running bucket list hierarchy migration...');
    await AppDataSource.query(migrationSql);
    
    console.log('✅ Migration completed successfully!');
    console.log('\nNew columns added:');
    console.log('  - parentId (UUID): For creating parent-child relationships');
    console.log('  - subcategory (VARCHAR): For organizing items within categories');
    console.log('\nYou can now:');
    console.log('  1. Add subcategories to organize destinations by continent');
    console.log('  2. Create hierarchical items like "Visit all 50 states" with child items for each state');
    console.log('  3. Completed items will automatically sort to the top');
    console.log('\nSee BUCKET_LIST_HIERARCHY_UPDATE.md for usage examples.');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('\n✅ Database connection closed');
    }
  }
}

runMigration();
