import { MODEL, ENDPOINT, TIMEOUT_MS, thinkingConfig, sanitizeInput, extractJson, buildPrompt } from "./_gemma.js";
import { APPROVED_OFFERINGS } from "./_curated_knowledge.js";

// Rate limiting map: simple sliding window per IP
const ipRequests = new Map();
const IP_LIMIT_PER_MINUTE = 15;

function checkRateLimit(ip) {
  const now = Date.now();
  const timestamps = ipRequests.get(ip) || [];
  const recent = timestamps.filter(t => now - t < 60000);
  if (recent.length >= IP_LIMIT_PER_MINUTE) return false;
  recent.push(now);
  ipRequests.set(ip, recent);
  return true;
}

export default async function handler(req, res) {
  // CORS & method check
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clientIp = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket?.remoteAddress || "anonymous";
  if (!checkRateLimit(clientIp)) {
    return res.status(429).json({ error: "Rate limit exceeded. Please wait a moment." });
  }

  const { offeringId, language, question } = req.body || {};

  // Validate offering ID strictly against server-side approved list
  if (!offeringId || !APPROVED_OFFERINGS[offeringId]) {
    return res.status(400).json({ error: "Invalid or unsupported offering ID" });
  }

  const cleanQuestion = sanitizeInput(question);
  if (!cleanQuestion) {
    return res.status(400).json({ error: "Question cannot be empty" });
  }

  if (typeof question === "string" && question.length > 500) {
    return res.status(400).json({ error: "Question exceeds maximum length of 500 characters" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "unset") {
    return res.status(503).json({
      fallback: true,
      reason: "model_unavailable",
      message: "Gemma model service is not configured with an API key."
    });
  }

  const lang = language === "es" ? "es" : "en";
  const prompt = buildPrompt({
    offeringId,
    language: lang,
    userQuestion: cleanQuestion
  });

  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 350,
      responseMimeType: "application/json"
    }
  };

  const tc = thinkingConfig();
  if (tc) payload.generationConfig.thinkingConfig = tc;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const apiRes = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!apiRes.ok) {
      console.error(`Gemma API HTTP Error: ${apiRes.status}`);
      return res.status(502).json({
        fallback: true,
        reason: `model_http_${apiRes.status}`,
        message: "External model inference error"
      });
    }

    const data = await apiRes.json();
    const result = extractJson(data);

    // Validate model output shape and non-empty answer
    if (!result || typeof result.answer !== "string" || !result.answer.trim()) {
      throw new Error("Invalid or empty model response format");
    }

    // Verify model did not inject unauthorized sources
    const allowedSources = APPROVED_OFFERINGS[offeringId].sources;
    const validatedMention = allowedSources.join(" / ");

    return res.status(200).json({
      success: true,
      provider: "gemma-4",
      model: MODEL,
      answer: result.answer.trim().slice(0, 500),
      sourceMention: validatedMention
    });
  } catch (err) {
    const isTimeout = err.name === "AbortError";
    console.error(`Inference error (timeout=${isTimeout}):`, err.message);
    return res.status(isTimeout ? 504 : 500).json({
      fallback: true,
      reason: isTimeout ? "model_timeout" : "model_inference_failed",
      message: isTimeout
        ? "Gemma request timed out"
        : "The cultural explanation service is temporarily unavailable. Using curated guidance."
    });
  } finally {
    clearTimeout(timer);
  }
}
