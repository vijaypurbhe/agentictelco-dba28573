import { useRef, useState, useCallback } from "react";
import { MessageCircle, LayoutDashboard } from "lucide-react";
import { TopBar } from "@/components/agent/TopBar";
import { ConversationPanel, ConversationPanelHandle, QuickOption } from "@/components/agent/ConversationPanel";
import { AgentPanel } from "@/components/agent/AgentPanel";
import { useIsMobile } from "@/hooks/use-mobile";
import { CustomerData, TimelineEvent, CustomerUpdate, DEFAULT_CUSTOMER, DEFAULT_TIMELINE } from "@/types/customer";
import Login from "./Login";

const Index = () => {
  const conversationRef = useRef<ConversationPanelHandle>(null);
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<"chat" | "agent">("chat");
  const [customer, setCustomer] = useState<CustomerData>(DEFAULT_CUSTOMER);
  const [timeline, setTimeline] = useState<TimelineEvent[]>(DEFAULT_TIMELINE);
  const [detectedAction, setDetectedAction] = useState<string | null>(null);
  const [detectedOption, setDetectedOption] = useState<string | null>(null);
  const [dynamicQuickOptions, setDynamicQuickOptions] = useState<QuickOption[] | null>(null);
  const [conversationTurn, setConversationTurn] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!sessionStorage.getItem("demo_auth_email")
  );

  const handleActionClick = (prompt: string) => {
    conversationRef.current?.sendMessage(prompt);
    if (isMobile) setActiveTab("chat");
  };

  const handleCustomerUpdate = useCallback((update: CustomerUpdate) => {
    setCustomer(update.customer);
    setTimeline(update.timeline);
  }, []);

  const handleActionDetected = useCallback((actionTitle: string) => {
    setDetectedAction(actionTitle);
    if (isMobile) setActiveTab("agent");
  }, [isMobile]);

  const handleMessageSent = useCallback(() => {
    setConversationTurn((t) => t + 1);
  }, []);

  const handleOptionDetected = useCallback((optionId: string) => {
    setDetectedOption(optionId);
  }, []);

  const handleQuickOptionsDetected = useCallback((options: QuickOption[]) => {
    setDynamicQuickOptions(options);
  }, []);

  if (!isAuthenticated) {
    return <Login onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <TopBar />

      {!isMobile ? (
        <div className="flex flex-1 overflow-hidden">
          <div className="w-[420px] border-r border-border/50 flex flex-col shrink-0">
            <ConversationPanel ref={conversationRef} customer={customer} onCustomerUpdate={handleCustomerUpdate} onActionDetected={handleActionDetected} onOptionDetected={handleOptionDetected} onMessageSent={handleMessageSent} onQuickOptionsDetected={handleQuickOptionsDetected} />
          </div>
          <div className="flex-1 flex flex-col">
            <AgentPanel onActionClick={handleActionClick} customer={customer} timeline={timeline} externalAction={detectedAction} externalOption={detectedOption} conversationTurn={conversationTurn} />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden relative">
            <div className={`absolute inset-0 ${activeTab === "chat" ? "" : "invisible"}`}>
              <ConversationPanel ref={conversationRef} customer={customer} onCustomerUpdate={handleCustomerUpdate} onActionDetected={handleActionDetected} onOptionDetected={handleOptionDetected} onMessageSent={handleMessageSent} />
            </div>
            <div className={`absolute inset-0 ${activeTab === "agent" ? "" : "invisible"}`}>
              <AgentPanel onActionClick={handleActionClick} customer={customer} timeline={timeline} externalAction={detectedAction} externalOption={detectedOption} conversationTurn={conversationTurn} />
            </div>
          </div>

          <div className="border-t border-border/50 bg-card/80 backdrop-blur-xl flex">
            <button
              onClick={() => setActiveTab("chat")}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 transition-colors ${
                activeTab === "chat" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <MessageCircle className="w-6 h-6" />
              <span className="text-xs font-semibold">Conversation</span>
            </button>
            <button
              onClick={() => setActiveTab("agent")}
              className={`flex-1 flex flex-col items-center gap-1.5 py-3.5 transition-colors ${
                activeTab === "agent" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <LayoutDashboard className="w-6 h-6" />
              <span className="text-xs font-semibold">Agent Panel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Index;
