-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON public.user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON public.user_preferences
    FOR DELETE USING (auth.uid() = user_id);

-- Service providers policies
CREATE POLICY "Anyone can view active service providers" ON public.service_providers
    FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can manage own business" ON public.service_providers
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all providers" ON public.service_providers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Tours policies
CREATE POLICY "Anyone can view active tours" ON public.tours
    FOR SELECT USING (is_active = true);

CREATE POLICY "Providers can manage own tours" ON public.tours
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.service_providers sp 
            WHERE sp.id = tours.provider_id AND sp.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all tours" ON public.tours
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Bookings policies
CREATE POLICY "Users can view own bookings" ON public.bookings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bookings" ON public.bookings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bookings" ON public.bookings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Providers can view bookings for their tours" ON public.bookings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tours t
            JOIN public.service_providers sp ON t.provider_id = sp.id
            WHERE t.id = bookings.tour_id AND sp.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all bookings" ON public.bookings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );

-- Reviews policies
CREATE POLICY "Anyone can view verified reviews" ON public.reviews
    FOR SELECT USING (is_verified = true);

CREATE POLICY "Users can view own reviews" ON public.reviews
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create reviews for their bookings" ON public.reviews
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE id = reviews.booking_id AND user_id = auth.uid() AND status = 'completed'
        )
    );

CREATE POLICY "Users can update own reviews" ON public.reviews
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all reviews" ON public.reviews
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND user_type = 'admin'
        )
    );