/**
 * ============================================================================
 * DATABASE DEPLOYMENT SCRIPT
 * ============================================================================
 * This script handles complete database initialization and migration
 * 
 * Usage:
 *   node deploy-database.js [options]
 * 
 * Options:
 *   --fresh         Drop all tables and reinitialize (WARNING: DATA LOSS!)
 *   --seed          Run seed scripts after initialization
 *   --skip-confirm  Skip confirmation prompts (use with caution)
 * 
 * Environment Variables Required:
 *   DATABASE_URL    PostgreSQL connection string
 * 
 * Examples:
 *   node deploy-database.js
 *   node deploy-database.js --seed
 *   node deploy-database.js --fresh --seed
 * ============================================================================
 */

// Environment variables are already loaded by the calling script
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Parse command line arguments
const args = process.argv.slice(2);
const isFresh = args.includes('--fresh');
const shouldSeed = args.includes('--seed');
const skipConfirm = args.includes('--skip-confirm');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logHeader(message) {
  const line = '='.repeat(80);
  log(`\n${line}`, colors.cyan);
  log(message, colors.bright + colors.cyan);
  log(`${line}\n`, colors.cyan);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

async function confirm(question) {
  if (skipConfirm) return true;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${colors.yellow}${question} (yes/no): ${colors.reset}`, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function runSqlFile(client, filePath, label) {
  logInfo(`Running: ${label}`);
  const sql = fs.readFileSync(filePath, 'utf8');
  await client.query(sql);
  logSuccess(`Completed: ${label}`);
}

async function dropAllTables(client) {
  logWarning('Dropping all tables...');
  await client.query(`
    DROP TABLE IF EXISTS bucket_list_items CASCADE;
    DROP TABLE IF EXISTS comments CASCADE;
    DROP TABLE IF EXISTS likes CASCADE;
    DROP TABLE IF EXISTS embeds CASCADE;
    DROP TABLE IF EXISTS media CASCADE;
    DROP TABLE IF EXISTS entries CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
  logSuccess('All tables dropped');
}

async function runSeeds(client) {
  logHeader('Running Seed Scripts');
  
  const seedsDir = path.join(__dirname, 'database', 'seeds');
  
  if (!fs.existsSync(seedsDir)) {
    logWarning('No seeds directory found, skipping...');
    return;
  }

  const seedFiles = fs
    .readdirSync(seedsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  if (seedFiles.length === 0) {
    logWarning('No seed files found, skipping...');
    return;
  }

  for (const file of seedFiles) {
    const fullPath = path.join(seedsDir, file);
    await runSqlFile(client, fullPath, file);
  }
}

async function main() {
  // Validate environment
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logError('DATABASE_URL environment variable is not set');
    logInfo('Set it to your PostgreSQL connection string:');
    logInfo('  postgres://user:password@host:5432/database');
    process.exit(1);
  }

  // Display deployment plan
  logHeader('Personal Portfolio - Database Deployment');
  
  log('Deployment Configuration:', colors.bright);
  log(`  Database URL: ${databaseUrl.replace(/:[^:@]*@/, ':****@')}`);
  log(`  Fresh Install: ${isFresh ? 'YES (will drop all tables)' : 'NO'}`);
  log(`  Run Seeds: ${shouldSeed ? 'YES' : 'NO'}`);
  console.log();

  // Confirm dangerous operations
  if (isFresh) {
    logWarning('WARNING: Fresh install will DELETE ALL EXISTING DATA!');
    const proceed = await confirm('Are you absolutely sure you want to continue?');
    if (!proceed) {
      logInfo('Deployment cancelled');
      process.exit(0);
    }
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    // Connect to database
    logInfo('Connecting to database...');
    await client.connect();
    logSuccess('Connected to database');

    // Drop tables if fresh install
    if (isFresh) {
      await dropAllTables(client);
    }

    // Run initialization script
    logHeader('Initializing Database Schema');
    const schemaPath = path.join(__dirname, 'database', 'init-schema.sql');
    await runSqlFile(client, schemaPath, 'init-schema.sql');

    // Run seed scripts if requested
    if (shouldSeed) {
      await runSeeds(client);
    }

    // Display summary
    logHeader('Deployment Complete');
    logSuccess('Database deployment completed successfully!');
    
    // Query and display table counts
    const tables = [
      'users',
      'entries',
      'media',
      'embeds',
      'likes',
      'comments',
      'bucket_list_items',
    ];

    log('\nTable Status:', colors.bright);
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
        const count = result.rows[0].count;
        log(`  ${table}: ${count} rows`);
      } catch (err) {
        log(`  ${table}: Error reading`);
      }
    }

    console.log();
    logInfo('Next Steps:');
    log('  1. Update admin user credentials in seeds/01-create-admin-user.sql');
    log('  2. Deploy the API: npm run deploy:api');
    log('  3. Deploy the frontend: npm run deploy:web');
    
  } catch (err) {
    logHeader('Deployment Failed');
    logError('Error during database deployment:');
    console.error(err);
    process.exitCode = 1;
  } finally {
    try {
      await client.end();
      logInfo('Database connection closed');
    } catch (err) {
      // Ignore cleanup errors
    }
  }
}

// Run the deployment
main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
