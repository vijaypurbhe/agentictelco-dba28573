
## Goal

Produce a narrative document that explains how the **Telco Agent Assist** demo (this app) maps to a **Salesforce Headless360** architecture — covering Salesforce touch points, data retrieval patterns, the UI stack already in use, and the overall end-to-end architecture.

## Deliverable

A single document checked into the repo at:

- `docs/SALESFORCE_HEADLESS360_ARCHITECTURE.md` (primary, source of truth, easy to diff/review)

Plus an exported Word version for sharing with non-technical stakeholders:

- `/mnt/documents/Telco_Agent_Assist_Headless360_Architecture.docx` (generated via the `docx` skill so it can be downloaded)

## Document outline

1. **Executive summary** — what the demo shows, why Headless360 fits, business outcomes (ARPU lift, AHT reduction, retention).
2. **What "Headless360" means here** — decoupling Salesforce Service Cloud / Data Cloud / Agentforce from the presentation layer; Salesforce as the system of record + intelligence, Lovable app as the experience layer.
3. **Current demo architecture (as built today)**
   - React 18 + Vite 5 + TypeScript + Tailwind + shadcn/ui
   - Framer Motion, lucide-react, custom design tokens (fast-food reskin)
   - Supabase Edge Functions (`agent-chat`, `transcribe-audio`) + Lovable AI Gateway (Gemini 3 Flash)
   - Client-side intent detection (`src/lib/intent-detection.ts`) driving 9 specialist agents
   - Voice pipeline (MediaRecorder → silence detection → Gemini transcription)
   - Structured AI tags (`<customer_update>`, `<quick_options>`) that drive dynamic tiles, customer context, and timeline
   - ASCII diagram of the split-panel UI (reuse from `DEMO_GUIDE.md`)
4. **Target Headless360 architecture (production mapping)** with an ASCII layer diagram:
   ```
   Experience Layer  : React SPA (this app), embedded in Service Console via Open CTI / Omni-Channel
   Orchestration     : Supabase Edge Functions  →  MuleSoft / Salesforce Connect REST proxy
   Intelligence      : Agentforce / Einstein + Lovable AI Gateway (Gemini) for NLU + summarization
   System of Record  : Service Cloud, Sales Cloud, Communications Cloud (Vlocity), Data Cloud (CDP)
   Channels          : Voice (SCV / Amazon Connect), Chat, Email, In-app
   ```
5. **Salesforce touch points** — table mapping each demo feature to the Salesforce object/API:
   | Demo feature | Salesforce object / API | Access pattern |
   |---|---|---|
   | Customer Context card | `Account`, `Contact`, `Asset`, Comms Cloud `vlocity_cmt__Account__c` | REST `/sobjects` + SOQL via gateway |
   | Plan / ARPU / LTV | Data Cloud Calculated Insights, CDP Unified Profile | Data Cloud Query API |
   | Interaction Timeline | `Case`, `Task`, `Event`, `LiveChatTranscript`, `VoiceCall` | SOQL with `ORDER BY CreatedDate` |
   | Plan Upgrade agent | Comms Cloud CPQ (`vlocity_cmt__Offer__c`, `Order`) | Industries CPQ APIs / Digital Commerce API |
   | Bundle / Add-on agent | Product2 + PricebookEntry + CPQ | Digital Commerce `getOffers` |
   | Loyalty Reward agent | Loyalty Management (`LoyaltyProgramMember`, `TransactionJournal`) | REST + Connect API |
   | Billing Dispute agent | Industries Billing / `BillingAccount`, `Invoice` | REST |
   | Account Suspend/Reactivate | `ContractLineItem`, `WorkOrder` | REST + Flow invocation |
   | Multi-Line Management | `Asset` hierarchy, `vlocity_cmt__FulfilmentRequest__c` | Order Management APIs |
   | Agent recommendations | Einstein Next Best Action / Agentforce Topics + Actions | NBA REST / Agentforce Agent API |
   | Voice transcription | Service Cloud Voice + Einstein Conversation Insights | SCV real-time transcript stream |
   | Customer lookup ("pull up John Davis") | SOSL / Global Search | `/services/data/vXX.X/search` |
6. **Data retrieval patterns** — three patterns and when to use each:
   - **Direct REST / SOQL** through the Lovable connector gateway (`https://connector-gateway.lovable.dev/salesforce/...`) — used for ad-hoc reads (Cases, Contacts).
   - **Data Cloud Query API** — used for unified 360° profile, ARPU, LTV, churn score (the fields shown in the Customer Context card).
   - **Agentforce / Einstein API** — used for the recommendation engine that today is simulated by Gemini + intent detection; in production Agentforce returns the structured `quick_options` and next-best-action.
   - Sequence diagram (ASCII) for a representative flow: *"Agent says 'upgrade plan' → intent detected → Edge Function → Salesforce Digital Commerce `getOffers` → 3 tiles rendered → agent clicks → Order submitted via Industries Order Management."*
7. **Security & auth** — OAuth 2.0 JWT bearer flow from Edge Function to Salesforce, scoped connected app, field-level security honored by REST, PII never stored in Lovable Cloud, audit logging (already in `supabase/functions/get-client-info` and the `@techmahindra.com` access restriction).
8. **UI technology summary** — concrete versions and rationale (React 18, Vite 5, Tailwind v3, shadcn/ui, Framer Motion, TanStack-free per project preference, Supabase JS client, deployment to Firebase Hosting as static SPA).
9. **Gap analysis: demo vs. production** — what is mocked today (Gemini-generated customer JSON, hardcoded timeline) vs. what swaps to live Salesforce calls; effort estimate per swap (S/M/L).
10. **Build plan / phased rollout** — Phase 1 read-only Customer 360, Phase 2 Agentforce recommendations, Phase 3 transactional writes (orders, cases), Phase 4 SCV voice + real-time transcript.
11. **Appendix** — glossary (Headless360, Data Cloud, Agentforce, SCV, NBA), reference links.

## Technical notes

- Markdown file is hand-authored; no code changes to the app itself.
- DOCX export uses the bundled `docx` skill (`docx-js` + validation script) so it renders cleanly in Word/Google Docs. Page size US Letter, Arial, semantic Heading 1/2/3, real bullet lists (no unicode bullets), one table for the touch-point mapping.
- ASCII diagrams kept inside fenced ```text blocks per plan-mode formatting rules.
- No new dependencies, no schema changes, no edge function changes.

## Out of scope

- Implementing any of the Salesforce integrations in code.
- Changing the demo UI.
- Wiring a real Salesforce connection (would require `standard_connectors--connect salesforce` — can be a follow-up).
