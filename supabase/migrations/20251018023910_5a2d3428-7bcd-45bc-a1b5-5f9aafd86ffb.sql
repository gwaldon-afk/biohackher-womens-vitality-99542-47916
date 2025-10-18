-- Expert Partner Module - Complete Database Schema

-- 1. Create role enum (if not exists)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'expert', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Create subscription tier enum
CREATE TYPE public.expert_tier AS ENUM ('free', 'premium', 'elite');

-- 3. Create verification status enum
CREATE TYPE public.verification_status AS ENUM ('pending', 'approved', 'rejected', 'suspended');

-- 4. Create listing status enum
CREATE TYPE public.listing_status AS ENUM ('active', 'inactive', 'suspended');

-- 5. Expert profiles table
CREATE TABLE public.expert_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expert_id TEXT UNIQUE NOT NULL,
  
  -- Basic Info
  practice_name TEXT,
  bio TEXT,
  specialties TEXT[] DEFAULT '{}',
  location TEXT,
  timezone TEXT DEFAULT 'Australia/Sydney',
  
  -- Verification
  verification_status public.verification_status DEFAULT 'pending',
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  
  -- Credentials
  insurance_verified BOOLEAN DEFAULT false,
  insurance_number TEXT,
  license_number TEXT,
  years_of_practice INTEGER,
  
  -- Subscription & Revenue
  tier public.expert_tier DEFAULT 'free',
  referral_rate NUMERIC(5,2) DEFAULT 10.00,
  subscription_status TEXT DEFAULT 'inactive',
  subscription_started_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  
  -- Revenue Tracking
  revenue_total NUMERIC(10,2) DEFAULT 0,
  referrals_count INTEGER DEFAULT 0,
  
  -- Contact & Services
  email TEXT,
  phone TEXT,
  website TEXT,
  consultation_fee NUMERIC(10,2),
  accepts_insurance BOOLEAN DEFAULT false,
  
  -- Listing
  listing_status public.listing_status DEFAULT 'inactive',
  featured BOOLEAN DEFAULT false,
  average_rating NUMERIC(3,2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  
  -- Compliance
  last_credential_check TIMESTAMP WITH TIME ZONE,
  complaints_count INTEGER DEFAULT 0,
  auto_suspended BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(user_id)
);

-- 6. Expert credentials (uploaded documents)
CREATE TABLE public.expert_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.expert_profiles(id) ON DELETE CASCADE,
  
  document_type TEXT NOT NULL, -- 'license', 'insurance', 'certification', etc.
  document_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  
  verified BOOLEAN DEFAULT false,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES auth.users(id),
  notes TEXT,
  
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Expert services
CREATE TABLE public.expert_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.expert_profiles(id) ON DELETE CASCADE,
  
  service_name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  price NUMERIC(10,2),
  available BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 8. Expert availability
CREATE TABLE public.expert_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.expert_profiles(id) ON DELETE CASCADE,
  
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  available BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(expert_id, day_of_week, start_time)
);

-- 9. Referrals tracking
CREATE TABLE public.expert_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.expert_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  referral_type TEXT NOT NULL, -- 'consultation', 'subscription', 'service'
  amount NUMERIC(10,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(10,2) NOT NULL,
  
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'refunded'
  completed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 10. Expert reviews
CREATE TABLE public.expert_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.expert_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  
  flagged BOOLEAN DEFAULT false,
  flagged_reason TEXT,
  flagged_at TIMESTAMP WITH TIME ZONE,
  
  verified_purchase BOOLEAN DEFAULT false,
  
  response_text TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  UNIQUE(expert_id, user_id)
);

-- 11. Complaints
CREATE TABLE public.expert_complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.expert_profiles(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  complaint_type TEXT NOT NULL, -- 'credential', 'conduct', 'quality', 'billing'
  description TEXT NOT NULL,
  
  status TEXT DEFAULT 'open', -- 'open', 'investigating', 'resolved', 'dismissed'
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  
  assigned_to UUID REFERENCES auth.users(id),
  resolution_notes TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 12. Verification audit log
CREATE TABLE public.expert_verification_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id UUID NOT NULL REFERENCES public.expert_profiles(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL, -- 'approved', 'rejected', 'suspended', 'reactivated'
  performed_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT,
  notes TEXT,
  
  previous_status public.verification_status,
  new_status public.verification_status,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 13. Create indexes for performance
CREATE INDEX idx_expert_profiles_user_id ON public.expert_profiles(user_id);
CREATE INDEX idx_expert_profiles_expert_id ON public.expert_profiles(expert_id);
CREATE INDEX idx_expert_profiles_verification_status ON public.expert_profiles(verification_status);
CREATE INDEX idx_expert_profiles_tier ON public.expert_profiles(tier);
CREATE INDEX idx_expert_profiles_listing_status ON public.expert_profiles(listing_status);
CREATE INDEX idx_expert_profiles_specialties ON public.expert_profiles USING GIN(specialties);
CREATE INDEX idx_expert_profiles_location ON public.expert_profiles(location);

CREATE INDEX idx_expert_credentials_expert_id ON public.expert_credentials(expert_id);
CREATE INDEX idx_expert_services_expert_id ON public.expert_services(expert_id);
CREATE INDEX idx_expert_availability_expert_id ON public.expert_availability(expert_id);
CREATE INDEX idx_expert_referrals_expert_id ON public.expert_referrals(expert_id);
CREATE INDEX idx_expert_referrals_user_id ON public.expert_referrals(user_id);
CREATE INDEX idx_expert_reviews_expert_id ON public.expert_reviews(expert_id);
CREATE INDEX idx_expert_complaints_expert_id ON public.expert_complaints(expert_id);
CREATE INDEX idx_expert_complaints_status ON public.expert_complaints(status);

-- 14. Enable RLS on all tables
ALTER TABLE public.expert_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_verification_log ENABLE ROW LEVEL SECURITY;

-- 15. Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 16. RLS Policies for expert_profiles

-- Public can view approved, active experts
CREATE POLICY "Anyone can view approved active experts"
ON public.expert_profiles FOR SELECT
USING (
  verification_status = 'approved' 
  AND listing_status = 'active'
);

-- Experts can view their own profile
CREATE POLICY "Experts can view own profile"
ON public.expert_profiles FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all expert profiles"
ON public.expert_profiles FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Experts can update their own profile (but not verification status)
CREATE POLICY "Experts can update own profile"
ON public.expert_profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Experts can insert their own profile
CREATE POLICY "Experts can create own profile"
ON public.expert_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can update any profile
CREATE POLICY "Admins can update any expert profile"
ON public.expert_profiles FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- 17. RLS Policies for expert_credentials

-- Experts can view their own credentials
CREATE POLICY "Experts can view own credentials"
ON public.expert_credentials FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.expert_profiles
    WHERE id = expert_credentials.expert_id
    AND user_id = auth.uid()
  )
);

-- Admins can view all credentials
CREATE POLICY "Admins can view all credentials"
ON public.expert_credentials FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Experts can insert their own credentials
CREATE POLICY "Experts can upload own credentials"
ON public.expert_credentials FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.expert_profiles
    WHERE id = expert_credentials.expert_id
    AND user_id = auth.uid()
  )
);

-- Experts can delete their own credentials
CREATE POLICY "Experts can delete own credentials"
ON public.expert_credentials FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.expert_profiles
    WHERE id = expert_credentials.expert_id
    AND user_id = auth.uid()
  )
);

-- Admins can update credentials (for verification)
CREATE POLICY "Admins can update credentials"
ON public.expert_credentials FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- 18. RLS Policies for expert_services

-- Public can view services for approved experts
CREATE POLICY "Anyone can view services for approved experts"
ON public.expert_services FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.expert_profiles
    WHERE id = expert_services.expert_id
    AND verification_status = 'approved'
    AND listing_status = 'active'
  )
);

-- Experts can manage their own services
CREATE POLICY "Experts can manage own services"
ON public.expert_services FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.expert_profiles
    WHERE id = expert_services.expert_id
    AND user_id = auth.uid()
  )
);

-- 19. RLS Policies for expert_availability

-- Public can view availability for approved experts
CREATE POLICY "Anyone can view availability for approved experts"
ON public.expert_availability FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.expert_profiles
    WHERE id = expert_availability.expert_id
    AND verification_status = 'approved'
    AND listing_status = 'active'
  )
);

-- Experts can manage their own availability
CREATE POLICY "Experts can manage own availability"
ON public.expert_availability FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.expert_profiles
    WHERE id = expert_availability.expert_id
    AND user_id = auth.uid()
  )
);

-- 20. RLS Policies for expert_referrals

-- Experts can view their own referrals
CREATE POLICY "Experts can view own referrals"
ON public.expert_referrals FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.expert_profiles
    WHERE id = expert_referrals.expert_id
    AND user_id = auth.uid()
  )
);

-- Users can view their own referrals
CREATE POLICY "Users can view own referrals"
ON public.expert_referrals FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
ON public.expert_referrals FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- System can insert referrals (will be done via edge function)
CREATE POLICY "Authenticated users can create referrals"
ON public.expert_referrals FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 21. RLS Policies for expert_reviews

-- Public can view reviews for approved experts
CREATE POLICY "Anyone can view reviews for approved experts"
ON public.expert_reviews FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.expert_profiles
    WHERE id = expert_reviews.expert_id
    AND verification_status = 'approved'
  )
);

-- Users can create reviews
CREATE POLICY "Users can create reviews"
ON public.expert_reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
ON public.expert_reviews FOR UPDATE
USING (auth.uid() = user_id);

-- Experts can respond to their reviews (response_text only)
CREATE POLICY "Experts can respond to reviews"
ON public.expert_reviews FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.expert_profiles
    WHERE id = expert_reviews.expert_id
    AND user_id = auth.uid()
  )
);

-- Admins can manage all reviews
CREATE POLICY "Admins can manage reviews"
ON public.expert_reviews FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 22. RLS Policies for expert_complaints

-- Users can create complaints
CREATE POLICY "Users can create complaints"
ON public.expert_complaints FOR INSERT
WITH CHECK (auth.uid() = reported_by);

-- Users can view their own complaints
CREATE POLICY "Users can view own complaints"
ON public.expert_complaints FOR SELECT
USING (auth.uid() = reported_by);

-- Experts can view complaints about them
CREATE POLICY "Experts can view complaints about them"
ON public.expert_complaints FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.expert_profiles
    WHERE id = expert_complaints.expert_id
    AND user_id = auth.uid()
  )
);

-- Admins can manage all complaints
CREATE POLICY "Admins can manage complaints"
ON public.expert_complaints FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- 23. RLS Policies for expert_verification_log

-- Admins can view and create verification logs
CREATE POLICY "Admins can manage verification logs"
ON public.expert_verification_log FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

-- Experts can view their own verification log
CREATE POLICY "Experts can view own verification log"
ON public.expert_verification_log FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.expert_profiles
    WHERE id = expert_verification_log.expert_id
    AND user_id = auth.uid()
  )
);

-- 24. Create trigger for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_expert_profiles_updated_at
  BEFORE UPDATE ON public.expert_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expert_credentials_updated_at
  BEFORE UPDATE ON public.expert_credentials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expert_services_updated_at
  BEFORE UPDATE ON public.expert_services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expert_availability_updated_at
  BEFORE UPDATE ON public.expert_availability
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expert_referrals_updated_at
  BEFORE UPDATE ON public.expert_referrals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expert_reviews_updated_at
  BEFORE UPDATE ON public.expert_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expert_complaints_updated_at
  BEFORE UPDATE ON public.expert_complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 25. Function to generate unique expert_id
CREATE OR REPLACE FUNCTION public.generate_expert_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate format: EXP-YYYYMM-XXXXX (e.g., EXP-202501-A3F9K)
    new_id := 'EXP-' || TO_CHAR(NOW(), 'YYYYMM') || '-' || 
              UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 5));
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM public.expert_profiles WHERE expert_id = new_id) INTO id_exists;
    
    EXIT WHEN NOT id_exists;
  END LOOP;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 26. Function to update expert rating
CREATE OR REPLACE FUNCTION public.update_expert_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.expert_profiles
  SET 
    average_rating = (
      SELECT COALESCE(AVG(rating), 0)
      FROM public.expert_reviews
      WHERE expert_id = NEW.expert_id
    ),
    total_reviews = (
      SELECT COUNT(*)
      FROM public.expert_reviews
      WHERE expert_id = NEW.expert_id
    )
  WHERE id = NEW.expert_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_expert_rating_on_review
  AFTER INSERT OR UPDATE OR DELETE ON public.expert_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_expert_rating();

-- 27. Function to check auto-suspension
CREATE OR REPLACE FUNCTION public.check_expert_auto_suspension()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-suspend if 3+ unresolved complaints in 12 months
  IF (
    SELECT COUNT(*)
    FROM public.expert_complaints
    WHERE expert_id = NEW.expert_id
    AND status = 'open'
    AND created_at > NOW() - INTERVAL '12 months'
  ) >= 3 THEN
    UPDATE public.expert_profiles
    SET 
      listing_status = 'suspended',
      auto_suspended = true
    WHERE id = NEW.expert_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_auto_suspension_on_complaint
  AFTER INSERT ON public.expert_complaints
  FOR EACH ROW
  EXECUTE FUNCTION public.check_expert_auto_suspension();