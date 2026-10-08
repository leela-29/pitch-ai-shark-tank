# Pitch Perfect

Build a polished hackathon MVP called "Shark Arena" for the PromptWars × The Prompt Arena challenge "Shark Tank Simulator".

Goal: a user pitches a startup idea and gets challenged by an AI investor panel, then receives a useful final assessment.

Build the app as a responsive React + TypeScript + Tailwind + shadcn/ui full-stack app. For the first MVP, do NOT require authentication, database, or external AI API keys. Use realistic local/mock AI responses so the entire demo works immediately. Keep the architecture ready for a future LLM integration.

Core flow:
1. Landing page with strong startup/hackathon visual identity. Hero title: "Shark Arena". Subtitle: "Your idea is about to get grilled." CTA: "Enter the Tank".
2. Pitch form asking for startup name, problem, solution, target customers, and business/revenue model. Include an example idea button.
3. Investor panel screen with 4 investor personas:
   - The Business Shark: revenue, pricing, costs, profitability.
   - The Growth Shark: market size, acquisition, competition, scalability.
   - The Tech Shark: feasibility, technology, differentiation, risks.
   - The Brutal Shark: assumptions, weak points, hard objections.
   Show one question at a time, investor persona card, progress indicator, timer-like visual (not requiring real timing), answer text area, submit, and hint button. Use deterministic/mock generated questions based on the pitch fields, cycling through all four sharks.
4. Results screen with an animated-looking score dashboard: overall Pitch Score out of 100 plus category scores for Problem, Innovation, Market, Business Model, Scalability. Show strengths, biggest weakness, actionable improvements, investor verdicts for all four sharks, and a clearly labeled "Hypothetical Offer" with amount/equity. Make clear the offer is simulated, not real.
5. Add "Pitch Again" and "Improve My Pitch" CTAs.
6. Include polished empty/loading/error states and mobile responsiveness.

Design direction:
- Premium dark "investor room" aesthetic, mostly black/deep navy surfaces with electric accent gradients, glassmorphism cards, subtle grid/background glow, bold typography, high contrast.
- Use Lucide icons and shadcn components.
- Make interactions smooth and demo-friendly.
- Avoid stock photos; use CSS effects, gradients, icons, and shapes.
- Use accessible labels and keyboard-friendly controls.

Important judging/demo considerations:
- The experience should feel like a real investor panel rather than a generic chatbot.
- Make the investor personalities distinct in tone.
- The results page should visibly answer: Who invests? Why? What is the biggest weakness? What should the founder do next?
- Include a small disclaimer that scores and offers are simulated AI feedback.

Keep the MVP simple enough to finish quickly, but make it look presentation-ready. No auth, no database, no paid integrations for this first build.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pitch-ai-shark-tank.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/c0c3cc6f-5384-4505-a77e-540788f98e50).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
