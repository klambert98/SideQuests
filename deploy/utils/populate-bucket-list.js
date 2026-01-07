/**
 * ============================================================================
 * BUCKET LIST POPULATION UTILITY
 * ============================================================================
 * Utility to populate bucket list items from the original populate script
 * Can be run standalone or integrated into deployment
 * 
 * Usage:
 *   node deploy/utils/populate-bucket-list.js [--clear]
 * 
 * Options:
 *   --clear    Clear existing bucket list items before populating
 * ============================================================================
 */

require('dotenv').config();
const { Client } = require('pg');

const args = process.argv.slice(2);
const shouldClear = args.includes('--clear');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function populateBucketList() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    log('Connected to database\n', colors.green);

    // Get the admin user ID
    const userResult = await client.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );
    
    if (userResult.rows.length === 0) {
      throw new Error('No admin user found. Please create a user first.');
    }
    
    const userId = userResult.rows[0].id;
    log(`Using user ID: ${userId}\n`, colors.cyan);

    // Clear existing items if requested
    if (shouldClear) {
      log('Clearing existing bucket list items...', colors.yellow);
      await client.query('DELETE FROM bucket_list_items WHERE "userId" = $1', [userId]);
      log('✓ Cleared\n', colors.green);
    }

    // Helper function to create or find parent item
    async function getOrCreateParent(title, description, category, subcategory = null) {
      const existing = await client.query(
        'SELECT id FROM bucket_list_items WHERE "userId" = $1 AND title = $2',
        [userId, title]
      );
      
      if (existing.rows.length > 0) {
        log(`  ✓ Found existing: ${title}`, colors.green);
        return existing.rows[0].id;
      }

      const result = await client.query(
        `INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
         VALUES ($1, $2, $3, $4, $5, false, 0)
         RETURNING id`,
        [userId, title, description, category, subcategory]
      );
      log(`  ✓ Created: ${title}`, colors.green);
      return result.rows[0].id;
    }

    // Helper function to add children
    async function addChildren(parentId, category, items) {
      // First, delete existing children to avoid duplicates
      await client.query(
        'DELETE FROM bucket_list_items WHERE "parentId" = $1',
        [parentId]
      );

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        await client.query(
          `INSERT INTO bucket_list_items ("userId", title, description, category, "parentId", completed, "displayOrder")
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [userId, item.name, item.description || null, category, parentId, item.completed || false, i]
        );
      }
      log(`    → Added ${items.length} child items\n`, colors.cyan);
    }

    log('═'.repeat(70), colors.cyan);
    log('POPULATING BUCKET LIST ITEMS', colors.cyan);
    log('═'.repeat(70) + '\n', colors.cyan);

    // Example: Visit all 50 States + Territories
    log('1. Creating "Visit all 50 U.S. States and Territories"...', colors.yellow);
    const statesParentId = await getOrCreateParent(
      'Visit all 50 U.S. States and Territories',
      'Complete tour of all states and territories',
      'Travel Goals'
    );

    const statesAndTerritories = [
      { name: 'Alabama' }, { name: 'Alaska' }, { name: 'Arizona' }, { name: 'Arkansas' },
      { name: 'California' }, { name: 'Colorado' }, { name: 'Connecticut' }, { name: 'Delaware' },
      { name: 'Florida' }, { name: 'Georgia' }, { name: 'Hawaii' }, { name: 'Idaho' },
      { name: 'Illinois' }, { name: 'Indiana' }, { name: 'Iowa' }, { name: 'Kansas' },
      { name: 'Kentucky' }, { name: 'Louisiana' }, { name: 'Maine' }, { name: 'Maryland' },
      { name: 'Massachusetts' }, { name: 'Michigan' }, { name: 'Minnesota' }, { name: 'Mississippi' },
      { name: 'Missouri' }, { name: 'Montana' }, { name: 'Nebraska' }, { name: 'Nevada' },
      { name: 'New Hampshire' }, { name: 'New Jersey' }, { name: 'New Mexico' }, { name: 'New York' },
      { name: 'North Carolina' }, { name: 'North Dakota' }, { name: 'Ohio' }, { name: 'Oklahoma' },
      { name: 'Oregon' }, { name: 'Pennsylvania' }, { name: 'Rhode Island' }, { name: 'South Carolina' },
      { name: 'South Dakota' }, { name: 'Tennessee' }, { name: 'Texas' }, { name: 'Utah' },
      { name: 'Vermont' }, { name: 'Virginia' }, { name: 'Washington' }, { name: 'West Virginia' },
      { name: 'Wisconsin' }, { name: 'Wyoming' },
      // Territories
      { name: 'Puerto Rico', description: 'Territory' },
      { name: 'U.S. Virgin Islands', description: 'Territory' },
      { name: 'Guam', description: 'Territory' },
      { name: 'American Samoa', description: 'Territory' },
      { name: 'Northern Mariana Islands', description: 'Territory' },
    ];
    
    await addChildren(statesParentId, 'Travel Goals', statesAndTerritories);

    log('═'.repeat(70), colors.cyan);
    log('BUCKET LIST POPULATION COMPLETE!', colors.green);
    log('═'.repeat(70) + '\n', colors.cyan);

    // Show summary
    const countResult = await client.query(
      'SELECT COUNT(*) FROM bucket_list_items WHERE "userId" = $1',
      [userId]
    );
    log(`Total bucket list items: ${countResult.rows[0].count}\n`, colors.cyan);

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

populateBucketList()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
