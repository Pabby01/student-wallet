import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SYSTEM = `You are a receipt parser. Given a photo of a paper receipt or a mobile money / POS slip, extract structured fields.
Return ONLY valid JSON matching this schema (no markdown, no commentary):
{
  "amount": number | null,            // total paid, naira; numbers only
  "merchant": string | null,          // shop / vendor / seller name
  "date": string | null,              // ISO yyyy-mm-dd; if you cannot read it, null
  "description": string | null,       // short summary of items, max 80 chars
  "category_hint": string | null      // one of: Food, Transport, Academic, Airtime/Data, Entertainment, Shopping, Bills, Other
}
If the image is not a receipt, return all nulls.`;

export const scanReceipt = createServerFn({ method: "POST" })
  .validator(
    z.object({
      imageDataUrl: z.string().min(20), // data:image/...;base64,XXXX
    }),
  )
  .handler(async ({ data }) => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    const apiUrl =
      process.env.OPENROUTER_API_URL ?? "https://openrouter.ai/api/v1/chat/completions";
    const model = process.env.OPENROUTER_MODEL ?? "google/gemini-flash-1.5";

    if (!apiKey) {
      throw new Error("Missing OPENROUTER_API_KEY environment variable.");
    }

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract the fields from this receipt." },
              { type: "image_url", image_url: { url: data.imageDataUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      if (res.status === 429) throw new Error("Rate limited. Please wait a moment and try again.");
      if (res.status === 402)
        throw new Error("Receipt scanning credits are unavailable. Try again later.");
      throw new Error(`Scan failed (${res.status}): ${txt.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "{}";
    let parsed: {
      amount?: number | null;
      merchant?: string | null;
      date?: string | null;
      description?: string | null;
      category_hint?: string | null;
    } = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to recover a JSON blob from the string
      const m = content.match(/\{[\s\S]*\}/);
      if (m) {
        try {
          parsed = JSON.parse(m[0]);
        } catch {
          parsed = {};
        }
      }
    }

    return {
      amount: typeof parsed.amount === "number" ? parsed.amount : null,
      merchant: parsed.merchant ?? null,
      date: parsed.date ?? null,
      description: parsed.description ?? null,
      categoryHint: parsed.category_hint ?? null,
    };
  });
