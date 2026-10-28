import http from "node:http";
import assert from "node:assert/strict";
import test from "node:test";
import { MODEL } from "../api/_gemma.js";
import handler from "../api/explain.js";

// Mock fetch provider
function withMockProvider(mockFn, testBody) {
  const origFetch = globalThis.fetch;
  globalThis.fetch = mockFn;
  return Promise.resolve()
    .then(testBody)
    .finally(() => {
      globalThis.fetch = origFetch;
    });
}

function callMockHandler(body, envKey = "mock_key") {
  return new Promise((resolve) => {
    const origKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = envKey;

    const req = {
      method: "POST",
      body,
      headers: { "x-forwarded-for": `10.0.0.${Math.floor(Math.random() * 500)}` }
    };

    let statusCode = 200;
    let resJson = null;

    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      setHeader() {
        return this;
      },
      json(data) {
        resJson = data;
        process.env.GEMINI_API_KEY = origKey;
        resolve({ status: statusCode, data: resJson });
      }
    };

    handler(req, res).catch((err) => {
      process.env.GEMINI_API_KEY = origKey;
      resolve({ status: 500, error: err.message });
    });
  });
}

test("Mock Integration: Successful English Gemma response", async () => {
  await withMockProvider(async (url, opts) => {
    assert.match(url, new RegExp(MODEL));
    assert.equal(opts.headers["x-goog-api-key"], "mock_key");
    return {
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    answer: "Marigolds are traditional guiding flowers whose vibrant color welcomes souls.",
                    sourceMention: "INAH / UNESCO"
                  })
                }
              ]
            }
          }
        ]
      })
    };
  }, async () => {
    const res = await callMockHandler({
      offeringId: "flowers",
      language: "en",
      question: "Why marigolds?"
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.model, MODEL);
    assert.equal(res.data.sourceMention, "INAH / UNESCO");
    assert.match(res.data.answer, /guiding flowers/);
  });
});

test("Mock Integration: Successful Spanish Gemma response", async () => {
  await withMockProvider(async (url, opts) => {
    return {
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    answer: "El cempasúchil es una flor tradicional que guía el camino de las almas.",
                    sourceMention: "INAH / UNESCO"
                  })
                }
              ]
            }
          }
        ]
      })
    };
  }, async () => {
    const res = await callMockHandler({
      offeringId: "flowers",
      language: "es",
      question: "¿Por qué cempasúchil?"
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.match(res.data.answer, /flor tradicional/);
  });
});

test("Mock Integration: Provider timeout triggers 504 with fallback signal", async () => {
  await withMockProvider(async () => {
    const abortErr = new Error("AbortError");
    abortErr.name = "AbortError";
    throw abortErr;
  }, async () => {
    const res = await callMockHandler({
      offeringId: "flowers",
      language: "en",
      question: "Will it timeout?"
    });
    assert.equal(res.status, 504);
    assert.equal(res.data.fallback, true);
    assert.equal(res.data.reason, "model_timeout");
  });
});

test("Mock Integration: Provider 500 error triggers 502 with fallback signal", async () => {
  await withMockProvider(async () => {
    return { ok: false, status: 500 };
  }, async () => {
    const res = await callMockHandler({
      offeringId: "flowers",
      language: "en",
      question: "Provider down?"
    });
    assert.equal(res.status, 502);
    assert.equal(res.data.fallback, true);
    assert.equal(res.data.reason, "model_http_500");
  });
});

test("Mock Integration: Model returns unexpected text instead of JSON format", async () => {
  await withMockProvider(async () => {
    return {
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: "I cannot answer this question in JSON format." }]
            }
          }
        ]
      })
    };
  }, async () => {
    const res = await callMockHandler({
      offeringId: "candles",
      language: "en",
      question: "Invalid JSON response?"
    });
    assert.equal(res.status, 500);
    assert.equal(res.data.fallback, true);
    assert.equal(res.data.reason, "model_inference_failed");
    assert.equal(res.data.message.includes("Unexpected token"), false, "Must not leak internal stack/syntax errors to visitor");
  });
});

test("Mock Integration: Rejects empty or whitespace-only answer string as invalid", async () => {
  await withMockProvider(async () => {
    return {
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [{ text: '{\n  "answer": "   ",\n  "sourceMention": "INAH"\n}' }]
            }
          }
        ]
      })
    };
  }, async () => {
    const res = await callMockHandler({
      offeringId: "bread",
      language: "en",
      question: "Tell me about bread"
    });
    assert.equal(res.status, 500);
    assert.equal(res.data.fallback, true);
    assert.equal(res.data.reason, "model_inference_failed");
    assert.equal(res.data.message.includes("temporarily unavailable"), true, "Returns sanitized visitor-facing message");
  });
});

test("Client Async Race Condition: State currentRequestId cancels stale responses", () => {
  // Test simulated race condition logic matching main.js
  let state = {
    selected: "flowers",
    language: "en",
    currentRequestId: 1
  };

  const oldRequestId = state.currentRequestId;
  const initialOffering = state.selected;
  const initialLanguage = state.language;

  // Visitor switches to bread and Spanish while request 1 is still in flight
  state.currentRequestId++;
  state.selected = "bread";
  state.language = "es";

  // Simulate arrival of old request 1 response
  const isStale = (
    oldRequestId !== state.currentRequestId ||
    initialOffering !== state.selected ||
    initialLanguage !== state.language
  );

  assert.equal(isStale, true, "Stale async response is identified and discarded");
});

test("Regression: Spanish Gemma question for bread addresses bread, not marigolds", async () => {
  await withMockProvider(async (url, opts) => {
    const payload = JSON.parse(opts.body);
    const userPrompt = payload.contents[0].parts[0].text;
    assert.match(userPrompt, /Element: PAN DE MUERTO/, "Gemma prompt must be grounded in bread, not flowers");
    assert.match(userPrompt, /pan de muerto/i, "User question must be passed to prompt");
    return {
      ok: true,
      json: async () => ({
        candidates: [
          {
            content: {
              parts: [
                {
                  text: JSON.stringify({
                    answer: "El pan de muerto es un alimento sagrado colocado en la ofrenda que simboliza la fraternidad y el recuerdo.",
                    sourceMention: "INAH"
                  })
                }
              ]
            }
          }
        ]
      })
    };
  }, async () => {
    const res = await callMockHandler({
      offeringId: "bread",
      language: "es",
      question: "¿Cuál es el significado del pan de muerto?"
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.match(res.data.answer, /pan de muerto/);
    assert.equal(res.data.sourceMention, "INAH");
  });
});


