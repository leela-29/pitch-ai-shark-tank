import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  checkGeminiConnection,
  generateGeminiAssessment,
  generateGeminiQuestions,
} from "./arena-ai.server";

const pitchSchema = z.object({
  name: z.string().trim().min(3).max(80),
  problem: z.string().trim().min(3).max(1500),
  solution: z.string().trim().min(3).max(1500),
  customers: z.string().trim().min(3).max(1500),
  model: z.string().trim().min(3).max(1500),
});

export const getAiQuestions = createServerFn({ method: "POST" })
  .validator(pitchSchema)
  .handler(async ({ data }) => generateGeminiQuestions(data));

export const getAiAssessment = createServerFn({ method: "POST" })
  .validator(
    z.object({
      pitch: pitchSchema,
      answers: z.array(z.string().trim().min(5).max(3000)).length(4),
    }),
  )
  .handler(async ({ data }) => generateGeminiAssessment(data.pitch, data.answers));

export const testAiConnection = createServerFn({ method: "POST" }).handler(
  async () => checkGeminiConnection(),
);
