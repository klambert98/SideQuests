import { AppDataSource } from '../config/database';
import { BucketListItem } from '../entities/BucketListItem';
import { User } from '../entities/User';

const seedBucketList = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepository = AppDataSource.getRepository(User);
    const bucketListRepository = AppDataSource.getRepository(BucketListItem);

    // Get the first user (assuming there's an admin user)
    const user = await userRepository.findOne({ where: {} });
    if (!user) {
      console.error('No users found. Please create a user first.');
      process.exit(1);
    }

    const items = [
      // Skills & Certifications
      { title: 'Learn Sign Language', category: 'Skills & Certifications', completed: false },
      { title: 'Earn Scuba Cert', category: 'Skills & Certifications', completed: false },
      { title: 'Get first-aid cert', category: 'Skills & Certifications', completed: false },
      { title: 'Learn to surf', category: 'Skills & Certifications', completed: false },
      { title: 'Learn to snowboard', category: 'Skills & Certifications', completed: false },
      { title: 'Get pilot license', category: 'Skills & Certifications', completed: false },
      { title: 'Take a pottery class', category: 'Skills & Certifications', completed: false },
      { title: 'Learn latte art', category: 'Skills & Certifications', completed: false },
      { title: 'Get an Adobe cert', category: 'Skills & Certifications', completed: false },
      { title: 'Take a film-making class/bootcamp', category: 'Skills & Certifications', completed: false },
      { title: 'Learn glassblowing', category: 'Skills & Certifications', completed: false },
      { title: 'Learn to rock climb', category: 'Skills & Certifications', completed: false },
      { title: 'Take fly-fishing class', category: 'Skills & Certifications', completed: false },
      { title: 'Take aerial silks class', category: 'Skills & Certifications', completed: false },
      { title: 'Learn to pole dance', category: 'Skills & Certifications', completed: false },
      { title: 'Learn lock picking', category: 'Skills & Certifications', completed: false },
      { title: 'Take a blacksmithing class', category: 'Skills & Certifications', completed: false },
      { title: 'Learn woodworking and make a piece of furniture', category: 'Skills & Certifications', completed: false },
      { title: 'Get a black-belt in a martial arts discipline', category: 'Skills & Certifications', completed: false },
      { title: 'Learn some line dances and dance at a country bar', category: 'Skills & Certifications', completed: false },
      { title: 'Attend a language exchange meetup', category: 'Skills & Certifications', completed: false },
      { title: 'Get boating license', category: 'Skills & Certifications', completed: true },
      { title: 'Get motorcycle license', category: 'Skills & Certifications', completed: true },

      // General Adventures
      { title: 'Have a photoshoot in another country while in traditional garb', category: 'General Adventures', completed: false },
      { title: 'Go on a solo backpacking trip in another country, using only public transit and hostels', category: 'General Adventures', completed: false },
      { title: 'Go skydiving', category: 'General Adventures', completed: false },
      { title: 'Ride in a hot air balloon', category: 'General Adventures', completed: false },
      { title: 'Skate on a frozen lake', category: 'General Adventures', completed: false },
      { title: 'Volunteer for a beach or river clean-up', category: 'General Adventures', completed: false },
      { title: 'Watch a meteor shower in a dark sky park', category: 'General Adventures', completed: false },
      { title: 'Take a scenic roadtrip on a motorcycle', category: 'General Adventures', completed: false },
      { title: 'Be an extra in a movie', category: 'General Adventures', completed: false },
      { title: 'Take a zero gravity flight (Blue Origin)', category: 'General Adventures', completed: false },
      { title: 'Attend a silent retreat', category: 'General Adventures', completed: false },
      { title: 'Go rafting on every class of rapids', category: 'General Adventures', completed: false },
      { title: 'Try ice-climbing a frozen waterfall', category: 'General Adventures', completed: false },
      { title: 'Go on a multi-day kayaking camping trip', category: 'General Adventures', completed: false },
      { title: 'Camp out on the beach', category: 'General Adventures', completed: false },
      { title: 'Paint and sip in another city', category: 'General Adventures', completed: false },
      { title: 'Multi-day backpacking trip', category: 'General Adventures', completed: false },
      { title: 'Swim with dolphins', category: 'General Adventures', completed: false },
      { title: 'Attend a major music festival', category: 'General Adventures', completed: false },
      { title: 'Bungee jump into a canyon', category: 'General Adventures', completed: false },
      { title: 'Bungee jump into a river', category: 'General Adventures', completed: false },
      { title: 'Attend a masquerade ball', category: 'General Adventures', completed: false },
      { title: 'Go to a silent disco', category: 'General Adventures', completed: true },
      { title: 'Ride on a scenic mountain train', category: 'General Adventures', completed: true },
      { title: 'Fly a kite on a windy beach', category: 'General Adventures', completed: true },

      // Bucket List Destinations
      { title: 'Get a Sak Yant tattoo', category: 'Bucket List Destinations', completed: false },
      { title: 'See a Shakespeare play at The Globe', category: 'Bucket List Destinations', completed: false },
      { title: 'Go on an Antarctica cruise', category: 'Bucket List Destinations', completed: false },
      { title: 'Sandboard in the Moroccan desert', category: 'Bucket List Destinations', completed: false },
      { title: 'Ride horseback in Kyrgyzstan', category: 'Bucket List Destinations', completed: false },
      { title: 'See the Northern Lights in Iceland', category: 'Bucket List Destinations', completed: false },
      { title: 'Watch the 2027 solar eclipse in Luxor', category: 'Bucket List Destinations', completed: false },
      { title: 'Hike Mt. Fuji, stay overnight, and watch the sunrise', category: 'Bucket List Destinations', completed: false },
      { title: 'Hang glide over Rio', category: 'Bucket List Destinations', completed: false },
      { title: 'Paddleboard in an Alaskan glacier', category: 'Bucket List Destinations', completed: false },
      { title: 'Snow tubing/toboggan in Norway', category: 'Bucket List Destinations', completed: false },
      { title: 'French Quarter walking tour', category: 'Bucket List Destinations', completed: false },
      { title: "Ride a vintage carousel in Vienna's Prater", category: 'Bucket List Destinations', completed: false },
      { title: 'Spend night in an ice hotel in Sweden', category: 'Bucket List Destinations', completed: false },
      { title: 'Swim with bioluminescent plankton in Maldives', category: 'Bucket List Destinations', completed: false },
      { title: 'Explore Chernobyl with a guided tour', category: 'Bucket List Destinations', completed: false },
      { title: 'Ride a camel at sunset in the Sahara', category: 'Bucket List Destinations', completed: false },
      { title: 'Attend Holi or Diwali in India', category: 'Bucket List Destinations', completed: false },
      { title: 'Zipline over Grand Canyon', category: 'Bucket List Destinations', completed: false },
      { title: 'Hike in Patagonia wearing Patagonia', category: 'Bucket List Destinations', completed: false },
      { title: 'Scuba dive Great Barrier Reef', category: 'Bucket List Destinations', completed: false },
      { title: 'Watch New York Times Square ball drop on New Years Eve', category: 'Bucket List Destinations', completed: false },
      { title: 'Cycle the Great Ocean Road in Australia', category: 'Bucket List Destinations', completed: false },
      { title: 'Sail Greek islands in a small yacht or boat', category: 'Bucket List Destinations', completed: false },
      { title: 'Hike the Kalalau Trail on Kauai', category: 'Bucket List Destinations', completed: false },
      { title: 'Take the train journey on the Trans-Siberian Railway', category: 'Bucket List Destinations', completed: false },
      { title: 'Visit Machu Picchu at sunrise after multi-day trek', category: 'Bucket List Destinations', completed: false },
      { title: 'Stay at a treehouse lodge in Costa Rica', category: 'Bucket List Destinations', completed: false },
      { title: 'Attend the Ice and Fire Festival in China', category: 'Bucket List Destinations', completed: false },
      { title: 'Explore the Galapagos Islands on a guided eco-tour', category: 'Bucket List Destinations', completed: false },
      { title: 'Attend full moon drum circle in Bali', category: 'Bucket List Destinations', completed: false },
      { title: 'Walk the Camino de Santiago', category: 'Bucket List Destinations', completed: false },
      { title: 'Spend night in yurt camp in Mongolia and watch the stars', category: 'Bucket List Destinations', completed: false },
      { title: 'Learn Maori Haka and perform it with locals', category: 'Bucket List Destinations', completed: false },
      { title: 'Visit Socotra and see the Dragon Blood Trees', category: 'Bucket List Destinations', completed: false },
      { title: 'Stay in traditional ryokan in Japan', category: 'Bucket List Destinations', completed: false },
      { title: 'Take archery class on horseback in Mongolia', category: 'Bucket List Destinations', completed: false },
      { title: 'Get coffee at the town at the bottom of the Grand Canyon', category: 'Bucket List Destinations', completed: false },
      { title: 'Go to Kennedy Space Station and do astronaut training experience', category: 'Bucket List Destinations', completed: false },
      { title: 'Safari in Serengeti National Park', category: 'Bucket List Destinations', completed: false },
      { title: 'Do an Antarctica polar plunge', category: 'Bucket List Destinations', completed: false },
      { title: 'Have tea at the Banff Lake Louise Tea House', category: 'Bucket List Destinations', completed: true },

      // Local & Easy Adventures
      { title: 'Go on a photography tour with a group', category: 'Local & Easy Adventures', completed: false },
      { title: 'Goat yoga (or other animal yoga)', category: 'Local & Easy Adventures', completed: false },
      { title: 'Yoga in the park', category: 'Local & Easy Adventures', completed: false },
      { title: 'Kayak/paddleboard on a lake that has to be hiked to', category: 'Local & Easy Adventures', completed: false },
      { title: 'Walk Bloomsday', category: 'Local & Easy Adventures', completed: false },
      { title: 'Amtrak to Seattle, public transit + hostel stay', category: 'Local & Easy Adventures', completed: false },
      { title: 'Participate in a local theater production', category: 'Local & Easy Adventures', completed: false },
      { title: 'Go to a drive-in theater', category: 'Local & Easy Adventures', completed: false },
      { title: 'Join a local book club', category: 'Local & Easy Adventures', completed: false },
      { title: 'Take an urban sketching walking tour downtown', category: 'Local & Easy Adventures', completed: false },
      { title: 'Try geocaching', category: 'Local & Easy Adventures', completed: false },
      { title: 'Have art displayed in a local gallery', category: 'Local & Easy Adventures', completed: false },
      { title: 'Make a 3D model, print it, and paint it', category: 'Local & Easy Adventures', completed: false },
      { title: 'Make an elaborate cosplay from scratch to wear to a convention', category: 'Local & Easy Adventures', completed: false },
      { title: 'Write and publish a book', category: 'Local & Easy Adventures', completed: false },
      { title: 'Record a fanfic audio book', category: 'Local & Easy Adventures', completed: false },
      { title: 'Create a basic video game', category: 'Local & Easy Adventures', completed: false },
      { title: 'Participate in a historical reenactment or Ren Faire', category: 'Local & Easy Adventures', completed: false },
      { title: 'Get into shape', category: 'Local & Easy Adventures', completed: false },
      { title: 'Participate in the 24 Hours of Riverside mountain biking race', category: 'Local & Easy Adventures', completed: false },
      { title: 'Attend midnight showing of Rocky Horror', category: 'Local & Easy Adventures', completed: true },
      { title: 'Go to a hike-in hot springs', category: 'Local & Easy Adventures', completed: true },
      { title: 'Ride on a dog sled', category: 'Local & Easy Adventures', completed: true },
      { title: 'Go snowshoeing', category: 'Local & Easy Adventures', completed: true },
      { title: 'Go cross-country skiing', category: 'Local & Easy Adventures', completed: true },
      { title: 'Enjoy a multi-course meal blindfolded', category: 'Local & Easy Adventures', completed: true },
      { title: 'Do a polar plunge', category: 'Local & Easy Adventures', completed: true },

      // Ultimate Goals
      { title: 'Visit all continents', category: 'Ultimate Goals', completed: false },
      { title: 'Visit all National Parks in the US and US territories', category: 'Ultimate Goals', completed: false },
      { title: 'Visit all 50 states and US territories', category: 'Ultimate Goals', completed: false },
      { title: 'See all 7 UNESCO World Heritage Sites', category: 'Ultimate Goals', completed: false },
    ];

    // Clear existing items for this user
    await bucketListRepository.delete({ userId: user.id });

    // Create bucket list items
    const bucketListItems = items.map((item) =>
      bucketListRepository.create({
        ...item,
        userId: user.id,
      })
    );

    await bucketListRepository.save(bucketListItems);
    console.log(`✅ Seeded ${bucketListItems.length} bucket list items for user ${user.email}`);
  } catch (error) {
    console.error('❌ Error seeding bucket list:', error);
    process.exit(1);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
};

seedBucketList();
