

# Plan: Voice-Enabled AT&T-Inspired Agentic Enterprise Demo

## What We Are Building

Three major enhancements to the existing agentic customer service demo:

1. **Voice Input** — Browser-native speech-to-text so the agent can speak instead of type, with a visual recording indicator and auto-send capability
2. **AT&T-Inspired Branding** — Restyle the entire UI with AT&T's signature blue palette, globe-inspired iconography, and premium telecom typography
3. **3 New Enterprise Flows** — Billing Dispute Resolution, Account Suspension/Reactivation, and Multi-Line Management with full 5-step workflows, quick-select options, and AI prompts

---

## Technical Approach

### 1. Voice Input (Web Speech API)

**File: `src/components/agent/ConversationPanel.tsx`**
- Add a `useVoiceInput` hook or inline logic using `window.SpeechRecognition` / `webkitSpeechRecognition`
- Replace the existing decorative `Mic` button with a functional toggle:
  - Idle state: mic icon
  - Recording state: pulsing red indicator with waveform animation
  - On speech result: populate the input field; optionally auto-send
- Add `interimResults` support so partial transcription appears live in the input field
- Graceful fallback: if `SpeechRecognition` is not available, hide the mic button or show a tooltip

**New file: `src/hooks/use-voice-input.ts`**
- Encapsulate SpeechRecognition setup, start/stop, interim/final results, error handling
- Returns: `{ isListening, transcript, startListening, stopListening, isSupported }`

### 2. AT&T-Inspired Branding

**File: `src/index.css`** — Update CSS variables:
- Light mode primary: `207 90% 54%` (AT&T blue #0057B8 area)
- Dark mode primary: `207 90% 62%`
- Accent: keep orange-ish for upsell highlights (AT&T uses orange accents)
- Background: slightly cooler whites/grays

**File: `src/components/agent/TopBar.tsx`**
- Replace "Agentic Fluid UI" with "AT&T Agent Assist" or similar
- Replace `Radio` icon with a globe icon (`Globe` from lucide)
- Add AT&T-style horizontal nav feel with a subtle gradient bar

**File: `src/components/agent/CustomerContext.tsx`**
- Minor styling tweaks for the AT&T card look (rounded corners, blue accent borders)

### 3. Three New Enterprise Flows

**File: `src/components/agent/AgentPanel.tsx`**
- Add 3 new entries to `actions` array and `actionPrompts` map:
  - **Billing Dispute Resolution** (icon: `Receipt`, tag: "Support")
  - **Account Suspension/Reactivation** (icon: `Power`, tag: "Account")
  - **Multi-Line Management** (icon: `Users`, tag: "Account")
- Grid expands from 6 to 9 action cards (3x3 grid)

**File: `src/components/agent/QuickSelectCard.tsx`**
- Add 3 new entries to `actionOptions` and `selectPrompts`:
  - Billing Dispute: "Partial Credit", "Full Reversal", "Payment Plan"
  - Account Suspension: "Reactivate Now", "Payment Arrangement", "Partial Restore"
  - Multi-Line: "Add New Line", "Remove Line", "Transfer Number"

**File: `src/components/agent/DynamicActionContent.tsx`**
- Add 3 new step-generator functions (`BillingDisputeSteps`, `AccountSuspensionSteps`, `MultiLineSteps`) following the existing pattern of 5 steps each with contextual metrics, recommendations, and execution checklists
- Add entries to `actionIcons` map

**File: `src/components/agent/AgentPanel.tsx`**
- Update system prompt context in edge function to mention these new capabilities

**File: `supabase/functions/agent-chat/index.ts`**
- Extend system prompt to cover billing disputes, account management, and multi-line scenarios

---

## Summary of Files Changed

| File | Change |
|------|--------|
| `src/hooks/use-voice-input.ts` | New — Web Speech API hook |
| `src/components/agent/ConversationPanel.tsx` | Wire voice input to mic button |
| `src/index.css` | AT&T blue color palette |
| `src/components/agent/TopBar.tsx` | AT&T-inspired branding |
| `src/components/agent/AgentPanel.tsx` | Add 3 new action cards |
| `src/components/agent/QuickSelectCard.tsx` | Add 3 new quick-select option sets |
| `src/components/agent/DynamicActionContent.tsx` | Add 3 new 5-step flow generators |
| `supabase/functions/agent-chat/index.ts` | Extend system prompt for new flows |

