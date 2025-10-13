import { Product } from "@/services/productService";

export interface MatchedSupplement {
  originalText: string;
  ingredientName: string;
  dosage: string | null;
  matchedProduct: Product | null;
  genericInfo: {
    category: string;
    searchable: boolean;
  };
}

/**
 * Extract ingredient name and dosage from supplement text
 * Example: "Lion's Mane mushroom extract (1000mg)" → { name: "Lion's Mane", dosage: "1000mg" }
 */
export const parseSupplementText = (supplementText: string): { name: string; dosage: string | null } => {
  // Extract dosage if in parentheses
  const dosageMatch = supplementText.match(/\(([^)]+)\)/);
  const dosage = dosageMatch ? dosageMatch[1] : null;

  // Remove dosage and extract core ingredient name
  let name = supplementText.replace(/\([^)]+\)/g, "").trim();
  
  // Remove common suffixes
  name = name
    .replace(/extract$/i, "")
    .replace(/supplement$/i, "")
    .replace(/mushroom$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return { name, dosage };
};

/**
 * Match supplement text to products in database
 * Uses fuzzy matching on ingredient names
 */
export const matchSupplementToProduct = async (
  supplementText: string,
  products: Product[]
): Promise<MatchedSupplement> => {
  const { name: ingredientName, dosage } = parseSupplementText(supplementText);

  // Fuzzy match logic - check if product name contains ingredient name (case insensitive)
  const matchedProduct = products.find((product) => {
    const productName = product.name.toLowerCase();
    const ingredientLower = ingredientName.toLowerCase();
    
    // Direct match or contains match
    return (
      productName.includes(ingredientLower) ||
      ingredientLower.includes(productName) ||
      // Handle common variations
      (ingredientLower.includes("lion") && productName.includes("lion")) ||
      (ingredientLower.includes("omega") && productName.includes("omega")) ||
      (ingredientLower.includes("fish oil") && productName.includes("omega-3"))
    );
  });

  return {
    originalText: supplementText,
    ingredientName,
    dosage,
    matchedProduct: matchedProduct || null,
    genericInfo: {
      category: "supplement",
      searchable: true,
    },
  };
};

/**
 * Calculate bundle discount for multiple products
 */
export const calculateBundleDiscount = (
  products: Product[],
  currency: string = "GBP",
  discountPercentage: number = 10
): { subtotal: number; discount: number; total: number } => {
  let subtotal = 0;

  products.forEach((product) => {
    const price = getProductPriceForCurrency(product, currency);
    if (price) subtotal += price;
  });

  const discount = subtotal * (discountPercentage / 100);
  const total = subtotal - discount;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    discount: parseFloat(discount.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
};

/**
 * Get product price for specific currency
 */
const getProductPriceForCurrency = (product: Product, currency: string): number | null => {
  switch (currency.toUpperCase()) {
    case "USD":
      return product.price_usd;
    case "AUD":
      return product.price_aud;
    case "CAD":
      return product.price_cad;
    case "GBP":
    default:
      return product.price_gbp;
  }
};

/**
 * Format price with currency symbol
 */
export const formatPrice = (amount: number, currency: string = "GBP"): string => {
  const symbols: Record<string, string> = {
    GBP: "£",
    USD: "$",
    AUD: "A$",
    CAD: "C$",
  };

  const symbol = symbols[currency.toUpperCase()] || currency;
  return `${symbol}${amount.toFixed(2)}`;
};
