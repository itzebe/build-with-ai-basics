<!-- Canonical copy: devpost/spec.md — this root copy exists so the submission requirement is visible at a glance. Edit devpost/spec.md. -->

---
doc: spec
status: approved
---

# Finite — Technical Spec

## How This Works, In Plain Language

There are three pieces, and only three.

**A page you look at.** `index.html` is the whole screen. It has an empty space where the ritual cards will go, and a small form for adding one. It is deliberately almost empty — everything you see is drawn by the script.

**A script that does the thinking.** `app.js` holds the list of rituals in memory. For each one it works out the date of every occurrence from the start date and the frequency, compares those dates to today's date, and draws a card. Squares whose date has passed are drawn quiet; squares still to come are drawn lit. When you tap a passed square, it records that you were there and redraws the card. That is the entire logic.

**Why time drives it rather than your taps.** Nothing is stored about which squares have passed. The passed/future split is recomputed from the clock every time the page is drawn. That means the grid is always correct, even if the app has not been opened for months, and there is no background process, no timer, and no way for the stored data to disagree with reality.

**A shelf in the browser to keep things on.** When the list changes, the script writes it to `localStorage` — a small storage box the browser keeps for one site. When you open the page again, it reads that box back and rebuilds the cards. There is no server and nothing is sent anywhere.

Why this shape rather than something more elaborate: the whole product is one screen, one list, and one calculation. A framework would add a build step, a dependency that can break, and files to maintain, and would not make the grid any better. Plain HTML, CSS and JavaScript means you can open the project and read all of it.

## The Core Journey Through the System

Implements `prd.md > The Core Journey`.

1. You open the page → `index.html` loads `styles.css` and `app.js`.
2. `app.js` runs `load()` → reads `localStorage["finite.rituals.v1"]`. If nothing is there, it writes the example ritual and uses that.
3. It calls `render()` → for each ritual it calls `occurrences(ritual)` to build the list of dates, then draws a card. Each date becomes a square, marked passed or upcoming by comparing it to today.
4. You type into the add form and press save → `handleAdd()` validates the four fields, calls `totalFrom(input)` to work out how many occurrences fit, pushes a new ritual onto the list, calls `save()` and then `render()`. Because the start date is stored, the new card's timeline is already partly elapsed if the phase began in the past.
5. You tap a passed square → `toggleKept(id, index)` adds or removes that occurrence's index in the ritual's `kept` list, then calls `save()` and `render()`. The kept count on the card changes in the same redraw.
6. You tap a future square → nothing happens. `toggleKept()` returns early.
7. You close the tab and come back next week → step 2 runs again, your kept marks are still there because they were written to storage, and **the passed/future split has moved on its own**, because it is recomputed from the clock in step 3. Step 3 also compares today to `lastSeenISO` and, if occurrences fell in between, draws the line saying how many passed while you were away.

## Stack

Plain HTML, CSS and JavaScript. No framework, no build step, no package manager, no dependencies to install.

- **HTML5** — [developer.mozilla.org/Web/HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
- **CSS** — custom properties for the palette, CSS Grid for the square grid. [developer.mozilla.org/Web/CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- **JavaScript (ES2020+)** — no modules, one plain script tag so the page also works when opened directly. [developer.mozilla.org/Web/JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- **`localStorage`** — [developer.mozilla.org/Web/API/Window/localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- **System font stacks only.** No webfont is loaded, so the app makes zero network requests and renders correctly offline.

Rationale: a proof of concept whose whole point is a visual that must not stutter during a screen recording should have nothing in it that can fail to load.

## Where It Runs and How Someone Tries It

Runs in a browser. Nothing else is required — no API keys, no accounts, no configuration.

**Exact start command**, from the project root:

```bash
python3 -m http.server 8000
```

Then open **http://localhost:8000**.

A local server is recommended rather than double-clicking `index.html`, because browsers treat `file://` pages inconsistently and some refuse `localStorage` on that origin. Serving it over `http://localhost` makes saving reliable. Any static server works; `npx serve` and `php -S localhost:8000` are equally fine.

To record the demo: start the server, open the page, and the whole journey fits in well under a minute.

Submission requires both a short demo video and a public GitHub repository. Deployment is optional and is not planned — a local app is fine to record, and the spec's run instructions above are what a reviewer would follow.

## Look and Feel

Carried forward from `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`. These are the exact tokens to use.

```
--paper:      #faf7f2   /* page background, warm off-white */
--card:       #fffdf9   /* card surface, barely lighter than paper */
--ink:        #1c1a17   /* primary text, warm near-black */
--ink-soft:   #6b6459   /* secondary text, frequency line */
--rule:       #e6dfd4   /* hairline borders */
--live:       #2f6f5e   /* a remaining square: deep muted green */
--spent:      #d8d1c6   /* a spent square: warm grey, NOT black */
--focus:      #8a6f3f   /* focus rings, warm bronze */
```

- **Typography.** Headings and numbers in a serif stack: `ui-serif, Georgia, "Iowan Old Style", "Times New Roman", serif`. Labels and body in a sans stack: `ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif`. Ritual names ~1.35rem, the remaining count ~2.1rem with `letter-spacing: 0.02em` and `font-variant-numeric: tabular-nums` so it does not jump as it changes. Labels ~0.72rem, uppercase, `letter-spacing: 0.08em`, `--ink-soft`.
- **Density and energy.** Spacious. Card padding ~1.4rem, 1.1rem gap between cards, page max-width ~46rem centred. The interface should feel unhurried and should never look like it wants more of the user's attention.
- **Copy tone.** Plain, calm, second person, no exclamation marks, no praise. "You have 41 left." Never "Only 41 left!" or "You've used 5!".
- **Squares.** `border-radius: 3px`, 2px gap, sized by count so the grid stays readable:

  | remaining | square size |
  |---|---|
  | ≤ 60 | 20px |
  | ≤ 200 | 15px |
  | ≤ 600 | 11px |
  | > 600 | 9px |

  Applied as a class on the grid element (`is-sm`, `is-xs`, `is-xxs`) rather than inline styles.
- **Three square states**, and the contrast between them carries the meaning:

  | State | Fill | Border | Meaning |
  |---|---|---|---|
  | Upcoming | `--live` | none | has not happened yet |
  | Passed | `--passed` (pale) | hairline `--rule` | gone, not recorded |
  | Kept | `--kept` (deep) | none | gone, and you were there |

  Passed is *paler than upcoming*, not darker. The eye should read the past as receding
  and the future as still available — the opposite of a progress bar, which fills up.
  Kept is the darkest thing on the card, so the marks you made are what stands out.

- **The next occurrence.** The next upcoming square gains a hairline `--ink` border and slightly more weight. It should feel heavier, not alarming — no red, no pulse.
- **Motion.** Squares transition `background-color` over 150ms when marked. Everything else is instant. Wrap the transition in `@media (prefers-reduced-motion: reduce)` and disable it there, in which case marking re-renders immediately.
- **Avoided, explicitly.** Emoji, gradients, glassmorphism, drop shadows beyond a hairline, progress rings, streak counters, confetti, stock imagery, purple-to-blue. Also avoided: any red, any warning colour, and any treatment of a passed-but-unkept square that reads as a failure. It is just a past square.

Token additions for the palette:

```
--passed:       #ded7cb   /* a passed square: paler than upcoming, not darker */
--passed-edge:  #9c8e78   /* its hairline edge, at 3.15:1 against the card */
--kept:         #1f4f42   /* a kept square: the deepest colour on the card */
```

The passed fill is deliberately low-contrast against the card (1.41:1), because a passed
square should recede rather than shout. Its edge carries the visibility instead, at 3.15:1 —
enough to hold up on a projector without turning the past into the loudest thing on screen.
Kept sits at 9.16:1, the highest on the card, so the marks you made are what the eye finds
first.

## Components

### `index.html` — the shell

Static markup only: a `<header>` with the title and one-line explanation, a `<p>` showing the total, an empty `<main id="stack">`, and a `<form id="add-form">` with three labelled inputs and save/cancel buttons. No ritual content is hard-coded — the script fills `#stack`.
PRD ref: `prd.md > Screens and Layout`.

### `app.js` — state, calculation and rendering

One file, three concerns, in this order:

- **State.** `let rituals = []`. Each ritual is:

  ```js
  {
    id: "r_1712345678901",        // unique, from Date.now() plus a counter
    name: "Saturday pancakes",     // user text, trimmed
    freq: "weekly",                // "daily" | "weekly" | "monthly" | "yearly"
    durationValue: 12,             // number, as typed
    durationUnit: "years",         // "days" | "weeks" | "months" | "years"
    startISO: "2019-03-02",        // when the phase began, local date
    total: 626,                    // computed once at creation, never recomputed
    kept: [0, 1, 4, 7],            // occurrence indices the user recorded being there for
    lastSeenISO: "2026-10-15"      // the day the app was last opened, per ritual
  }
  ```

  `kept` stores **indices into the occurrence list**, not dates. The occurrence list is
  deterministic — it is always `start + n × period` — so an index identifies a moment
  permanently, and the stored data stays tiny even for a grid of 626.

  **Nothing about passed or remaining is stored.** Both are derived on every render from
  `startISO`, `freq` and today's date. This is the single most important property in the
  data model: the app cannot go stale, because it holds no opinion about the present.

- **Calculation.** Two functions, and the second one is the heart of the app.

  `totalFrom({freq, durationValue, durationUnit})` converts both sides to days and divides:

  ```
  DAYS_PER_PERIOD = { daily: 1, weekly: 7, monthly: 30.4375, yearly: 365.25 }
  DAYS_PER_UNIT   = { days: 1, weeks: 7, months: 30.4375, years: 365.25 }
  total = Math.floor(durationValue * DAYS_PER_UNIT[durationUnit] / DAYS_PER_PERIOD[freq])
  ```

  `Math.floor` rather than round, so the count never promises an occurrence that does not
  fit. Minimum of 1. Maximum 2000 — beyond that the grid is meaningless and the form
  rejects it.

  `occurrences(ritual)` returns the array of `Date` objects, one per occurrence, in order:

  ```
  occurrence n = start + n × period,  for n = 0 … total − 1
  ```

  Periods are added with `setDate`/`setMonth`/`setFullYear` on a copy of the start date,
  **not** by multiplying milliseconds. This matters: adding 7 × 86,400,000 ms across a
  daylight-saving boundary drifts by an hour and can land an occurrence on the wrong day,
  which would put a square in the wrong state. Calendar arithmetic keeps the local date
  stable.

  Because `occurrences()` depends on `total` and `startISO` only, it is pure and returns
  the same list every call. That is what makes index-based `kept` safe.

  `splitOccurrences(list, today)` then partitions that array into passed and upcoming by
  comparing each date to the start of today. An occurrence **on** today counts as passed,
  because the day has already begun.

  Worked examples of `totalFrom`: weekly for 12 years → `12 × 365.25 ÷ 7` → **626**.
  Yearly for 20 years → **20**. Monthly for 3 years → `1095.75 ÷ 30.4375` → **36**.
  Worked example of the split: those 626 weekly occurrences starting 2019-03-02, read on
  2026-10-22, give **399 passed and 227 upcoming** — the first occurrence is the start date
  itself, and the last is 2031-02-22.

  Month-end is clamped rather than allowed to overflow: starting on 31 January, the monthly
  sequence is 31 Jan → 28 Feb → 31 Mar → 30 Apr → 31 May. Without the clamp, JavaScript's
  `setMonth` rolls 31 February into 3 March, which would put the whole timeline on the wrong
  days from then on.

- **The legend.** Static markup in `index.html`, not generated by script, because it never changes and belongs in the document. Three `<span class="key-swatch">` elements carrying the same classes the real squares use (`is-upcoming`, `is-passed`, `is-kept`), so the legend cannot drift out of step with the grid it describes — if a colour changes in the stylesheet, both change together. One sentence under it states the interaction, and the whole thing is a `<p>`-level caption rather than a control, so it needs no dismissal and no ARIA beyond plain text.

- **Noticing the gap.** `notePassage()` runs once at startup, before the first render. For each ritual it counts how many occurrences fell between `lastSeenISO` and today, records that count in the transient `sinceLastSeen` map for `buildCard()` to draw, then moves `lastSeenISO` to today and saves. The count is never persisted, because it describes a difference between two dates rather than a fact about the ritual — storing it would let it go stale exactly the way the old `spent` counter did. A ritual with no `lastSeenISO` (an older record) is skipped rather than shown a bogus number, and gains the field on that first run.

- **Rendering.** `render()` clears `#stack` and rebuilds every card from `rituals`. Rebuilding wholesale rather than diffing is deliberate: the list is tiny, and a full rebuild means the DOM can never disagree with the state.

  Each square is a `<button>` with `data-id` and `data-index`, plus `.is-passed` or `.is-upcoming`, and `.is-kept` if its index is in `kept`. Its `aria-label` states the date and what tapping will do, for example `"Saturday 2 March 2019, passed. Not marked as kept. Tap to record you were there."` Future squares are `disabled`, since there is nothing to record about a moment that has not happened.

  Tapping a passed square adds `.is-marking` (filling toward the kept colour over 150ms), then re-renders with the index toggled in `kept`. Under `prefers-reduced-motion: reduce` the re-render is immediate. The next upcoming square carries `.is-next`.

  The card also renders the two counts and the next-occurrence line from the same split, so all three can never disagree.

PRD ref: `prd.md > Features and Behavior`, `prd.md > The Core Journey`.

### Persistence

`save()` writes `JSON.stringify(rituals)` to `localStorage["finite.rituals.v1"]`. `load()` reads it, `JSON.parse`s it inside a `try`/`catch`, and falls back to the seeded example if the value is missing or unparseable. Every write is wrapped in `try`/`catch` too, because `localStorage` throws in private browsing and when the quota is full.

The stored payload is deliberately small: dates are never stored, only `startISO`, `total` and the `kept` indices. A 626-occurrence ritual with 400 kept marks is a few kilobytes, so quota is not a practical concern.
PRD ref: `prd.md > States and Boundaries`.

### Seeding

If `load()` finds nothing, `app.js` creates one example ritual — "Saturday pancakes", weekly, 12 years, starting seven years ago — and saves it, so the first screen is never empty and the timeline is already partly elapsed. A ritual starting today would show a fully lit grid, which hides the whole mechanic.

The card is marked with a small line saying it is an example.
PRD ref: `prd.md > States and Boundaries` (first use).

## Data Model

One key, one shape, no relationships.

- **Where it lives.** `localStorage["finite.rituals.v1"]`, as a JSON array of ritual objects. The `.v1` suffix means a future shape change can be detected rather than crashing on old data.
- **How it is updated.** Any change to `rituals` is immediately followed by `save()` then `render()`. There is no other write path.
- **The only thing stored about the past is which indices you marked.** Not the dates, not the
  count passed, not the count remaining. Everything time-dependent is recomputed from the
  clock on every render. This is the single most important decision in the design, because it
  is what stops the app from ever showing a stale number.
- **`kept` is a list of indices, not dates.** The occurrence list is deterministic, so index 4
  is always the same Saturday. Storing dates would be redundant and would risk disagreeing with
  a recomputed list.
- **What happens on return.** `load()` restores the array exactly. Your kept marks are unchanged,
  the passed/future split has moved on by however much time has passed, and the card says how
  many moments slipped by. That is the feature.
- **What clearing site data does.** It deletes the key. The app then re-seeds the example ritual.
  The UI says so in one small line.

## File Structure

```
build-with-ai-basics/
├── index.html          # the only page: shell, header, stack container, add form
├── styles.css          # palette tokens, layout, card and the three square states
├── app.js              # state, dates, calculation, rendering, persistence, handlers
├── README.md           # what it is, how to run it, what was built and why
├── LICENSE             # MIT
├── devpost/            # Devpost learning workspace
│   ├── scope.md        # planning: the idea and its boundary
│   ├── prd.md          # planning: what it does
│   ├── spec.md         # planning: how it is built (this file)
│   ├── checklist.md    # build slices, progress, revisions
│   └── app-map.html    # take-home map of the finished code
└── .gitignore
```

No `node_modules`, no build output, no assets directory. Three files are the application.

## External Services and Dependencies

None. This is a deliberate part of the design, not an omission.

- No network requests at any point. The app works with the network disconnected.
- No API keys, no accounts, no rate limits, no cost.
- No third-party scripts, so there is nothing to be unavailable during a demo recording.
- No telemetry or analytics of any kind.

The only browser feature relied on is `localStorage`, which is available in every current browser.

## Important Failure Modes

- **`localStorage` unavailable** (private browsing, or storage disabled) → every read and write is wrapped in `try`/`catch`; the app keeps working for the session and shows one small line explaining that rituals will not be kept.
- **Corrupt or stale saved data** → `JSON.parse` is wrapped in `try`/`catch`, and each restored ritual is checked for the fields it needs. Anything malformed is discarded rather than rendered as `NaN`. If nothing valid survives, the example ritual is re-seeded.
- **An absurd duration** (daily for 100 years) → the form rejects counts above 2000 with an inline message rather than building a grid of 36,525 elements and freezing the page.
- **A very large grid** → square size steps down by count (see the table above), so 626 squares stay legible and the count stays on screen.
- **A device clock set wrong** → the grid will be wrong, and there is no way around that. The app derives everything from the local clock and has no network to check against. It is stated in the README rather than hidden.
- **A start date far in the past with a high frequency** → the occurrence list could run to thousands of entries. The 2000 cap is applied at creation from the duration, and `occurrences()` is bounded by `total`, so the list can never exceed 2000.
- **A stored `kept` index beyond the current `total`** → discarded during validation in `load()`, so a stale index can never mark a square that does not exist.

## What Was Simplified and Why

- **`kept` is a list of indices rather than a list of dates** — instead of storing the date of
  every marked moment. The occurrence list is deterministic, so an index is unambiguous, and
  storing dates would duplicate information the app can already derive.
- **Nothing about the present is stored** — instead of caching the passed/upcoming split. Caching
  it would be faster and would introduce the only bug that actually matters: a grid that is
  quietly out of date. Recomputing from the clock on every render costs nothing at this scale and
  cannot be wrong.
- **The whole stack is re-rendered on every change** — instead of updating the one square that
  changed. The list is tiny and a full rebuild cannot desync from the state.
- **Calendar arithmetic rather than millisecond arithmetic** — instead of adding
  `period × 86,400,000` ms. Milliseconds drift across daylight-saving boundaries and can put an
  occurrence on the wrong day, which would show the wrong square as passed.
- **Instances pass on their own; taps only record** — the first version had taps consuming
  instances, which made the headline number a report on the user's own discipline. Now the
  number moves with the calendar, and a tap is a note about the past that can be corrected.
- **Un-kept moments are never counted** — instead of showing how many passed without you. The
  data is there and the number is trivial to compute. It is left out because it would be the most
  punishing thing on the screen and would turn a reflection tool into a source of guilt.
- **The gap line is a fact, not a prompt** — "4 moments passed since you last looked", not
  "you have not opened this in 4 weeks" and not a call to action. It reports what already
  happened and then stops until real time passes again.
- **System fonts** — instead of a webfont. Removes the only network dependency the app could have had.

## Decisions and Open Issues

- **Plain HTML/CSS/JS over a framework** — chosen so the project has no build step and no dependencies that can break mid-demo. Tradeoff accepted: rendering is hand-written, which is more code than a framework would need, but the list is small enough that it does not matter.
- **`localStorage` over a real database** — chosen because a single-user local tool needs no server. Tradeoff accepted: rituals are per-browser and clearing site data removes them.
- **Time-driven rather than tap-driven depletion** — chosen because a number that only moves when you tap it is not useful; it measures your tapping, not your life. Tradeoff accepted: the app depends on the device clock being right, and there is no network to verify it against.
- **Marking is reversible** — the first version made spending permanent to mirror the irreversibility of time. That was solving the wrong problem: the moment is gone either way, so the tap is a record and records should be correctable.
- **The grid is the kernel, so it is built in the first three slices** — the number alone already exists elsewhere; the depletion is the idea.

**Learner uncertainty identified during planning:** whether `localStorage` would actually survive closing the tab, or whether the data would vanish and leave the app looking broken on camera. This is the one genuinely load-bearing technical assumption in the design, and everything about persistence rests on it.

What resolved it: the agreed investigation was to build the storage step as its own slice, then record a moment, close the browser completely, reopen the page, and confirm the marks were still there — rather than trusting that it works. That check is recorded as slice 4's verification in `checklist.md`, and the result is what the rest of the design depends on.

**Revision (2026-10-22) — why the design changed.** The first build worked but was not useful:
the headline number only moved when the user tapped it, so it measured their tapping rather
than their life, and it was wrong the moment they stopped opening the app. The fix was to put
the occurrences on real dates and derive everything from the clock. This touched the data model
(added `startISO` and `kept`, removed `spent`), the calculation (added `occurrences()` and
`splitOccurrences()`), the interaction (tapping records rather than consumes, and is reversible)
and the visuals (three square states instead of two). It did not touch the kernel: a grid you
watch deplete is still the idea. The change is recorded in `checklist.md` under Revisions.

No open questions remain that block the build. `prd.md > Open Questions` was empty at approval.
