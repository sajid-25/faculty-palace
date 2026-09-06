import { getGroqClient, getDefaultModel } from "./groqClient";

export interface GroqCallOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  responseFormat?: "json_object" | "text";
}

export interface GroqTelemetry {
  model: string;
  latencyMs: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface GroqCallResult<T = unknown> {
  data: T;
  rawContent: string;
  telemetry: GroqTelemetry;
}

/**
 * Executes a structured Groq API call with JSON validation, automatic 1x retry on malformed JSON, and telemetry logging.
 *
 * @template T Expected parsed JSON shape
 * @param prompt The user prompt to send to the model
 * @param options Optional configuration overrides (model, temperature, system prompt)
 */
export async function callGroq<T = unknown>(
  prompt: string,
  options: GroqCallOptions = {}
): Promise<GroqCallResult<T>> {
  const groq = getGroqClient();
  const model = options.model || getDefaultModel();
  const temperature = options.temperature ?? 0.1;
  const maxTokens = options.maxTokens ?? 4096;
  const systemPrompt =
    options.systemPrompt ||
    "You are an expert AI academic assessment auditor. Always respond with valid JSON adhering to the specified schema.";

  const isJsonMode = options.responseFormat !== "text";

  const executeAttempt = async (isRetry = false): Promise<GroqCallResult<T>> => {
    const startTime = performance.now();

    const messages = [
      { role: "system" as const, content: systemPrompt },
      {
        role: "user" as const,
        content: isRetry
          ? `${prompt}\n\nIMPORTANT: Your previous response was not valid JSON. Ensure your output is strictly valid JSON without any markdown or conversational wrapper.`
          : prompt,
      },
    ];

    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      response_format: isJsonMode ? { type: "json_object" } : undefined,
    });

    const endTime = performance.now();
    const latencyMs = Math.round(endTime - startTime);

    const rawContent = completion.choices[0]?.message?.content || "";
    const usage = completion.usage || {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
    };

    const telemetry: GroqTelemetry = {
      model,
      latencyMs,
      promptTokens: usage.prompt_tokens,
      completionTokens: usage.completion_tokens,
      totalTokens: usage.total_tokens,
    };

    console.log(
      `[Groq AI Service] Model: ${telemetry.model} | Latency: ${telemetry.latencyMs}ms | Tokens: ${telemetry.totalTokens} (Prompt: ${telemetry.promptTokens}, Completion: ${telemetry.completionTokens})`
    );

    if (!isJsonMode) {
      return {
        data: rawContent as unknown as T,
        rawContent,
        telemetry,
      };
    }

    // JSON parsing and validation
    try {
      // Clean possible markdown code fences if model accidentally wrapped json
      let sanitized = rawContent.trim();
      if (sanitized.startsWith("```json")) {
        sanitized = sanitized.slice(7);
      } else if (sanitized.startsWith("```")) {
        sanitized = sanitized.slice(3);
      }
      if (sanitized.endsWith("```")) {
        sanitized = sanitized.slice(0, -3);
      }
      sanitized = sanitized.trim();

      const parsed = JSON.parse(sanitized) as T;
      return {
        data: parsed,
        rawContent,
        telemetry,
      };
    } catch (parseError: unknown) {
      const errMessage = parseError instanceof Error ? parseError.message : "Malformed JSON response";
      if (!isRetry) {
        console.warn(
          `[Groq AI Service] Malformed JSON received from ${model}. Retrying once... Error: ${errMessage}`
        );
        return await executeAttempt(true);
      }

      throw new Error(
        `[Groq AI Service] Failed to parse JSON response from model '${model}' after retry. Raw response:\n${rawContent.slice(
          0,
          300
        )}\nParse error: ${errMessage}`
      );
    }
  };

  try {
    return await executeAttempt(false);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[Groq AI Service Error] ${errorMsg}`);
    throw err;
  }
}
