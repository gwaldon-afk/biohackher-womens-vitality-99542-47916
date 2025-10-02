interface ProductRecommendation {
  id: string;
  name: string;
  price: number;
  tier: 'Gold' | 'Silver' | 'Bronze';
  evidenceLevel: 'Gold' | 'Silver' | 'Bronze' | 'Emerging';
  priority: number;
  dosage: string;
}

export const matchProductsToAssessment = (
  symptomType: string,
  score: number
): ProductRecommendation[] => {
  const recommendations: ProductRecommendation[] = [];

  // Only recommend if score indicates need (< 70)
  if (score >= 70) return [];

  switch (symptomType) {
    case 'sleep':
    case 'brain-brain-fog-assessment':
      if (score < 50) {
        recommendations.push(
          {
            id: 'sleep-mag-glycinate',
            name: 'Magnesium Glycinate 400mg',
            price: 24.99,
            tier: 'Gold',
            evidenceLevel: 'Gold',
            priority: 1,
            dosage: '2 capsules 30-60 min before bed'
          },
          {
            id: 'sleep-theanine',
            name: 'L-Theanine 200mg',
            price: 22.99,
            tier: 'Gold',
            evidenceLevel: 'Silver',
            priority: 2,
            dosage: '1-2 capsules before bed'
          },
          {
            id: 'sleep-melatonin',
            name: 'Slow-Release Melatonin 3mg',
            price: 19.99,
            tier: 'Silver',
            evidenceLevel: 'Gold',
            priority: 3,
            dosage: '1 tablet 1-2 hours before bedtime'
          }
        );
      } else {
        recommendations.push(
          {
            id: 'sleep-mag-glycinate',
            name: 'Magnesium Glycinate 400mg',
            price: 24.99,
            tier: 'Gold',
            evidenceLevel: 'Gold',
            priority: 1,
            dosage: '2 capsules 30-60 min before bed'
          },
          {
            id: 'sleep-theanine',
            name: 'L-Theanine 200mg',
            price: 22.99,
            tier: 'Silver',
            evidenceLevel: 'Silver',
            priority: 2,
            dosage: '1-2 capsules before bed'
          }
        );
      }
      break;

    case 'hot-flashes':
    case 'balance-hormonal-balance-evaluation':
      if (score < 50) {
        recommendations.push(
          {
            id: 'hf-black-cohosh',
            name: 'Black Cohosh Extract 80mg',
            price: 27.99,
            tier: 'Gold',
            evidenceLevel: 'Gold',
            priority: 1,
            dosage: '1 capsule twice daily with meals'
          },
          {
            id: 'hf-red-clover',
            name: 'Red Clover Isoflavones',
            price: 21.99,
            tier: 'Silver',
            evidenceLevel: 'Silver',
            priority: 2,
            dosage: '2 capsules daily with food'
          },
          {
            id: 'sleep-mag-glycinate',
            name: 'Magnesium Glycinate 400mg',
            price: 24.99,
            tier: 'Silver',
            evidenceLevel: 'Gold',
            priority: 3,
            dosage: '2 capsules before bed'
          }
        );
      } else {
        recommendations.push(
          {
            id: 'hf-black-cohosh',
            name: 'Black Cohosh Extract 80mg',
            price: 27.99,
            tier: 'Gold',
            evidenceLevel: 'Gold',
            priority: 1,
            dosage: '1 capsule twice daily with meals'
          }
        );
      }
      break;

    case 'joint-pain':
    case 'body-mobility-&-strength-analysis':
      if (score < 50) {
        recommendations.push(
          {
            id: 'jp-turmeric-curcumin',
            name: 'Turmeric Curcumin with Bioperine',
            price: 29.99,
            tier: 'Gold',
            evidenceLevel: 'Gold',
            priority: 1,
            dosage: '2 capsules daily with meals'
          },
          {
            id: 'jp-omega-3',
            name: 'Ultra-Pure Omega-3 Fish Oil',
            price: 34.99,
            tier: 'Gold',
            evidenceLevel: 'Gold',
            priority: 2,
            dosage: '2 softgels daily with meals'
          },
          {
            id: 'jp-glucosamine',
            name: 'Glucosamine Chondroitin MSM',
            price: 26.99,
            tier: 'Silver',
            evidenceLevel: 'Silver',
            priority: 3,
            dosage: '3 tablets daily with food'
          }
        );
      } else {
        recommendations.push(
          {
            id: 'jp-turmeric-curcumin',
            name: 'Turmeric Curcumin with Bioperine',
            price: 29.99,
            tier: 'Gold',
            evidenceLevel: 'Gold',
            priority: 1,
            dosage: '2 capsules daily with meals'
          },
          {
            id: 'jp-omega-3',
            name: 'Ultra-Pure Omega-3 Fish Oil',
            price: 34.99,
            tier: 'Silver',
            evidenceLevel: 'Gold',
            priority: 2,
            dosage: '2 softgels daily with meals'
          }
        );
      }
      break;

    case 'gut':
    case 'bloating':
      if (score < 50) {
        recommendations.push(
          {
            id: 'gut-digestive-enzymes',
            name: 'Full-Spectrum Digestive Enzymes',
            price: 31.99,
            tier: 'Gold',
            evidenceLevel: 'Gold',
            priority: 1,
            dosage: '1-2 capsules with each meal'
          },
          {
            id: 'gut-probiotics',
            name: '50 Billion CFU Probiotic',
            price: 39.99,
            tier: 'Gold',
            evidenceLevel: 'Gold',
            priority: 2,
            dosage: '1 capsule daily'
          },
          {
            id: 'gut-l-glutamine',
            name: 'L-Glutamine Powder',
            price: 29.99,
            tier: 'Silver',
            evidenceLevel: 'Silver',
            priority: 3,
            dosage: '5g twice daily between meals'
          }
        );
      } else {
        recommendations.push(
          {
            id: 'gut-digestive-enzymes',
            name: 'Full-Spectrum Digestive Enzymes',
            price: 31.99,
            tier: 'Gold',
            evidenceLevel: 'Gold',
            priority: 1,
            dosage: '1-2 capsules with each meal'
          },
          {
            id: 'gut-probiotics',
            name: '50 Billion CFU Probiotic',
            price: 39.99,
            tier: 'Silver',
            evidenceLevel: 'Gold',
            priority: 2,
            dosage: '1 capsule daily'
          }
        );
      }
      break;

    case 'brain-fog':
    case 'brain-memory-&-focus-analysis':
      if (score < 50) {
        recommendations.push(
          {
            id: 'bf-b-complex',
            name: 'Active B-Complex',
            price: 25.99,
            tier: 'Gold',
            evidenceLevel: 'Gold',
            priority: 1,
            dosage: '1 capsule daily with breakfast'
          },
          {
            id: 'bf-lions-mane',
            name: "Lion's Mane Mushroom Extract",
            price: 28.99,
            tier: 'Gold',
            evidenceLevel: 'Silver',
            priority: 2,
            dosage: '2 capsules daily with food'
          },
          {
            id: 'jp-omega-3',
            name: 'Ultra-Pure Omega-3 Fish Oil',
            price: 34.99,
            tier: 'Silver',
            evidenceLevel: 'Gold',
            priority: 3,
            dosage: '2 softgels daily with meals'
          }
        );
      } else {
        recommendations.push(
          {
            id: 'bf-b-complex',
            name: 'Active B-Complex',
            price: 25.99,
            tier: 'Gold',
            evidenceLevel: 'Gold',
            priority: 1,
            dosage: '1 capsule daily with breakfast'
          },
          {
            id: 'bf-lions-mane',
            name: "Lion's Mane Mushroom Extract",
            price: 28.99,
            tier: 'Silver',
            evidenceLevel: 'Silver',
            priority: 2,
            dosage: '2 capsules daily with food'
          }
        );
      }
      break;

    case 'anxiety':
    case 'balance-stress-&-anxiety-assessment':
      recommendations.push(
        {
          id: 'sleep-mag-glycinate',
          name: 'Magnesium Glycinate 400mg',
          price: 24.99,
          tier: 'Gold',
          evidenceLevel: 'Gold',
          priority: 1,
          dosage: '2 capsules daily'
        },
        {
          id: 'sleep-theanine',
          name: 'L-Theanine 200mg',
          price: 22.99,
          tier: 'Gold',
          evidenceLevel: 'Silver',
          priority: 2,
          dosage: '1-2 capsules as needed'
        }
      );
      break;

    default:
      // Generic recommendations for unknown symptom types
      recommendations.push(
        {
          id: 'bf-b-complex',
          name: 'Active B-Complex',
          price: 25.99,
          tier: 'Silver',
          evidenceLevel: 'Gold',
          priority: 1,
          dosage: '1 capsule daily with breakfast'
        }
      );
  }

  return recommendations.sort((a, b) => a.priority - b.priority);
};

export const calculateBundlePrice = (products: ProductRecommendation[]): {
  subtotal: number;
  discount: number;
  total: number;
  savings: number;
} => {
  const subtotal = products.reduce((sum, product) => sum + product.price, 0);
  const discount = 0.10; // 10% bundle discount
  const savings = subtotal * discount;
  const total = subtotal - savings;

  return {
    subtotal,
    discount,
    total,
    savings
  };
};
