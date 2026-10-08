export type Pitch = { name: string; problem: string; solution: string; customers: string; model: string };
export type SharkId = 'business' | 'growth' | 'tech' | 'brutal';
export const sharks = [
  { id: 'business', name: 'The Business Shark', short: 'Business', focus: 'The numbers don’t lie.', specialty: 'Revenue · Pricing · Profitability', description: 'A great idea is nothing without a business. Show me the money.', label: 'THE NUMBER CRUNCHER' },
  { id: 'growth', name: 'The Growth Shark', short: 'Growth', focus: 'Think bigger. Then bigger.', specialty: 'Market · Acquisition · Scale', description: 'Small ambitions don’t get funded. How big can this really get?', label: 'THE BIG-PICTURE THINKER' },
  { id: 'tech', name: 'The Tech Shark', short: 'Tech', focus: 'Can you actually build it?', specialty: 'Technology · Feasibility · Moat', description: 'Cool buzzwords won’t cut it. I’m looking under the hood.', label: 'THE REALITY CHECK' },
  { id: 'brutal', name: 'The Brutal Shark', short: 'Brutal', focus: 'No fluff. No mercy.', specialty: 'Assumptions · Risks · Objections', description: 'Someone has to say what everyone else is thinking. That’s me.', label: 'THE DEVIL’S ADVOCATE' },
] as const;
export const emptyPitch: Pitch = { name: '', problem: '', solution: '', customers: '', model: '' };
export const examplePitch: Pitch = {
  name: 'LoopLunch',
  problem: 'Independent cafes throw away unsold lunches while local office workers struggle to find affordable, fresh meals.',
  solution: 'A marketplace connecting cafes with nearby workers for discounted surplus lunches, reserved before the lunch rush.',
  customers: 'Office workers in city centers and independent cafes with at least 10 unsold meals per day.',
  model: 'A 15% commission on each £6 meal. Cafe partners pay no upfront fee. We launch in one neighborhood before expanding.',
};
export type Question = { shark: SharkId; question: string; hint: string };
const excerpt = (s: string) => s.length > 140 ? `${s.slice(0, 137)}…` : s;
export function generateQuestions(pitch: Pitch): Question[] {
  return [
    { shark: 'business', question: `You’re proposing “${excerpt(pitch.model)}” for ${pitch.name}. Walk me through one paying customer: what do they pay, what does it cost you to serve them, and when do you break even?`, hint: 'Give a price, direct cost, gross margin, and monthly break-even customer count. Estimates are fine—label your assumptions.' },
    { shark: 'growth', question: `Your target is “${excerpt(pitch.customers)}”. That’s a starting point, not a growth strategy. How will ${pitch.name} win its first 100 customers, and why will they choose you over their current alternative?`, hint: 'Pick one specific acquisition channel. Estimate its cost, conversion rate, and customer acquisition cost. Name the existing alternative.' },
    { shark: 'tech', question: `Your solution is “${excerpt(pitch.solution)}”. What is the hardest part to build, what can you ship in six weeks, and what stops a competitor copying it?`, hint: 'Separate your MVP from the long-term vision. Name one technical risk, a way to test it, and a defensible advantage beyond features.' },
    { shark: 'brutal', question: `You say the problem is “${excerpt(pitch.problem)}”. I’m not convinced people will pay to fix it. What evidence would prove you wrong—and what will you test before spending your first £10,000?`, hint: 'Identify your riskiest assumption. Propose a low-cost test with real customers, a measurable success threshold, and a clear stop/pivot condition.' },
  ];
}
export type Assessment = {
  overall: number;
  categories: { name: string; score: number; advice: string }[];
  strengths: string[];
  weakness: string;
  improvements: string[];
  verdicts: { shark: SharkId; invests: boolean; reason: string }[];
  offer: { amount: number; equity: number } | null;
};
function evidenceScore(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const unique = new Set(words.map(word => word.toLowerCase())).size;
  if (words.length < 5 || unique / words.length < .4) return 15;
  const numbers = /\d/.test(text) ? 10 : 0;
  const specifics = (text.match(/customer|cost|test|margin|price|interview|week|conversion|prototype|pilot|competitor|revenue|paid|risk|channel/gi) || []).length;
  return Math.min(91, 24 + Math.min(unique, 45) * .8 + numbers + Math.min(specifics, 7) * 3);
}
export function assessPitch(pitch: Pitch, answers: string[]): Assessment {
  const answerScores = sharks.map((_, i) => evidenceScore(answers[i] || ''));
  const [business = 15, growth = 15, tech = 15, brutal = 15] = answerScores;
  const categories = [
    { name: 'Problem', score: Math.round(evidenceScore(pitch.problem) * .45 + brutal * .55), advice: 'The willingness-to-pay assumption is still unproven. Run 10 customer interviews and ask for paid commitments—not compliments.' },
    { name: 'Innovation', score: Math.round(evidenceScore(pitch.solution) * .4 + tech * .6), advice: 'The differentiation is not yet defensible. Compare three alternatives and test one advantage customers actually value.' },
    { name: 'Market', score: Math.round(evidenceScore(pitch.customers) * .35 + growth * .65), advice: 'The initial customer segment and acquisition economics need evidence. Test one channel with a small budget and measure cost per paying customer.' },
    { name: 'Business Model', score: Math.round(evidenceScore(pitch.model) * .35 + business * .65), advice: 'Unit economics are the biggest gap. Build a price/cost/margin model, include acquisition costs, and calculate break-even volume.' },
    { name: 'Scalability', score: Math.round(growth * .5 + tech * .5), advice: 'Repeatable delivery is unproven. Run a small pilot, measure manual work per customer, and fix the largest bottleneck before expanding.' },
  ];
  const sorted = [...categories].sort((a, b) => a.score - b.score);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];
  const overall = Math.round(categories.reduce((sum, category) => sum + category.score, 0) / categories.length);
  const reasons = [
    'Your pricing and cost assumptions are concrete enough to justify a small pilot. Validate margins with actual transactions.',
    'You’ve identified a plausible first-customer channel. Prove that acquisition cost stays below customer lifetime value.',
    'A focused MVP and explicit technical risks make the build credible. Demonstrate the key workflow before expanding scope.',
    'You’ve confronted the central assumption with a testable plan. I’d back the experiment, not the unproven projections.',
  ];
  const objections = [
    'I’m out for now. I need specific prices, delivery costs, margins, and a realistic break-even customer count.',
    'I’m out for now. A target market isn’t an acquisition plan. Show one repeatable channel and measured acquisition cost.',
    'I’m out for now. Define a buildable MVP, name the hardest technical risk, and explain why your advantage is hard to copy.',
    'I’m out. Enthusiasm is not evidence. Show a paid-demand test and the result that would make you stop or pivot.',
  ];
  const verdicts = sharks.map((shark, i) => {
    const invests = (answerScores[i] ?? 15) >= (i === 3 ? 75 : 67);
    return { shark: shark.id, invests, reason: (invests ? reasons[i] : objections[i]) ?? 'Validate your assumptions with a small paid pilot.' };
  });
  return {
    overall, categories,
    strengths: [strongest ? `${strongest.name} is your strongest dimension (${strongest.score}/100). ${pitch.name} has a clearer starting point here than in the other areas.` : 'You have completed the panel.', answerScores.some(score => score >= 67) ? 'Your strongest answers include concrete detail rather than relying only on the vision.' : 'You have articulated an initial problem, solution, and target segment that can now be tested.'],
    weakness: weakest?.advice || 'Validate demand with paying customers.',
    improvements: [weakest?.advice || 'Test willingness to pay.', 'This week: recruit 10 people from your stated target segment and test a simple prototype with them.', `Before fundraising: bring evidence for ${sorted[1]?.name.toLowerCase() || 'your model'}—a measured result, not a larger projection.`],
    verdicts,
    offer: verdicts.some(verdict => verdict.invests) ? { amount: overall >= 75 ? 150000 : 75000, equity: overall >= 75 ? 10 : 15 } : null,
  };
}
export interface ArenaProvider {
  questions: (pitch: Pitch) => Promise<Question[]>;
  assessment: (pitch: Pitch, answers: string[]) => Promise<Assessment>;
}
export const mockArenaProvider: ArenaProvider = {
  questions: async pitch => generateQuestions(pitch),
  assessment: async (pitch, answers) => assessPitch(pitch, answers),
};