

# AT&T Agent Assist — Feature Documentation & Testing Guide

## Overview

AT&T Agent Assist is an **Agentic Enterprise Platform** that helps customer service representatives handle wireless/telecom customer interactions using AI-powered multi-agent orchestration. The application features a split-panel interface: a **Conversation Panel** (AI chat) on the left and a **Multi-Agent Panel** on the right.

---

## Architecture

```text
┌──────────────────────────────────────────────────────┐
│                     TopBar                           │
│  [AT&T Agent Assist]         [AI Active] [Enterprise]│
├────────────────────┬─────────────────────────────────┤
│  Conversation      │  Agent Panel                    │
│  Panel (420px)     │                                 │
│                    │  ┌─ Customer Context ──────────┐│
│  [System msg]      │  │ Name, Plan, ARPU, LTV, etc.││
│  [User msg]        │  └────────────────────────────┘│
│  [AI response]     │  ┌─ Agent Ribbon ─────────────┐│
│                    │  │ 9 specialist agent buttons  ││
│                    │  └────────────────────────────┘│
│                    │  ┌─ Active Agent Section(s) ──┐│
│                    │  │ Collapsible, stacked flows  ││
│                    │  └────────────────────────────┘│
│                    │  ┌─ Combined Checkout ─────────┐│
│  [Voice FAB]       │  │ Execute All N Actions       ││
│  [Text input]      │  └────────────────────────────┘│
│                    │  ┌─ Interaction Timeline ──────┐│
│                    │  │ 8 historical events         ││
│                    │  └────────────────────────────┘│
└────────────────────┴─────────────────────────────────┘
```

---

## Features

### 1. AI Conversation Panel
- **Real-time streaming chat** with an AI assistant powered by Gemini 3 Flash via a backend function
- AI is context-aware: it knows the current customer's plan, tenure, data usage, risk score, and LTV
- Responses are streamed token-by-token for a live typing effect
- **Customer switching**: Ask the AI to "pull up" or "look up" a different customer by name, and the entire UI (customer context card, timeline) updates dynamically with AI-generated data

### 2. Voice Input
- **Floating microphone button** in the conversation panel
- Records audio via the browser's MediaRecorder API
- **Automatic silence detection** (1.5s threshold) — stops recording when you stop speaking
- Audio is transcribed server-side via a `transcribe-audio` backend function
- Transcribed text is automatically sent as a message to the AI

### 3. Intent Detection (NLP)
- Every typed or voice message is analyzed locally for **action-level intent** (which agent to activate) and **option-level intent** (which specific option to select)
- **9 action intents** with keyword patterns: Plan Upgrade, Add-On Bundle, Loyalty Reward, Device Trade-In, Home Internet Bundle, Premium Support, Billing Dispute, Account Suspend/Reactivate, Multi-Line Management
- **27 option intents** (3 per agent) with specific keyword patterns (e.g., "full reversal" selects the Full Reversal option in the Billing Dispute agent)
- When an intent is detected, the Agent Panel automatically activates the corresponding agent and highlights the matching option

### 4. Nine Specialist Agents
Each agent has a full 5-step workflow (Identify → Analyze → Recommend → Execute → Confirm) with rich, data-driven UI at each step:

| Agent | Tag | Description |
|---|---|---|
| Plan Agent | Upsell | Upgrade to Unlimited Plus/Premium/Ultimate |
| Bundle Agent | Cross-sell | Device protection, cloud storage, total bundle |
| Loyalty Agent | Retention | Free streaming, bill credits, data boosts |
| Device Agent | Revenue | iPhone/Galaxy trade-in with credit |
| Home Agent | Cross-sell | 5G Home / LTE Home internet bundles |
| Support Agent | Retention | Priority/dedicated/family support tiers |
| Billing Agent | Support | Partial credit, full reversal, payment plans |
| Account Agent | Account | Reactivate, payment arrangement, partial restore |
| Lines Agent | Account | Add, remove, or transfer phone lines |

### 5. Quick Select Cards
- Each agent displays **3 selectable options** as visual cards
- One option is marked as "Best" (recommended)
- Selecting an option sends a contextual prompt to the AI conversation
- Options can be **auto-selected via voice/text** intent detection

### 6. Multi-Agent Stacking
- Multiple agents can be **active simultaneously** (e.g., Plan Upgrade + Loyalty Reward + Add-On Bundle)
- Each agent renders as a **collapsible section** with independent step progress
- When a new agent is activated, existing agents auto-collapse but preserve their state
- Each section has collapse/expand toggle and a remove (X) button
- The agent ribbon transforms into a compact horizontal bar showing all 9 agents as small buttons

### 7. Combined Checkout
- Appears automatically when **2 or more agents** are active
- Shows a summary of all queued actions with individual progress indicators
- Each action shows either a checkmark (complete) or "Step X/5" progress
- "Execute All N Actions" button sends a combined prompt to the AI for unified processing

### 8. Customer Context Card
- Displays: name, account ID, phone, plan, tenure, ARPU, LTV, risk score, data usage (with progress bar)
- Updates dynamically when the AI performs a customer lookup

### 9. Interaction Timeline
- Shows 5-8 historical events (calls, plan changes, billing, complaints, device upgrades, retention actions)
- Color-coded icons by event type
- Shows date, description, agent name, and outcome
- Updates when a new customer is loaded

### 10. Dark/Light Theme
- Toggle button in the top bar switches between dark and light mode

### 11. Mobile Responsive
- On screens < 768px, the layout switches to a **tabbed interface** with a bottom tab bar (Conversation / Agent Panel)
- When an intent is detected via voice or text, the app **auto-switches to the Agent Panel tab** so the user sees the updated UI immediately

---

## How to Test

### Basic Chat Flow
1. Open the app — you see Sarah Mitchell's customer profile on the right
2. Type a message like "What plan options does this customer have?" and press Enter or click Send
3. Watch the AI response stream in real-time

### Voice Input
1. Click the **blue microphone FAB** (floating button) in the conversation panel
2. Speak a command (e.g., "I want to upgrade the plan")
3. Stop speaking — after 1.5 seconds of silence, recording stops automatically
4. The transcript appears in the input field and is sent to the AI
5. The corresponding agent (Plan Agent) should activate on the right panel

### Intent Detection — Single Agent
1. Type "The customer has a billing dispute" and send
2. The **Billing Agent** should activate in the Agent Panel with its 3 options (Partial Credit, Full Reversal, Payment Plan)
3. Type "They want a full reversal" — the **Full Reversal** card should auto-select

### Multi-Agent Stacking
1. Click the **"Plan Upgrade"** card in the agent grid (or type "upgrade plan")
2. Once the Plan Agent is active, click the **"Bundle Agent"** button in the horizontal ribbon (or type "also add device protection")
3. Click the **"Loyalty Agent"** button (or type "check loyalty rewards too")
4. Verify all three agents appear as stacked, collapsible sections
5. Click an agent's header to collapse/expand it
6. The **Combined Checkout** panel should appear at the bottom showing all 3 actions

### Combined Checkout
1. Activate 2+ agents (see above)
2. Observe each agent's step progress (e.g., "Step 2/5")
3. Click "Execute All 3 Actions" — a combined prompt is sent to the AI
4. All agents advance to the final step (Confirm)

### Customer Switching
1. Type "Pull up account for John Davis" or "Look up customer Mike Johnson"
2. The AI generates new customer data — the Customer Context card and Interaction Timeline update with the new customer's information

### Quick Select Cards
1. Activate any agent (e.g., click "Plan Upgrade")
2. In the expanded agent section, click one of the 3 option cards (e.g., "Unlimited Premium $85/mo")
3. The card highlights as "Selected" and a contextual prompt is sent to the AI

### Mobile Experience
1. Resize the browser window to below 768px width
2. The layout switches to tabbed view with bottom navigation
3. Type a message with an intent keyword — the app should auto-switch to the Agent Panel tab
4. Switch between Conversation and Agent Panel using the bottom tabs

### Theme Toggle
1. Click the sun/moon icon in the top-right corner of the top bar
2. The entire UI switches between dark and light themes

