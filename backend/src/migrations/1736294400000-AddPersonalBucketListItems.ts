import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPersonalBucketListItems1736294400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get the admin user ID
    const result = await queryRunner.query(
      `SELECT id FROM users WHERE role = 'admin' LIMIT 1`
    );

    if (result.length === 0) {
      throw new Error('No admin user found. Please create an admin user first.');
    }

    const adminUserId = result[0].id;
    let itemOrder = 1;

    // Helper function to insert items
    const insertItems = async (items: Array<{ title: string; description: string; category: string; subcategory: string; completed: boolean }>) => {
      for (const item of items) {
        await queryRunner.query(
          `INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING`,
          [adminUserId, item.title, item.description, item.category, item.subcategory, item.completed, itemOrder++]
        );
      }
    };

    // Helper to insert a parent with children
    const insertParentWithChildren = async (
      parent: { title: string; description: string; category: string; subcategory?: string },
      children: Array<{ name: string; description?: string; completed?: boolean }>
    ) => {
      const parentInsert = await queryRunner.query(
        `INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
         VALUES ($1, $2, $3, $4, $5, false, $6)
         ON CONFLICT DO NOTHING
         RETURNING id`,
        [adminUserId, parent.title, parent.description, parent.category, parent.subcategory || null, itemOrder++]
      );

      // If the parent already existed, fetch its id
      const parentId = parentInsert[0]?.id
        ? parentInsert[0].id
        : (
            await queryRunner.query(
              `SELECT id FROM bucket_list_items WHERE "userId" = $1 AND title = $2 AND category = $3 LIMIT 1`,
              [adminUserId, parent.title, parent.category]
            )
          )[0]?.id;

      if (!parentId) return;

      for (const child of children) {
        await queryRunner.query(
          `INSERT INTO bucket_list_items ("userId", title, description, category, "parentId", completed, "displayOrder")
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING`,
          [
            adminUserId,
            child.name,
            child.description || null,
            parent.category,
            parentId,
            child.completed || false,
            itemOrder++,
          ]
        );
      }
    };

    // ========================================================================
    // SKILLS & CERTIFICATIONS
    // ========================================================================

    await insertItems([
      // Languages & Communication
      { title: 'Learn Sign Language', description: 'Become proficient in American Sign Language', category: 'Skills & Certifications', subcategory: 'Languages & Communication', completed: false },
      { title: 'Attend a Language Exchange Meetup', description: 'Practice languages with native speakers', category: 'Skills & Certifications', subcategory: 'Languages & Communication', completed: false },

      // Water Sports
      { title: 'Earn Scuba Diving Certification', description: 'Get certified for scuba diving', category: 'Skills & Certifications', subcategory: 'Water Sports', completed: false },
      { title: 'Learn to Surf', description: 'Take surfing lessons and catch waves', category: 'Skills & Certifications', subcategory: 'Water Sports', completed: false },
      { title: 'Take a Fly-Fishing Class', description: 'Learn the art of fly-fishing', category: 'Skills & Certifications', subcategory: 'Water Sports', completed: false },
      { title: 'Get Boating License', description: 'Obtain official boating license', category: 'Skills & Certifications', subcategory: 'Water Sports', completed: true },

      // Winter Sports
      { title: 'Learn to Snowboard', description: 'Take snowboarding lessons and hit the slopes', category: 'Skills & Certifications', subcategory: 'Winter Sports', completed: false },

      // Extreme Sports
      { title: 'Learn to Rock Climb', description: 'Take rock climbing lessons and scale walls', category: 'Skills & Certifications', subcategory: 'Extreme Sports', completed: false },
      { title: 'Take an Aerial Silks Class', description: 'Learn aerial acrobatics with silks', category: 'Skills & Certifications', subcategory: 'Extreme Sports', completed: false },

      // Arts & Crafts
      { title: 'Take a Pottery Class', description: 'Learn to throw pottery on a wheel', category: 'Skills & Certifications', subcategory: 'Arts & Crafts', completed: false },
      { title: 'Learn Glassblowing', description: 'Create art through glassblowing', category: 'Skills & Certifications', subcategory: 'Arts & Crafts', completed: false },
      { title: 'Take a Blacksmithing Class', description: 'Learn traditional blacksmithing techniques', category: 'Skills & Certifications', subcategory: 'Arts & Crafts', completed: false },
      { title: 'Learn Woodworking and Make Furniture', description: 'Build a complete piece of furniture from scratch', category: 'Skills & Certifications', subcategory: 'Arts & Crafts', completed: false },

      // Dance & Performance
      { title: 'Learn Pole Dancing', description: 'Take pole dancing fitness classes', category: 'Skills & Certifications', subcategory: 'Dance & Performance', completed: false },
      { title: 'Learn Line Dances and Dance at a Country Bar', description: 'Master country line dancing and hit the dance floor', category: 'Skills & Certifications', subcategory: 'Dance & Performance', completed: false },

      // Culinary Skills
      { title: 'Learn Latte Art', description: 'Master the art of creating beautiful latte designs', category: 'Skills & Certifications', subcategory: 'Culinary Skills', completed: false },

      // Professional Certifications
      { title: 'Get First Aid Certification', description: 'Become certified in first aid and CPR', category: 'Skills & Certifications', subcategory: 'Professional Certifications', completed: false },
      { title: "Get Pilot's License", description: 'Earn a private pilot license', category: 'Skills & Certifications', subcategory: 'Professional Certifications', completed: false },
      { title: 'Get Adobe Certification', description: 'Become Adobe certified in creative software', category: 'Skills & Certifications', subcategory: 'Professional Certifications', completed: false },
      { title: 'Get Motorcycle License', description: 'Obtain motorcycle endorsement', category: 'Skills & Certifications', subcategory: 'Professional Certifications', completed: true },

      // Film & Media
      { title: 'Take a Film-Making Class or Bootcamp', description: 'Learn professional film-making techniques', category: 'Skills & Certifications', subcategory: 'Film & Media', completed: false },

      // Martial Arts
      { title: 'Get a Black Belt in a Martial Arts Discipline', description: 'Achieve black belt rank in martial arts', category: 'Skills & Certifications', subcategory: 'Martial Arts', completed: false },

      // Unique Skills
      { title: 'Learn Lock Picking', description: 'Master the skill of lock picking', category: 'Skills & Certifications', subcategory: 'Unique Skills', completed: false },
    ]);

    // ========================================================================
    // ADVENTURE & EXPERIENCES
    // ========================================================================

    await insertItems([
      // Sky & Air
      { title: 'Go Skydiving', description: 'Jump out of a plane and freefall', category: 'Adventure & Experiences', subcategory: 'Sky & Air', completed: false },
      { title: 'Ride in a Hot Air Balloon', description: 'Float peacefully in a hot air balloon', category: 'Adventure & Experiences', subcategory: 'Sky & Air', completed: false },
      { title: 'Take a Zero Gravity Flight', description: 'Experience weightlessness (Blue Origin)', category: 'Adventure & Experiences', subcategory: 'Sky & Air', completed: false },

      // Bungee & Heights
      { title: 'Bungee Jump into a Canyon', description: 'Take the plunge off a canyon edge', category: 'Adventure & Experiences', subcategory: 'Bungee & Heights', completed: false },
      { title: 'Bungee Jump into a River', description: 'Bungee jump with a water landing', category: 'Adventure & Experiences', subcategory: 'Bungee & Heights', completed: false },

      // Water Adventures
      { title: 'Go Rafting on Every Class of Rapids', description: 'Experience all levels of white-water rafting', category: 'Adventure & Experiences', subcategory: 'Water Adventures', completed: false },
      { title: 'Try Ice-Climbing a Frozen Waterfall', description: 'Climb a frozen waterfall with ice axes', category: 'Adventure & Experiences', subcategory: 'Water Adventures', completed: false },
      { title: 'Go on a Multi-Day Kayaking Camping Trip', description: 'Kayak and camp along a waterway', category: 'Adventure & Experiences', subcategory: 'Water Adventures', completed: false },
      { title: 'Swim with Dolphins', description: 'Interact with dolphins in their natural habitat', category: 'Adventure & Experiences', subcategory: 'Water Adventures', completed: false },

      // Backpacking & Camping
      { title: 'Go on a Solo Backpacking Trip in Another Country', description: 'Travel solo using only public transit and hostels', category: 'Adventure & Experiences', subcategory: 'Backpacking & Camping', completed: false },
      { title: 'Multi-Day Backpacking Trip', description: 'Complete a multi-day wilderness backpacking expedition', category: 'Adventure & Experiences', subcategory: 'Backpacking & Camping', completed: false },
      { title: 'Camp Out on the Beach', description: 'Spend the night camping on a beach', category: 'Adventure & Experiences', subcategory: 'Backpacking & Camping', completed: false },

      // Winter Adventures
      { title: 'Skate on a Frozen Lake', description: 'Ice skate on a natural frozen lake', category: 'Adventure & Experiences', subcategory: 'Winter Adventures', completed: false },

      // Nature & Wildlife
      { title: 'Watch a Meteor Shower in a Dark Sky Park', description: 'Stargaze during a meteor shower in a designated dark sky area', category: 'Adventure & Experiences', subcategory: 'Nature & Wildlife', completed: false },

      // Road Trips & Transit
      { title: 'Take a Scenic Road Trip on a Motorcycle', description: 'Embark on an epic motorcycle road trip', category: 'Adventure & Experiences', subcategory: 'Road Trips & Transit', completed: false },
      { title: 'Ride on a Scenic Mountain Train', description: 'Take a picturesque train journey through mountains', category: 'Adventure & Experiences', subcategory: 'Road Trips & Transit', completed: true },

      // Wellness & Mindfulness
      { title: 'Attend a Silent Retreat', description: 'Participate in a meditation and silence retreat', category: 'Adventure & Experiences', subcategory: 'Wellness & Mindfulness', completed: false },

      // Volunteering & Service
      { title: 'Volunteer for a Beach or River Clean-Up', description: 'Give back by helping clean up waterways', category: 'Adventure & Experiences', subcategory: 'Volunteering & Service', completed: false },

      // Entertainment
      { title: 'Be an Extra in a Movie', description: 'Appear as a background actor in a film', category: 'Adventure & Experiences', subcategory: 'Entertainment', completed: false },
      { title: 'Attend a Major Music Festival', description: 'Experience a large-scale music festival', category: 'Adventure & Experiences', subcategory: 'Entertainment', completed: false },
      { title: 'Attend a Masquerade Ball', description: 'Dress up for an elegant masquerade ball', category: 'Adventure & Experiences', subcategory: 'Entertainment', completed: false },
      { title: 'Attend a Silent Disco', description: 'Dance with wireless headphones at a silent disco', category: 'Adventure & Experiences', subcategory: 'Entertainment', completed: true },

      // Simple Pleasures
      { title: 'Fly a Kite on a Windy Beach', description: 'Enjoy kite flying on a breezy beach', category: 'Adventure & Experiences', subcategory: 'Simple Pleasures', completed: true },
    ]);

    // ========================================================================
    // INTERNATIONAL DESTINATIONS
    // ========================================================================

    await insertItems([
      // Africa
      { title: 'Sandboard in the Moroccan Desert', description: 'Surf down sand dunes in Morocco', category: 'International Destinations', subcategory: 'Africa', completed: false },
      { title: 'Ride a Camel at Sunset in the Sahara', description: 'Experience camel trekking in the Sahara Desert', category: 'International Destinations', subcategory: 'Africa', completed: false },
      { title: 'Safari in Serengeti National Park', description: 'Go on a wildlife safari in Tanzania', category: 'International Destinations', subcategory: 'Africa', completed: false },
      { title: 'Watch the 2027 Solar Eclipse in Luxor', description: 'View the total solar eclipse from Egypt', category: 'International Destinations', subcategory: 'Africa', completed: false },

      // Europe
      { title: 'See a Shakespeare Play at The Globe', description: 'Watch Shakespeare performed at the Globe Theatre in London', category: 'International Destinations', subcategory: 'Europe', completed: false },
      { title: 'See the Northern Lights in Iceland', description: 'Witness the Aurora Borealis in Iceland', category: 'International Destinations', subcategory: 'Europe', completed: false },
      { title: "Ride a Vintage Carousel in Vienna's Prater", description: 'Enjoy a classic carousel ride in Vienna', category: 'International Destinations', subcategory: 'Europe', completed: false },
      { title: 'Spend a Night in an Ice Hotel in Sweden', description: 'Sleep in a hotel made entirely of ice', category: 'International Destinations', subcategory: 'Europe', completed: false },
      { title: 'Explore Chernobyl with a Guided Tour', description: 'Visit the Chernobyl exclusion zone', category: 'International Destinations', subcategory: 'Europe', completed: false },
      { title: 'Sail the Greek Islands in a Small Yacht', description: 'Island hop in Greece by boat', category: 'International Destinations', subcategory: 'Europe', completed: false },
      { title: 'Walk the Camino de Santiago', description: 'Complete the historic pilgrimage trail in Spain', category: 'International Destinations', subcategory: 'Europe', completed: false },
      { title: 'Snow Tubing/Toboggan in Norway', description: 'Enjoy winter sledding in Norway', category: 'International Destinations', subcategory: 'Europe', completed: false },

      // Asia
      { title: 'Get a Sak Yant Tattoo', description: 'Receive traditional Thai bamboo tattoo', category: 'International Destinations', subcategory: 'Asia', completed: false },
      { title: 'Ride Horseback in Kyrgyzstan', description: 'Experience horseback riding in Central Asia', category: 'International Destinations', subcategory: 'Asia', completed: false },
      { title: 'Hike Mt. Fuji and Watch the Sunrise', description: 'Climb Mt. Fuji, stay overnight, and see dawn from the summit', category: 'International Destinations', subcategory: 'Asia', completed: false },
      { title: 'Swim with Bioluminescent Plankton in the Maldives', description: 'Experience glowing waters at night', category: 'International Destinations', subcategory: 'Asia', completed: false },
      { title: 'Attend Holi or Diwali in India', description: 'Participate in major Indian festivals', category: 'International Destinations', subcategory: 'Asia', completed: false },
      { title: 'Attend the Ice and Snow Festival in China', description: 'See massive ice sculptures in Harbin', category: 'International Destinations', subcategory: 'Asia', completed: false },
      { title: 'Attend a Full Moon Drum Circle in Bali', description: 'Join a spiritual gathering in Bali', category: 'International Destinations', subcategory: 'Asia', completed: false },
      { title: 'Spend a Night in a Yurt Camp in Mongolia', description: 'Sleep in a traditional yurt under the stars', category: 'International Destinations', subcategory: 'Asia', completed: false },
      { title: 'Stay in a Traditional Ryokan in Japan', description: 'Experience a Japanese inn with tatami mats and hot springs', category: 'International Destinations', subcategory: 'Asia', completed: false },
      { title: 'Take an Archery Class on Horseback in Mongolia', description: 'Learn traditional Mongolian horse archery', category: 'International Destinations', subcategory: 'Asia', completed: false },
      { title: 'Take the Trans-Siberian Railway', description: 'Journey across Russia on the legendary train route', category: 'International Destinations', subcategory: 'Asia', completed: false },

      // Oceania
      { title: 'Learn Maori Haka and Perform It with Locals', description: 'Master the traditional Maori war dance', category: 'International Destinations', subcategory: 'Oceania', completed: false },
      { title: 'Scuba Dive the Great Barrier Reef', description: "Dive one of the world's greatest coral reefs", category: 'International Destinations', subcategory: 'Oceania', completed: false },
      { title: 'Cycle the Great Ocean Road in Australia', description: "Bike along Australia's stunning coastal highway", category: 'International Destinations', subcategory: 'Oceania', completed: false },

      // Middle East
      { title: 'Visit Socotra and See the Dragon Blood Trees', description: "Explore Yemen's alien-like island landscape", category: 'International Destinations', subcategory: 'Middle East', completed: false },

      // South America
      { title: 'Hang Glide Over Rio de Janeiro', description: "Soar above Rio's coastline", category: 'International Destinations', subcategory: 'South America', completed: false },
      { title: 'Hike in Patagonia Wearing Patagonia', description: 'Trek through Patagonia in Patagonia gear', category: 'International Destinations', subcategory: 'South America', completed: false },
      { title: 'Visit Machu Picchu at Sunrise After Multi-Day Trek', description: 'Hike the Inca Trail to reach Machu Picchu', category: 'International Destinations', subcategory: 'South America', completed: false },
      { title: 'Explore the Galápagos Islands on a Guided Eco-Tour', description: 'Discover unique wildlife in the Galápagos', category: 'International Destinations', subcategory: 'South America', completed: false },

      // Central America
      { title: 'Stay at a Treehouse Lodge in Costa Rica', description: 'Sleep in a rainforest treehouse', category: 'International Destinations', subcategory: 'Central America', completed: false },

      // Antarctica
      { title: 'Go on an Antarctica Cruise', description: 'Voyage to the frozen continent', category: 'International Destinations', subcategory: 'Antarctica', completed: false },
      { title: 'Do an Antarctica Polar Plunge', description: 'Jump into Antarctic waters', category: 'International Destinations', subcategory: 'Antarctica', completed: false },

      // Cultural Experiences
      { title: 'Have a Photoshoot in Another Country in Traditional Garb', description: 'Get professional photos in cultural attire abroad', category: 'International Destinations', subcategory: 'Cultural Experiences', completed: false },
      { title: 'Paint and Sip in Another City', description: 'Take a paint and wine class while traveling', category: 'International Destinations', subcategory: 'Cultural Experiences', completed: false },

      // North America (International)
      { title: 'French Quarter Walking Tour', description: "Explore New Orleans' historic French Quarter", category: 'International Destinations', subcategory: 'North America', completed: false },
      { title: 'Have Tea at the Banff Lake Louise Tea House', description: 'Hike to and enjoy tea at Lake Louise', category: 'International Destinations', subcategory: 'North America', completed: true },
    ]);

    // ========================================================================
    // USA DESTINATIONS
    // ========================================================================

    await insertItems([
      // Southwest
      { title: 'Zipline Over the Grand Canyon', description: 'Soar across the canyon on a zipline', category: 'USA Destinations', subcategory: 'Southwest', completed: false },
      { title: 'Get Coffee at the Town at the Bottom of the Grand Canyon', description: 'Visit Supai Village in Havasupai', category: 'USA Destinations', subcategory: 'Southwest', completed: false },

      // Hawaii
      { title: 'Hike the Kalalau Trail on Kauai', description: 'Trek the challenging Na Pali Coast trail in Hawaii', category: 'USA Destinations', subcategory: 'Hawaii', completed: false },

      // Alaska
      { title: 'Paddleboard in an Alaskan Glacier', description: 'SUP among icebergs in Alaska', category: 'USA Destinations', subcategory: 'Alaska', completed: false },

      // Northeast
      { title: "Watch the New York Times Square Ball Drop on New Year's Eve", description: 'Ring in the New Year in Times Square', category: 'USA Destinations', subcategory: 'Northeast', completed: false },

      // Southeast
      { title: 'Go to Kennedy Space Center and Do Astronaut Training Experience', description: "Experience NASA's astronaut training program", category: 'USA Destinations', subcategory: 'Southeast', completed: false },
    ]);

    // ========================================================================
    // TRAVEL GOALS (PARENT + CHILDREN)
    // ========================================================================

    await insertParentWithChildren(
      {
        title: 'Visit all 50 U.S. States and Territories',
        description: 'Complete tour of all states and territories',
        category: 'Travel Goals',
      },
      [
        { name: 'Alabama' },
        { name: 'Alaska' },
        { name: 'Arizona' },
        { name: 'Arkansas' },
        { name: 'California' },
        { name: 'Colorado' },
        { name: 'Connecticut' },
        { name: 'Delaware' },
        { name: 'Florida' },
        { name: 'Georgia' },
        { name: 'Hawaii' },
        { name: 'Idaho' },
        { name: 'Illinois' },
        { name: 'Indiana' },
        { name: 'Iowa' },
        { name: 'Kansas' },
        { name: 'Kentucky' },
        { name: 'Louisiana' },
        { name: 'Maine' },
        { name: 'Maryland' },
        { name: 'Massachusetts' },
        { name: 'Michigan' },
        { name: 'Minnesota' },
        { name: 'Mississippi' },
        { name: 'Missouri' },
        { name: 'Montana' },
        { name: 'Nebraska' },
        { name: 'Nevada' },
        { name: 'New Hampshire' },
        { name: 'New Jersey' },
        { name: 'New Mexico' },
        { name: 'New York' },
        { name: 'North Carolina' },
        { name: 'North Dakota' },
        { name: 'Ohio' },
        { name: 'Oklahoma' },
        { name: 'Oregon' },
        { name: 'Pennsylvania' },
        { name: 'Rhode Island' },
        { name: 'South Carolina' },
        { name: 'South Dakota' },
        { name: 'Tennessee' },
        { name: 'Texas' },
        { name: 'Utah' },
        { name: 'Vermont' },
        { name: 'Virginia' },
        { name: 'Washington' },
        { name: 'West Virginia' },
        { name: 'Wisconsin' },
        { name: 'Wyoming' },
        { name: 'Puerto Rico', description: 'Territory' },
        { name: 'U.S. Virgin Islands', description: 'Territory' },
        { name: 'Guam', description: 'Territory' },
        { name: 'American Samoa', description: 'Territory' },
        { name: 'Northern Mariana Islands', description: 'Territory' },
      ]
    );

    // ========================================================================
    // LOCAL ACTIVITIES
    // ========================================================================

    await insertItems([
      // Arts & Culture
      { title: 'Go on a Photography Tour with a Group', description: 'Join a guided photography walk', category: 'Local Activities', subcategory: 'Arts & Culture', completed: false },
      { title: 'Take an Urban Sketching Walking Tour Downtown', description: 'Sketch cityscapes with a group', category: 'Local Activities', subcategory: 'Arts & Culture', completed: false },
      { title: 'Have Art Displayed in a Local Gallery', description: 'Get your artwork exhibited (Terrain or similar)', category: 'Local Activities', subcategory: 'Arts & Culture', completed: false },
      { title: 'Participate in a Local Theater Production', description: 'Act in a community theater play', category: 'Local Activities', subcategory: 'Arts & Culture', completed: false },

      // Entertainment
      { title: 'Go to a Drive-In Theater', description: 'Watch a movie at a classic drive-in', category: 'Local Activities', subcategory: 'Entertainment', completed: false },
      { title: 'Attend Midnight Showing of Rocky Horror Picture Show', description: 'Experience the cult classic with audience participation', category: 'Local Activities', subcategory: 'Entertainment', completed: true },
      { title: 'Participate in a Historical Reenactment or Renaissance Faire', description: 'Dress up and experience living history', category: 'Local Activities', subcategory: 'Entertainment', completed: false },

      // Wellness & Fitness
      { title: 'Goat Yoga (or Other Animal Yoga)', description: 'Practice yoga with friendly animals', category: 'Local Activities', subcategory: 'Wellness & Fitness', completed: false },
      { title: 'Yoga in the Park', description: 'Join an outdoor yoga session', category: 'Local Activities', subcategory: 'Wellness & Fitness', completed: false },
      { title: 'Get into Shape', description: 'Achieve peak physical fitness', category: 'Local Activities', subcategory: 'Wellness & Fitness', completed: false },
      { title: 'Do a Polar Plunge', description: 'Jump into freezing water for charity', category: 'Local Activities', subcategory: 'Wellness & Fitness', completed: true },

      // Outdoor Adventures
      { title: 'Kayak/Paddleboard on a Lake Accessible Only by Hiking', description: 'Hike to a remote alpine lake and paddle', category: 'Local Activities', subcategory: 'Outdoor Adventures', completed: false },
      { title: 'Walk Bloomsday', description: 'Participate in the Bloomsday Run in Spokane', category: 'Local Activities', subcategory: 'Outdoor Adventures', completed: false },
      { title: 'Try Geocaching', description: 'Go on a GPS treasure hunt', category: 'Local Activities', subcategory: 'Outdoor Adventures', completed: false },
      { title: 'Participate in the 24 Hours of Riverside Mountain Biking Race', description: 'Compete in the endurance mountain bike race', category: 'Local Activities', subcategory: 'Outdoor Adventures', completed: false },
      { title: 'Go to a Hike-In Hot Springs', description: 'Soak in natural hot springs reached by trail', category: 'Local Activities', subcategory: 'Outdoor Adventures', completed: true },
      { title: 'Ride on a Dog Sled', description: 'Experience dog sledding in winter', category: 'Local Activities', subcategory: 'Outdoor Adventures', completed: true },
      { title: 'Go Snowshoeing', description: 'Trek through snow on snowshoes', category: 'Local Activities', subcategory: 'Outdoor Adventures', completed: true },
      { title: 'Go Cross-Country Skiing', description: 'Glide through winter landscapes on Nordic skis', category: 'Local Activities', subcategory: 'Outdoor Adventures', completed: true },

      // Regional Travel
      { title: 'Take Amtrak to Seattle Using Only Public Transit and Hostels', description: 'Enjoy a budget-friendly train adventure', category: 'Local Activities', subcategory: 'Regional Travel', completed: false },

      // Social & Community
      { title: 'Join a Local Book Club', description: 'Connect with readers in the community', category: 'Local Activities', subcategory: 'Social & Community', completed: false },

      // Creative Projects
      { title: 'Make a 3D Model, Print It, and Paint It', description: 'Complete a 3D printing project from start to finish', category: 'Local Activities', subcategory: 'Creative Projects', completed: false },
      { title: 'Make an Elaborate Cosplay from Scratch', description: 'Create and wear a detailed costume to a convention', category: 'Local Activities', subcategory: 'Creative Projects', completed: false },
      { title: 'Write and Publish a Book', description: 'Complete and publish an original book', category: 'Local Activities', subcategory: 'Creative Projects', completed: false },
      { title: 'Record a Fanfic Audiobook', description: 'Narrate and produce a fanfiction audiobook', category: 'Local Activities', subcategory: 'Creative Projects', completed: false },
      { title: 'Create a Basic Video Game', description: 'Design and develop a simple video game', category: 'Local Activities', subcategory: 'Creative Projects', completed: false },

      // Unique Experiences
      { title: 'Enjoy a Multi-Course Meal Blindfolded', description: 'Experience dining in the dark', category: 'Local Activities', subcategory: 'Unique Experiences', completed: true },
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get the admin user ID
    const result = await queryRunner.query(
      `SELECT id FROM users WHERE role = 'admin' LIMIT 1`
    );

    if (result.length === 0) {
      return; // No admin user, nothing to delete
    }

    const adminUserId = result[0].id;

    // Delete all bucket list items for the admin user that were added by this migration
    await queryRunner.query(
      `DELETE FROM bucket_list_items 
       WHERE "userId" = $1 
       AND category IN (
         'Skills & Certifications',
         'Adventure & Experiences',
         'International Destinations',
         'USA Destinations',
         'Local Activities',
         'Travel Goals'
       )`,
      [adminUserId]
    );
  }
}
