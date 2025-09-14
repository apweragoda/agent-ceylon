-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

-- Create custom types
CREATE TYPE user_type AS ENUM ('tourist', 'provider', 'admin');
CREATE TYPE budget_range AS ENUM ('budget', 'mid_range', 'luxury');
CREATE TYPE accommodation_type AS ENUM ('hotel', 'guesthouse', 'resort', 'homestay');
CREATE TYPE business_type AS ENUM ('hotel', 'restaurant', 'diving', 'transport', 'tour_guide');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  country TEXT,
  user_type user_type DEFAULT 'tourist' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create user preferences table
CREATE TABLE public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  budget_range budget_range NOT NULL,
  preferred_activities TEXT[] DEFAULT '{}' NOT NULL,
  accommodation_type accommodation_type NOT NULL,
  group_size INTEGER DEFAULT 1 NOT NULL,
  travel_duration INTEGER NOT NULL,
  accessibility_needs BOOLEAN DEFAULT FALSE NOT NULL,
  dietary_restrictions TEXT[] DEFAULT '{}' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  UNIQUE(user_id)
);

-- Create service providers table
CREATE TABLE public.service_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  business_name TEXT NOT NULL,
  business_type business_type NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  contact_info JSONB NOT NULL DEFAULT '{}',
  services JSONB DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0 NOT NULL,
  reviews_count INTEGER DEFAULT 0 NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create tours table
CREATE TABLE public.tours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration INTEGER NOT NULL,
  max_participants INTEGER NOT NULL,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  itinerary JSONB NOT NULL DEFAULT '{}',
  included_services TEXT[] DEFAULT '{}',
  rating DECIMAL(2,1) DEFAULT 0 NOT NULL,
  reviews_count INTEGER DEFAULT 0 NOT NULL,
  provider_id UUID REFERENCES public.service_providers(id) ON DELETE CASCADE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tour_id UUID REFERENCES public.tours(id) ON DELETE CASCADE NOT NULL,
  participants INTEGER NOT NULL,
  booking_date DATE NOT NULL,
  status booking_status DEFAULT 'pending' NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_status payment_status DEFAULT 'pending' NOT NULL,
  payment_intent_id TEXT,
  special_requests TEXT,
  contact_info JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  tour_id UUID REFERENCES public.tours(id) ON DELETE SET NULL,
  provider_id UUID REFERENCES public.service_providers(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_users_user_type ON public.users(user_type);
CREATE INDEX idx_tours_category ON public.tours(category);
CREATE INDEX idx_tours_location ON public.tours(location);
CREATE INDEX idx_tours_provider ON public.tours(provider_id);
CREATE INDEX idx_tours_rating ON public.tours(rating DESC);
CREATE INDEX idx_bookings_user ON public.bookings(user_id);
CREATE INDEX idx_bookings_tour ON public.bookings(tour_id);
CREATE INDEX idx_bookings_status ON public.bookings(status);
CREATE INDEX idx_reviews_tour ON public.reviews(tour_id);
CREATE INDEX idx_reviews_provider ON public.reviews(provider_id);
CREATE INDEX idx_service_providers_type ON public.service_providers(business_type);
CREATE INDEX idx_service_providers_location ON public.service_providers(location);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_providers_updated_at BEFORE UPDATE ON public.service_providers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tours_updated_at BEFORE UPDATE ON public.tours 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();