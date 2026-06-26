# Telco Agent Assist on Salesforce Headless360

**Audience:** Solution architects, Salesforce platform leads, and Tech Mahindra delivery teams evaluating how the Telco Agent Assist demo would be productionised on a Salesforce Headless360 foundation.

**Status:** Reference narrative. The demo is a faithful experience-layer prototype; this document explains exactly what swaps to Salesforce and what stays in the Lovable/edge layer.

---

## 1. Executive summary

Telco Agent Assist is an AI-assisted, multi-agent console for contact-centre representatives selling and servicing wireless plans. It demonstrates a fast, opinionated, fast-food-grade UI on top of nine specialist "agents" (Plan Upgrade, Loyalty, Bundle, Billing Dispute, etc.) that are driven by a streaming LLM conversation, voice input, and AI-recommended action tiles.

The Headless360 pattern — Salesforce as the system of record and intelligence layer, with a decoupled experience layer — is a natural fit:

- **ARPU lift** from Agentforce-recommended upsell tiles that match Communications Cloud catalog offers.
- **AHT reduction** from voice transcription, intent detection, and one-click action execution.
- **Retention** from loyalty and dispute flows that honour Service Cloud entitlements and Data Cloud churn signals.
- **Lower cost-to-serve** because the front-end is a static SPA hosted outside the Salesforce runtime; only data and write operations cross into the core.

## 2. What "Headless360" means here

Headless360 decouples the **C360 experience** (what the agent sees and clicks) from the **C360 system of record** (Salesforce Service Cloud, Communications Cloud / Vlocity, Data Cloud, Agentforce, Loyalty Management). Salesforce remains the source of truth, identity, security and orchestration; the UI is free to be modern, fast and channel-specific.

In this demo:

- **Salesforce** owns Account, Asset, Order, Case, Loyalty, Billing, and the AI recommendation policy.
- **Lovable app (React SPA)** owns the agent experience — multi-agent stacking, combined checkout, voice, tile interactions.
- **Supabase Edge Functions** sit between them as a thin orchestration layer that talks to Salesforce REST/Data Cloud/Agentforce on the agent's behalf.

## 3. Current demo architecture (as built today)

```text
┌──────────────────────────────────────────────────────────────────┐
│                          TopBar (brand)                          │
├────────────────────────┬─────────────────────────────────────────┤
│  Conversation Panel    │  Multi-Agent Panel                      │
│  (Gemini stream)       │   • Customer Context card               │
│   • Chat messages      │   • Agent ribbon (9 specialists)        │
│   • Voice FAB (Mic)    │   • Active agent section(s), stacked    │
│   • Intent detection   │   • Combined Checkout                   │
│                        │   • Interaction Timeline                │
└────────────────────────┴─────────────────────────────────────────┘
        │                              │
        ▼                              ▼
  Supabase Edge Function       Supabase Edge Function
  agent-chat (Gemini 3 Flash)  transcribe-audio (Gemini)
        │                              │
        └──────── Lovable AI Gateway ──┘
```

**Stack:**

- React 18, Vite 5, TypeScript 5, Tailwind CSS v3, shadcn/ui, Framer Motion, lucide-react.
- React Router (classic SPA, no TanStack) — deploys as a static bundle to Firebase Hosting.
- Supabase Edge Functions (`agent-chat`, `transcribe-audio`, `get-client-info`) — Deno runtime.
- Lovable AI Gateway → `google/gemini-3-flash-preview` for both chat and transcription.
- Client-side NLU in `src/lib/intent-detection.ts` (27 option intents, 9 action intents) to keep the UI in sync with the streamed LLM response.
- Structured tags embedded in the LLM stream — `<customer_update>{…}</customer_update>` and `<quick_options>[…]</quick_options>` — drive the Customer Context card, the Timeline, and the dynamically-rendered action tiles.
- Access control restricted to `@techmahindra.com`, audit log written via `get-client-info` with geolocation.

## 4. Target Headless360 architecture (production)

```text
┌─────────────────────────────────────────────────────────────────────┐
│ Experience Layer                                                    │
│   React SPA (this app). Optionally embedded inside Service Console  │
│   via Open CTI / Lightning Out / iframe, or standalone PWA.         │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ HTTPS (JSON)
┌───────────────────────────────▼─────────────────────────────────────┐
│ Orchestration Layer                                                 │
│   Supabase Edge Functions (Deno). Responsibilities:                 │
│     • OAuth 2.0 JWT bearer auth to Salesforce (server-to-server)   │
│     • Lovable connector gateway → Salesforce REST (v62.0)           │
│     • LLM calls (Lovable AI Gateway → Gemini) for NLU + summaries  │
│     • Caching, rate limiting, audit logging                         │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│ Intelligence Layer                                                  │
│   Agentforce (Topics + Actions, Agent API)                          │
│   Einstein Next Best Action, Einstein Conversation Insights         │
│   Lovable AI Gateway (Gemini) for free-text conversation            │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│ System of Record                                                    │
│   Service Cloud  · Sales Cloud  · Communications Cloud (Vlocity)    │
│   Data Cloud (CDP, Calculated Insights)  · Loyalty Management       │
│   Industries Billing  · Order Management                            │
└───────────────────────────────┬─────────────────────────────────────┘
                                │
┌───────────────────────────────▼─────────────────────────────────────┐
│ Channels                                                            │
│   Service Cloud Voice (Amazon Connect) · Chat · Email · In-app      │
└─────────────────────────────────────────────────────────────────────┘
```

## 5. Salesforce touch points

Every visible element in the demo maps to a concrete Salesforce object or API.

| Demo feature | Salesforce object / API | Access pattern |
|---|---|---|
| Customer Context card (name, plan, ARPU, LTV, risk) | `Account`, `Contact`, `Asset`, Comms Cloud `vlocity_cmt__Account__c` + Data Cloud Unified Profile | REST `/sobjects` + SOQL through gateway; Data Cloud Query API for ARPU/LTV/risk |
| Customer lookup ("pull up John Davis") | Global Search | SOSL `/services/data/v62.0/search` |
| Interaction Timeline | `Case`, `Task`, `Event`, `LiveChatTranscript`, `VoiceCall`, `OrderHistory` | SOQL `ORDER BY CreatedDate DESC LIMIT 8` |
| Plan Upgrade agent + tiles | Comms Cloud CPQ (`vlocity_cmt__Offer__c`, `Product2`, `PricebookEntry`, `Order`) | Industries Digital Commerce API `getOffers`, `createCart`, `submitOrder` |
| Add-On Bundle agent | `Product2` + bundle structure + CPQ context rules | Digital Commerce `getOffersDetails` |
| Loyalty Reward agent | `LoyaltyProgramMember`, `TransactionJournal`, `LoyaltyTier` | Loyalty Management REST + Connect API |
| Device Trade-In agent | `Asset` (current device), `Product2` (target), trade-in valuation flow | Invocable Flow via REST |
| Home Internet Bundle | Comms Cloud serviceability + CPQ | Industries APIs |
| Premium Support agent | `Entitlement`, `ServiceContract` | REST `/sobjects/Entitlement` |
| Billing Dispute agent | Industries Billing (`BillingAccount`, `Invoice`, `Adjustment`) | Industries Billing REST |
| Account Suspend / Reactivate | `ContractLineItem`, `WorkOrder`, suspension Flow | REST + Flow invocation |
| Multi-Line Management | `Asset` hierarchy, `vlocity_cmt__FulfilmentRequest__c` | Order Management APIs |
| AI recommendations (the `<quick_options>` tiles) | Einstein Next Best Action strategies + Agentforce Topics/Actions | NBA REST `/connect/interaction/recommendations`; Agentforce Agent API |
| Voice transcription | Service Cloud Voice + Einstein Conversation Insights | SCV real-time transcript stream (today: client-side MediaRecorder → Gemini) |
| Combined Checkout (execute N actions) | Industries Order Management orchestration plan | One composite `POST /composite` request submitting all carts |
| Audit log (who pulled up which customer) | Platform Event + `EventLogFile` | Publish Platform Event from edge function |

## 6. Data retrieval patterns

Three patterns cover every read in the app.

### 6.1 Direct REST / SOQL via the Lovable connector gateway

Used for ad-hoc reads of standard objects (Account, Contact, Case, Asset). The Lovable Salesforce connector terminates OAuth, refreshes tokens, and applies API version `v62.0` automatically.

```ts
// Inside supabase/functions/agent-chat/index.ts (production version)
const GATEWAY_URL = "https://connector-gateway.lovable.dev/salesforce";
const soql = `
  SELECT Id, Name, Phone, AccountNumber,
         (SELECT Id, Name, SerialNumber FROM Assets),
         (SELECT Id, CaseNumber, Subject, Status FROM Cases ORDER BY CreatedDate DESC LIMIT 8)
  FROM Account WHERE Id = '${accountId}'
`;
const res = await fetch(`${GATEWAY_URL}/query?q=${encodeURIComponent(soql)}`, {
  headers: {
    Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
    "X-Connection-Api-Key": Deno.env.get("SALESFORCE_API_KEY")!,
  },
});
```

### 6.2 Data Cloud Query API

Used for the unified profile fields that today are mocked by the LLM (`arpu`, `ltv`, `riskScore`, `dataPercent`). Data Cloud holds the Calculated Insights that aggregate billing, usage, and churn signals across source systems.

```text
POST /services/data/v62.0/ssot/query
{
  "sql": "SELECT UnifiedIndividualId, arpu_12m__c, ltv__c, churn_risk__c
          FROM UnifiedIndividual__dlm
          WHERE crm_account_id__c = :accountId"
}
```

### 6.3 Agentforce / Einstein API

Replaces the Gemini-emitted `<quick_options>` block. In production, when the agent says "the customer wants to upgrade", the orchestration layer calls Agentforce with the conversation context; Agentforce returns the recommended offers (already priced, eligibility-checked, and rule-validated by Comms Cloud) and the next best action.

```text
POST /einstein/ai-agent/v1/agents/:agentId/sessions/:sessionId/messages
{
  "message": "Customer wants to upgrade plan",
  "context": { "accountId": "001…", "interactionId": "…" }
}
→ returns: { "recommendations": [ {offerId, label, price, highlight}, … ] }
```

### 6.4 End-to-end sequence — "upgrade plan" flow

```text
Agent voice/text  ──►  Intent detection (client)
                       │
                       ▼
                 Edge Function: agent-chat
                       │
        ┌──────────────┼──────────────────────┐
        ▼              ▼                      ▼
   Data Cloud    Digital Commerce       Agentforce
   (profile)     getOffers              recommend()
        │              │                      │
        └──────────────┴──────────────────────┘
                       │
                       ▼
              Stream back to UI:
              • Customer Context (refreshed)
              • 3 tiles in QuickSelectCard
              • Conversation summary

Agent clicks "Unlimited Premium $85/mo"
                       │
                       ▼
                 Edge Function: agent-chat
                       │
                       ▼
            Industries Order Management
            POST /composite (cart → order → activate)
                       │
                       ▼
            Order Id + ETA streamed back to UI;
            Combined Checkout shows ✓ Done.
```

## 7. Security and authentication

- **Server-to-server auth:** OAuth 2.0 JWT Bearer flow from the edge function to a scoped Connected App. No Salesforce session ever reaches the browser.
- **Per-user identity:** the Lovable app authenticates the contact-centre agent (today: `@techmahindra.com` allow-list via Supabase Auth). The agent's Salesforce user Id is forwarded as a header so Salesforce can enforce object-, field-, and row-level security via sharing rules and FLS.
- **Connector gateway:** secrets (`LOVABLE_API_KEY`, `SALESFORCE_API_KEY`) live only in Supabase Edge Function secrets — never in client code.
- **PII boundary:** Lovable Cloud stores only the audit trail (who logged in, from where, when); customer PII is fetched on-demand and never persisted.
- **Audit:** every customer lookup and every write action publishes a Platform Event to Salesforce so it shows up in standard Event Monitoring.

## 8. UI technology summary

| Concern | Choice | Why |
|---|---|---|
| Framework | React 18 + Vite 5 + TypeScript 5 | Fast HMR, static-SPA output, no vendor lock-in |
| Routing | React Router (classic) | Deploys cleanly to Firebase Hosting as static assets |
| Styling | Tailwind CSS v3 + shadcn/ui + semantic design tokens | Tomato-red / sunshine-yellow fast-food reskin via `src/index.css` |
| Animation | Framer Motion | Tile pulse, stacked-agent transitions, AI-pick glow |
| Icons / emoji | lucide-react + `src/lib/action-emoji.ts` | High-visibility iconography for entry-level operators |
| State | React hooks + URL state | No Redux/TanStack; preserves user's stack preference |
| AI / voice | Lovable AI Gateway (Gemini 3 Flash) via Supabase Edge Functions | One key, multiple models, no client-side secret |
| Backend runtime | Supabase Edge Functions (Deno) | Co-located with auth, secrets, and the connector gateway |
| Hosting | Firebase Hosting (static SPA, `dist/` → `public/`) | Global CDN, instant rollback |

## 9. Gap analysis — demo vs. production

| Capability | Today (demo) | Production (Headless360) | Effort |
|---|---|---|---|
| Customer profile | Gemini-generated JSON in `<customer_update>` | Account + Data Cloud Unified Profile | **M** |
| Timeline | Hardcoded `DEFAULT_TIMELINE` + LLM-generated | SOQL across Case/Task/VoiceCall | **S** |
| Quick-option tiles | `<quick_options>` from LLM | Agentforce + Comms Cloud Digital Commerce | **L** |
| Plan upgrade write | Simulated message | Industries Order Management `submitOrder` | **L** |
| Loyalty rewards | Static three tiles | Loyalty Management `LoyaltyProgramMember` redeem | **M** |
| Billing dispute | Simulated credit | Industries Billing `Adjustment` + Flow | **M** |
| Voice | MediaRecorder → Gemini | Service Cloud Voice real-time transcript + ECI | **L** |
| Recommendations | Intent regex + LLM judgement | Einstein NBA strategies + Agentforce Topics | **L** |
| Audit | Supabase row + client IP | Platform Event → Event Monitoring | **S** |
| Auth | Supabase email allow-list | SSO (SAML/OIDC) into Salesforce identity | **S** |

S ≈ 1–3 days · M ≈ 1–2 weeks · L ≈ 3–6 weeks of integration work per item.

## 10. Phased rollout

**Phase 1 — Read-only Customer 360 (2–3 weeks).** Replace the mocked Customer Context and Timeline with live Account, Asset, Case, and Data Cloud reads. Salesforce remains read-only; tiles still come from the LLM.

**Phase 2 — Agentforce-driven recommendations (3–4 weeks).** Swap the `<quick_options>` source from Gemini to Agentforce + NBA. Tiles become eligibility-checked and priced by Comms Cloud.

**Phase 3 — Transactional writes (4–6 weeks).** Wire Plan Upgrade, Add-On Bundle, Loyalty redeem, Billing dispute, and Multi-Line Management to Industries Order Management, Loyalty, and Billing APIs. Combined Checkout becomes a real composite order submission.

**Phase 4 — Voice + omni-channel (4–6 weeks).** Replace the browser voice pipeline with Service Cloud Voice; pipe ECI insights into the conversation stream. Embed the SPA inside the Service Console via Open CTI for screen-pop.

## 11. Appendix — glossary

- **Headless360** — architecture pattern that separates Salesforce's Customer 360 data and intelligence from the presentation tier.
- **Service Cloud Voice (SCV)** — Salesforce-native telephony with real-time transcription, typically backed by Amazon Connect.
- **Communications Cloud (Vlocity)** — industry-specific CPQ, order management, and catalog for telco.
- **Data Cloud (CDP)** — Salesforce's customer data platform, source of the Unified Profile and Calculated Insights.
- **Agentforce** — Salesforce's autonomous AI agent platform (Topics, Actions, Agent API).
- **Einstein Next Best Action (NBA)** — recommendation engine that evaluates strategies against context and returns ranked actions.
- **Einstein Conversation Insights (ECI)** — analyses voice/chat transcripts for sentiment, mentions, and coaching signals.
- **Open CTI** — Salesforce framework for embedding a third-party softphone/agent UI inside the Service Console.

---

*Document owner: Tech Mahindra Telco Agent Assist team. Update with each architectural change.*
