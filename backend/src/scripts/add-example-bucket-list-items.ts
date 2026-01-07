/**
 * Helper script to add example hierarchical bucket list items
 * Run this after the hierarchy migration to see the new features in action
 * 
 * Usage: 
 *   ts-node src/scripts/add-example-bucket-list-items.ts <your-user-id>
 */

import { AppDataSource } from '../config/database';
import { bucketListItemService } from '../services/BucketListItemService';

async function addExampleItems(userId: string) {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('✅ Database connected\n');

    console.log('Adding example items for user:', userId);
    console.log('═'.repeat(60));

    // 1. Add destinations with subcategories (continents)
    console.log('\n1. Adding destinations by continent...');
    
    const destinations = [
      // North America
      { title: 'New York City', description: 'See Times Square and Central Park', category: 'Destinations', subcategory: 'North America', completed: true },
      { title: 'Grand Canyon', description: 'Hike the South Rim', category: 'Destinations', subcategory: 'North America', completed: false },
      // Europe
      { title: 'Paris, France', description: 'See the Eiffel Tower', category: 'Destinations', subcategory: 'Europe', completed: true },
      { title: 'Rome, Italy', description: 'Visit the Colosseum', category: 'Destinations', subcategory: 'Europe', completed: false },
      // Asia
      { title: 'Tokyo, Japan', description: 'Experience Japanese culture', category: 'Destinations', subcategory: 'Asia', completed: false },
      { title: 'Great Wall of China', description: 'Walk the ancient wall', category: 'Destinations', subcategory: 'Asia', completed: false },
    ];

    for (const dest of destinations) {
      await bucketListItemService.createItem(userId, dest);
      console.log(`  ✅ ${dest.completed ? '✓' : '○'} ${dest.title} (${dest.subcategory})`);
    }

    // 2. Create "Visit all 50 States" with child items
    console.log('\n2. Creating "Visit all 50 States" checklist...');
    
    const statesParent = await bucketListItemService.createItem(userId, {
      title: 'Visit all 50 U.S. States',
      description: 'Complete tour of all United States',
      category: 'Travel Goals',
      completed: false,
    });
    console.log(`  ✅ Created parent: ${statesParent.title}`);

    const states = [
      { name: 'California', completed: true },
      { name: 'New York', completed: true },
      { name: 'Texas', completed: true },
      { name: 'Florida', completed: false },
      { name: 'Illinois', completed: false },
      { name: 'Pennsylvania', completed: false },
      { name: 'Ohio', completed: false },
      { name: 'Georgia', completed: false },
      { name: 'North Carolina', completed: false },
      { name: 'Michigan', completed: false },
      // Add more as needed...
    ];

    for (const state of states) {
      await bucketListItemService.createItem(userId, {
        title: state.name,
        category: 'Travel Goals',
        parentId: statesParent.id,
        completed: state.completed,
      });
    }
    console.log(`  ✅ Added ${states.length} state checkboxes (${states.filter(s => s.completed).length} completed)`);

    // 3. Create "Visit National Parks" with child items
    console.log('\n3. Creating "Visit all National Parks" checklist...');
    
    const parksParent = await bucketListItemService.createItem(userId, {
      title: 'Visit all National Parks',
      description: 'Experience the beauty of U.S. National Parks',
      category: 'Travel Goals',
      completed: false,
    });
    console.log(`  ✅ Created parent: ${parksParent.title}`);

    const parks = [
      { name: 'Yellowstone', completed: true },
      { name: 'Grand Canyon', completed: true },
      { name: 'Yosemite', completed: false },
      { name: 'Zion', completed: false },
      { name: 'Glacier', completed: false },
      { name: 'Rocky Mountain', completed: false },
      { name: 'Acadia', completed: false },
      { name: 'Great Smoky Mountains', completed: false },
    ];

    for (const park of parks) {
      await bucketListItemService.createItem(userId, {
        title: park.name,
        category: 'Travel Goals',
        parentId: parksParent.id,
        completed: park.completed,
      });
    }
    console.log(`  ✅ Added ${parks.length} park checkboxes (${parks.filter(p => p.completed).length} completed)`);

    // 4. Create "7 UNESCO Sites" with child items
    console.log('\n4. Creating "Visit 7 UNESCO World Heritage Sites" checklist...');
    
    const unescoParent = await bucketListItemService.createItem(userId, {
      title: 'Visit 7 UNESCO World Heritage Sites',
      description: 'Experience world heritage sites',
      category: 'Travel Goals',
      completed: false,
    });
    console.log(`  ✅ Created parent: ${unescoParent.title}`);

    const unescoSites = [
      { name: 'Machu Picchu', description: 'Peru', completed: false },
      { name: 'Great Wall of China', description: 'China', completed: false },
      { name: 'Petra', description: 'Jordan', completed: false },
      { name: 'Taj Mahal', description: 'India', completed: false },
      { name: 'Colosseum', description: 'Rome, Italy', completed: true },
      { name: 'Angkor Wat', description: 'Cambodia', completed: false },
      { name: 'Pyramids of Giza', description: 'Egypt', completed: false },
    ];

    for (const site of unescoSites) {
      await bucketListItemService.createItem(userId, {
        title: site.name,
        description: site.description,
        category: 'Travel Goals',
        parentId: unescoParent.id,
        completed: site.completed,
      });
    }
    console.log(`  ✅ Added ${unescoSites.length} UNESCO site checkboxes (${unescoSites.filter(s => s.completed).length} completed)`);

    console.log('\n' + '═'.repeat(60));
    console.log('✅ All example items added successfully!\n');
    console.log('What was created:');
    console.log('  • 6 destination items organized by continent (3 completed, 3 pending)');
    console.log('  • "Visit all 50 States" with 10 state checkboxes (3 completed, 7 pending)');
    console.log('  • "Visit all National Parks" with 8 park checkboxes (2 completed, 6 pending)');
    console.log('  • "7 UNESCO Sites" with 7 site checkboxes (1 completed, 6 pending)');
    console.log('\nCompleted items will automatically appear at the top in the frontend!');
    console.log('Visit /bucket-list to see the new hierarchy in action.\n');

  } catch (error) {
    console.error('❌ Error adding example items:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Database connection closed');
    }
  }
}

// Get user ID from command line argument
const userId = process.argv[2];

if (!userId) {
  console.error('❌ Error: User ID is required');
  console.log('\nUsage: ts-node src/scripts/add-example-bucket-list-items.ts <your-user-id>');
  console.log('\nTo get your user ID, run:');
  console.log('  SELECT id, email FROM users;');
  process.exit(1);
}

addExampleItems(userId);
