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

## Revisions After The First Review

A pass over the finished app against the judging criteria, which turned up real defects
rather than polish.

- **Keyboard navigation was unusable.** Every passed square was a tab stop, so a keyboard
  user pressed Tab up to 365 times to get past one grid. The grid is now a single tab stop
  with arrow-key movement inside it, and focus survives the redraw after a mark.
- **The end of the phase was not stated.** `prd.md` promised the frequency and the end date
  on each card; only the frequency and start were shown. The end date is now shown, taken
  from the last square so it cannot disagree with the grid.
- **The "next one" ring was unexplained** on screen. It is now in the legend.
- **A finished phase offered no next step.** The card said every moment had passed and left
  it there. It now points at what can still be done.
- **No favicon and a thin page title**, which showed in the browser tab during a demo. Both
  fixed, with a social preview description alongside.

Verified afterwards: one tab stop per 626-square grid; arrows move one square and one visual
row; End lands on the last actionable square; a grid with nothing actionable takes no tab
stop; a fully-passed card is still markable by keyboard; the stated end date equals the last
square's date; `localStorage` blocked at load still lets the app work for the session and
shows the warning line; contrast of the new meta line is 5.75:1; no console errors, no
external requests, no 404s; mobile has no overflow and touch marking still works.

## The Demo Video

`finite-demo.mp4` in the repository root. 1 minute 14 seconds, 1280x720, H.264 with AAC
audio, about 2.8 MB. Recorded from the running app, not from slides or code.

**Voiceover.** The narration is synthetic Nigerian-accented English, generated with
SpeechT5 fine-tuned on Nigerian-accented recordings (`Ngadou/nigerian_accent_tts_en`). The
script is in `devpost/voiceover.md`, and the generator is `devpost/voiceover.py`.

Two things worth knowing about that voice, because both were measured rather than assumed:

1. The fine-tune ships no speaker embedding, and SpeechT5 takes its accent mostly from the
   embedding. So the embeddings are extracted with a SpeechBrain x-vector encoder from the
   same Nigerian training audio, then L2-normalized to the scale the model expects.
2. The model cannot pronounce the product name. Across 240 spelling, speaker and seed
   combinations it produced "Five Nights", "Phoenix", "Fire Nate", "find eights" and
   "finance", and never "Finite". The narration therefore never says the name; the title
   card carries it visually. If you record this in your own voice, say the name.

The captions stay on screen with the narration, so the video still works muted or with
sound off, which is how many reviewers watch. If you would rather use your own voice, the
shot list below is the order to record in and the script is the points to make.

**Shot list, in order**

1. **Title card** (4s) - the name, the one-line idea, and the three square states.
2. **First load** (12s) - the app opens on the seeded ritual. The narration points out that
   the squares pass on their own, which is the idea the whole project rests on.
3. **Marking** (8s) - tap a passed square, it fills in and the kept count rises; tap again to
   take it back. This is the one interaction.
4. **Adding** (15s) - fill the form with a weekly ritual that started years ago. The new card
   comes back partly in the past, because it started in the past.
5. **Coming back** (7s) - the marker moves back 30 days and the page reloads. The card says
   how many moments passed while away, once.
6. **Keyboard** (7s) - the grid is one tab stop, arrows move inside it, Enter records.
7. **Phone** (7s) - the same app at 390px wide, tapping a square.
8. **A finished phase** (6s) - a ritual whose time is up, and recording it anyway.
9. **End card** (7s) - the repository URL and the three planning docs.

What the video deliberately shows, because it is what a reviewer cannot get from the
repository alone: the count moving without the user, the return line, and the grid on a phone.

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

1. Open the page. The legend is under the title: four swatches and one line saying to tap a
   passed square if you were there. Point at it, because it is what makes the rest legible.
   Then the seeded ritual, already partly elapsed: quiet squares behind, lit ones ahead, and
   two counts. Say what the two numbers are.
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
