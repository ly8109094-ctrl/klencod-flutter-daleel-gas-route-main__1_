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
- StoreProvider exposes database-backed state and async mutations; public views must render deliveries via toPublicDelivery. Why: persistent distribution records need one consistent interface without leaking private fields.
- Roles live in user_roles and all writes use RLS or role-checked database functions; protected pages live under _authenticated. Why: UI visibility is not authorization.
- PDF export prints a dedicated report surface with Arabic fonts and page-break rules. Why: browser printing preserves RTL text and offers Save as PDF without rasterizing records.
- Vercel hosting uses Nitro's vercel preset (auto-detected on Vercel, or `npm run build:vercel`); never add a vercel.json SPA rewrite. Why: the app is server-rendered, and Lovable's build stays on its own preset.
