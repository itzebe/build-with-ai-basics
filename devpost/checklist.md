---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. You can see a ritual and the grid of instances it has left**
  Becomes usable: A page that opens and shows one ritual card with its name, its frequency, and a grid of squares — one per remaining instance. Nothing is interactive yet.
  Why now: Proves the whole path end to end on the first slice — page, styles, state, calculation, render — so every later slice has somewhere to land. Bootstrapping lives here rather than as its own step.
  PRD ref: `prd.md > Screens and Layout`, `prd.md > States and Boundaries` (first use)
  Spec ref: `spec.md > File Structure`, `spec.md > Components` (index.html, app.js — state and rendering), `spec.md > Look and Feel`
  Build: Create `index.html`, `styles.css` and `app.js`. Add the palette tokens and typography from the spec. Seed the example ritual (Saturday pancakes, weekly, 12 years). Implement `remainingFrom()` and `render()` so one card draws with its name, frequency line, remaining count and a grid of squares sized by count.
  Verify (mechanical): Serve with `python3 -m http.server 8000`, fetch the page, and confirm HTTP 200 with the card markup present. Evaluate `remainingFrom({freq:'weekly',durationValue:12,durationUnit:'years'})` in the page and confirm it returns 626. Confirm the rendered grid contains exactly 626 square elements.
  Learner check: Open http://localhost:8000 and look at the card. Does the grid read as "a lot of these left" at a glance, and does the page feel calm rather than like a dashboard?
  Commit: `Add ritual card with remaining-instances grid`

- [x] **2. You can see which moments have passed, and record being there**
      Scope: every occurrence gets a real date, derived from the start date and the
      frequency. Past dates render quiet, future dates render lit, and tapping a passed
      square records that you were there — reversibly.
      Verified: with the seeded ritual, 626 squares render as 366 passed and 260 upcoming.
      Tapping index 0 changes kept from 0 to 1 and adds `.is-kept`. Tapping it again
      returns it to 0. Marking indices 0, 1, 2 and 50 stores `[0,1,2,50]`; clearing index
      1 stores `[0,2,50]`. A tap on a future square does nothing (those are `disabled`).
      The occurrence list is pure: two calls return identical dates.
      Note: this slice originally read "you can spend an instance and watch the grid
      shrink". Revised — see Revisions below.

- [x] **3. You can add your own ritual**
  Becomes usable: An inline form that takes a name, a frequency and a duration, and adds a new card with a correctly calculated full grid.
  Why now: Until now the only ritual is the seeded example. This is what makes it the user's own app rather than a demo, and the calculation is the one piece of real logic in the project.
  PRD ref: `prd.md > Features and Behavior` (Adding a ritual), `prd.md > States and Boundaries` (invalid input)
  Spec ref: `spec.md > Components` (app.js — calculation), `spec.md > Data Model`
  Build: Add the form markup and styles. Implement `handleAdd()`: trim the name, convert duration and frequency to days, `Math.floor`, clamp to 1–2000. Validate — reject an empty name, a non-positive duration, and anything over 2000 — with a short inline message next to the field. Push the new ritual, re-render, and reset the form.
  Verify (mechanical): Submit three valid rituals (weekly/12 years → 626, yearly/20 years → 20, monthly/3 years → 36) and confirm each rendered count. Submit an empty name and a duration of 0 and confirm both are rejected with a visible inline message and no new card.
  Learner check: Add a ritual that is actually yours — a real one, with a real frequency. Does the number it gives you feel right?
  Commit: `Add a ritual from an inline form`

- [x] **4. Rituals survive closing the tab**
  Becomes usable: Rituals and their spent squares are still there when the page is reopened, including after the browser is fully closed.
  Why now: This is the learner's identified uncertainty in `spec.md > Decisions and Open Issues` — the one load-bearing assumption in the design. Finding out now, while the change is small, is much cheaper than discovering it during a recording.
  PRD ref: `prd.md > States and Boundaries` (persistence, boundaries)
  Spec ref: `spec.md > Components` (Persistence), `spec.md > Data Model`, `spec.md > Important Failure Modes`
  Build: Implement `save()` writing to `localStorage["finite.rituals.v1"]` and `load()` reading it back. Wrap both in `try`/`catch` and fall back to the seeded example on missing or unparseable data. Validate each restored ritual's fields and discard anything malformed. Seed only when nothing is stored. Add the one small line explaining that clearing site data clears rituals.
  Verify (mechanical): Spend 3 squares, read the `localStorage` key and confirm `spent: 3` is stored. Reload the page and confirm the count reflects it. Corrupt the key with invalid JSON, reload, and confirm the app re-seeds instead of throwing.
  Learner check: Spend a square, close the browser completely, reopen it and open the page again. Are the spent squares still spent?
  Commit: `Persist rituals and spent instances to localStorage`

- [x] **5. The grid stays readable, and the three states are distinguishable**
      Scope: size steps down by count so 626 squares stay legible; the three square states
      (upcoming, passed, kept) are visually distinct; the next upcoming square is weighted.
      Verified: 626 squares get `is-xxs`. Contrast measured against the card: upcoming
      5.81:1, kept 9.16:1, passed fill 1.41:1 with a `--passed-edge` hairline at 3.15:1 —
      the fill is meant to recede, and the edge carries the visibility on a projector.
      Passed vs upcoming is 4.13:1, so the two are clearly different colours.
      Revised — see Revisions below.

- [x] **6. A card can finish, and you can remove one**
  Becomes usable: A ritual whose squares are all spent shows a clear finished state, and any ritual can be removed with a confirmation.
  Why now: Last because it is the completeness pass — it closes the states the PRD names, and it is the only slice that can be cut without damaging the kernel if time runs short.
  PRD ref: `prd.md > Features and Behavior` (Removing a ritual), `prd.md > States and Boundaries` (finished, empty state)
  Spec ref: `spec.md > Components` (app.js — rendering), `spec.md > Data Model`
  Build: Add the finished state for a card at zero remaining. Add a quiet remove control, visually separated from the grid so it cannot be hit by accident, behind a confirmation. Add the empty state for when every ritual has been removed.
  Verify (mechanical): Spend a card to zero and confirm the finished state renders. Remove a card and confirm it disappears and the `localStorage` array is one shorter. Remove every card and confirm the empty state renders.
  Learner check: Finish one off and remove it. Is the wording right, or does it need to say something different?
  Commit: `Add finished and empty states plus ritual removal`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 2, the kernel
- [ ] Persistence confirmed by the learner — after slice 4, closing the browser entirely
- [ ] Final kick-the-tires exploration and feedback completed

## Submission Handoff

What is done, and what is the learner's own to finish. None of the items below has been
done on the learner's behalf.

- [x] App complete and verified; live at
      https://work-1-yrluinyyypugxots.prod-runtime.all-hands.dev/ (a sandbox URL, so the
      video is the durable artefact).
- [x] Public repository: https://github.com/itzebe/build-with-ai-basics
- [x] Required planning docs present at the repo root and in `devpost/`.
- [x] No secrets, no private context, learner profile gitignored and never committed.
- [ ] Demo video, 1-3 minutes, showing it working end to end.
- [ ] Learner-written project name, description, and Devpost form fields.
- [ ] Submit on Devpost.

### A suggested recording path

Not a script, and not narration — the learner writes that. Just the moves that show the
kernel working, in about a minute:

1. Open the page. The seeded ritual is already partly elapsed: quiet squares behind, lit
   ones ahead, and two counts. Say what the two numbers are.
2. Tap a quiet square. It fills in. Tap it again and it clears.
3. Add a ritual with a start date well in the past — a daily one a year back works well.
   The grid appears already mostly gone, which shows time is doing the work rather than
   the tapping. This is the move that proves the idea without waiting a week.
4. For the return-visit line without waiting: in the browser's storage set `lastSeenISO`
   on the seeded ritual to a date a few weeks back, then reload. The card says how many
   moments passed in between.
5. Reload once more to show the kept marks survived.

The one thing worth saying out loud, because it is the whole idea: the number moves
whether or not you open the app.

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship
      Technical review is complete: all six slices verified, plus a full regression
      pass (first load, mark, undo, add, reload, browser restart), zero external network
      requests, WCAG AA contrast on text, and a 390px mobile pass with touch. The
      time-driven redesign was verified end to end, including the two date bugs recorded
      under Revisions. This box stays unchecked because
      it also asks for the learner's confirmation, which has not been given. The
      remaining learner items are the three checkpoints above and the submission
      copy, which are the learner's own to write.

## Code Tour and App Map

- [x] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [x] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Guided code route written into `devpost/app-map.html` from the
finished code, then checked in a headless browser: all six sections render, no console
errors, and every link to a planning document resolves (no 404s). Evidence lives in the
map itself plus the per-slice verification lines above and the regression pass recorded
under Final Review.
Route and stops: `app.js > remainingFrom()` → `buildCard()` → `spend()` → `save()` /
`load()` → `styles.css > .sq` and the size classes. Five stops, in dependency order,
each one named by symbol. The practice reuses the app's own `seed()` and `spend()`.
Edit outcome: Not yet attempted by the learner. The suggested edit is in the map's
"Try changing something" section: swap the seed ritual for a real one, then change its
frequency from weekly to daily and watch the grid change. Offered, not applied.
Reflection: Offered, not yet answered. The two learner checkpoints above and the
submission description are the learner's own to give; nothing has been written on
their behalf.
Activity mode: Explicit static fallback — `devpost/app-map.html` is a self-contained
page with no dependencies, so the route can be followed without running anything, and
the app itself can be opened from the repository root with a static server.

## Revisions
- Spent squares are removed from the grid rather than greyed out and disabled — `scope.md > The Unique Kernel` defines the grid *shrinking* as the product, which contradicts `spec.md`'s original "a spent square is disabled" wording. `spec.md > Look and Feel` and `spec.md > Components` were corrected to match the kernel, and `--spent` is now used only for the 150ms leaving transition.
