// Action tiles use Lucide icons (passed via ActionCard `icon` prop) for an
// AT&T-style clean iconography. Leave the emoji map empty so the Lucide icon
// is rendered instead of a picture-menu emoji.

export const actionEmoji: Record<string, string> = {};


// Emoji used inside each QuickSelectCard option, keyed by option id.
export const optionEmoji: Record<string, string> = {
  // Plan Upgrade
  "basic-plus": "📶",
  premium: "🚀",
  ultimate: "👑",
  // Add-On Bundle
  protection: "🛡️",
  "total-bundle": "🎁",
  "cloud-only": "☁️",
  // Loyalty Reward
  streaming: "🎬",
  "bill-credit": "💵",
  "data-boost": "⚡",
  // Device Trade-In
  iphone16: "📱",
  iphone16plus: "📲",
  "galaxy-s25": "📱",
  // Home Internet
  "home-basic": "🏠",
  "home-plus": "🏡",
  "lte-home": "🌾",
  // Premium Support
  priority: "⚡",
  dedicated: "👤",
  "team-support": "👨‍👩‍👧",
  // Billing
  "partial-credit": "✂️",
  "full-reversal": "↩️",
  "payment-plan": "📅",
  // Account
  "reactivate-now": "✅",
  "payment-arrangement": "🤝",
  "partial-restore": "📞",
  // Multi-line
  "add-line": "➕",
  "remove-line": "➖",
  "transfer-number": "🔄",
};

export function pickOptionEmoji(id: string, label: string): string {
  if (optionEmoji[id]) return optionEmoji[id];
  const l = label.toLowerCase();
  if (l.includes("plan")) return "📶";
  if (l.includes("phone") || l.includes("iphone") || l.includes("galaxy")) return "📱";
  if (l.includes("home") || l.includes("wifi") || l.includes("internet")) return "🏠";
  if (l.includes("stream") || l.includes("netflix") || l.includes("disney")) return "🎬";
  if (l.includes("credit") || l.includes("refund") || l.includes("$")) return "💵";
  if (l.includes("bundle") || l.includes("gift") || l.includes("reward")) return "🎁";
  if (l.includes("support") || l.includes("help")) return "🛟";
  if (l.includes("line")) return "📞";
  if (l.includes("data") || l.includes("boost")) return "⚡";
  return "✨";
}
