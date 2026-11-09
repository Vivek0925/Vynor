# Vynor Workspace UI Redesign Rules

The dashboard (workspace hub) redesign is already finished and merged. **Do not touch the dashboard.**
This file covers only the workspace area: the shell and every page under `/workspace/[slug]/...`.

## 0. How to work: one section at a time (highest priority)

- Implement **only one section per request**. The user names the section (for example "Implement Section 3: Tasks").
- If the user does not name a section, ask which one. Never start the next section on your own.
- After finishing a section, **stop**. Do not touch any other section, even if it looks easy or related.
- Do **not** commit or push. The user reviews and commits after each section.
- Start the next section only when the user explicitly says to continue with a named section.

Sections, in this order:

1. **Shell**: sidebar, top bar, page card, mobile drawer, theme toggle, search (shared by every page)
2. **Overview**
3. **Tasks**
4. **Chat**
5. **Meetings**
6. **Projects**
7. **Files**
8. **Whiteboard**: restyle the page frame only, keep its existing behavior

Section 1 must be done first, because every other page renders inside it.

### What to do at the end of every section

Reply with a short summary containing:

- Files created and files changed.
- Which reference elements map to which components.
- Anything in the reference that was **left out or hidden** because the app has no data or feature for it (see section 3 of this file).
- Results of the TypeScript check, lint, and build.
- A short manual test list for the user (what to click, what should happen, at desktop and mobile widths).
- The line: "Ready for your review. Commit when happy, then tell me which section is next."

## 1. Design reference (source of truth for how things look)

- The reference is `docs/vynor workspace.html` (adjust the name if the file in `docs/` differs).
- Before implementing a section, open the reference and study that section carefully: layout, spacing, radii, typography, colors, icons, hover and focus states, transitions, and the mobile layout.
- The reference decides how things **look**. The existing application decides how things **work**.
- Recreate the design as faithful React components in the existing Next.js (App Router), TypeScript, Tailwind CSS v4 and Framer Motion setup.
- Do not embed the HTML file, use an iframe, or copy the HTML wholesale.
- Do not invent a different design or add creative changes beyond the reference.

## 2. Inspect before changing anything

- First inspect the repository: the `/workspace/[slug]` routes, nested layouts, the current sidebar and header, shared components, `globals.css`, the font setup, and how data is fetched (Prisma, server actions, API routes).
- Do not assume that paths or components named in this file exist. Follow the existing conventions and reuse existing components before creating new ones.
- Do not create a second layout, navigation, or design system next to the existing ones. Replace the old UI.
- Keep changes scoped to the current section and the shared components it directly needs.

## 3. Preserve functionality, never fake data

- Keep all existing authentication, authorization, session handling, Prisma schema, backend routes, API contracts, server actions, and database logic untouched.
- Every existing button, link, form, filter, dropdown, and interaction must still work after the redesign.
- Connect the new UI to the existing data sources. Do not use dummy or hardcoded data.
- The reference is a prototype. These behaviors exist only in the prototype and must **not** be faked in the app:
  - Auto-replies and "is typing..." from teammates
  - Seeded or pre-filled data (names, dates, streak history, messages, files)
  - State saved in `localStorage` instead of the database
  - The animated fake video call with drawn avatars
- If the reference shows a feature the app does not support yet (for example streaks, unread badges, a calendar connection, reactions), then:
  - build the visual only if real data exists for it, or
  - leave it out, and list it in the end-of-section summary so the user can decide.
- Never silently invent a backend feature to match the reference.

## 4. Tech stack and code rules

- Next.js App Router, TypeScript, Tailwind CSS v4, Framer Motion. Reuse existing dependencies and do not add new ones unless the section truly needs one. If a new library is needed (for example a drag-and-drop library), say so in the plan and ask first.
- Use `"use client"` only where needed (state, browser APIs, event handlers, Framer Motion). Keep pages and layouts as server components where possible.
- Respect `useReducedMotion`. Animation stays subtle.
- Every interactive element needs a visible keyboard focus state and an accessible name. Dialogs need focus trapping and Escape to close.

## 5. Theme, tokens, fonts

- Inspect `globals.css` and the existing `@theme` setup first. Reuse existing tokens (coral, cream, blue, sage, forest, butter, ink) and the existing Inter Tight setup via `next/font`.
- **Never hardcode hex values inside components.** Use tokens and Tailwind utilities.
- In **Section 1 only**, if these semantic tokens are missing, add them to `globals.css` as CSS variables, exposed with `@theme inline` so dark mode works by swapping variables:

| Token | Light | Dark |
|---|---|---|
| bg (page background) | #f5f3ee | #0f1713 |
| surface | #ffffff | #1b2620 |
| surface2 | #faf8f3 | #202c25 |
| surface3 (list columns, bubbles) | #f3f0e8 | #131c17 |
| ink (text) | #17201a | #ece7da |
| muted (secondary text) | #5c675f | #9aa89f |
| line (borders) | rgba(23,32,26,.11) | rgba(255,255,255,.1) |
| coral (accent) | #e5704f | #ec7d5d |
| coral-tint | #fbe9e1 | #3b2a23 |

- Label colors: Urgent = coral, Design = butter, Dev = blue, Docs = sage. Use existing tokens for them.
- **Light is the default theme.** Dark mode is opt-in through the toggle only (use `next-themes` with `attribute="data-theme"`, `defaultTheme="light"`, `enableSystem={false}` if it is not already set up). Do not follow the system theme automatically.
- Typography is minimal, not bold: body 400, headings and labels 500, only the logo 600. Avoid heavy bold text.
- Every component must look right in both light and dark mode.

## 6. Responsive behavior

- Desktop and laptop: fixed 260px sidebar, top bar, and one rounded page card. The sidebar and top bar never scroll. **Only the page content scrolls.** The sidebar has no visible scrollbar.
- At 860px and below: the sidebar becomes a slide-in drawer opened by a hamburger button. The top bar shows the hamburger, "WORKSPACE" with the workspace name, Dashboard and Invite. Search moves into the drawer. **No dark overlay** behind the drawer (use a transparent click-catcher and a light shadow). The drawer closes when a nav item is tapped.
- Prevent horizontal overflow on every page. Wide content (task board lists) scrolls inside its own container.

## 7. Section specifications

### Section 1: Shell
- Sidebar: logo, workspace card, groups **WORKSPACE** (Overview, Projects, Tasks, Whiteboard), **COMMUNICATION** (Chat, Meetings), **RESOURCES** (Files), Team card, user row. Active item has a coral-tint background and a coral icon. Chat shows an unread count badge only if real unread data exists.
- Top bar: search pill with a `/` keyboard hint, Dashboard link, Invite button. Search covers tasks, projects, channels and files using existing data. If no search endpoint exists, keep the existing search behavior and report it.
- Page card: one rounded container (about 22px radius, thin border) that holds each page, with a page header row (title, subtitle, page actions) and a scrollable body.
- Theme toggle (moon and sun) next to the user name. Persist the choice.
- Mobile drawer as described in section 6.
- Keep all existing links and routes working.

### Section 2: Overview
- Greeting by time of day, three stat cards (Projects, Open tasks, Members), "Recent activity", and "Your focus" (the signed-in user's open tasks sorted by due date, each with a checkbox that completes the task).
- Streak counter and weekly bars only if completion history exists.
- Stats and lists come from real data.

### Section 3: Tasks
- Board with horizontally scrolling lists. Lists can be renamed inline, deleted (with Undo) and added. Header actions: Add list, Add task.
- Cards show label bars, title, due-date chip (overdue gets the coral style, done gets the green style), checklist progress, comment count, assignee avatar, and a complete checkbox that appears on hover.
- Drag and drop between lists with the correct insert position. Reuse the existing drag-and-drop approach. Empty lists show "Drop a card here". Each list has an "Add a card" composer (Enter adds, Escape cancels).
- Card dialog: wide, two panels. Left: editable title, labels toggles, assignee, due date, description, checklist with progress bar, Delete card. Right: "Comments and activity" with the comment composer at the bottom. Changes save on blur or change.
- Mobile: lists scroll sideways and the dialog becomes full screen with panels stacked.

### Section 4: Chat
- Left panel: Channels and Direct messages with unread badges (only if real data). Right panel: header with the channel name, message list, and composer.
- Other people's messages on the left with avatar, name and time. **Your own messages on the right** in coral-tint bubbles with "You • time". This is the same on mobile.
- WhatsApp-style reactions: click a message to open an emoji bar (👍 ❤️ 😂 😮 😢 🙏). One reaction per user per message. Reactions show as small pills under the bubble, and clicking your own pill removes it. Only enable if the app stores reactions; otherwise report it.
- Mobile: tapping the channel name in the header opens a dropdown list of channels and DMs.

### Section 5: Meetings
- Page header: video icon tile, "Meetings", subtitle "Meet, collaborate, and stay connected with your workspace.", then "Calendar connected" pill (only if that integration state exists) and "+ New Meeting".
- "LIVE NOW" label with a green dot, then a mint card per live meeting: icon tile, name, participant count, ACTIVE tag, "Created by ...", and Join Meeting and Copy Link buttons.
- No "Upcoming" section.
- Do not build the fake animated call room. Keep the existing join behavior.

### Section 6: Projects
- List rows with an editable name, status or category, a progress bar with a percentage, and delete with Undo. "New project" button in the page header.

### Section 7: Files
- List rows with a file-type badge, name, size, modified time, and delete with Undo. Upload button using the existing real upload flow.

### Section 8: Whiteboard
- Only restyle the page frame (page card, header, spacing, theme support). **Do not change the whiteboard's functionality or canvas behavior.**

## 8. Verification (every section)

- Run the TypeScript check, lint, and build. Fix every issue the change introduced.
- Verify that all links, buttons, forms, and data in the section still work.
- Check light and dark mode, and desktop, tablet and mobile widths.
- Check keyboard navigation, focus states, and reduced-motion behavior.
- Confirm that nothing outside the section (and the shared components it needs) was modified.

## Primary objective

Replace the workspace UI one section at a time with the design in `docs/vynor workspace.html`, keeping every existing backend integration, data flow, and feature working. The reference decides how it looks. The existing app decides how it works.