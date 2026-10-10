# Shark Arena

An AI-powered startup pitch simulator. Practice pitching your idea to four investor personas, answer their questions, and receive an AI-generated assessment with a hypothetical offer.

**Live demo:** [Try Shark Arena](https://pitch-ai-shark-tank.lovable.app)

## Features

- Practice a startup pitch with four investor personas
- Answer investor questions and receive AI-generated feedback
- Get a hypothetical offer to help you think through your pitch
- Responsive interface for desktop and mobile

## Built with

- React and TypeScript
- Tailwind CSS and shadcn/ui
- Gemini API for investor questions and feedback

## Run locally

You’ll need Node.js and npm.

1. Clone this repository and enter its folder:

   ```bash
   git clone https://github.com/leela-29/pitch-ai-shark-tank.git
   cd pitch-ai-shark-tank
   ```

2. Install dependencies and start the app:

   ```bash
   npm install
   npm run dev
   ```

3. Open the local address shown in your terminal.

## Configure the AI features

The AI pitch flow requires a Google Gemini API key.

1. Create an API key in [Google AI Studio](https://aistudio.google.com/apikey).
2. Create a `.env.local` file in the project folder.
3. Add your key:

   ```text
   GOOGLE_API_KEY=your_key_here
   ```

Keep your API key private. Don’t commit it to GitHub or put it in a browser-exposed `VITE_*` variable. Pitch text and answers are sent to Google for AI processing.

## Project status

This is a student project for practicing startup pitches. AI-generated scores and offers are for practice and are not investment advice.
