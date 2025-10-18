// TypeScript types for Expert Partner Module

export type ExpertTier = 'free' | 'premium' | 'elite';
export type VerificationStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ListingStatus = 'active' | 'inactive' | 'suspended';

export interface ExpertProfile {
  id: string;
  user_id: string;
  expert_id: string;
  
  // Basic Info
  practice_name: string | null;
  bio: string | null;
  specialties: string[];
  location: string | null;
  timezone: string;
  
  // Verification
  verification_status: VerificationStatus;
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
  
  // Credentials
  insurance_verified: boolean;
  insurance_number: string | null;
  license_number: string | null;
  years_of_practice: number | null;
  
  // Subscription & Revenue
  tier: ExpertTier;
  referral_rate: number;
  subscription_status: string;
  subscription_started_at: string | null;
  subscription_ends_at: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  
  // Revenue Tracking
  revenue_total: number;
  referrals_count: number;
  
  // Contact & Services
  email: string | null;
  phone: string | null;
  website: string | null;
  consultation_fee: number | null;
  accepts_insurance: boolean;
  
  // Listing
  listing_status: ListingStatus;
  featured: boolean;
  average_rating: number;
  total_reviews: number;
  
  // Compliance
  last_credential_check: string | null;
  complaints_count: number;
  auto_suspended: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface ExpertCredential {
  id: string;
  expert_id: string;
  document_type: string;
  document_name: string;
  file_path: string;
  file_url: string | null;
  verified: boolean;
  verified_at: string | null;
  verified_by: string | null;
  notes: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpertService {
  id: string;
  expert_id: string;
  service_name: string;
  description: string | null;
  duration_minutes: number | null;
  price: number | null;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpertAvailability {
  id: string;
  expert_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpertReferral {
  id: string;
  expert_id: string;
  user_id: string;
  referral_type: string;
  amount: number;
  commission_rate: number;
  commission_amount: number;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  status: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpertReview {
  id: string;
  expert_id: string;
  user_id: string;
  rating: number;
  review_text: string | null;
  flagged: boolean;
  flagged_reason: string | null;
  flagged_at: string | null;
  verified_purchase: boolean;
  response_text: string | null;
  responded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpertComplaint {
  id: string;
  expert_id: string;
  reported_by: string;
  complaint_type: string;
  description: string;
  status: string;
  priority: string;
  assigned_to: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpertVerificationLog {
  id: string;
  expert_id: string;
  action: string;
  performed_by: string;
  reason: string | null;
  notes: string | null;
  previous_status: VerificationStatus | null;
  new_status: VerificationStatus | null;
  created_at: string;
}

export const TIER_CONFIG = {
  free: {
    name: 'Verified Partner',
    fee: 0,
    referralRate: 10,
    features: [
      'Basic listing in directory',
      'Referral tracking',
      '10% commission on referrals',
    ],
  },
  premium: {
    name: 'Premium Partner',
    fee: 299,
    referralRate: 20,
    features: [
      'Featured placement in directory',
      'Content co-creation opportunities',
      '20% commission on referrals',
      'Priority support',
    ],
  },
  elite: {
    name: 'Elite Clinic Partner',
    fee: 999,
    referralRate: 30,
    features: [
      'Co-branding opportunities',
      'Advanced analytics dashboard',
      '30% commission on referrals',
      'Event invitations',
      'Dedicated account manager',
    ],
  },
} as const;

export const SPECIALTIES = [
  'Functional Medicine',
  'Hormone Therapy',
  'Nutrition & Dietetics',
  'Women\'s Health',
  'Menopause Care',
  'Preventive Medicine',
  'Integrative Medicine',
  'Anti-Aging Medicine',
  'Metabolic Health',
  'Sleep Medicine',
  'Stress Management',
  'Fitness & Movement',
] as const;

export const COMPLAINT_TYPES = {
  credential: 'Credential Issue',
  conduct: 'Professional Conduct',
  quality: 'Service Quality',
  billing: 'Billing Dispute',
} as const;