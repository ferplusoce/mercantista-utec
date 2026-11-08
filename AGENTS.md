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

- Store custom requests and private attachments through the browser Cloud client with bounded authenticated INSERT and owner/admin access policies, so submission never exposes customer lists.
- Keep form rules in shared Zod schemas and enforce writes with database triggers; validate only changed historical fields so operational updates preserve old records.
- Keep invalid inline admin drafts local and debounce valid edits per field so simultaneous edits do not discard each other.
- Normalize opinion delivery types only at reporting/export boundaries, retaining raw historical answers and keeping existing KPIs unchanged.
- Reuse HowItWorks in home and the first-visit welcome; only the welcome-seen flag belongs in browser storage.
- Catalog (categories, vendors, products) and settings (tariffs, support WhatsApp) live in Cloud and are read through `src/lib/catalog.ts`; localStorage holds only cart/device data, so admin edits reach every customer.
- Customer profiles, addresses, taxis, orders and requests live in Cloud with owner/admin access; one root AuthProvider owns session state and protected pages sit under `_authenticated`.
- Product/category photos live in the private `product-images` bucket (public buckets are blocked by workspace policy); `image_url` stores the storage path and the app resolves signed URLs; uploads are shrunk client-side to ≤640px WebP for low-end phones.
