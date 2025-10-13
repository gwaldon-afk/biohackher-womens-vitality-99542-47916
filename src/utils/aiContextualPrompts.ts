import { Brain, Heart, Activity, Sparkles, TrendingUp, Target } from "lucide-react";

interface ContextualPrompt {
  text: string;
  icon: any;
}

export const getContextualPrompts = (pathname: string): ContextualPrompt[] => {
  // Homepage prompts
  if (pathname === "/") {
    return [
      { text: "How do I start optimizing my health?", icon: Sparkles },
      { text: "What is my longevity score?", icon: TrendingUp },
      { text: "Explain the 4 pillars of health", icon: Brain },
    ];
  }

  // Dashboard prompts
  if (pathname === "/dashboard") {
    return [
      { text: "How can I improve my brain score?", icon: Brain },
      { text: "Show me my progress trends", icon: TrendingUp },
      { text: "What should I focus on today?", icon: Target },
    ];
  }

  // Shop prompts
  if (pathname === "/shop") {
    return [
      { text: "What supplements for better sleep?", icon: Heart },
      { text: "Recommend products for my assessment results", icon: Sparkles },
      { text: "Explain this product's benefits", icon: Brain },
    ];
  }

  // 7-Day Plan / My Protocol prompts
  if (pathname === "/my-protocol" || pathname.includes("seven-day-plan")) {
    return [
      { text: "How do I stick to my protocol?", icon: Target },
      { text: "Can I customize this plan?", icon: Sparkles },
      { text: "Why these specific activities?", icon: Brain },
    ];
  }

  // Symptoms tracking prompts
  if (pathname.includes("symptom")) {
    return [
      { text: "What symptoms should I track?", icon: Heart },
      { text: "How do I improve my symptom scores?", icon: TrendingUp },
      { text: "Connect symptoms to root causes", icon: Brain },
    ];
  }

  // Assessment/Results prompts
  if (pathname.includes("assessment") || pathname.includes("results")) {
    return [
      { text: "Explain my assessment results", icon: Brain },
      { text: "What should I do with this score?", icon: Target },
      { text: "How can I improve this pillar?", icon: TrendingUp },
    ];
  }

  // About/Science prompts
  if (pathname === "/about" || pathname.includes("research") || pathname.includes("advisory")) {
    return [
      { text: "Is this backed by science?", icon: Brain },
      { text: "Show me the research evidence", icon: Sparkles },
      { text: "Who validates your recommendations?", icon: Heart },
    ];
  }

  // Nutrition prompts
  if (pathname.includes("nutrition")) {
    return [
      { text: "Create a meal plan for me", icon: Sparkles },
      { text: "What foods support longevity?", icon: Heart },
      { text: "How do I optimize my diet?", icon: Brain },
    ];
  }

  // Biohacking toolkit prompts
  if (pathname.includes("biohacking") || pathname.includes("toolkit")) {
    return [
      { text: "Which biohacks should I start with?", icon: Sparkles },
      { text: "Explain this biohacking protocol", icon: Brain },
      { text: "Is this safe for me?", icon: Heart },
    ];
  }

  // Wearables prompts
  if (pathname.includes("wearable")) {
    return [
      { text: "Which wearable should I use?", icon: Activity },
      { text: "How do I sync my device?", icon: Sparkles },
      { text: "What metrics should I track?", icon: TrendingUp },
    ];
  }

  // Settings prompts
  if (pathname === "/settings") {
    return [
      { text: "How do I update my preferences?", icon: Sparkles },
      { text: "Is my data secure?", icon: Heart },
      { text: "How do I manage my subscription?", icon: Target },
    ];
  }

  // Default prompts (fallback)
  return [
    { text: "How can you help me?", icon: Sparkles },
    { text: "What features are available?", icon: Brain },
    { text: "Show me quick health tips", icon: Heart },
  ];
};
