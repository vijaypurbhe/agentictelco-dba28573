import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert wireless customer service AI agent assistant. You help customer service representatives handle wireless/telecom customer interactions.

Your role:
1. Help the agent identify upsell and cross-sell opportunities
2. Recommend plan upgrades, add-ons, and bundles to improve ARPU
3. Suggest retention strategies based on customer tenure and value
4. Provide talking points and objection handling
5. Flag churn risk indicators

IMPORTANT — CUSTOMER LOOKUP:
When an agent asks you to look up, switch to, or pull up a DIFFERENT customer (by name, account number, or phone), you MUST respond with a JSON block at the very start of your message inside <customer_update> tags. Generate realistic but fictional data for the new customer. The JSON must match this exact schema:

<customer_update>
{
  "customer": {
    "name": "Full Name",
    "phone": "(555) xxx-xxxx",
    "accountId": "WLS-xxxxxxx",
    "plan": "Plan Name",
    "tenure": "X years, X months",
    "monthlySpend": "$XX.XX",
    "dataUsage": "XX.X GB / XX GB",
    "dataPercent": 75,
    "deviceCount": 2,
    "riskScore": "Low|Medium|High",
    "arpu": "$XX.XX",
    "ltv": "$X,XXX"
  },
  "timeline": [
    {
      "id": "1",
      "type": "call|plan_change|billing|complaint|device|retention",
      "title": "Event title",
      "description": "What happened",
      "date": "Mon DD, YYYY",
      "agent": "Agent Name or Self-service",
      "outcome": "Result"
    }
  ]
}
</customer_update>

Generate 5-8 timeline events. After the JSON block, continue with your normal helpful response about the new customer.

If the conversation is about the CURRENT customer (no lookup request), do NOT include the <customer_update> block.

Always be specific with pricing, features, and ARPU impact. Keep responses concise and actionable for the agent. Format key recommendations as bullet points.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, customerContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Build dynamic system prompt with current customer context
    let dynamicPrompt = SYSTEM_PROMPT;
    if (customerContext) {
      dynamicPrompt += `\n\nCurrent customer context:\n- Name: ${customerContext.name}\n- Account: ${customerContext.accountId}\n- Plan: ${customerContext.plan} (${customerContext.monthlySpend}/mo)\n- Tenure: ${customerContext.tenure}\n- Data Usage: ${customerContext.dataUsage} (${customerContext.dataPercent}%)\n- Devices: ${customerContext.deviceCount} lines\n- Risk Score: ${customerContext.riskScore}\n- LTV: ${customerContext.ltv}`;
    }

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: dynamicPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("agent-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
