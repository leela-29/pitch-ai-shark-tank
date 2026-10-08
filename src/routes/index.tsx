import { createFileRoute } from "@tanstack/react-router";
import { Arena } from '@/components/arena';
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: 'Shark Arena — Your idea is about to get grilled.' },
    { name: 'description', content: 'Pitch your startup to four distinct AI investor personas. Face the hard questions, get an honest assessment, and make your next move.' },
    { property: 'og:title', content: 'Shark Arena — Your idea is about to get grilled.' },
    { property: 'og:description', content: 'One pitch. Four ruthless AI investors. Get your pitch score, investor verdicts, and actionable feedback in this Shark Tank simulation.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Arena,
});
