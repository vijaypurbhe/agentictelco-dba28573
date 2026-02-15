import { TopBar } from "@/components/agent/TopBar";
import { ConversationPanel } from "@/components/agent/ConversationPanel";
import { AgentPanel } from "@/components/agent/AgentPanel";

const Index = () => {
  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Conversation */}
        <div className="w-[420px] border-r border-border/50 flex flex-col shrink-0">
          <ConversationPanel />
        </div>
        {/* Right: Dynamic Agent Panel */}
        <div className="flex-1 flex flex-col">
          <AgentPanel />
        </div>
      </div>
    </div>
  );
};

export default Index;
