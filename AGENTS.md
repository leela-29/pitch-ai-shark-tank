<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the pitch experience in a client-side flow on the index route; it must run without accounts or persistence.
- Use Gemini through TanStack Start server functions for production questions and assessments. Keep API credentials server-only; do not silently fall back to rule-based scoring. The local mock provider is for tests only.
- Keep shared pitch, question, and assessment types in browser-safe modules; validate all model output before returning it to the screens.
- Define all visual roles and reusable arena styling in src/styles.css; UI controls use shadcn components.
