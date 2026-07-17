/**
 * Lightweight Anthropic API wrapper using fetch().
 * Replaces the heavy @anthropic-ai/sdk package to reduce bundle size.
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

interface AnthropicResponse {
  content: Array<{ type: string; text: string }>;
  model: string;
  stop_reason: string;
}

export async function createMessage(options: {
  model: string;
  max_tokens: number;
  system?: string;
  messages: AnthropicMessage[];
  temperature?: number;
}): Promise<AnthropicResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is missing.");
  }

  const body: Record<string, unknown> = {
    model: options.model,
    max_tokens: options.max_tokens,
    messages: options.messages,
  };

  if (options.system) {
    body.system = options.system;
  }
  if (options.temperature !== undefined) {
    body.temperature = options.temperature;
  }

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-beta": "max-tokens-3-5-sonnet-2024-07-15",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Anthropic API error (${res.status}): ${errText}`);
  }

  return res.json();
}
