export const femaleLongevityQuotes = [
  {
    quote: "Your body is not a project to be perfected, but a vessel to be honored.",
    author: "Unknown"
  },
  {
    quote: "Longevity is not about adding years to your life, but life to your years.",
    author: "Unknown"
  },
  {
    quote: "Every cell in your body is eavesdropping on your thoughts. Choose wellness.",
    author: "Dr. Deepak Chopra"
  },
  {
    quote: "The greatest wealth is health, and you are building it daily.",
    author: "Virgil (adapted)"
  },
  {
    quote: "You are not too old, and it is not too late. Your body is listening.",
    author: "Unknown"
  },
  {
    quote: "Strong women don't have attitudes. They have boundaries, standards, and self-care routines.",
    author: "Unknown"
  },
  {
    quote: "Your hormones are messengers. Listen with compassion, respond with wisdom.",
    author: "Unknown"
  },
  {
    quote: "Every day you prioritize yourself, you're investing in a longer, richer life.",
    author: "Unknown"
  },
  {
    quote: "Resilience isn't about avoiding the storm—it's about learning to dance in the rain.",
    author: "Unknown"
  },
  {
    quote: "Your future self is watching. Make her proud today.",
    author: "Unknown"
  },
  {
    quote: "Menopause is not an ending. It's a metamorphosis into your most powerful self.",
    author: "Dr. Christiane Northrup"
  },
  {
    quote: "The body keeps the score, but you hold the pen to rewrite the story.",
    author: "Dr. Bessel van der Kolk (adapted)"
  },
  {
    quote: "Self-care is not selfish. You cannot serve from an empty vessel.",
    author: "Eleanor Brown"
  },
  {
    quote: "You are allowed to be both a masterpiece and a work in progress simultaneously.",
    author: "Sophia Bush"
  },
  {
    quote: "Aging is a privilege denied to many. Embrace it with grace and strength.",
    author: "Unknown"
  },
  {
    quote: "Your mitochondria don't care about your age—they respond to your choices today.",
    author: "Unknown"
  },
  {
    quote: "Consistency is the bridge between goals and accomplishment.",
    author: "Unknown"
  },
  {
    quote: "You don't need to be perfect. You need to be persistent.",
    author: "Unknown"
  },
  {
    quote: "Every small choice compounds. You're building longevity one decision at a time.",
    author: "Unknown"
  },
  {
    quote: "Your body is the only place you have to live. Treat it like the miracle it is.",
    author: "Jim Rohn (adapted)"
  },
  {
    quote: "Strength training isn't about vanity—it's about vitality and independence.",
    author: "Unknown"
  },
  {
    quote: "Sleep is the ultimate performance enhancer and longevity tool.",
    author: "Dr. Matthew Walker (adapted)"
  },
  {
    quote: "You are not behind. You are exactly where you need to be. Start now.",
    author: "Unknown"
  },
  {
    quote: "Your biology doesn't define your destiny. Your daily habits do.",
    author: "Unknown"
  },
  {
    quote: "The best time to start was yesterday. The second best time is now.",
    author: "Chinese Proverb"
  },
  {
    quote: "Inflammation is information. Your body is speaking—are you listening?",
    author: "Unknown"
  },
  {
    quote: "You are capable of more resilience than you've ever been asked to show.",
    author: "Unknown"
  },
  {
    quote: "Every plate of food is an opportunity to nourish your future self.",
    author: "Unknown"
  },
  {
    quote: "Your health is an investment, not an expense. Compound it daily.",
    author: "Unknown"
  },
  {
    quote: "Longevity is earned in the margins—the choices no one sees but everyone feels.",
    author: "Unknown"
  },
  {
    quote: "You are rewriting the narrative of what aging looks like for women.",
    author: "Unknown"
  }
];

export function getTodaysQuote(): typeof femaleLongevityQuotes[0] {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
  const index = dayOfYear % femaleLongevityQuotes.length;
  return femaleLongevityQuotes[index];
}
