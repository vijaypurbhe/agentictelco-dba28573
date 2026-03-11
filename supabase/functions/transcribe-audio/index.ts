import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_LANGUAGE_HINT = "en-US";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, format, languageHint } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!audio || typeof audio !== "string") {
      return new Response(
        JSON.stringify({ error: "No audio data provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedFormat = normalizeAudioFormat(format);
    const normalizedLanguageHint = typeof languageHint === "string" && languageHint.trim()
      ? languageHint.trim()
      : DEFAULT_LANGUAGE_HINT;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        temperature: 0,
        max_completion_tokens: 120,
        messages: [
          {
            role: "system",
            content: [
              "You are a speech-to-text engine for short voice commands.",
              `Primary language hint: ${normalizedLanguageHint}.`,
              "Transcribe exactly what is spoken.",
              "Do not translate.",
              "Do not summarize.",
              "Do not infer missing words.",
              "If the audio is unclear, silent, mostly noise, music, singing, solfege, or not understandable, return an empty string.",
              "Return only the transcript text with no labels or quotes.",
            ].join(" "),
          },
          {
            role: "user",
            content: [
              {
                type: "input_audio",
                input_audio: {
                  data: audio,
                  format: normalizedFormat,
                },
              },
              {
                type: "text",
                text: `Transcribe this voice command in ${normalizedLanguageHint}. If it is not clear spoken language, return an empty string.`,
              },
            ],
          },
        ],
      }),
    });

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
      const text = await response.text();
      console.error("Transcription gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "Transcription service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const transcript = sanitizeTranscript(data.choices?.[0]?.message?.content, normalizedLanguageHint);

    return new Response(
      JSON.stringify({ transcript }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("transcribe-audio error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function normalizeAudioFormat(format?: string) {
  switch (format) {
    case "mp3":
    case "ogg":
    case "mp4":
    case "webm":
    case "wav":
      return format;
    default:
      return "wav";
  }
}

function sanitizeTranscript(value: unknown, languageHint: string) {
  if (typeof value !== "string") return "";

  const transcript = value.trim().replace(/^['"`\s]+|['"`\s]+$/g, "");
  if (!transcript) return "";

  if (languageHint.toLowerCase().startsWith("en") && !looksMostlyLatin(transcript)) {
    return "";
  }

  return transcript;
}

function looksMostlyLatin(value: string) {
  const letters = value.match(/\p{L}/gu) ?? [];
  if (letters.length === 0) return true;

  const latinLetters = value.match(/[A-Za-z]/g) ?? [];
  return latinLetters.length / letters.length >= 0.6;
}
