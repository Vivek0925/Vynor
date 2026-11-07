# Vynor Dashboard UI Redesign Rules

- Before making any changes, thoroughly inspect the existing repository structure, especially the Next.js application, dashboard routes, layouts, components, styles, fonts, theme tokens, and dashboard-related content files.

- Identify the existing location of the dashboard page, its nested routes, shared layouts, navigation, sidebar, header, and reusable components before making changes.

- Do not assume that paths, components, tokens, or files mentioned below already exist. Follow the existing project architecture and conventions instead of creating duplicate structures unnecessarily.

## 1. Design Reference — Highest Priority

- A dashboard UI reference has been added to the project documentation folder:

  `docs/vynor dashboard(2).html`

- Before implementing anything, locate and thoroughly inspect this HTML file.

- Treat this HTML reference as the primary source of truth for the new Vynor dashboard design.

- The objective is to **replace the current dashboard UI with the design shown in the reference HTML**, not simply make minor visual improvements to the existing dashboard.

- Carefully analyze the reference, including:
  - Overall dashboard layout and structure.
  - Sidebar and navigation design.
  - Header and top navigation.
  - Page sections and content hierarchy.
  - Cards, statistics, metrics, and widgets.
  - Tables, lists, and activity sections.
  - Typography, font sizes, and font weights.
  - Colors, backgrounds, borders, shadows, and gradients.
  - Spacing, alignment, and border radii.
  - Icons, buttons, and interactive elements.
  - Hover effects, transitions, and animations.
  - Responsive behavior.

- Recreate the reference design as closely as possible using the existing project's Next.js, React, TypeScript, and Tailwind CSS architecture.

- Do not simply embed the HTML file using an iframe or copy its HTML wholesale. Convert the design into reusable React components following the existing project conventions.

- Do not invent a different design or introduce unnecessary creative changes that deviate from the reference. Preserve its visual identity and design decisions.

- If the reference uses external assets, fonts, icons, or libraries, inspect them and reuse appropriate existing project resources wherever possible.

- If certain reference elements conflict with existing application functionality, preserve the functionality while adapting the implementation to match the reference visually.

## 2. Technical Stack

- Use Next.js (App Router), TypeScript, Tailwind CSS v4, and Framer Motion.
- Reuse existing dependencies and UI libraries.
- Do not introduce unnecessary dependencies.
- Use `"use client"` only when required by client-side state, browser APIs, event handlers, or Framer Motion.
- Use Framer Motion for subtle animations and respect `useReducedMotion`.

## 3. Existing Theme and Fonts

- Inspect `globals.css` and existing theme configuration before using colors.
- Prefer existing `@theme` tokens such as coral, cream, blue, sage, forest, butter, and ink if available.
- Never hardcode hex color values inside components.
- Inspect the existing font configuration. If Inter Tight via `next/font` is already configured, reuse it.
- Match the reference's typography and visual appearance using the existing font setup wherever possible.

## 4. Functionality Preservation

- Preserve all existing dashboard functionality while replacing its UI.
- Do not replace functional components with static UI mockups.
- Maintain existing data bindings, API integrations, server actions, client-side state, and event handlers.
- Every existing button, link, navigation item, form, dropdown, filter, and interactive element must continue working.
- Connect the new UI to the existing data sources rather than using dummy or hardcoded data.

- Keep existing authentication, authorization, session management, Prisma schema, backend routes, API contracts, database operations, and application logic untouched.

## 5. Component Architecture

- Identify and reuse existing components before creating new ones.
- Break the reference design into small, reusable React components.
- Follow the existing project folder structure and naming conventions.
- Avoid duplicate layouts, navigation components, and design systems.
- Keep shared dashboard components consistent across nested routes.
- Keep changes scoped to the dashboard and directly related shared UI components and styles.

## 6. Responsive Design

- Reproduce the reference design across desktop, laptop, tablet, and mobile.
- Ensure the sidebar and navigation adapt properly to smaller screens.
- Make cards, tables, charts, and widgets responsive.
- Prevent horizontal overflow and broken layouts.
- Preserve usability and accessibility at every screen size.

## 7. Implementation and Verification

- First inspect the repository and reference HTML.
- Understand the existing dashboard implementation and identify the files that need modification.
- Compare the existing dashboard against the reference.
- Create an implementation plan.
- Replace the existing dashboard UI with the reference design.
- Connect all redesigned components to existing functionality and data.
- Avoid modifying unrelated files.

After implementation:

- Check for TypeScript errors.
- Run the existing lint and build commands.
- Verify all dashboard routes.
- Verify existing buttons, links, forms, and interactions.
- Verify data integrations.
- Test mobile, tablet, and desktop layouts.
- Check animations and reduced-motion behavior.
- Fix any issues introduced by the redesign.

## Primary Objective

Completely replace the current Vynor dashboard's visual interface with the design provided in `docs/vynor dashboard(2).html`.

The reference HTML determines how the dashboard should look. The existing application determines how it should function.

**Final result:** A faithful, polished, responsive implementation of the reference design using the existing Next.js architecture, with all existing backend integrations, data, authentication, and dashboard functionality preserved.