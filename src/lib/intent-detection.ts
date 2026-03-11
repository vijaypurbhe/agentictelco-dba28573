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

/**
 * Maps user message text to a specific option ID within an agent's QuickSelectCard.
 */
const OPTION_PATTERNS: { id: string; action: string; keywords: RegExp }[] = [
  // Plan Upgrade options
  { id: "basic-plus", action: "Plan Upgrade", keywords: /\b(unlimited plus|basic plus)\b/i },
  { id: "premium", action: "Plan Upgrade", keywords: /\b(unlimited premium|premium plan)\b/i },
  { id: "ultimate", action: "Plan Upgrade", keywords: /\b(unlimited ultimate|ultimate plan)\b/i },

  // Add-On Bundle options
  { id: "protection", action: "Add-On Bundle", keywords: /\b(device protection(?! bundle)|screen repair)\b/i },
  { id: "total-bundle", action: "Add-On Bundle", keywords: /\b(total protection|total bundle|protection bundle)\b/i },
  { id: "cloud-only", action: "Add-On Bundle", keywords: /\b(cloud storage|cloud only|photo backup)\b/i },

  // Loyalty Reward options
  { id: "streaming", action: "Loyalty Reward", keywords: /\b(free streaming|disney|netflix|hulu)\b/i },
  { id: "bill-credit", action: "Loyalty Reward", keywords: /\b(bill credit|\$50 credit|50 credit)\b/i },
  { id: "data-boost", action: "Loyalty Reward", keywords: /\b(data boost|10gb bonus|extra data|permanent.*data)\b/i },

  // Device Trade-In options
  { id: "iphone16", action: "Device Trade-In", keywords: /\b(iphone 16 pro(?! max)|iphone ?16pro(?! max))\b/i },
  { id: "iphone16plus", action: "Device Trade-In", keywords: /\b(iphone 16 pro max|iphone ?16 ?pro ?max)\b/i },
  { id: "galaxy-s25", action: "Device Trade-In", keywords: /\b(galaxy|samsung|s25)\b/i },

  // Home Internet Bundle options
  { id: "home-basic", action: "Home Internet Bundle", keywords: /\b(5g home(?! plus)|home basic)\b/i },
  { id: "home-plus", action: "Home Internet Bundle", keywords: /\b(5g home plus|home plus)\b/i },
  { id: "lte-home", action: "Home Internet Bundle", keywords: /\b(lte home|lte internet|rural)\b/i },

  // Premium Support options
  { id: "priority", action: "Premium Support", keywords: /\b(priority support|priority tier)\b/i },
  { id: "dedicated", action: "Premium Support", keywords: /\b(dedicated specialist|dedicated rep|named rep)\b/i },
  { id: "team-support", action: "Premium Support", keywords: /\b(family support|team support|all lines)\b/i },

  // Billing Dispute options
  { id: "partial-credit", action: "Billing Dispute", keywords: /\b(partial credit|proportional credit)\b/i },
  { id: "full-reversal", action: "Billing Dispute", keywords: /\b(full reversal|full refund|reverse.*charge|reversal)\b/i },
  { id: "payment-plan", action: "Billing Dispute", keywords: /\b(payment plan|payment arrangement|split.*balance|installment)\b/i },

  // Account Suspend/Reactivate options
  { id: "reactivate-now", action: "Account Suspend/Reactivate", keywords: /\b(reactivate now|restore now|immediate restor)\b/i },
  { id: "payment-arrangement", action: "Account Suspend/Reactivate", keywords: /\b(payment arrangement|payment plan|3.month)\b/i },
  { id: "partial-restore", action: "Account Suspend/Reactivate", keywords: /\b(partial restore|incoming only|partial service)\b/i },

  // Multi-Line Management options
  { id: "add-line", action: "Multi-Line Management", keywords: /\b(add.*line|new line|additional line)\b/i },
  { id: "remove-line", action: "Multi-Line Management", keywords: /\b(remove.*line|cancel.*line|drop.*line)\b/i },
  { id: "transfer-number", action: "Multi-Line Management", keywords: /\b(transfer.*number|port.*in|port.*number|keep.*number)\b/i },
];

export interface DetectedIntent {
  action: string | null;
  optionId: string | null;
}

export function detectFullIntent(message: string): DetectedIntent {
  const action = detectActionIntent(message);

  // Check option-level matches
  for (const pattern of OPTION_PATTERNS) {
    if (pattern.keywords.test(message)) {
      return {
        action: action || pattern.action,
        optionId: pattern.id,
      };
    }
  }

  return { action, optionId: null };
}
