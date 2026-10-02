# Project Brief v3: College Notes Site

Paste this whole file into Antigravity. It **replaces all earlier briefs** (which assumed read-only access, R2 storage and a Worker; none of that applies any more).

## 1. Goal

A website where students can browse, preview and download my notes. Only I upload files. Every PDF is watermarked by me before upload, so downloaded copies carry my site name. Each PDF is 2 to 10 MB (compressed). Everything must run on **free tiers with no credit card**.

## 2. Hard requirements

- **No payment method anywhere.** Do not use Cloudflare R2, AWS, Firebase Blaze or any service that asks for a card.
- Only I upload (no student accounts, no upload portal, no moderation, no backend).
- Students can preview a note in the browser **and** download it.
- Fast and comfortable on mobile (most students use phones).
- Notes are static files hosted with the site itself.

## 3. Architecture

| Part | Choice |
|---|---|
| Frontend | React + Vite (static build) |
| Hosting | **Cloudflare Pages** (free, no card) |
| PDF files | Stored inside the site's `public/notes/` folder and served as static files |
| Metadata | One `notes.json` file in the repo (no database) |
| PDF preview | PDF.js (`pdfjs-dist`) rendering to canvas, with a Download button |

Cloudflare Pages free-plan limits (confirm on Cloudflare's docs before launch): up to 20,000 files per site, 25 MiB maximum per file, 500 builds per month. Our PDFs (2 to 10 MB) fit within the per-file limit.

No R2, no Worker, no Supabase in version 1.

## 4. File and folder structure

One folder per subject, with the unit PDFs inside it:

```
project/
  public/
    notes/
      physics/
        unit-1.pdf
        unit-2.pdf
        unit-3.pdf
        unit-4.pdf
        unit-5.pdf
      chemistry/
        unit-1.pdf
        unit-2.pdf
  src/
    data/notes.json
    config.js        <- contains FILES_BASE_URL
```

Rules:
- Build every PDF URL from a single setting, `FILES_BASE_URL` (default `/notes/`), plus the `file` path from `notes.json`. If I later move the PDFs to another host, only this one value changes. Never hardcode PDF paths anywhere else.
- Use lowercase, hyphenated file names with the same pattern for every subject (`unit-1.pdf`, not `Unit1.pdf`).
- Other kinds of notes go in the same subject folder with names like `pyq-2024.pdf`, `formula-sheet.pdf`, `lab-1.pdf`.
- If I later need branches or semesters, extra folder levels can be added (for example `first-year/physics/unit-1.pdf`). Only the `file` path in `notes.json` needs to match.

## 5. Data format (`notes.json`)

```json
[
  {
    "id": "physics-unit-1",
    "title": "Physics: Unit 1",
    "subject": "Physics",
    "unit": "Unit 1",
    "type": "Handwritten",
    "tags": ["Endsem", "Short notes"],
    "pages": 24,
    "sizeMB": 4.2,
    "file": "physics/unit-1.pdf",
    "addedOn": "2026-10-02"
  }
]
```

- `file` is a path relative to `FILES_BASE_URL`.
- Optional fields I may add later: `branch`, `semester`, `subjectCode`. The UI must work without them and show a filter only when at least one note has that field.

Optional: write a small Node or Python script that scans `public/notes/` and generates the `file`, `pages` and `sizeMB` values for each entry, so I don't type them by hand.

## 6. PDF preparation (done by me before upload, not by the site)

1. **Watermark every PDF first**: a light diagonal site-name watermark plus a small footer line with the site URL. Keep it subtle so notes stay readable.
2. **Then compress** (Ghostscript or an online tool). Scanned handwritten notes often shrink from 10 MB to 2 to 3 MB with no visible loss.
3. Write a **batch script** (Python with `pypdf` and `reportlab`, or similar) that watermarks and compresses every PDF in an `input/` folder and writes the result to `output/`, keeping the same subject folder structure. Keep the original, un-watermarked PDFs safe somewhere else.

## 7. Preview and download behaviour

- Each note card has two actions: **Preview** and **Download**.
- Preview uses PDF.js on canvas, with page navigation, zoom and a progress indicator. This matters on phones, because mobile browsers often show only the first page of an embedded PDF.
- Download is a normal link with the `download` attribute pointing at the static PDF URL.
- No download counters, ratings or any feature that needs a backend.

## 8. Features

**Build in version 1:**
- Search bar (also open with Ctrl+K), searching title, subject, unit and tags
- Browse by **Subject**, then by **Unit** or note type (Unit notes, PYQ, Formula sheet, Lab)
- Filter by type: Handwritten, Formula Sheets, PYQ Solutions, Slides
- Note cards showing page count, file size, subject, unit, type and tags
- Preview reader plus Download button
- Sort by recently added
- Fully responsive layout, fast on mobile
- Built-in CGPA/SGPA calculator (a small client-side page)

**Remove (not needed, or needs a backend):**
- Student upload portal and drag-and-drop uploader
- Contributor leaderboard and "Hall of Fame"
- Ratings, upvotes and download counters
- Any logic that tries to block downloads

**Defer until the core works:**
- Branch and semester filters (only if I add those fields later)
- Bookmarks (localStorage, no backend needed)
- Exam countdown and timetable
- Cursor light trail and tilt effects
- Live stat counters

## 9. Visual design (kept from the earlier plan)

- Dark theme: base `#08090E` and `#0F111A`, glassmorphic cards (`rgba(255,255,255,0.03)` with `backdrop-filter: blur(16px)`).
- Accents: cyan `#00F0FF` / `#38BDF8` for navigation and resources; crimson `#FF0055` / `#F43F5E` for exam-related items such as PYQs.
- Fonts: Outfit or Inter for text, JetBrains Mono for unit labels and file metadata.
- Keep animations subtle (Framer Motion for page and modal transitions). Respect `prefers-reduced-motion`.
- Check text contrast on the dark glass cards so metadata stays readable.

## 10. Deployment

Pick one:

- **Direct upload (simplest start):** build the site, then use `wrangler pages deploy dist` (or drag a folder or zip into the Pages dashboard). Redeploys are quicker with Wrangler.
- **GitHub-connected:** every push to the repo redeploys. Easier to maintain, but git gets heavy with many large PDFs (GitHub recommends keeping repos around 1 GB or less), so consider keeping the PDFs out of git and deploying them with Wrangler instead.

Use a custom domain if possible.

## 11. Build order

1. Scaffold the Vite + React project and load `notes.json` with 5 to 10 mock entries (for example, physics units 1 to 5).
2. Build the list page: search, subject and unit browsing, note cards.
3. Build the PDF.js preview with page navigation, zoom and a Download button.
4. Write the watermark and compress batch script and run it on 5 to 10 real notes.
5. Put those PDFs in `public/notes/`, update `notes.json`, deploy to Cloudflare Pages, and test on a real phone.
6. Add the rest of the notes and the CGPA calculator.
7. Polish the visuals last.

## 12. Tips

- **Content beats design.** Launch with one or two subjects done well, and add more before each exam period, when traffic peaks.
- **Share it where students already are:** class WhatsApp groups, CRs, seniors, a QR code on a poster.
- **Limits can change.** Confirm current Cloudflare Pages limits before launch. Cloudflare's terms also allow it to restrict free sites that serve a disproportionate amount of non-web content, so a PDF-heavy site carries a small risk. Keep backups so the site can move to another host.
- **Backups:** keep the original PDFs, watermarked PDFs and `notes.json` in your own drive or a private repo.
- **Legal:** host only notes I made or have permission to share. Do not upload scanned textbooks or paid course material, and add a short contact or takedown line in the footer.
- **No secrets** in the frontend code. This version doesn't need any API keys.