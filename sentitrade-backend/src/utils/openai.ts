import OpenAI from "openai";

import { logger } from "./logger";

let openAIClient: OpenAI | null | undefined;

function getClient(): OpenAI | null {
  if (openAIClient !== undefined) {
    return openAIClient;
  }

  if (!process.env.OPENAI_API_KEY) {
    logger.warn("OPENAI_API_KEY is missing; AI agents will use graceful fallbacks");
    openAIClient = null;
    return openAIClient;
  }

  openAIClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return openAIClient;
}

function extractJsonPayload(rawText: string): string {
  const trimmed = rawText.trim();
  const objectStart = trimmed.indexOf("{");
  const objectEnd = trimmed.lastIndexOf("}");

  if (objectStart >= 0 && objectEnd > objectStart) {
    return trimmed.slice(objectStart, objectEnd + 1);
  }

  const arrayStart = trimmed.indexOf("[");
  const arrayEnd = trimmed.lastIndexOf("]");

  if (arrayStart >= 0 && arrayEnd > arrayStart) {
    return trimmed.slice(arrayStart, arrayEnd + 1);
  }

  return trimmed;
}

export async function runJsonModel<T>(
  model: string,
  systemPrompt: string,
  input: unknown,
): Promise<T> {
  const client = getClient();

  if (!client) {
    throw new Error("OpenAI client unavailable");
  }

  const response = await client.responses.create({
    model,
    instructions: systemPrompt,
    input: JSON.stringify(input),
  });

  const outputText = response.output_text?.trim();

  if (!outputText) {
    throw new Error("Model returned an empty response");
  }

  return JSON.parse(extractJsonPayload(outputText)) as T;
}
