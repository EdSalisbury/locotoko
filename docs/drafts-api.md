# Drafts from photos (for Lucida)

Another program (Lucida) sends an item's photos; Locotoko makes a draft at
once and identifies the item with Claude in the background.

## Authentication

Create a key on the **API Keys** page (navbar, next to Change Password). It's
shown once. Send it on every request as

    X-API-Key: lk_...

(or `Authorization: Bearer lk_...`). A request with a key acts as the user who
made it. A wrong or revoked key answers 401 and is treated like a wrong
password; too many answer 429.

## Endpoints

All under `/api/v1`. Each answers with a draft:

```json
{
  "id": "cmx03rljz0004mm36uzg85xzw",
  "lucidaItemNumber": "L-1042",
  "status": "identifying",
  "error": null,
  "title": "",
  "editUrl": "https://store.bluedragontrading.ltd/editItem/cmx03rljz0004mm36uzg85xzw",
  "createdAt": "2026-11-28T07:42:33.695Z"
}
```

`status` is `identifying`, `ready` or `failed`; `error` says why it failed, in
plain words. A failed draft keeps its photos (and anything already filled in).

| Request | What it does |
| --- | --- |
| `POST /drafts` | Multipart: `photos` (1-12 image files, in order) and `lucidaItemNumber`. Makes the draft and answers right away (201). |
| `GET /drafts/:id` | Where the draft stands. |
| `GET /drafts?lucidaItemNumber=L-1042` | The newest draft for that Lucida item, or 404 if it was never sent. |
| `PUT /drafts/:id/photos` | Multipart `photos`: replaces the draft's photos only, never its fields. |

A request Locotoko can't take (no photos, more than 12, a file that isn't an
image, no item number) answers 400 with the reason in `message`.

## What gets filled in

Photos are stored the way Add Item stores them (JPEG, longest side 1600 px).
Claude gets all of them in one conversation, picks a category from the ones
Locotoko's templates and items use, then fills the condition, item specifics
and UPC (kept only if its check digit is right) from that category's own
lists; the usual title and description generation writes the rest. If a
template uses the category, its shipping, location and specifics come along
as in Add Item. The owner is The Hoard. **Price and acquisition are never
filled in.** Anything Claude read but couldn't place is shown on the draft's
Edit Item page.
