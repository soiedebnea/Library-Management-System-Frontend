# Frontend — File Management Guide

Library Management System frontend: plain HTML + CSS + TypeScript (no framework).

## Folder Structure

```
frontend/
├── index.html                    # Dashboard page (stats + overdue loans)
├── books.html                    # Book catalog page (add/edit/delete/search)
├── members.html                  # Members page (register/edit/delete/search)
├── borrow.html                   # Borrow & Return page (issue, return, pay fines)
│
├── css/
│   └── style.css                 # The one shared stylesheet for every page
│
├── ts/                            # SOURCE FILES — edit these
│   ├── types.ts                    # Shared interfaces: Book, Member, BorrowRecord, etc.
│   ├── api.ts                      # Typed fetch() wrapper around every backend endpoint
│   ├── ui.ts                       # Small shared helpers: toasts, date formatting, confirm()
│   ├── dashboard.ts                 # Powers index.html
│   ├── books.ts                     # Powers books.html
│   ├── members.ts                   # Powers members.html
│   └── borrow.ts                    # Powers borrow.html
│
├── js/                            # GENERATED — do not hand-edit; produced by `npm run build`
│   └── (compiled .js + .js.map for every file in ts/)
│
├── package.json                  # Just the TypeScript dev-dependency + build script
└── tsconfig.json                 # Compiles ts/*.ts -> js/*.js
```

## What to edit vs. what's generated

- **Edit:** any `.html` file, `css/style.css`, or anything in `ts/`.
- **Auto-generated — never hand-edit:** everything in `js/`. Re-run `npm run build` after changing a `.ts` file; the matching `.js` file is rebuilt. Editing `.js` directly means your changes get silently overwritten on the next build.

## How it talks to the backend

The frontend never touches a database directly — it only calls the backend's REST API, and that connection lives in exactly one place:

```
frontend/ts/api.ts  →  API_BASE = "http://localhost:5000/api"
```

If the backend moves to a different host/port, `API_BASE` is the only line you need to change — then run `npm run build` again.

```
frontend/ts/*.ts --fetch()--> backend REST API --Mongoose--> MongoDB
```

## Quick "where do I edit X" lookup

| I want to... | Edit this file |
|---|---|
| Change the color scheme / fonts | `css/style.css` (CSS variables at the top) |
| Add a new page | new `.html` file + new `ts/<page>.ts` + add a nav link in every page's `<nav class="main-nav">` |
| Change what a page displays or how it behaves | the matching file in `ts/` (e.g. `books.ts` for `books.html`) |
| Point the app at a different backend URL | `ts/api.ts` → `API_BASE` |
| Add a field to a form (e.g. a new book field) | the relevant `.html` form + the matching `ts/*.ts` + `ts/types.ts` |

## Setup

```bash
cd frontend
npm install
npm run build               # compiles ts/*.ts -> js/*.js
```

Then open `index.html` directly in a browser, or serve the folder with any static server:

```bash
npx serve .
# or
python3 -m http.server 5500
```

> **Note:** the backend's `CLIENT_ORIGIN` (in its `.env`) must match whatever origin you serve this frontend from, or API requests will be blocked by CORS.