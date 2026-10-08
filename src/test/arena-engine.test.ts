import { describe, expect, it } from 'vitest';
import { assessPitch, examplePitch, generateQuestions, mockArenaProvider } from '@/lib/arena-engine';

describe('Shark Arena simulation', () => {
  it('asks four distinct, pitch-aware questions in persona order', () => {
    const questions = generateQuestions(examplePitch);
    expect(questions.map(q => q.shark)).toEqual(['business', 'growth', 'tech', 'brutal']);
    expect(questions[0]?.question).toContain(examplePitch.name);
    expect(questions[1]?.question).toContain(examplePitch.customers);
    expect(questions.every(q => q.hint.length > 20)).toBe(true);
  });
  it('is deterministic, bounded, and returns every category and verdict', () => {
    const answers = Array(4).fill('We test a paid prototype with 100 customers for 6 weeks. Our price is £20, cost is £5, and margin is 75%. We measure revenue, acquisition cost, conversion, and competitor risk before the pilot expands.');
    const result = assessPitch(examplePitch, answers);
    expect(result).toEqual(assessPitch(examplePitch, answers));
    expect(result.categories).toHaveLength(5);
    expect(result.verdicts).toHaveLength(4);
    expect(result.overall).toBeGreaterThan(0);
    expect(result.overall).toBeLessThanOrEqual(100);
    expect(result.offer?.amount).toBeGreaterThan(0);
    expect(result.improvements).toHaveLength(3);
  });
  it('does not reward empty or repetitive answers with investment', () => {
    for (const answers of [[], Array(4).fill('customer '.repeat(100))]) {
      const result = assessPitch(examplePitch, answers);
      expect(result.verdicts.every(v => !v.invests)).toBe(true);
      expect(result.offer).toBeNull();
    }
  });
  it('exposes an asynchronous replaceable provider', async () => {
    expect(await mockArenaProvider.questions(examplePitch)).toHaveLength(4);
    expect(await mockArenaProvider.assessment(examplePitch, [])).toEqual(assessPitch(examplePitch, []));
  });
});