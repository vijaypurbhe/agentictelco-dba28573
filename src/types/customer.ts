export interface CustomerData {
  name: string;
  phone: string;
  accountId: string;
  plan: string;
  tenure: string;
  monthlySpend: string;
  dataUsage: string;
  dataPercent: number;
  deviceCount: number;
  riskScore: string;
  arpu: string;
  ltv: string;
}

export interface TimelineEvent {
  id: string;
  type: "call" | "plan_change" | "billing" | "complaint" | "device" | "retention";
  title: string;
  description: string;
  date: string;
  agent?: string;
  outcome?: string;
}

export interface CustomerUpdate {
  customer: CustomerData;
  timeline: TimelineEvent[];
}

export const DEFAULT_CUSTOMER: CustomerData = {
  name: "Sarah Mitchell",
  phone: "(555) 234-8901",
  accountId: "WLS-2847391",
  plan: "Unlimited Basic",
  tenure: "3 years, 2 months",
  monthlySpend: "$75.00",
  dataUsage: "28.4 GB / 35 GB",
  dataPercent: 81,
  deviceCount: 3,
  riskScore: "Low",
  arpu: "$75.00",
  ltv: "$2,850",
};

export const DEFAULT_TIMELINE: TimelineEvent[] = [
  {
    id: "1",
    type: "call",
    title: "Plan Inquiry Call",
    description: "Customer called asking about data overage charges. Explained current plan limits.",
    date: "Feb 3, 2026",
    agent: "Agent Williams",
    outcome: "Resolved — no action taken",
  },
  {
    id: "2",
    type: "billing",
    title: "Payment Processed",
    description: "Monthly billing cycle completed. Auto-pay from Visa ending 4821.",
    date: "Jan 28, 2026",
    outcome: "$75.00 charged",
  },
  {
    id: "3",
    type: "plan_change",
    title: "Data Add-On Purchased",
    description: "Customer added 5GB one-time data boost due to approaching cap.",
    date: "Jan 15, 2026",
    agent: "Self-service (App)",
    outcome: "+$10.00 one-time",
  },
  {
    id: "4",
    type: "retention",
    title: "Loyalty Offer Applied",
    description: "Applied $5/mo discount for 12 months as tenure reward (3-year milestone).",
    date: "Dec 20, 2025",
    agent: "Agent Chen",
    outcome: "Discount active until Dec 2026",
  },
  {
    id: "5",
    type: "device",
    title: "Device Upgrade — iPhone 16 Pro",
    description: "Customer upgraded from iPhone 14. 24-month installment plan at $33.34/mo.",
    date: "Nov 8, 2025",
    agent: "Retail Store #4412",
    outcome: "Contract extended to Nov 2027",
  },
  {
    id: "6",
    type: "complaint",
    title: "Network Coverage Complaint",
    description: "Reported poor signal at home address. Escalated to network engineering.",
    date: "Oct 2, 2025",
    agent: "Agent Patel",
    outcome: "Resolved — tower upgrade completed",
  },
  {
    id: "7",
    type: "plan_change",
    title: "Plan Migration: Plus → Basic",
    description: "Customer downgraded from Unlimited Plus to Unlimited Basic to reduce costs.",
    date: "Aug 15, 2025",
    agent: "Agent Williams",
    outcome: "ARPU decreased $10/mo",
  },
  {
    id: "8",
    type: "billing",
    title: "Late Payment — Fee Waived",
    description: "Payment 5 days late. Agent waived $25 late fee due to customer tenure.",
    date: "Jun 28, 2025",
    agent: "Agent Torres",
    outcome: "$25 fee waived",
  },
];
