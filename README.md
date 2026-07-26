# Doc Pro

A full-stack doctor appointment booking platform with a constrained, safety-first AI health guidance assistant. Built as a portfolio project using a single Next.js monolith.

> **This is a demo application using fictional seeded data.** It is not a real medical service, does not provide medical diagnoses, and should not be used to make actual healthcare decisions.

## Tech stack

- **Framework:** Next.js 16 (App Router, Turbopack), TypeScript, React
- **Styling:** Tailwind CSS, shadcn/ui
- **Database:** PostgreSQL, Prisma ORM 7
- **Auth:** Better Auth (email/password, role-based sessions)
- **Validation:** Zod, on every server input
- **Forms/state:** React Hook Form patterns, Server Actions
- **File storage:** Cloudinary (avatar uploads)
- **AI:** Google Gemini API (`@google/genai`), structured JSON output
- **Testing:** Vitest + React Testing Library (unit), Playwright (e2e)
- **Linting:** Biome
- **Deployment target:** Vercel + Neon/Supabase Postgres

## Roles

- **Patient** — browse doctors without an account; sign in to book, manage appointments, and use the AI assistant.
- **Doctor** — applies for an account (reviewed by an admin), manages weekly availability, updates appointment status, edits their own profile.
- **Admin** — reviews doctor applications, manages specialties, views basic analytics.

## Core features

- Public doctor directory with URL-driven search, specialty filter, and sort (shareable/bookmarkable).
- Weekly-availability-template scheduling: doctors set working hours, lunch break, and session length; bookable slots are computed on the fly, not pre-materialized.
- Booking supports family members (book on behalf of a dependent) and is DB-enforced against double-booking via a partial unique index — verified under real concurrent requests, not just application-level checks.
- Appointments auto-confirm on booking (no doctor approval step required before a slot is held).
- Patient-side cancellation within a 2-hour policy window; doctor-side status transitions (`PENDING → CONFIRMED → COMPLETED/NO_SHOW`, or `→ CANCELLED`) follow an explicit, enforced state machine.
- Post-appointment star ratings (1–5, one per completed appointment), with the doctor's average recomputed from all ratings on every submission — not incrementally updated.
- Doctor self-service application form; admin approval/rejection queue; profile editing (bio, fee, specialties, photo) for both patients and doctors.
- Role-aware navigation, logout, and role-based default landing page after sign-in.
- **AI Health Guidance Assistant** (see below).

## AI Health Guidance Assistant — architecture

This is not a diagnostic tool, and the architecture is built specifically to prevent it from becoming one:

1. **Consent gate.** A patient must explicitly consent (versioned; a future policy change requires re-consent) before the assistant is reachable at all. Checked server-side on every request, not just gated by the UI.
2. **Deterministic red-flag screening, in two independent layers.** A fixed checklist of emergency symptoms is checked first — this is a lookup against booleans, not a model decision. As a safety net, a keyword scan on free-text chat messages provides a second, independent check, since a patient may describe an emergency in words that don't match a checkbox. If either layer matches, the model is never called, and the patient is shown urgent-care guidance (including crisis resources for self-harm indicators).
3. **The model never sees a doctor list and never names one.** It outputs a suggested specialty (from a fixed, closed enum) and a structured summary. Which real doctors get suggested is a separate, deterministic database query — the model has no path to hallucinate a doctor.
4. **Structured output, validated twice.** The model's JSON response is constrained by a schema at the API level, then re-validated server-side with Zod, then scanned against a list of banned content patterns (dosages, diagnostic claims, "ruled out" language) as defense-in-depth — the system prompt's instructions are not treated as a hard guarantee on their own.
5. **Nothing is persisted unless the patient chooses to attach it.** The generated summary lives only in the browser (`sessionStorage`) between the AI-assist page and the booking page. If the patient never books, or unchecks "attach this summary," it never touches the database. The original reason-for-visit text (always patient-authored) is stored separately from any AI summary, never conflated.
6. **The audit log stores metadata, not content.** `AiInteractionAuditLog` records whether a red flag fired, whether output passed validation, token counts, and a one-way hash of the input — never the patient's actual words or the model's actual output.

## Notable architecture decisions

- **Server Actions vs. Route Handlers:** CRUD-style mutations tied to a page use Server Actions; the AI endpoint is a Route Handler for a stable, independently testable HTTP contract.
- **Scheduling model:** `DoctorAvailability` stores a recurring weekly template (day, hours, break, session length), not materialized per-date slot rows. Slots are computed at request time and cross-checked against existing bookings. `Appointment.durationMinutes` is snapshotted at booking time so a doctor changing their default session length later doesn't retroactively alter past bookings.
- **Timezone handling:** the hospital operates in a single fixed timezone (`Asia/Kolkata`, set as `HOSPITAL_TIMEZONE`). Weekly-template fields (`workStart`, `workEnd`, etc.) store a wall-clock time-of-day using UTC field getters as a container, not a real instant — displayed with `timeZone: 'UTC'`. Actual appointment instants (`startUtc`) are genuine UTC timestamps, converted to/from hospital-local time at the boundary — displayed with `timeZone: HOSPITAL_TIMEZONE`. These two are not interchangeable; mixing them up was a recurring bug during development.
- **Double-booking prevention:** a Postgres partial unique index on `(doctorProfileId, startUtc) WHERE status IN ('PENDING', 'CONFIRMED')` — the actual source of truth, not an application-level pre-check, which cannot be race-proof on its own.
- **Role-based landing page:** after sign-in, doctors and admins land on their dashboard; patients land on the homepage (browsing is the more common first action for that role). An explicit `redirectTo` (e.g., from a protected page bounce) always takes priority over the role default.

## Setup

```bash
npm install
```

Create `.env` with:
```
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
BETTER_AUTH_SECRET="<32+ char random string>"
BETTER_AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
GEMINI_API_KEY="..."
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

Generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Run migrations and seed:
```bash
npx prisma migrate dev
npx prisma db seed
```

Start the dev server:
```bash
npm run dev
```

### Demo accounts (all seeded, fictional)

| Role | Email | Password |
|---|---|---|
| Admin | admin@docpro.test | AdminPass123! |
| Doctor (approved) | dr.mehta@docpro.test | DoctorPass123! |
| Doctor (approved) | dr.rao@docpro.test | DoctorPass123! |
| Doctor (approved) | dr.iyer@docpro.test | DoctorPass123! |
| Doctor (pending) | dr.khan@docpro.test | DoctorPass123! |
| Patient | patient.demo@docpro.test | PatientPass123! |
| Patient (with family member) | patient.family@docpro.test | PatientPass123! |

## Testing

```bash
npm run test              # unit tests (Vitest)
npx playwright test       # e2e tests
npm run test:e2e:clean    # full reset + reseed + e2e run, for a guaranteed-clean state
```

The e2e suite runs against a **shared, mutable dev database** with no per-test data isolation — `playwright.config.ts` runs tests serially (`workers: 1`) for this reason. Several tests mutate seeded data (approving a doctor, cancelling an appointment); `test:e2e:clean` is the safe way to run the full suite from a known state.

## Known limitations (deliberate scope decisions, not oversights)

- **No per-date availability exceptions.** A doctor's schedule is a fixed weekly template only — no holiday overrides or one-off schedule changes.
- **No reschedule**, only cancel-and-rebook — avoids a second concurrency path against the same booking slot.
- **Single-hospital, single-timezone scope.** No multi-tenancy.
- **No email confirmations or reminders.** Explicitly deferred; not yet built.
- **No moderation queue for ratings or reviews.**
- **Doctors are auto-confirmed on booking** — there is no longer a manual doctor-side "accept" step before a slot is held.

## Project structure

```
src/
  app/            # routes: pages, Server Actions, Route Handlers, colocated client components
  components/     # shared UI (navbar, footer)
  lib/            # framework-agnostic logic: db client, auth config, repositories, scheduling, AI, validation
prisma/
  schema.prisma
  seed.ts
tests/
  unit/           # Vitest
  e2e/            # Playwright
```