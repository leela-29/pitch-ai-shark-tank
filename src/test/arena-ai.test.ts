import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  checkGeminiConnection,
  generateGeminiAssessment,
  generateGeminiQuestions,
} from "@/lib/arena-ai.server";
import { examplePitch } from "@/lib/arena-engine";

function modelResponse(value: unknown) {
  return new Response(
    JSON.stringify({
      candidates: [{ content: { parts: [{ text: JSON.stringify(value) }] } }],
    }),
    { status: 200 },
  );
}

describe("Gemini arena provider", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("GOOGLE_API_KEY", "test-key");
    vi.stubGlobal("fetch", fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("generates one validated question for each investor in panel order", async () => {
    fetchMock.mockResolvedValue(
      modelResponse({
        questions: ["Business", "Growth", "Tech", "Brutal"].map((name) => ({
          question: `${name}: How will this specific startup prove its most important assumption?`,
          hint: "Give a measurable experiment, a timeline, and the result that would change your decision.",
        })),
      }),
    );

    const questions = await generateGeminiQuestions(examplePitch);

    expect(questions.map((question) => question.shark)).toEqual([
      "business",
      "growth",
      "tech",
      "brutal",
    ]);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toContain("generativelanguage.googleapis.com/v1beta/models/");
    expect(url).toContain("gemini-3.5-flash:generateContent");
    expect(new Headers(init?.headers).get("x-goog-api-key")).toBe("test-key");
    expect(JSON.stringify(init?.body)).toContain("responseMimeType");
  });

  it("returns validated AI assessment content and no offer when Gemini declines", async () => {
    fetchMock.mockResolvedValue(
      modelResponse({
        overall: 54,
        categories: [
          { name: "Problem", score: 60, advice: "Validate demand with paying target customers." },
          {
            name: "Innovation",
            score: 55,
            advice: "Test whether customers value this difference.",
          },
          { name: "Market", score: 50, advice: "Measure one repeatable acquisition channel." },
          {
            name: "Business Model",
            score: 45,
            advice: "Verify costs and margins with a small pilot.",
          },
          { name: "Scalability", score: 60, advice: "Measure delivery effort before expanding." },
        ],
        strengths: [
          "The initial target group is clearly described.",
          "The first version can be tested in one neighborhood.",
        ],
        weakness: "There is not yet evidence that customers will pay.",
        improvements: [
          "Interview ten likely customers and record current spending.",
          "Offer a paid pilot to a small group this month.",
          "Track cost per order and gross margin before expanding.",
        ],
        verdicts: ["business", "growth", "tech", "brutal"].map((shark) => ({
          shark,
          invests: false,
          reason: "I need customer evidence before I can support this investment.",
        })),
        offer: { recommended: false, amount: 0, equity: 0 },
      }),
    );

    const result = await generateGeminiAssessment(examplePitch, [
      "Answer one",
      "Answer two",
      "Answer three",
      "Answer four",
    ]);

    expect(result.overall).toBe(54);
    expect(result.categories.map((category) => category.name)).toEqual([
      "Problem",
      "Innovation",
      "Market",
      "Business Model",
      "Scalability",
    ]);
    expect(result.verdicts.map((verdict) => verdict.shark)).toEqual([
      "business",
      "growth",
      "tech",
      "brutal",
    ]);
    expect(result.offer).toBeNull();
  });

  it("fails clearly without a configured server API key", async () => {
    vi.stubEnv("GOOGLE_API_KEY", "");

    await expect(generateGeminiQuestions(examplePitch)).rejects.toThrow(/GOOGLE_API_KEY/);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("confirms service connectivity only after a valid Gemini response", async () => {
    fetchMock.mockResolvedValue(modelResponse({ status: "ok" }));

    await expect(checkGeminiConnection()).resolves.toEqual({ model: "gemini-3.5-flash" });
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("rejects malformed model output instead of returning a fallback result", async () => {
    fetchMock.mockResolvedValue(modelResponse({ questions: [] }));

    await expect(generateGeminiQuestions(examplePitch)).rejects.toThrow();
  });
});
