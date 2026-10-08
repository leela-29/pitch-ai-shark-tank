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

- Keep the pitch experience in a client-side flow on the index route; the MVP must run without accounts, persistence, or external services.
- Isolate typed simulation logic in a browser-safe module with a provider interface; future LLM integration should replace the provider without changing the screens.
- Define all visual roles and reusable arena styling in src/styles.css; UI controls use shadcn components.
