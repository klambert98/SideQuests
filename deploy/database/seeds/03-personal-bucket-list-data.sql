-- ============================================================================
-- SEED: Personal Bucket List Items
-- ============================================================================
-- This file contains personal bucket list items organized by category
-- Run this with the --seed flag during deployment
-- ============================================================================

DO $$
DECLARE
    admin_user_id UUID;
    item_order INT := 1;
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_user_id FROM users WHERE role = 'admin' LIMIT 1;
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'No admin user found. Please create an admin user first.';
    END IF;

    -- ========================================================================
    -- SKILLS & CERTIFICATIONS
    -- ========================================================================
    
    -- Languages & Communication
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Learn Sign Language', 'Become proficient in American Sign Language', 'Skills & Certifications', 'Languages & Communication', false, item_order),
        (admin_user_id, 'Attend a Language Exchange Meetup', 'Practice languages with native speakers', 'Skills & Certifications', 'Languages & Communication', false, item_order + 1)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 2;
    
    -- Water Sports
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Earn Scuba Diving Certification', 'Get certified for scuba diving', 'Skills & Certifications', 'Water Sports', false, item_order),
        (admin_user_id, 'Learn to Surf', 'Take surfing lessons and catch waves', 'Skills & Certifications', 'Water Sports', false, item_order + 1),
        (admin_user_id, 'Take a Fly-Fishing Class', 'Learn the art of fly-fishing', 'Skills & Certifications', 'Water Sports', false, item_order + 2),
        (admin_user_id, 'Get Boating License', 'Obtain official boating license', 'Skills & Certifications', 'Water Sports', true, item_order + 3)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 4;
    
    -- Winter Sports
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Learn to Snowboard', 'Take snowboarding lessons and hit the slopes', 'Skills & Certifications', 'Winter Sports', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;
    
    -- Extreme Sports
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Learn to Rock Climb', 'Take rock climbing lessons and scale walls', 'Skills & Certifications', 'Extreme Sports', false, item_order),
        (admin_user_id, 'Take an Aerial Silks Class', 'Learn aerial acrobatics with silks', 'Skills & Certifications', 'Extreme Sports', false, item_order + 1)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 2;
    
    -- Arts & Crafts
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Take a Pottery Class', 'Learn to throw pottery on a wheel', 'Skills & Certifications', 'Arts & Crafts', false, item_order),
        (admin_user_id, 'Learn Glassblowing', 'Create art through glassblowing', 'Skills & Certifications', 'Arts & Crafts', false, item_order + 1),
        (admin_user_id, 'Take a Blacksmithing Class', 'Learn traditional blacksmithing techniques', 'Skills & Certifications', 'Arts & Crafts', false, item_order + 2),
        (admin_user_id, 'Learn Woodworking and Make Furniture', 'Build a complete piece of furniture from scratch', 'Skills & Certifications', 'Arts & Crafts', false, item_order + 3)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 4;
    
    -- Dance & Performance
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Learn Pole Dancing', 'Take pole dancing fitness classes', 'Skills & Certifications', 'Dance & Performance', false, item_order),
        (admin_user_id, 'Learn Line Dances and Dance at a Country Bar', 'Master country line dancing and hit the dance floor', 'Skills & Certifications', 'Dance & Performance', false, item_order + 1)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 2;
    
    -- Culinary Skills
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Learn Latte Art', 'Master the art of creating beautiful latte designs', 'Skills & Certifications', 'Culinary Skills', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;
    
    -- Professional Certifications
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Get First Aid Certification', 'Become certified in first aid and CPR', 'Skills & Certifications', 'Professional Certifications', false, item_order),
        (admin_user_id, 'Get Pilot''s License', 'Earn a private pilot license', 'Skills & Certifications', 'Professional Certifications', false, item_order + 1),
        (admin_user_id, 'Get Adobe Certification', 'Become Adobe certified in creative software', 'Skills & Certifications', 'Professional Certifications', false, item_order + 2),
        (admin_user_id, 'Get Motorcycle License', 'Obtain motorcycle endorsement', 'Skills & Certifications', 'Professional Certifications', true, item_order + 3)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 4;
    
    -- Film & Media
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Take a Film-Making Class or Bootcamp', 'Learn professional film-making techniques', 'Skills & Certifications', 'Film & Media', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;
    
    -- Martial Arts
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Get a Black Belt in a Martial Arts Discipline', 'Achieve black belt rank in martial arts', 'Skills & Certifications', 'Martial Arts', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;
    
    -- Unique Skills
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Learn Lock Picking', 'Master the skill of lock picking', 'Skills & Certifications', 'Unique Skills', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;

    -- ========================================================================
    -- ADVENTURE & EXPERIENCES
    -- ========================================================================
    
    -- Sky & Air
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Go Skydiving', 'Jump out of a plane and freefall', 'Adventure & Experiences', 'Sky & Air', false, item_order),
        (admin_user_id, 'Ride in a Hot Air Balloon', 'Float peacefully in a hot air balloon', 'Adventure & Experiences', 'Sky & Air', false, item_order + 1),
        (admin_user_id, 'Take a Zero Gravity Flight', 'Experience weightlessness (Blue Origin)', 'Adventure & Experiences', 'Sky & Air', false, item_order + 2)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 3;
    
    -- Bungee & Heights
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Bungee Jump into a Canyon', 'Take the plunge off a canyon edge', 'Adventure & Experiences', 'Bungee & Heights', false, item_order),
        (admin_user_id, 'Bungee Jump into a River', 'Bungee jump with a water landing', 'Adventure & Experiences', 'Bungee & Heights', false, item_order + 1)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 2;
    
    -- Water Adventures
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Go Rafting on Every Class of Rapids', 'Experience all levels of white-water rafting', 'Adventure & Experiences', 'Water Adventures', false, item_order),
        (admin_user_id, 'Try Ice-Climbing a Frozen Waterfall', 'Climb a frozen waterfall with ice axes', 'Adventure & Experiences', 'Water Adventures', false, item_order + 1),
        (admin_user_id, 'Go on a Multi-Day Kayaking Camping Trip', 'Kayak and camp along a waterway', 'Adventure & Experiences', 'Water Adventures', false, item_order + 2),
        (admin_user_id, 'Swim with Dolphins', 'Interact with dolphins in their natural habitat', 'Adventure & Experiences', 'Water Adventures', false, item_order + 3)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 4;
    
    -- Backpacking & Camping
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Go on a Solo Backpacking Trip in Another Country', 'Travel solo using only public transit and hostels', 'Adventure & Experiences', 'Backpacking & Camping', false, item_order),
        (admin_user_id, 'Multi-Day Backpacking Trip', 'Complete a multi-day wilderness backpacking expedition', 'Adventure & Experiences', 'Backpacking & Camping', false, item_order + 1),
        (admin_user_id, 'Camp Out on the Beach', 'Spend the night camping on a beach', 'Adventure & Experiences', 'Backpacking & Camping', false, item_order + 2)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 3;
    
    -- Winter Adventures
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Skate on a Frozen Lake', 'Ice skate on a natural frozen lake', 'Adventure & Experiences', 'Winter Adventures', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;
    
    -- Nature & Wildlife
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Watch a Meteor Shower in a Dark Sky Park', 'Stargaze during a meteor shower in a designated dark sky area', 'Adventure & Experiences', 'Nature & Wildlife', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;
    
    -- Road Trips & Transit
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Take a Scenic Road Trip on a Motorcycle', 'Embark on an epic motorcycle road trip', 'Adventure & Experiences', 'Road Trips & Transit', false, item_order),
        (admin_user_id, 'Ride on a Scenic Mountain Train', 'Take a picturesque train journey through mountains', 'Adventure & Experiences', 'Road Trips & Transit', true, item_order + 1)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 2;
    
    -- Wellness & Mindfulness
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Attend a Silent Retreat', 'Participate in a meditation and silence retreat', 'Adventure & Experiences', 'Wellness & Mindfulness', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;
    
    -- Volunteering & Service
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Volunteer for a Beach or River Clean-Up', 'Give back by helping clean up waterways', 'Adventure & Experiences', 'Volunteering & Service', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;
    
    -- Entertainment
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Be an Extra in a Movie', 'Appear as a background actor in a film', 'Adventure & Experiences', 'Entertainment', false, item_order),
        (admin_user_id, 'Attend a Major Music Festival', 'Experience a large-scale music festival', 'Adventure & Experiences', 'Entertainment', false, item_order + 1),
        (admin_user_id, 'Attend a Masquerade Ball', 'Dress up for an elegant masquerade ball', 'Adventure & Experiences', 'Entertainment', false, item_order + 2),
        (admin_user_id, 'Attend a Silent Disco', 'Dance with wireless headphones at a silent disco', 'Adventure & Experiences', 'Entertainment', true, item_order + 3)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 4;
    
    -- Simple Pleasures
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Fly a Kite on a Windy Beach', 'Enjoy kite flying on a breezy beach', 'Adventure & Experiences', 'Simple Pleasures', true, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;

    -- ========================================================================
    -- INTERNATIONAL DESTINATIONS
    -- ========================================================================
    
    -- Africa
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Sandboard in the Moroccan Desert', 'Surf down sand dunes in Morocco', 'International Destinations', 'Africa', false, item_order),
        (admin_user_id, 'Ride a Camel at Sunset in the Sahara', 'Experience camel trekking in the Sahara Desert', 'International Destinations', 'Africa', false, item_order + 1),
        (admin_user_id, 'Safari in Serengeti National Park', 'Go on a wildlife safari in Tanzania', 'International Destinations', 'Africa', false, item_order + 2),
        (admin_user_id, 'Watch the 2027 Solar Eclipse in Luxor', 'View the total solar eclipse from Egypt', 'International Destinations', 'Africa', false, item_order + 3)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 4;
    
    -- Europe
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'See a Shakespeare Play at The Globe', 'Watch Shakespeare performed at the Globe Theatre in London', 'International Destinations', 'Europe', false, item_order),
        (admin_user_id, 'See the Northern Lights in Iceland', 'Witness the Aurora Borealis in Iceland', 'International Destinations', 'Europe', false, item_order + 1),
        (admin_user_id, 'Ride a Vintage Carousel in Vienna''s Prater', 'Enjoy a classic carousel ride in Vienna', 'International Destinations', 'Europe', false, item_order + 2),
        (admin_user_id, 'Spend a Night in an Ice Hotel in Sweden', 'Sleep in a hotel made entirely of ice', 'International Destinations', 'Europe', false, item_order + 3),
        (admin_user_id, 'Explore Chernobyl with a Guided Tour', 'Visit the Chernobyl exclusion zone', 'International Destinations', 'Europe', false, item_order + 4),
        (admin_user_id, 'Sail the Greek Islands in a Small Yacht', 'Island hop in Greece by boat', 'International Destinations', 'Europe', false, item_order + 5),
        (admin_user_id, 'Walk the Camino de Santiago', 'Complete the historic pilgrimage trail in Spain', 'International Destinations', 'Europe', false, item_order + 6),
        (admin_user_id, 'Snow Tubing/Toboggan in Norway', 'Enjoy winter sledding in Norway', 'International Destinations', 'Europe', false, item_order + 7)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 8;
    
    -- Asia
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Get a Sak Yant Tattoo', 'Receive traditional Thai bamboo tattoo', 'International Destinations', 'Asia', false, item_order),
        (admin_user_id, 'Ride Horseback in Kyrgyzstan', 'Experience horseback riding in Central Asia', 'International Destinations', 'Asia', false, item_order + 1),
        (admin_user_id, 'Hike Mt. Fuji and Watch the Sunrise', 'Climb Mt. Fuji, stay overnight, and see dawn from the summit', 'International Destinations', 'Asia', false, item_order + 2),
        (admin_user_id, 'Swim with Bioluminescent Plankton in the Maldives', 'Experience glowing waters at night', 'International Destinations', 'Asia', false, item_order + 3),
        (admin_user_id, 'Attend Holi or Diwali in India', 'Participate in major Indian festivals', 'International Destinations', 'Asia', false, item_order + 4),
        (admin_user_id, 'Attend the Ice and Snow Festival in China', 'See massive ice sculptures in Harbin', 'International Destinations', 'Asia', false, item_order + 5),
        (admin_user_id, 'Attend a Full Moon Drum Circle in Bali', 'Join a spiritual gathering in Bali', 'International Destinations', 'Asia', false, item_order + 6),
        (admin_user_id, 'Spend a Night in a Yurt Camp in Mongolia', 'Sleep in a traditional yurt under the stars', 'International Destinations', 'Asia', false, item_order + 7),
        (admin_user_id, 'Stay in a Traditional Ryokan in Japan', 'Experience a Japanese inn with tatami mats and hot springs', 'International Destinations', 'Asia', false, item_order + 8),
        (admin_user_id, 'Take an Archery Class on Horseback in Mongolia', 'Learn traditional Mongolian horse archery', 'International Destinations', 'Asia', false, item_order + 9),
        (admin_user_id, 'Take the Trans-Siberian Railway', 'Journey across Russia on the legendary train route', 'International Destinations', 'Asia', false, item_order + 10)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 11;
    
    -- Oceania
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Learn Maori Haka and Perform It with Locals', 'Master the traditional Maori war dance', 'International Destinations', 'Oceania', false, item_order),
        (admin_user_id, 'Scuba Dive the Great Barrier Reef', 'Dive one of the world''s greatest coral reefs', 'International Destinations', 'Oceania', false, item_order + 1),
        (admin_user_id, 'Cycle the Great Ocean Road in Australia', 'Bike along Australia''s stunning coastal highway', 'International Destinations', 'Oceania', false, item_order + 2)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 3;
    
    -- Middle East
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Visit Socotra and See the Dragon Blood Trees', 'Explore Yemen''s alien-like island landscape', 'International Destinations', 'Middle East', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;
    
    -- South America
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Hang Glide Over Rio de Janeiro', 'Soar above Rio''s coastline', 'International Destinations', 'South America', false, item_order),
        (admin_user_id, 'Hike in Patagonia Wearing Patagonia', 'Trek through Patagonia in Patagonia gear', 'International Destinations', 'South America', false, item_order + 1),
        (admin_user_id, 'Visit Machu Picchu at Sunrise After Multi-Day Trek', 'Hike the Inca Trail to reach Machu Picchu', 'International Destinations', 'South America', false, item_order + 2),
        (admin_user_id, 'Explore the Galápagos Islands on a Guided Eco-Tour', 'Discover unique wildlife in the Galápagos', 'International Destinations', 'South America', false, item_order + 3)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 4;
    
    -- Central America
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Stay at a Treehouse Lodge in Costa Rica', 'Sleep in a rainforest treehouse', 'International Destinations', 'Central America', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;
    
    -- Antarctica
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Go on an Antarctica Cruise', 'Voyage to the frozen continent', 'International Destinations', 'Antarctica', false, item_order),
        (admin_user_id, 'Do an Antarctica Polar Plunge', 'Jump into Antarctic waters', 'International Destinations', 'Antarctica', false, item_order + 1)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 2;
    
    -- Cultural Experiences
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Have a Photoshoot in Another Country in Traditional Garb', 'Get professional photos in cultural attire abroad', 'International Destinations', 'Cultural Experiences', false, item_order),
        (admin_user_id, 'Paint and Sip in Another City', 'Take a paint and wine class while traveling', 'International Destinations', 'Cultural Experiences', false, item_order + 1)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 2;
    
    -- North America (International)
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'French Quarter Walking Tour', 'Explore New Orleans'' historic French Quarter', 'International Destinations', 'North America', false, item_order),
        (admin_user_id, 'Have Tea at the Banff Lake Louise Tea House', 'Hike to and enjoy tea at Lake Louise', 'International Destinations', 'North America', true, item_order + 1)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 2;

    -- ========================================================================
    -- USA DESTINATIONS
    -- ========================================================================
    
    -- Southwest
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Zipline Over the Grand Canyon', 'Soar across the canyon on a zipline', 'USA Destinations', 'Southwest', false, item_order),
        (admin_user_id, 'Get Coffee at the Town at the Bottom of the Grand Canyon', 'Visit Supai Village in Havasupai', 'USA Destinations', 'Southwest', false, item_order + 1)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 2;
    
    -- Hawaii
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Hike the Kalalau Trail on Kauai', 'Trek the challenging Na Pali Coast trail in Hawaii', 'USA Destinations', 'Hawaii', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;
    
    -- Alaska
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Paddleboard in an Alaskan Glacier', 'SUP among icebergs in Alaska', 'USA Destinations', 'Alaska', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;
    
    -- Northeast
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Watch the New York Times Square Ball Drop on New Year''s Eve', 'Ring in the New Year in Times Square', 'USA Destinations', 'Northeast', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;
    
    -- Southeast
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Go to Kennedy Space Center and Do Astronaut Training Experience', 'Experience NASA''s astronaut training program', 'USA Destinations', 'Southeast', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;

    -- ========================================================================
    -- LOCAL ACTIVITIES
    -- ========================================================================
    
    -- Arts & Culture
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Go on a Photography Tour with a Group', 'Join a guided photography walk', 'Local Activities', 'Arts & Culture', false, item_order),
        (admin_user_id, 'Take an Urban Sketching Walking Tour Downtown', 'Sketch cityscapes with a group', 'Local Activities', 'Arts & Culture', false, item_order + 1),
        (admin_user_id, 'Have Art Displayed in a Local Gallery', 'Get your artwork exhibited (Terrain or similar)', 'Local Activities', 'Arts & Culture', false, item_order + 2),
        (admin_user_id, 'Participate in a Local Theater Production', 'Act in a community theater play', 'Local Activities', 'Arts & Culture', false, item_order + 3)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 4;
    
    -- Entertainment
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Go to a Drive-In Theater', 'Watch a movie at a classic drive-in', 'Local Activities', 'Entertainment', false, item_order),
        (admin_user_id, 'Attend Midnight Showing of Rocky Horror Picture Show', 'Experience the cult classic with audience participation', 'Local Activities', 'Entertainment', true, item_order + 1),
        (admin_user_id, 'Participate in a Historical Reenactment or Renaissance Faire', 'Dress up and experience living history', 'Local Activities', 'Entertainment', false, item_order + 2)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 3;
    
    -- Wellness & Fitness
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Goat Yoga (or Other Animal Yoga)', 'Practice yoga with friendly animals', 'Local Activities', 'Wellness & Fitness', false, item_order),
        (admin_user_id, 'Yoga in the Park', 'Join an outdoor yoga session', 'Local Activities', 'Wellness & Fitness', false, item_order + 1),
        (admin_user_id, 'Get into Shape', 'Achieve peak physical fitness', 'Local Activities', 'Wellness & Fitness', false, item_order + 2),
        (admin_user_id, 'Do a Polar Plunge', 'Jump into freezing water for charity', 'Local Activities', 'Wellness & Fitness', true, item_order + 3)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 4;
    
    -- Outdoor Adventures
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Kayak/Paddleboard on a Lake Accessible Only by Hiking', 'Hike to a remote alpine lake and paddle', 'Local Activities', 'Outdoor Adventures', false, item_order),
        (admin_user_id, 'Walk Bloomsday', 'Participate in the Bloomsday Run in Spokane', 'Local Activities', 'Outdoor Adventures', false, item_order + 1),
        (admin_user_id, 'Try Geocaching', 'Go on a GPS treasure hunt', 'Local Activities', 'Outdoor Adventures', false, item_order + 2),
        (admin_user_id, 'Participate in the 24 Hours of Riverside Mountain Biking Race', 'Compete in the endurance mountain bike race', 'Local Activities', 'Outdoor Adventures', false, item_order + 3),
        (admin_user_id, 'Go to a Hike-In Hot Springs', 'Soak in natural hot springs reached by trail', 'Local Activities', 'Outdoor Adventures', true, item_order + 4),
        (admin_user_id, 'Ride on a Dog Sled', 'Experience dog sledding in winter', 'Local Activities', 'Outdoor Adventures', true, item_order + 5),
        (admin_user_id, 'Go Snowshoeing', 'Trek through snow on snowshoes', 'Local Activities', 'Outdoor Adventures', true, item_order + 6),
        (admin_user_id, 'Go Cross-Country Skiing', 'Glide through winter landscapes on Nordic skis', 'Local Activities', 'Outdoor Adventures', true, item_order + 7)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 8;
    
    -- Regional Travel
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Take Amtrak to Seattle Using Only Public Transit and Hostels', 'Enjoy a budget-friendly train adventure', 'Local Activities', 'Regional Travel', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;
    
    -- Social & Community
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Join a Local Book Club', 'Connect with readers in the community', 'Local Activities', 'Social & Community', false, item_order)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 1;
    
    -- Creative Projects
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Make a 3D Model, Print It, and Paint It', 'Complete a 3D printing project from start to finish', 'Local Activities', 'Creative Projects', false, item_order),
        (admin_user_id, 'Make an Elaborate Cosplay from Scratch', 'Create and wear a detailed costume to a convention', 'Local Activities', 'Creative Projects', false, item_order + 1),
        (admin_user_id, 'Write and Publish a Book', 'Complete and publish an original book', 'Local Activities', 'Creative Projects', false, item_order + 2),
        (admin_user_id, 'Record a Fanfic Audiobook', 'Narrate and produce a fanfiction audiobook', 'Local Activities', 'Creative Projects', false, item_order + 3),
        (admin_user_id, 'Create a Basic Video Game', 'Design and develop a simple video game', 'Local Activities', 'Creative Projects', false, item_order + 4)
    ON CONFLICT DO NOTHING;
    item_order := item_order + 5;
    
    -- Unique Experiences
    INSERT INTO bucket_list_items ("userId", title, description, category, subcategory, completed, "displayOrder")
    VALUES 
        (admin_user_id, 'Enjoy a Multi-Course Meal Blindfolded', 'Experience dining in the dark', 'Local Activities', 'Unique Experiences', true, item_order)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Successfully added personal bucket list items';

END $$;
