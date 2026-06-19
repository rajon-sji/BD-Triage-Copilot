# BD Triage Copilot — Project Source of Truth

> This is the single source of truth for the whole project. It explains **what we are
> building, why, and how it should feel**. Read it fully before writing any code, and
> re-read the relevant section before any major decision. If something I ask for later
> seems to conflict with this document, pause and flag it instead of guessing.
>
> Keep this file in the repo (e.g. as `CONTEXT.md` at the root, and optionally mirrored
> into `.cursor/rules/`) so it stays the reference we both come back to.

---

## 0. How we work together

- **Build incrementally, not all at once.** First get the foundation ready (setup,
  dependencies, design system, database, seed data). Then we build one feature at a
  time. After you finish a step, stop and show me before moving on.
- **Confirm before big moves.** Before adding a new dependency, changing the data model,
  or restructuring the app, tell me what and why.
- **No invented complexity.** If a feature isn't described here, it's out of scope until
  I add it. When in doubt, smaller and simpler.

---

## 1. What we're building (in one breath)

A BD person at a software agency gets a **messy project brief** — an Upwork post, a
client email, a recurring client's feature request. They paste it in. In seconds they
get back a **confident first read**: can we take this, what stack fits, how big is it,
roughly what budget, which internal team should run it — grounded in our *real* past
projects. Then they can open a **detailed breakdown** to follow up with confidence.

It is a **triage copilot**, not a chatbot and not a one-click proposal writer. It turns
chaos into a fast, trustworthy first response, then supports the deeper follow-up.

---

## 2. The problem & who it's for

**User:** the Business Development team at SJ Innovation.

**The pain:** the slowest, most senior-dependent step in BD is reading a raw brief and
forming a credible first response — *Is this a fit? What does it involve? Who runs it?
What's it worth?* Today that requires a senior person's time and memory of past work.
Briefs pile up; first responses are slow or inconsistent. The existing BD dashboard
already *measures* the symptoms (proposal conversion, average time to sign) but has
**nothing that helps produce the response itself.** That missing engine is what we build.

---

## 3. The one thing this must prove

> Paste a messy real-world brief → get back, in seconds, a grounded, confident
> first-response snapshot that a BD person could act on immediately — with the actual
> past SJI projects that justify it.

If a demo viewer pastes a chaotic brief and goes "oh — it actually understood this,
and it's showing me *real* projects to back up the call," we've won. Everything in this
doc serves that single moment. Nothing else matters as much.

---

## 4. How it works — the flow in plain language

```
  1. User pastes a brief (or clicks a sample brief)
        │
  2. The AI reads it and pulls out what's being asked for
        │
  3. The AI searches our REAL past projects for similar work   ← this is the grounding
        │
  4. It matches a tech stack + the right internal team, sizes the job,
     and works out a budget range — anchored to those real projects
        │
  5. TIER 1 — First-Response Snapshot appears (the 10-second read)
        │
  6. User can expand to TIER 2 — Detailed Breakdown for the real follow-up
```

The experience is **sequential and confident**, mirroring how BD actually works: a fast,
sure first reply, then the detailed conversation.

---

## 5. Input

Keep input almost effortless — the whole value is that they paste the mess and get clarity.

- **A single large text box** for the brief.
- **"Try an example" buttons** that load real-flavored sample briefs so a viewer never has
  to type: one Upwork-style job post, one direct-client email, one recurring-client
  feature request. (We'll write these together; make them feel real and messy.)
- **Optional source tag** (a small dropdown): *Upwork · Direct client · Recurring client*.
  It gently shifts framing — an Upwork post needs more qualification, a recurring client
  is already trusted.

No login. No forms. No required fields beyond the brief.

---

## 6. The engine (behind the scenes)

Three things work together. Describe their behavior; don't over-engineer them.

1. **Reasoning agent** — reads the brief and extracts structured signals: domain,
   features, tech hints, timeline hints, budget hints, and red flags.

2. **Retrieval over real past work (RAG)** — embeds those signals and searches our
   portfolio corpus (vector similarity) to find the most similar real SJI projects.
   This retrieval is the *evidence* behind every claim the tool makes.

3. **Deterministic math** — the budget range is plain arithmetic (anchored hours ×
   rate card), never a number the model "feels." This keeps it defensible on camera.

**Make it a real agentic loop, not one flat call.** The agent should be able to *decide
what to search for*, retrieve, notice a gap, and search again before it synthesizes.
Give it a `search_past_projects` capability it calls itself. This is what makes it an
agent rather than a chatbot — and we want that to be *visible* (see §10, "The AI Working
Moment").

---

## 7. Output — two tiers

### Tier 1 — First-Response Snapshot (the instant read)
A clean card the BD person can act on in 10 seconds:

- **Verdict:** Strong fit / Possible fit / Poor fit — one line of why
- **Project type & domain**
- **Scope size:** Small / Medium / Large (with a rough hours band)
- **Suggested tech stack**
- **Route to:** which internal POD / team
- **Budget range**
- **Confidence level** + the single biggest risk flag
- **Grounded in:** N similar real SJI projects, each with a match %

### Tier 2 — Detailed Breakdown (expand for the real follow-up)
- Parsed requirements list
- Phase-by-phase scope with hours
- Full estimate table
- Risks & assumptions
- The retrieved real projects, each with match % and what it contributes
- **Suggested clarifying questions to send the client** ← high value; this is what a
  real first BD touch actually is
- **A draft first-response message** to the client

---

## 8. Data we seed

Three small datasets power everything. **The portfolio is real; the other two we can
fill with realistic values.**

1. **Portfolio corpus (REAL):** SJ Innovation's real past projects — title, client type,
   problem, solution, tech stack. Source is the live portfolio (it's a single-page app,
   so the data comes from its backend/export or its data feed, not page scraping —
   we'll sort out extraction together). Real case studies usually lack hour breakdowns,
   so we'll **augment each with a realistic phase + hours estimate** (generated once,
   then sanity-checked) so the budget math has something to anchor to.

2. **Rate card:** a few roles × hourly rates. Drives the budget arithmetic.

3. **PODs / Teams capability table:** each internal team and its tech specialties. Drives
   the "route to" recommendation. (SJI already has a PODs/Teams concept, so this slots in.)

---

## 9. Tech stack

Chosen to be free, simple, and fast to build solo. Don't add to this without asking.

- **App:** Next.js (App Router) — one repo, UI + API routes together. No separate backend.
- **Database + vector search:** Supabase (free tier) with the `pgvector` extension. The
  corpus and the similarity search both live here.
- **AI model + embeddings:** Google Gemini (Flash) for reasoning, Google embeddings for
  vectors. Free with one API key. (If I later say to use Claude for generation, it's a
  one-line swap — keep the model call isolated so that's easy.)
- **Streaming layer:** the Vercel AI SDK, so the agent's output and steps can *stream in*
  live (this powers the "AI working" feel — see §10).
- **Hosting:** Vercel (free tier). Push to GitHub → auto-deploy → gives us the public URL.

No authentication, no payments, no multi-tenant. This is a showcase MVP.

---

## 10. Design direction — this is as important as the engine

The product must feel like a **modern AI platform where intelligence is clearly working
for you behind the scenes** — calm, premium, confident. Not a generic dashboard, and
absolutely not "AI slop" (default gradients, purple-on-white, emoji-stuffed cards).

### Use the Hallmark design skill
Install and follow it so our design has real taste and consistency:

```
npx skills add nutlope/hallmark
```

Let Hallmark guide the type, spacing, and component polish. Our job is to apply it with
restraint and a clear point of view, not to decorate.

### The AI Working Moment (the signature element — get this right)
When the user submits a brief, **do not show a generic spinner.** Show the agent's real
work, streaming in as a sequence of steps that light up and complete one by one:

```
  ◐  Reading the brief…
  ◐  Finding similar SJI projects…        →   ✓ 3 matches found
  ◐  Matching tech stack & team…
  ◐  Sizing scope & budget…
  ◐  Writing your snapshot…
```

Each step animates in, shows it's active, then resolves. Where the agent actually
searches, surface the search term ("Finding projects like: *CRM integration for
insurance*"). This is both delightful UX **and** the visible proof that it's a real
agent doing real work. Then the Tier-1 snapshot streams/reveals in. This moment is the
demo's heartbeat — spend the polish here.

### Brand — SJ Innovation
Anchor the palette to SJI's brand. **Sample the exact colors from the live logo at
https://sjinnovation.com (the logo is the source of truth for hue).** As a starting
point derived from SJI's product UI and logo:

- **Accent / energy:** SJI coral-orange (the warm tone in the logo mark) — use sparingly,
  for the AI/active states and primary actions.
- **Ink / structure:** deep navy (the wordmark color) for text and surfaces.
- **Secondary / intelligence:** a teal→indigo range (seen across the existing BD and
  Marketing apps) for AI accents, the working-moment, and data highlights.
- Neutral grays for everything else; lots of calm whitespace.

Treat orange as the rare, deliberate accent — most of the screen is quiet so the AI
moments pop. Verify the real hex values from the logo before finalizing tokens.

### Quality floor
Responsive to mobile, visible keyboard focus, respect reduced-motion, clear empty and
error states written in plain language ("Paste a brief to get started," not a stack trace).

---

## 11. Dependencies & setup sequence

Do this in order. Confirm the project runs after each major step before continuing.

1. **Scaffold** a Next.js (App Router) app with TypeScript and Tailwind.
2. **Add the design skill:** `npx skills add nutlope/hallmark` and read it.
3. **UI foundation:** set up shadcn/ui (Radix-based, accessible components) so it pairs
   with Hallmark; add `lucide-react` for icons.
4. **Motion:** add `framer-motion` for the AI Working Moment and reveal animations.
5. **Charts:** add a polished charting library for the detailed view and any metrics —
   prefer `@tremor/react` (clean, product-grade dashboard charts) or Recharts.
6. **AI + streaming:** add the Vercel AI SDK (`ai` + the Google provider) for streaming
   and tool-calling against Gemini.
7. **Data:** add the Supabase client (`@supabase/supabase-js`); create the Supabase
   project; enable `pgvector`.
8. **Markdown rendering** (optional): `react-markdown` for rendering the report and the
   draft client message nicely.
9. Establish the **design tokens** (brand colors above, type scale, spacing) once, up
   front, so every component inherits them.

Then stop. We'll build features one at a time: data model + seed → retrieval →
agent loop → Tier-1 snapshot → the AI Working Moment → Tier-2 detail → deploy.

---

## 12. Out of scope (do NOT build these)

- Authentication, user accounts, roles, settings pages
- Editing / saving / versioning proposals
- PDF or document export
- Pushing anything to a CRM or the existing BD platform
- Multi-tenant or admin panels
- Anything not in the path: **brief → grounded snapshot → detailed breakdown**

If it isn't proving the §3 statement, it waits.

---

## 13. Definition of done (the demo)

Done means: a viewer clicks a sample messy brief (e.g. an Upwork post), watches the AI
Working Moment stream through its steps, and within seconds sees a First-Response
Snapshot — verdict, stack, team, scope, budget — **grounded in real SJI projects with
match percentages** — then expands the detailed breakdown with clarifying questions and
a draft client reply. It's deployed at a public URL. It looks like a premium AI product,
not a hackathon hack.

---

## 14. The north star, one more time

**Messy brief in → confident, grounded first response out, in seconds, backed by our
real work.** When a choice is unclear, pick the option that makes *that* moment land
harder, and keep everything else quiet.
