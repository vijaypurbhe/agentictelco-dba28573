import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  TrendingUp,
  Zap,
  Gift,
  Smartphone,
  Wifi,
  Shield,
  CheckCircle2,
  DollarSign,
  BarChart3,
  Users,
  Signal,
  Package,
  Clock,
  Star,
} from "lucide-react";
import { CustomerData } from "@/types/customer";

interface DynamicActionContentProps {
  actionTitle: string;
  currentStep: number;
  customer: CustomerData;
  onBack: () => void;
}

type ActionStepData = {
  title: string;
  subtitle: string;
  content: React.ReactNode;
};

const actionIcons: Record<string, React.ElementType> = {
  "Plan Upgrade": TrendingUp,
  "Add-On Bundle": Zap,
  "Loyalty Reward": Gift,
  "Device Trade-In": Smartphone,
  "Home Internet Bundle": Wifi,
  "Premium Support": Shield,
};

function PlanUpgradeSteps(customer: CustomerData): ActionStepData[] {
  return [
    {
      title: "Customer Identified",
      subtitle: "Reviewing current plan & eligibility",
      content: (
        <div className="space-y-3">
          <InfoCard label="Current Plan" value={customer.plan} icon={Signal} />
          <InfoCard label="Monthly Spend" value={customer.monthlySpend} icon={DollarSign} />
          <InfoCard label="Data Usage" value={customer.dataUsage} icon={BarChart3} />
          <div className="glass-panel p-3 border-success/20">
            <p className="text-xs font-medium text-success">✓ Eligible for upgrade</p>
            <p className="text-[10px] text-muted-foreground mt-1">Customer is on {customer.plan} with {customer.dataPercent}% data utilization — strong upgrade candidate.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Usage Analysis",
      subtitle: "Patterns & upgrade triggers identified",
      content: (
        <div className="space-y-3">
          <MetricRow label="Data Utilization" value={`${customer.dataPercent}%`} status={customer.dataPercent > 70 ? "warning" : "success"} />
          <MetricRow label="Overage Risk" value={customer.dataPercent > 80 ? "High" : "Low"} status={customer.dataPercent > 80 ? "warning" : "success"} />
          <MetricRow label="Device Count" value={`${customer.deviceCount} lines`} status="neutral" />
          <MetricRow label="Tenure Value" value={customer.tenure} status="success" />
          <div className="gradient-hero rounded-xl p-3 border border-primary/20">
            <p className="text-xs font-semibold text-foreground">📊 Analysis Summary</p>
            <p className="text-[10px] text-muted-foreground mt-1">High data usage ({customer.dataPercent}%) with {customer.deviceCount} lines suggests family plan upgrade would deliver best value and reduce overage risk.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Recommended Plan",
      subtitle: "Best upgrade option for this customer",
      content: (
        <div className="space-y-3">
          <div className="glass-panel p-4 border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-foreground">Unlimited Premium</h4>
              <span className="text-xs font-bold text-primary">$85/mo</span>
            </div>
            <div className="space-y-1.5">
              <FeatureItem text="Unlimited 5G Ultra Wideband" />
              <FeatureItem text="50GB premium hotspot data" />
              <FeatureItem text="HD streaming (720p → 4K UHD)" />
              <FeatureItem text="International texting included" />
              <FeatureItem text="Disney+, Hulu, ESPN+ bundle" />
            </div>
          </div>
          <ComparisonRow label="Price Difference" from={customer.monthlySpend} to="$85.00" impact="+$10/mo" />
          <ComparisonRow label="ARPU Impact" from={customer.arpu} to="$85.00" impact="+$120/yr" />
        </div>
      ),
    },
    {
      title: "Execute Upgrade",
      subtitle: "Processing plan change...",
      content: (
        <div className="space-y-3">
          <StepItem step={1} text="Verify customer identity" status="done" />
          <StepItem step={2} text="Review plan change terms" status="done" />
          <StepItem step={3} text="Apply Unlimited Premium plan" status="active" />
          <StepItem step={4} text="Process billing adjustment" status="pending" />
          <StepItem step={5} text="Send confirmation email" status="pending" />
          <div className="glass-panel p-3 border-warning/20">
            <p className="text-xs font-medium text-warning">⏳ Awaiting agent confirmation</p>
            <p className="text-[10px] text-muted-foreground mt-1">Review the plan change details with the customer before proceeding.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Upgrade Confirmed",
      subtitle: "Plan change successfully applied",
      content: (
        <div className="space-y-3">
          <div className="glass-panel p-4 border-success/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <h4 className="text-sm font-bold text-success">Upgrade Complete</h4>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>• {customer.name} upgraded to <strong className="text-foreground">Unlimited Premium</strong></p>
              <p>• New monthly rate: <strong className="text-foreground">$85.00/mo</strong></p>
              <p>• ARPU lift: <strong className="text-primary">+$10.00/mo</strong></p>
              <p>• Confirmation sent to {customer.phone}</p>
            </div>
          </div>
          <MetricRow label="Revenue Impact" value="+$120/yr" status="success" />
          <MetricRow label="Retention Score" value="Improved" status="success" />
        </div>
      ),
    },
  ];
}

function AddOnBundleSteps(customer: CustomerData): ActionStepData[] {
  return [
    {
      title: "Customer Identified",
      subtitle: "Reviewing current add-ons & eligibility",
      content: (
        <div className="space-y-3">
          <InfoCard label="Current Plan" value={customer.plan} icon={Signal} />
          <InfoCard label="Active Lines" value={`${customer.deviceCount} devices`} icon={Smartphone} />
          <InfoCard label="Current Add-ons" value="None detected" icon={Package} />
          <div className="glass-panel p-3 border-primary/20">
            <p className="text-xs font-medium text-primary">📦 Cross-sell opportunity</p>
            <p className="text-[10px] text-muted-foreground mt-1">{customer.deviceCount} active devices with no protection — high-value bundle candidate.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Bundle Analysis",
      subtitle: "Evaluating best bundle options",
      content: (
        <div className="space-y-3">
          <MetricRow label="Unprotected Devices" value={`${customer.deviceCount}`} status="warning" />
          <MetricRow label="Cloud Storage Used" value="0 GB" status="warning" />
          <MetricRow label="Bundle Savings vs. Individual" value="32%" status="success" />
          <MetricRow label="Avg. Claim Frequency" value="1.2x/yr" status="neutral" />
          <div className="gradient-hero rounded-xl p-3 border border-primary/20">
            <p className="text-xs font-semibold text-foreground">📊 Risk Assessment</p>
            <p className="text-[10px] text-muted-foreground mt-1">{customer.deviceCount} unprotected devices represent $2,400+ in potential replacement costs. Bundle protection reduces customer risk by 85%.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Recommended Bundle",
      subtitle: "Best cross-sell package",
      content: (
        <div className="space-y-3">
          <div className="glass-panel p-4 border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-foreground">Total Protection Bundle</h4>
              <span className="text-xs font-bold text-primary">$8/mo</span>
            </div>
            <div className="space-y-1.5">
              <FeatureItem text="Device protection (all lines)" />
              <FeatureItem text="100GB cloud storage" />
              <FeatureItem text="Identity theft monitoring" />
              <FeatureItem text="Same-day device replacement" />
              <FeatureItem text="Tech support 24/7" />
            </div>
          </div>
          <ComparisonRow label="Individual Cost" from="$23/mo" to="$8/mo" impact="Save $15" />
          <ComparisonRow label="ARPU Impact" from={customer.arpu} to={`$${(parseFloat(customer.arpu.replace('$', '')) + 8).toFixed(2)}`} impact="+$96/yr" />
        </div>
      ),
    },
    {
      title: "Execute Bundle Add",
      subtitle: "Processing add-on activation...",
      content: (
        <div className="space-y-3">
          <StepItem step={1} text="Verify device eligibility" status="done" />
          <StepItem step={2} text="Review bundle terms" status="done" />
          <StepItem step={3} text="Activate device protection" status="active" />
          <StepItem step={4} text="Enable cloud storage" status="pending" />
          <StepItem step={5} text="Send setup instructions" status="pending" />
        </div>
      ),
    },
    {
      title: "Bundle Activated",
      subtitle: "Add-ons successfully applied",
      content: (
        <div className="space-y-3">
          <div className="glass-panel p-4 border-success/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <h4 className="text-sm font-bold text-success">Bundle Active</h4>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>• Total Protection Bundle added for <strong className="text-foreground">{customer.name}</strong></p>
              <p>• Covers all <strong className="text-foreground">{customer.deviceCount} devices</strong></p>
              <p>• Monthly addition: <strong className="text-primary">$8.00/mo</strong></p>
            </div>
          </div>
          <MetricRow label="Revenue Impact" value="+$96/yr" status="success" />
        </div>
      ),
    },
  ];
}

function LoyaltyRewardSteps(customer: CustomerData): ActionStepData[] {
  return [
    {
      title: "Customer Identified",
      subtitle: "Reviewing tenure & loyalty status",
      content: (
        <div className="space-y-3">
          <InfoCard label="Tenure" value={customer.tenure} icon={Clock} />
          <InfoCard label="Lifetime Value" value={customer.ltv} icon={DollarSign} />
          <InfoCard label="Risk Score" value={customer.riskScore} icon={Shield} />
          <div className="glass-panel p-3 border-success/20">
            <p className="text-xs font-medium text-success">⭐ Loyalty tier: Gold</p>
            <p className="text-[10px] text-muted-foreground mt-1">{customer.tenure} tenure qualifies for premium retention rewards.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Retention Analysis",
      subtitle: "Churn risk & reward eligibility",
      content: (
        <div className="space-y-3">
          <MetricRow label="Churn Probability" value={customer.riskScore === "Low" ? "8%" : customer.riskScore === "Medium" ? "24%" : "45%"} status={customer.riskScore === "Low" ? "success" : "warning"} />
          <MetricRow label="Loyalty Points" value="12,400" status="success" />
          <MetricRow label="Reward Budget" value="$180/yr" status="neutral" />
          <MetricRow label="Competitive Offers" value="2 detected" status="warning" />
          <div className="gradient-hero rounded-xl p-3 border border-primary/20">
            <p className="text-xs font-semibold text-foreground">🎯 Retention Strategy</p>
            <p className="text-[10px] text-muted-foreground mt-1">Proactive reward application reduces churn by 62% for customers in this tenure bracket. ROI: 4.2x on reward cost.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Recommended Reward",
      subtitle: "Best retention offer",
      content: (
        <div className="space-y-3">
          <div className="glass-panel p-4 border-success/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-foreground">Loyalty Appreciation Package</h4>
              <span className="text-xs font-bold text-success">FREE</span>
            </div>
            <div className="space-y-1.5">
              <FeatureItem text="6 months free streaming (Disney+ or Netflix)" />
              <FeatureItem text="$50 bill credit applied immediately" />
              <FeatureItem text="Priority customer support tier" />
              <FeatureItem text="Early access to new devices" />
            </div>
          </div>
          <ComparisonRow label="Reward Value" from="$0" to="$130" impact="Customer savings" />
          <ComparisonRow label="Retention ROI" from="$130 cost" to="$2,850 LTV" impact="21.9x" />
        </div>
      ),
    },
    {
      title: "Apply Reward",
      subtitle: "Processing loyalty benefits...",
      content: (
        <div className="space-y-3">
          <StepItem step={1} text="Verify loyalty tier" status="done" />
          <StepItem step={2} text="Apply $50 bill credit" status="done" />
          <StepItem step={3} text="Activate streaming subscription" status="active" />
          <StepItem step={4} text="Upgrade support tier" status="pending" />
          <StepItem step={5} text="Send appreciation notification" status="pending" />
        </div>
      ),
    },
    {
      title: "Reward Applied",
      subtitle: "Loyalty benefits activated",
      content: (
        <div className="space-y-3">
          <div className="glass-panel p-4 border-success/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <h4 className="text-sm font-bold text-success">Rewards Active</h4>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>• Streaming subscription activated for <strong className="text-foreground">6 months</strong></p>
              <p>• <strong className="text-foreground">$50 credit</strong> applied to next bill</p>
              <p>• Support tier upgraded to <strong className="text-foreground">Priority</strong></p>
            </div>
          </div>
          <MetricRow label="Churn Risk Reduction" value="-62%" status="success" />
        </div>
      ),
    },
  ];
}

function DeviceTradeInSteps(customer: CustomerData): ActionStepData[] {
  return [
    {
      title: "Customer Identified",
      subtitle: "Reviewing device & trade-in eligibility",
      content: (
        <div className="space-y-3">
          <InfoCard label="Active Devices" value={`${customer.deviceCount} lines`} icon={Smartphone} />
          <InfoCard label="Current Plan" value={customer.plan} icon={Signal} />
          <InfoCard label="Account Status" value="Active — Good standing" icon={CheckCircle2} />
          <div className="glass-panel p-3 border-primary/20">
            <p className="text-xs font-medium text-primary">📱 Trade-in eligible</p>
            <p className="text-[10px] text-muted-foreground mt-1">Primary device is 24+ months old — qualifies for trade-in credits and new device financing.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Device Assessment",
      subtitle: "Trade-in value & upgrade options",
      content: (
        <div className="space-y-3">
          <MetricRow label="Current Device Age" value="26 months" status="warning" />
          <MetricRow label="Estimated Trade-In Value" value="$200" status="success" />
          <MetricRow label="Upgrade Financing" value="$0 down eligible" status="success" />
          <MetricRow label="Contract Extension" value="24 months" status="neutral" />
          <div className="gradient-hero rounded-xl p-3 border border-primary/20">
            <p className="text-xs font-semibold text-foreground">📊 Device Lifecycle</p>
            <p className="text-[10px] text-muted-foreground mt-1">Device is past optimal trade-in window. Acting now preserves maximum credit value before next depreciation cycle.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Recommended Upgrade",
      subtitle: "Best device + financing option",
      content: (
        <div className="space-y-3">
          <div className="glass-panel p-4 border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-foreground">iPhone 16 Pro (128GB)</h4>
              <span className="text-xs font-bold text-primary">$0 down</span>
            </div>
            <div className="space-y-1.5">
              <FeatureItem text="$200 trade-in credit applied" />
              <FeatureItem text="$27.77/mo for 36 months" />
              <FeatureItem text="Free case + screen protector" />
              <FeatureItem text="Same-day in-store pickup" />
            </div>
          </div>
          <ComparisonRow label="Device Cost" from="$999" to="$799" impact="-$200 credit" />
          <ComparisonRow label="Monthly Payment" from="N/A" to="$27.77/mo" impact="36 months" />
        </div>
      ),
    },
    {
      title: "Process Trade-In",
      subtitle: "Executing device exchange...",
      content: (
        <div className="space-y-3">
          <StepItem step={1} text="Verify trade-in device condition" status="done" />
          <StepItem step={2} text="Apply $200 trade-in credit" status="done" />
          <StepItem step={3} text="Initialize device financing" status="active" />
          <StepItem step={4} text="Order new device" status="pending" />
          <StepItem step={5} text="Schedule data transfer" status="pending" />
        </div>
      ),
    },
    {
      title: "Trade-In Complete",
      subtitle: "Device upgrade processed",
      content: (
        <div className="space-y-3">
          <div className="glass-panel p-4 border-success/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <h4 className="text-sm font-bold text-success">Trade-In Processed</h4>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>• <strong className="text-foreground">$200 credit</strong> applied to account</p>
              <p>• iPhone 16 Pro ordered — <strong className="text-foreground">same-day pickup</strong></p>
              <p>• Contract extended <strong className="text-foreground">24 months</strong></p>
            </div>
          </div>
          <MetricRow label="Contract Lock-In" value="24 months" status="success" />
          <MetricRow label="Revenue Secured" value={`$${(parseFloat(customer.monthlySpend.replace('$', '')) * 24).toFixed(0)}`} status="success" />
        </div>
      ),
    },
  ];
}

function HomeInternetSteps(customer: CustomerData): ActionStepData[] {
  return [
    {
      title: "Customer Identified",
      subtitle: "Reviewing household & address eligibility",
      content: (
        <div className="space-y-3">
          <InfoCard label="Active Lines" value={`${customer.deviceCount} devices`} icon={Users} />
          <InfoCard label="Current Spend" value={customer.monthlySpend} icon={DollarSign} />
          <InfoCard label="Service Area" value="5G Home eligible" icon={Wifi} />
          <div className="glass-panel p-3 border-primary/20">
            <p className="text-xs font-medium text-primary">🏠 Convergence opportunity</p>
            <p className="text-[10px] text-muted-foreground mt-1">Customer address is in 5G home coverage area. No existing home internet detected — prime cross-sell target.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Household Analysis",
      subtitle: "Internet needs assessment",
      content: (
        <div className="space-y-3">
          <MetricRow label="5G Signal Strength" value="Excellent" status="success" />
          <MetricRow label="Est. Download Speed" value="300+ Mbps" status="success" />
          <MetricRow label="Household Devices" value={`${customer.deviceCount + 5} estimated`} status="neutral" />
          <MetricRow label="Convergence Discount" value="$10/mo" status="success" />
          <div className="gradient-hero rounded-xl p-3 border border-primary/20">
            <p className="text-xs font-semibold text-foreground">📊 Bundle Value</p>
            <p className="text-[10px] text-muted-foreground mt-1">Adding home internet with wireless creates a convergence lock — customers with both services have 73% lower churn rate.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Recommended Bundle",
      subtitle: "Best home internet package",
      content: (
        <div className="space-y-3">
          <div className="glass-panel p-4 border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-foreground">5G Home Internet Plus</h4>
              <span className="text-xs font-bold text-primary">$25/mo</span>
            </div>
            <div className="space-y-1.5">
              <FeatureItem text="300+ Mbps typical download speeds" />
              <FeatureItem text="No data caps or throttling" />
              <FeatureItem text="Self-install router included" />
              <FeatureItem text="$10/mo convergence discount" />
              <FeatureItem text="30-day satisfaction guarantee" />
            </div>
          </div>
          <ComparisonRow label="Standard Price" from="$35/mo" to="$25/mo" impact="-$10 bundle" />
          <ComparisonRow label="Household ARPU" from={customer.monthlySpend} to={`$${(parseFloat(customer.monthlySpend.replace('$', '')) + 25).toFixed(2)}`} impact="+$300/yr" />
        </div>
      ),
    },
    {
      title: "Setup Internet",
      subtitle: "Processing home internet order...",
      content: (
        <div className="space-y-3">
          <StepItem step={1} text="Verify address eligibility" status="done" />
          <StepItem step={2} text="Apply convergence discount" status="done" />
          <StepItem step={3} text="Order 5G home router" status="active" />
          <StepItem step={4} text="Schedule self-install kit" status="pending" />
          <StepItem step={5} text="Activate home service" status="pending" />
        </div>
      ),
    },
    {
      title: "Internet Added",
      subtitle: "Home service successfully activated",
      content: (
        <div className="space-y-3">
          <div className="glass-panel p-4 border-success/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <h4 className="text-sm font-bold text-success">Home Internet Active</h4>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>• 5G Home Internet Plus activated for <strong className="text-foreground">{customer.name}</strong></p>
              <p>• Router shipping — <strong className="text-foreground">arrives in 2-3 days</strong></p>
              <p>• Convergence discount: <strong className="text-primary">-$10/mo</strong></p>
            </div>
          </div>
          <MetricRow label="Revenue Impact" value="+$300/yr" status="success" />
          <MetricRow label="Churn Reduction" value="-73%" status="success" />
        </div>
      ),
    },
  ];
}

function PremiumSupportSteps(customer: CustomerData): ActionStepData[] {
  return [
    {
      title: "Customer Identified",
      subtitle: "Reviewing support history & value tier",
      content: (
        <div className="space-y-3">
          <InfoCard label="Lifetime Value" value={customer.ltv} icon={Star} />
          <InfoCard label="Risk Score" value={customer.riskScore} icon={Shield} />
          <InfoCard label="Current Support" value="Standard tier" icon={Users} />
          <div className="glass-panel p-3 border-accent/20">
            <p className="text-xs font-medium text-accent">👑 High-value account</p>
            <p className="text-[10px] text-muted-foreground mt-1">LTV of {customer.ltv} qualifies this account for premium support retention strategy.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Support Analysis",
      subtitle: "Interaction history & satisfaction",
      content: (
        <div className="space-y-3">
          <MetricRow label="Support Contacts (12mo)" value="4 interactions" status="neutral" />
          <MetricRow label="Avg Wait Time" value="12 min" status="warning" />
          <MetricRow label="CSAT Score" value="3.8/5" status="warning" />
          <MetricRow label="Churn Reduction w/ Premium" value="-40%" status="success" />
          <div className="gradient-hero rounded-xl p-3 border border-primary/20">
            <p className="text-xs font-semibold text-foreground">📊 Support ROI</p>
            <p className="text-[10px] text-muted-foreground mt-1">Premium support costs $7/mo but reduces churn by 40% for high-value accounts. Net revenue impact: +$1,140/yr in retained LTV.</p>
          </div>
        </div>
      ),
    },
    {
      title: "Recommended Tier",
      subtitle: "Premium support package",
      content: (
        <div className="space-y-3">
          <div className="glass-panel p-4 border-accent/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-bold text-foreground">Priority Support Plus</h4>
              <span className="text-xs font-bold text-accent">$7/mo</span>
            </div>
            <div className="space-y-1.5">
              <FeatureItem text="Priority queue — under 2 min wait" />
              <FeatureItem text="Dedicated support specialist" />
              <FeatureItem text="Proactive issue monitoring" />
              <FeatureItem text="Extended hours (6AM–12AM)" />
              <FeatureItem text="In-store express service" />
            </div>
          </div>
          <ComparisonRow label="Wait Time" from="12 min avg" to="<2 min" impact="-83%" />
          <ComparisonRow label="ARPU Impact" from={customer.arpu} to={`$${(parseFloat(customer.arpu.replace('$', '')) + 7).toFixed(2)}`} impact="+$84/yr" />
        </div>
      ),
    },
    {
      title: "Activate Support",
      subtitle: "Processing support upgrade...",
      content: (
        <div className="space-y-3">
          <StepItem step={1} text="Verify account eligibility" status="done" />
          <StepItem step={2} text="Assign dedicated specialist" status="done" />
          <StepItem step={3} text="Upgrade support tier" status="active" />
          <StepItem step={4} text="Enable proactive monitoring" status="pending" />
          <StepItem step={5} text="Send welcome package" status="pending" />
        </div>
      ),
    },
    {
      title: "Support Upgraded",
      subtitle: "Premium support activated",
      content: (
        <div className="space-y-3">
          <div className="glass-panel p-4 border-success/30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <h4 className="text-sm font-bold text-success">Premium Active</h4>
            </div>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <p>• Priority Support Plus activated for <strong className="text-foreground">{customer.name}</strong></p>
              <p>• Dedicated specialist: <strong className="text-foreground">Agent Martinez</strong></p>
              <p>• Proactive monitoring: <strong className="text-success">Enabled</strong></p>
            </div>
          </div>
          <MetricRow label="Churn Risk Reduction" value="-40%" status="success" />
          <MetricRow label="Retained LTV" value={customer.ltv} status="success" />
        </div>
      ),
    },
  ];
}

// --- Helper sub-components ---

function InfoCard({ label, value, icon: Icon }: { label: string; value: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/40">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="text-xs font-semibold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function MetricRow({ label, value, status }: { label: string; value: string; status: "success" | "warning" | "neutral" }) {
  const colors = {
    success: "text-success",
    warning: "text-warning",
    neutral: "text-foreground",
  };
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-xs font-bold ${colors[status]}`}>{value}</span>
    </div>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 className="w-3 h-3 text-success shrink-0" />
      <span className="text-xs text-muted-foreground">{text}</span>
    </div>
  );
}

function ComparisonRow({ label, from, to, impact }: { label: string; from: string; to: string; impact: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/30">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-muted-foreground line-through">{from}</span>
        <span className="text-foreground font-semibold">{to}</span>
        <span className="text-primary font-bold text-[10px]">{impact}</span>
      </div>
    </div>
  );
}

function StepItem({ step, text, status }: { step: number; text: string; status: "done" | "active" | "pending" }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg bg-muted/30">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
        status === "done" ? "bg-success text-success-foreground" :
        status === "active" ? "bg-primary text-primary-foreground animate-pulse" :
        "bg-muted text-muted-foreground"
      }`}>
        {status === "done" ? <CheckCircle2 className="w-3.5 h-3.5" /> : step}
      </div>
      <span className={`text-xs ${status === "pending" ? "text-muted-foreground" : "text-foreground"}`}>{text}</span>
    </div>
  );
}

// --- Step data resolver ---
function getStepsForAction(actionTitle: string, customer: CustomerData): ActionStepData[] {
  switch (actionTitle) {
    case "Plan Upgrade": return PlanUpgradeSteps(customer);
    case "Add-On Bundle": return AddOnBundleSteps(customer);
    case "Loyalty Reward": return LoyaltyRewardSteps(customer);
    case "Device Trade-In": return DeviceTradeInSteps(customer);
    case "Home Internet Bundle": return HomeInternetSteps(customer);
    case "Premium Support": return PremiumSupportSteps(customer);
    default: return PlanUpgradeSteps(customer);
  }
}

// --- Main Component ---
export function DynamicActionContent({ actionTitle, currentStep, customer, onBack }: DynamicActionContentProps) {
  const steps = getStepsForAction(actionTitle, customer);
  const stepData = steps[currentStep] || steps[0];
  const ActionIcon = actionIcons[actionTitle] || TrendingUp;

  return (
    <div className="space-y-4">
      {/* Action Header */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </motion.button>
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <ActionIcon className="w-4.5 h-4.5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground">{actionTitle}</h3>
          <p className="text-[10px] text-muted-foreground">{stepData.subtitle}</p>
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${actionTitle}-${currentStep}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <div className="gradient-hero rounded-xl p-3 border border-primary/20 mb-3">
            <h4 className="text-xs font-bold text-foreground">{stepData.title}</h4>
            <p className="text-[10px] text-muted-foreground">{stepData.subtitle}</p>
          </div>
          {stepData.content}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
