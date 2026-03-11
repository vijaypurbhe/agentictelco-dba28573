/**
 * Maps user message text to an agent action title.
 * Returns the matching action title or null if no match.
 */

const INTENT_PATTERNS: { action: string; keywords: RegExp }[] = [
  {
    action: "Plan Upgrade",
    keywords: /\b(plan upgrade|upgrade plan|upgrade my plan|change plan|switch plan|better plan|unlimited premium|higher plan|rate plan|plan change)\b/i,
  },
  {
    action: "Add-On Bundle",
    keywords: /\b(add[- ]?on|bundle|device protection|cloud storage|cross[- ]?sell|extra feature|insurance)\b/i,
  },
  {
    action: "Loyalty Reward",
    keywords: /\b(loyalty|reward|tenure|retention offer|discount|free month|streaming|loyal customer)\b/i,
  },
  {
    action: "Device Trade-In",
    keywords: /\b(trade[- ]?in|device upgrade|new phone|new device|upgrade device|phone upgrade|iphone|samsung|pixel)\b/i,
  },
  {
    action: "Home Internet Bundle",
    keywords: /\b(home internet|5g home|home 5g|broadband|home bundle|wifi|wi-fi|internet bundle|convergence)\b/i,
  },
  {
    action: "Premium Support",
    keywords: /\b(premium support|priority support|support tier|enhanced support|vip support)\b/i,
  },
  {
    action: "Billing Dispute",
    keywords: /\b(bill|billing|charge|overcharge|credit|refund|dispute|payment issue|wrong charge|fee waiv)\b/i,
  },
  {
    action: "Account Suspend/Reactivate",
    keywords: /\b(suspend|reactivat|account hold|restore service|turn off|turn on|deactivat|reconnect service)\b/i,
  },
  {
    action: "Multi-Line Management",
    keywords: /\b(multi[- ]?line|add line|remove line|family plan|additional line|transfer number|port number|extra line)\b/i,
  },
];

export function detectActionIntent(message: string): string | null {
  for (const { action, keywords } of INTENT_PATTERNS) {
    if (keywords.test(message)) {
      return action;
    }
  }
  return null;
}
