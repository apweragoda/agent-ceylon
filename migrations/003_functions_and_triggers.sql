-- Function to handle user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'tourist')::user_type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user registration
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update tour ratings
CREATE OR REPLACE FUNCTION public.update_tour_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(2,1);
  review_count INTEGER;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    SELECT AVG(rating), COUNT(*)
    INTO avg_rating, review_count
    FROM public.reviews
    WHERE tour_id = NEW.tour_id AND is_verified = true;
    
    UPDATE public.tours
    SET rating = COALESCE(avg_rating, 0),
        reviews_count = review_count
    WHERE id = NEW.tour_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT AVG(rating), COUNT(*)
    INTO avg_rating, review_count
    FROM public.reviews
    WHERE tour_id = OLD.tour_id AND is_verified = true;
    
    UPDATE public.tours
    SET rating = COALESCE(avg_rating, 0),
        reviews_count = review_count
    WHERE id = OLD.tour_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for tour rating updates
CREATE TRIGGER update_tour_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_tour_rating();

-- Function to update service provider ratings
CREATE OR REPLACE FUNCTION public.update_provider_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(2,1);
  review_count INTEGER;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    SELECT AVG(rating), COUNT(*)
    INTO avg_rating, review_count
    FROM public.reviews
    WHERE provider_id = NEW.provider_id AND is_verified = true;
    
    UPDATE public.service_providers
    SET rating = COALESCE(avg_rating, 0),
        reviews_count = review_count
    WHERE id = NEW.provider_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT AVG(rating), COUNT(*)
    INTO avg_rating, review_count
    FROM public.reviews
    WHERE provider_id = OLD.provider_id AND is_verified = true;
    
    UPDATE public.service_providers
    SET rating = COALESCE(avg_rating, 0),
        reviews_count = review_count
    WHERE id = OLD.provider_id;
    
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for service provider rating updates
CREATE TRIGGER update_provider_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_provider_rating();

-- Function for tour recommendations based on preferences
CREATE OR REPLACE FUNCTION public.get_recommended_tours(user_preferences_id UUID)
RETURNS TABLE (
  tour_id UUID,
  match_score DECIMAL(3,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as tour_id,
    CASE
      WHEN up.budget_range = 'budget' AND t.price <= 10000 THEN 0.3
      WHEN up.budget_range = 'mid_range' AND t.price BETWEEN 10000 AND 50000 THEN 0.3
      WHEN up.budget_range = 'luxury' AND t.price > 50000 THEN 0.3
      ELSE 0.0
    END +
    CASE
      WHEN t.duration <= up.travel_duration THEN 0.2
      ELSE 0.0
    END +
    CASE
      WHEN t.max_participants >= up.group_size THEN 0.2
      ELSE 0.0
    END +
    CASE
      WHEN t.category = ANY(up.preferred_activities) THEN 0.3
      ELSE 0.0
    END as match_score
  FROM public.tours t
  CROSS JOIN public.user_preferences up
  WHERE up.id = user_preferences_id
    AND t.is_active = true
  ORDER BY match_score DESC;
END;
$$ LANGUAGE plpgsql;