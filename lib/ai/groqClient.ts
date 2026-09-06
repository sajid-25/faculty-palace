import Groq from "groq-sdk";

let groqInstance: Groq | null = null;

export function getGroqClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is not configured in the environment variables. Please check your .env.local file."
    );
  }

  if (!groqInstance) {
    groqInstance = new Groq({ apiKey });
  }

  return groqInstance;
}

export function getDefaultModel(): string {
  return process.env.GROQ_MODEL || "qwen/qwen3.8-27b";
}
