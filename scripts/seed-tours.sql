-- Sample Tours for AgentCeylon
-- This script adds sample tour data to showcase the platform

-- First, let's create some sample service providers if they don't exist
-- Note: You'll need to replace these user IDs with actual user IDs from your users table

-- Sample Tours Data
INSERT INTO tours (
  title,
  description,
  price,
  duration,
  max_participants,
  category,
  location,
  itinerary,
  inclusions,
  exclusions,
  images,
  rating,
  reviews_count,
  is_active,
  provider_id
) VALUES 
-- Cultural Tours
(
  'Ancient Wonders of Kandy & Sigiriya',
  'Explore Sri Lanka''s most iconic cultural sites including the Temple of the Tooth, Sigiriya Rock Fortress, and traditional villages. Experience centuries of history and stunning architecture.',
  45000,
  3,
  15,
  'cultural',
  'Kandy, Sigiriya',
  '["Day 1: Arrive in Kandy, Temple of the Tooth visit, cultural show", "Day 2: Travel to Sigiriya, climb the Rock Fortress", "Day 3: Village tour and return to Colombo"]',
  '["Accommodation", "Breakfast", "Professional guide", "Entrance fees", "Transportation"]',
  '["Lunch and dinner", "Personal expenses", "Tips"]',
  '["https://images.unsplash.com/photo-1578662996442-48f60103fc96", "https://images.unsplash.com/photo-1566552881560-0be862a7c445"]',
  4.8,
  24,
  true,
  NULL
),
(
  'Galle Fort Heritage Walk',
  'Step back in time with a guided tour through the UNESCO World Heritage Galle Fort. Discover Dutch colonial architecture, charming cafes, and stunning ocean views.',
  8500,
  1,
  20,
  'cultural',
  'Galle',
  '["Morning: Meet at Galle Fort entrance", "Guided walk through historic streets", "Visit lighthouse and ramparts", "Lunch at colonial restaurant", "Shopping at local boutiques"]',
  '["Professional guide", "Entrance fees", "Light refreshments"]',
  '["Lunch", "Transportation", "Shopping expenses"]',
  '["https://images.unsplash.com/photo-1544735716-392fe2489ffa", "https://images.unsplash.com/photo-1578050575477-60b3b24bd92a"]',
  4.6,
  18,
  true,
  NULL
),

-- Adventure Tours
(
  'Ella Rock Hiking Adventure',
  'Challenge yourself with this spectacular hike to Ella Rock. Enjoy breathtaking views of tea plantations, valleys, and the famous Nine Arch Bridge along the way.',
  12000,
  1,
  12,
  'adventure',
  'Ella',
  '["Early morning departure", "Guided hike to Ella Rock (4-5 hours)", "Packed lunch with mountain views", "Visit Nine Arch Bridge", "Return by evening"]',
  '["Professional guide", "Packed lunch", "Water bottles", "Safety equipment"]',
  '["Transportation to Ella", "Personal gear", "Tips"]',
  '["https://images.unsplash.com/photo-1571847140471-1d7766e8f4e4", "https://images.unsplash.com/photo-1578050575692-a35eaca5b1a6"]',
  4.7,
  31,
  true,
  NULL
),
(
  'White Water Rafting at Kitulgala',
  'Experience the thrill of white water rafting on the Kelani River. Perfect for adventure seekers looking for an adrenaline rush in beautiful natural surroundings.',
  8500,
  1,
  8,
  'adventure',
  'Kitulgala',
  '["Safety briefing and equipment", "2-3 hours white water rafting", "Lunch by the river", "Optional jungle walk", "Return journey"]',
  '["Safety equipment", "Professional instructor", "Lunch", "Changing facilities"]',
  '["Transportation", "Personal clothes", "Waterproof camera"]',
  '["https://images.unsplash.com/photo-1544737149-6e4d999de2a4", "https://images.unsplash.com/photo-1571847140471-1d7766e8f4e4"]',
  4.5,
  16,
  true,
  NULL
),

-- Beach Tours
(
  'Mirissa Whale Watching Experience',
  'Embark on an unforgettable whale watching journey from Mirissa. Spot blue whales, sperm whales, and dolphins in their natural habitat in the Indian Ocean.',
  7500,
  1,
  25,
  'beach',
  'Mirissa',
  '["Early morning boat departure", "3-4 hours whale watching", "Dolphin spotting", "Return to harbor", "Beach lunch optional"]',
  '["Boat ride", "Life jackets", "Experienced crew", "Light refreshments"]',
  '["Meals", "Transportation to Mirissa", "Seasickness medication"]',
  '["https://images.unsplash.com/photo-1544551763-46a013bb70d5", "https://images.unsplash.com/photo-1559827260-dc66d52bef19"]',
  4.9,
  42,
  true,
  NULL
),
(
  'Unawatuna Beach Paradise Day',
  'Relax and unwind at one of Sri Lanka''s most beautiful beaches. Enjoy snorkeling, beach games, and stunning sunset views at Unawatuna.',
  5500,
  1,
  30,
  'beach',
  'Unawatuna',
  '["Morning arrival at Unawatuna Beach", "Snorkeling session", "Beach volleyball and games", "Beachside lunch", "Sunset viewing", "Evening return"]',
  '["Snorkeling equipment", "Beach chairs", "Lunch", "Fresh fruit"]',
  '["Transportation", "Alcoholic beverages", "Water sports"]',
  '["https://images.unsplash.com/photo-1506905925346-21bda4d32df4", "https://images.unsplash.com/photo-1571847140471-1d7766e8f4e4"]',
  4.4,
  28,
  true,
  NULL
),

-- Wildlife Tours
(
  'Yala National Park Safari',
  'Experience the wild side of Sri Lanka at Yala National Park. Spot leopards, elephants, sloth bears, and over 200 bird species in their natural habitat.',
  18000,
  2,
  6,
  'wildlife',
  'Yala National Park',
  '["Day 1: Arrival and afternoon safari", "Evening at safari lodge", "Day 2: Early morning safari", "Return journey with packed lunch"]',
  '["Safari jeep", "Professional guide", "Accommodation", "All meals", "Park fees"]',
  '["Personal expenses", "Alcoholic beverages", "Tips"]',
  '["https://images.unsplash.com/photo-1549366021-9f761d040a94", "https://images.unsplash.com/photo-1571847140471-1d7766e8f4e4"]',
  4.8,
  35,
  true,
  NULL
),
(
  'Udawalawe Elephant Safari',
  'Visit the famous Udawalawe National Park, home to over 600 elephants. Also visit the Elephant Transit Home to see rescued baby elephants being cared for.',
  15000,
  1,
  8,
  'wildlife',
  'Udawalawe',
  '["Morning departure", "Udawalawe National Park safari", "Elephant Transit Home visit", "Lunch at local restaurant", "Return journey"]',
  '["Safari vehicle", "Park entrance", "Professional guide", "Lunch"]',
  '["Transportation", "Personal expenses", "Tips"]',
  '["https://images.unsplash.com/photo-1551969014-7d2c4cddf0b6", "https://images.unsplash.com/photo-1578050575477-60b3b24bd92a"]',
  4.6,
  22,
  true,
  NULL
),

-- Diving Tours
(
  'Hikkaduwa Coral Reef Diving',
  'Discover the underwater world of Hikkaduwa with its vibrant coral reefs and diverse marine life. Perfect for both beginners and experienced divers.',
  12500,
  1,
  10,
  'diving',
  'Hikkaduwa',
  '["Morning briefing and equipment check", "Two diving sessions", "Surface interval with refreshments", "Marine life identification", "Certificate presentation"]',
  '["Diving equipment", "Professional instructor", "Refreshments", "Certificate"]',
  '["Lunch", "Transportation", "Underwater camera"]',
  '["https://images.unsplash.com/photo-1583212292454-1fe6229603b7", "https://images.unsplash.com/photo-1559827260-dc66d52bef19"]',
  4.7,
  19,
  true,
  NULL
),

-- Food Tours
(
  'Colombo Street Food Adventure',
  'Embark on a culinary journey through Colombo''s vibrant street food scene. Taste authentic local dishes and learn about Sri Lankan food culture.',
  6500,
  1,
  15,
  'food',
  'Colombo',
  '["Meet at Pettah Market", "Street food tastings", "Traditional sweet shop visit", "Spice market tour", "Cooking demonstration", "Tea tasting session"]',
  '["Food tastings", "Professional guide", "Recipe cards", "Tea tasting"]',
  '["Transportation", "Additional food purchases", "Tips"]',
  '["https://images.unsplash.com/photo-1585937421612-70a008356fbe", "https://images.unsplash.com/photo-1578050575477-60b3b24bd92a"]',
  4.5,
  26,
  true,
  NULL
),

-- Photography Tours
(
  'Golden Hour Photography Tour - Sigiriya',
  'Capture the perfect shot of Sigiriya Rock Fortress during golden hour. Professional photography guidance included for stunning landscape photos.',
  9500,
  1,
  8,
  'photography',
  'Sigiriya',
  '["Pre-dawn departure", "Best viewpoint setup", "Golden hour photography", "Breakfast with view", "Photo review session", "Editing tips"]',
  '["Professional guide", "Photography tips", "Breakfast", "Basic editing guidance"]',
  '["Camera equipment", "Transportation", "Personal expenses"]',
  '["https://images.unsplash.com/photo-1578662996442-48f60103fc96", "https://images.unsplash.com/photo-1571847140471-1d7766e8f4e4"]',
  4.8,
  14,
  true,
  NULL
),

-- Spiritual Tours
(
  'Sacred Temples of Kandy',
  'A spiritual journey through Kandy''s most sacred temples. Experience Buddhist culture, meditation sessions, and traditional ceremonies.',
  11000,
  2,
  12,
  'spiritual',
  'Kandy',
  '["Day 1: Temple of the Tooth, evening ceremony", "Meditation session", "Day 2: Additional temples", "Monk blessing ceremony", "Traditional lunch"]',
  '["Temple entrance fees", "Meditation guide", "Traditional lunch", "Professional guide"]',
  '["Accommodation", "Dinner", "Personal donations"]',
  '["https://images.unsplash.com/photo-1566552881560-0be862a7c445", "https://images.unsplash.com/photo-1578050575692-a35eaca5b1a6"]',
  4.6,
  17,
  true,
  NULL
);

-- Update some tours with random provider_ids (you'll need to replace these with actual provider IDs)
-- This is just an example - you should use actual provider IDs from your service_providers table

COMMENT ON TABLE tours IS 'Sample tour data has been inserted. Remember to update provider_id fields with actual service provider IDs from your service_providers table.';