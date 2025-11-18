/**
 * Analytics tracking for shop interactions
 * Tracks user behavior for optimization and A/B testing
 */

interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp: string;
}

const ANALYTICS_ENABLED = true; // Feature flag for analytics

const trackEvent = (event: string, properties: Record<string, any> = {}) => {
  if (!ANALYTICS_ENABLED) return;
  
  const analyticsEvent: AnalyticsEvent = {
    event,
    properties: {
      ...properties,
      url: window.location.href,
      referrer: document.referrer,
    },
    timestamp: new Date().toISOString(),
  };
  
  // Log to console in development
  if (import.meta.env.DEV) {
    console.log('[Analytics]', analyticsEvent);
  }
  
  // In production, send to analytics service
  // Example: analytics.track(event, properties);
};

export const shopAnalytics = {
  // Page views
  viewShop: (pillar?: string) => {
    trackEvent('shop_page_viewed', {
      pillar: pillar || 'all',
    });
  },

  // Product interactions
  viewProduct: (productId: string, productName: string, source: string) => {
    trackEvent('product_viewed', {
      product_id: productId,
      product_name: productName,
      source, // 'shop' | 'recommendations' | 'assessment_results'
    });
  },

  addToCart: (productId: string, productName: string, price: number, source: string) => {
    trackEvent('product_added_to_cart', {
      product_id: productId,
      product_name: productName,
      price,
      source,
    });
  },

  // Recommendation interactions
  viewRecommendations: (assessmentType: string, productCount: number) => {
    trackEvent('recommendations_viewed', {
      assessment_type: assessmentType,
      product_count: productCount,
    });
  },

  clickRecommendation: (productId: string, position: number) => {
    trackEvent('recommendation_clicked', {
      product_id: productId,
      position,
    });
  },

  // Assessment integration
  shopYourProtocol: (assessmentType: string, itemCount: number) => {
    trackEvent('shop_protocol_clicked', {
      assessment_type: assessmentType,
      item_count: itemCount,
    });
  },

  viewInShop: (productId: string, assessmentType: string) => {
    trackEvent('view_in_shop_clicked', {
      product_id: productId,
      assessment_type: assessmentType,
    });
  },

  // Search and filtering
  search: (searchTerm: string, resultCount: number) => {
    trackEvent('shop_search', {
      search_term: searchTerm,
      result_count: resultCount,
    });
  },

  filterByPillar: (pillar: string) => {
    trackEvent('shop_filter_pillar', {
      pillar,
    });
  },

  // Empty states
  viewEmptyState: (variant: string, hasCompletedAssessments: boolean) => {
    trackEvent('empty_state_viewed', {
      variant,
      has_completed_assessments: hasCompletedAssessments,
    });
  },

  clickEmptyStateCTA: (variant: string, action: string) => {
    trackEvent('empty_state_cta_clicked', {
      variant,
      action,
    });
  },
};
