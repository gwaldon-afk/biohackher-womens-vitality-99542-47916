import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  description: string;
  detailed_description: string | null;
  category: string;
  price_gbp: number | null;
  price_usd: number | null;
  price_aud: number | null;
  price_cad: number | null;
  affiliate_link: string | null;
  target_symptoms: string[] | null;
  target_pillars: string[] | null;
  contraindications: Array<{ condition: string; severity: string }> | null;
  benefits: string[] | null;
  ingredients: any[] | null;
  usage_instructions: string | null;
  research_citations: any[] | null;
  image_url: string | null;
  brand: string | null;
  evidence_level: 'gold' | 'silver' | 'bronze' | 'emerging' | null;
  display_order: number | null;
  is_active: boolean;
}

/**
 * Fetch all active products
 */
export const getProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data as unknown as Product[];
};

/**
 * Fetch products by category
 */
export const getProductsByCategory = async (category: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', category)
    .eq('is_active', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }

  return data as unknown as Product[];
};

/**
 * Fetch a single product by ID
 */
export const getProductById = async (productId: string) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .eq('is_active', true)
    .single();

  if (error) {
    console.error('Error fetching product:', error);
    throw error;
  }

  return data as unknown as Product;
};

/**
 * Search products by symptoms
 */
export const searchProductsBySymptoms = async (symptoms: string[]) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .overlaps('target_symptoms', symptoms);

  if (error) {
    console.error('Error searching products:', error);
    throw error;
  }

  return data as unknown as Product[];
};

/**
 * Get product price based on user's currency
 */
export const getProductPrice = (product: Product, currency: string = 'GBP'): number | null => {
  switch (currency.toUpperCase()) {
    case 'USD':
      return product.price_usd;
    case 'AUD':
      return product.price_aud;
    case 'CAD':
      return product.price_cad;
    case 'GBP':
    default:
      return product.price_gbp;
  }
};

/**
 * Format product price with currency symbol
 */
export const formatProductPrice = (product: Product, currency: string = 'GBP'): string => {
  const price = getProductPrice(product, currency);
  if (!price) return 'Price not available';

  const symbols: Record<string, string> = {
    GBP: '£',
    USD: '$',
    AUD: 'A$',
    CAD: 'C$',
  };

  const symbol = symbols[currency.toUpperCase()] || currency;
  return `${symbol}${price.toFixed(2)}`;
};
