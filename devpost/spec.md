---
doc: spec
status: approved
---

# Finite — Technical Spec

## How This Works, In Plain Language

There are three pieces, and only three.

**A page you look at.** `index.html` is the whole screen. It has an empty space where the ritual cards will go, and a small form for adding one. It is deliberately almost empty — everything you see is drawn by the script.

**A script that does the thinking.** `app.js` holds the list of rituals in memory, works out how many instances are left, and draws a card for each one. When you tap a square, it changes the list and redraws the card. That is the entire logic.

**A shelf in the browser to keep things on.** When the list changes, the script writes it to `localStorage` — a small storage box the browser keeps for one site. When you open the page again, it reads that box back and rebuilds the cards. There is no server and nothing is sent anywhere.

Why this shape rather than something more elaborate: the whole product is one screen, one list, and one calculation. A framework would add a build step, a dependency that can break, and files to maintain, and would not make the grid any better. Plain HTML, CSS and JavaScript means you can open the project and read all of it.

## The Core Journey Through the System

Implements `prd.md > The Core Journey`.

1. You open the page → `index.html` loads `styles.css` and `app.js`.
2. `app.js` runs `load()` → reads `localStorage["finite.rituals.v1"]`. If nothing is there, it writes the example ritual and uses that.
3. It calls `render()` → for each ritual it builds a card, works out `remaining`, and draws one square per remaining instance.
4. You type into the add form and press save → `handleAdd()` validates the three fields, calls `remainingFrom(input)` to work out the count, pushes a new ritual onto the list, calls `save()` and then `render()`.
5. You tap a square → `handleSpend(id, index)` marks that index as spent in the ritual's list, then calls `save()` and `render()`. The count on the card is `remaining`, so it drops in the same redraw.
6. You close the tab and come back → step 2 runs again, and the spent squares are still spent because they were written to storage.

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
- **The last square.** When exactly one remains, it keeps the same size but gains a hairline `--ink` border and slightly more weight. It should feel heavier, not alarming — no red, no pulse.
- **Motion.** Squares transition `background-color` and `transform` over 150ms when leaving. Everything else is instant. Wrap the transition in `@media (prefers-reduced-motion: reduce)` and disable it there, in which case spending re-renders immediately.
- **Avoided, explicitly.** Emoji, gradients, glassmorphism, drop shadows beyond a hairline, progress rings, streak counters, confetti, stock imagery, purple-to-blue.

Note on `--spent`: because the grid shrinks, a spent square does not persist on screen. The token is used only for the brief leaving transition, so the eye reads the square as *used up* rather than as an error state.

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
    total: 626,                    // computed once at creation, never recomputed
    spent: 3                       // how many instances have been marked spent
  }
  ```

  `remaining` is never stored. It is always `total - spent`, computed on read. Storing it would let the two drift apart.

- **Calculation.** `remainingFrom({freq, durationValue, durationUnit})` converts both sides to days and divides:

  ```
  DAYS_PER_PERIOD = { daily: 1, weekly: 7, monthly: 30.4375, yearly: 365.25 }
  DAYS_PER_UNIT   = { days: 1, weeks: 7, months: 30.4375, years: 365.25 }
  total = Math.floor(durationValue * DAYS_PER_UNIT[durationUnit] / DAYS_PER_PERIOD[freq])
  ```

  `Math.floor` rather than round, so the count never promises an instance that does not fit. Minimum of 1. Maximum 2000 — beyond that the grid is meaningless and the form rejects it.

  Worked examples: weekly for 12 years → `12 × 365.25 ÷ 7` → **626**. Yearly for 20 years → **20**. Monthly for 3 years → `1095.75 ÷ 30.4375` → **36**.

- **Rendering.** `render()` clears `#stack` and rebuilds every card from `rituals`. Rebuilding wholesale rather than diffing is deliberate: the list is tiny, and a full rebuild means the DOM can never disagree with the state.

  Each square is a `<button>` with `data-id` and `data-index`, and an `aria-label` like `"Mark one Saturday pancakes as used. 625 would remain."` Squares carry no spent state in the DOM: a spent square is removed from the grid entirely, because the grid shrinking *is* the product (`scope.md > The Unique Kernel`). Only squares still to come are rendered.

  Tapping a square adds `.is-leaving` (fading toward `--spent` and scaling to 0.72 over 150ms), disables it against a double-tap, then re-renders with `spent` incremented. Under `prefers-reduced-motion: reduce` the re-render is immediate. The final remaining square carries `.is-next`.

PRD ref: `prd.md > Features and Behavior`, `prd.md > The Core Journey`.

### Persistence

`save()` writes `JSON.stringify(rituals)` to `localStorage["finite.rituals.v1"]`. `load()` reads it, `JSON.parse`s it inside a `try`/`catch`, and falls back to the seeded example if the value is missing or unparseable. Every write is wrapped in `try`/`catch` too, because `localStorage` throws in private browsing and when the quota is full.
PRD ref: `prd.md > States and Boundaries`.

### Seeding

If `load()` finds nothing, `app.js` creates one example ritual — "Saturday pancakes", weekly, 12 years — and saves it, so the first screen is never empty. The card is marked with a small line saying it is an example.
PRD ref: `prd.md > States and Boundaries` (first use).

## Data Model

One key, one shape, no relationships.

- **Where it lives.** `localStorage["finite.rituals.v1"]`, as a JSON array of ritual objects. The `.v1` suffix means a future shape change can be detected rather than crashing on old data.
- **How it is updated.** Any change to `rituals` is immediately followed by `save()` then `render()`. There is no other write path.
- **`spent` is a count, not a list of dates.** The POC only needs to know how many are gone, so the newest instances are marked spent first and the grid simply shows `total - spent` squares. This is the single most important simplification in the data model.
- **What happens on return.** `load()` restores the array exactly, so spent squares stay spent. Because nothing is stored about *when* an instance was spent, the app cannot show a history — by design, and it is not in the PRD.
- **What clearing site data does.** It deletes the key. The app then re-seeds the example ritual. The UI says so in one small line.

## File Structure

```
build-with-ai-basics/
├── index.html          # the only page: shell, header, stack container, add form
├── styles.css          # palette tokens, layout, card and square styles
├── app.js              # state, calculation, rendering, persistence, event handlers
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

## What Was Simplified and Why

- **`spent` is a number rather than a list of dates** — instead of recording when each instance happened. The POC only needs the count, and a history would need a second screen to be worth anything.
- **The whole stack is re-rendered on every change** — instead of updating the one square that changed. The list is tiny and a full rebuild cannot desync from the state.
- **No start date is collected** — instead of tracking how far through the phase you are. A percentage is a nice-to-have and would add a date picker and a second calculation path.
- **Instances are consumed by tapping, not by the passage of time** — instead of the grid advancing itself as days pass. Deliberate: the tap is the user acknowledging the moment, and auto-advancing would make the number change while nobody was looking. The app therefore reports what the user has marked, and the copy does not claim otherwise.
- **No undo button** — instead of a first-class reverse action. Spending is one-way because the thing being modelled is one-way.
- **System fonts** — instead of a webfont. Removes the only network dependency the app could have had.

## Decisions and Open Issues

- **Plain HTML/CSS/JS over a framework** — chosen so the project has no build step and no dependencies that can break mid-demo. Tradeoff accepted: rendering is hand-written, which is more code than a framework would need, but the list is small enough that it does not matter.
- **`localStorage` over a real database** — chosen because a single-user local tool needs no server. Tradeoff accepted: rituals are per-browser and clearing site data removes them.
- **The grid is the kernel, so it is built in the first three slices** — the number alone already exists elsewhere; the depletion is the idea.
- **One-way spending, no undo** — mirrors the thing being modelled. Tradeoff accepted: a mistap cannot be reversed in the POC.

**Learner uncertainty identified during planning:** whether `localStorage` would actually survive closing the tab, or whether the data would vanish and leave the app looking broken on camera. This is the one genuinely load-bearing technical assumption in the design, and everything about persistence rests on it.

What resolved it: the agreed investigation was to build the storage step as its own slice, then save a ritual, close the browser completely, reopen the page, and confirm the spent squares were still spent — rather than trusting that it works. That check is recorded as slice 4's verification in `checklist.md`, and the result is what the rest of the design depends on.

No open questions remain that block the build. `prd.md > Open Questions` was empty at approval.
