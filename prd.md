<!-- Canonical copy: devpost/prd.md — this root copy exists so the submission requirement is visible at a glance. Edit devpost/prd.md. -->

---
doc: prd
status: approved
---

# Finite — Product Requirements

One line: a single-page app that shows a grid of remaining instances for each recurring ritual you name, and lets you spend one by tapping it.
Source: `scope.md > The Core Loop`, `scope.md > The Unique Kernel`.

## The Core Journey

1. You open the app. It loads instantly and shows a short line explaining what it is.
2. Below that is a stack of ritual cards. On first use, one example ritual is already there so the screen is never empty.
3. Each card shows the ritual's name, how often it happens, how many instances remain, and a grid of squares — one square per remaining instance.
4. You tap a square on a card. That square goes dark permanently and the remaining count drops by one.
5. You tap **Add a ritual**. A small form appears: what it is, how often, and roughly how long the phase runs.
6. You save it. The new card appears in the stack with a full grid and a count worked out from your answers.
7. You close the tab and come back later. Your rituals are still there, and the squares you spent are still spent.

Success is: a stranger opens the page, understands it in five seconds, and taps a square.

## Screens and Layout

One screen. No navigation, no modals, no separate routes.

Top to bottom:

- A short title and a one-line explanation. Deliberately brief — two sentences at most.
- A quiet total across all rituals: how many instances remain in total. Small type, not the focus.
- The stack of ritual cards, newest added at the bottom.
- An **Add a ritual** control at the end of the stack.

Each card, left to right:

- The ritual's name, in serif, largest text on the card.
- Under it, a line of small text: the frequency and the end of the phase, phrased plainly.
- The remaining count, large and prominent.
- The grid of squares, wrapping across as many rows as needed.
- A small, quiet way to remove a card.

The add form appears inline under the stack, not as an overlay. It has three fields, a save button and a cancel. No other controls.

## Look and Feel

Carried forward from `scope.md > Inspiration & Identity`.

- **Palette.** Warm paper background (`#faf7f2`-ish), near-black ink (`#1c1a17`), and a single accent for squares still remaining. Spent squares go to a muted warm grey, not pure black — the difference should read as *used up*, not as *error*. No gradients, no drop shadows beyond a hairline, no colour that looks like a warning.
- **Typography.** Serif for the ritual names and the numbers — something with warmth, in the spirit of a printed book rather than a dashboard. System serif stack is fine and avoids a network dependency. Small labels and the frequency line in a clean sans-serif at low contrast. Numbers get a little extra letter-spacing so they read as typeset.
- **Density.** Spacious. Cards have generous padding and clear separation. This is the opposite of a dense dashboard; empty space is part of the feeling.
- **Tone of copy.** Plain, calm, second person, never cheerful and never scolding. "You have 41 left." Not "Only 41 left!" and not "You've used 5!" No exclamation marks anywhere. No streaks, no praise, no badges.
- **The squares.** Printed blocks, not habit-tracker checkboxes. Slight rounding, a hairline gap between them, roughly square, sized so a grid of 50 reads at a glance without counting. Tapping one is the only interaction and should feel definite — a short, quiet transition, no bounce, no confetti.
- **Motion.** Minimal. Squares fade to spent over ~150ms. No other animation. Respect `prefers-reduced-motion`.

Explicitly avoided: emoji, stock photography, gradients, glassmorphism, purple-to-blue AI-app gradients, progress rings, streak counters, celebratory animation.

## Features and Behavior

### The stack of rituals

The main surface. Shows every ritual the user has, in the order added.

- Each card shows name, frequency, remaining count, and the grid.
- The count and the grid are always consistent with each other — the count is the number of remaining squares.
- Cards never reorder on their own.

### Spending an instance

The core interaction, and the kernel.

- Tapping a remaining square marks it spent, permanently.
- The square changes appearance immediately, and the count on the card decrements in the same frame.
- A spent square cannot be un-spent by tapping it again. Reversing a mistake is a separate, deliberate action, not an accidental double-tap.
- Tapping a spent square does nothing.
- If the user spends the final square, the card shows a distinct finished state rather than an empty box.

### Adding a ritual

An inline form with three inputs.

- **What is it** — free text, the ritual's name. Required.
- **How often** — a choice of daily, weekly, monthly, or yearly. Required.
- **How long does this last** — a number of days, weeks, months, or years, or an end date. Required.

On save: the remaining count is calculated, the card is added with a full grid, and the form resets. The new card is immediately usable.

### Removing a ritual

A quiet text control on each card, separate from the grid so it cannot be hit by accident. Asks for confirmation before removing. Removal is permanent for the POC.

## States and Boundaries

- **First use** — one example ritual is present so the screen is never empty, with a short line making clear it is an example and can be removed.
- **Empty state** — if the user removes everything, show a single calm line inviting them to add a ritual. Not an illustration, not a call to action with an exclamation mark.
- **A ritual with many instances** — a grid of 100+ squares must still be readable and must not push the count off screen. Squares shrink past a threshold, and the grid wraps.
- **A ritual with one instance left** — the card should read as notable without alarm. This is where the product does its work; the last square should feel different in weight, not in colour.
- **Finished** — all squares spent. The card says so plainly and offers to remove it.
- **Invalid input** — an empty name, a zero or negative duration, or a duration so large the count is absurd. Show a short inline message next to the field. Never silently accept.
- **Persistence** — rituals and their spent squares are saved in the browser and survive closing the tab. There is no account and no server, so this is per-browser. Clearing site data clears the rituals, and the app says so in one small line.
- **Boundaries** — everything is local. Nothing is transmitted anywhere. The app makes no network requests at all.

## Product Decisions

- **A grid rather than a number** — the number alone is the thing that already exists elsewhere; the grid is what makes it land. This is the kernel, so it is built first.
- **Any ritual, not just parents** — the user names their own. This is the main difference from existing "time left with your parents" calculators.
- **The user supplies the estimate** — the app does arithmetic on what it is told. It does not model lifespans and does not imply precision it does not have.
- **Spending is one-way** — it mirrors the thing being modelled. You cannot get a Saturday back. Undo exists only as a deliberate act.
- **No notifications** — the product depends on the user choosing to look. Being nagged would contradict the point.
- **One screen, no navigation** — keeps the build small and keeps the focus on the grid.
- **Warm and quiet, not morbid** — the tone is the difference between a tool someone keeps and one they close immediately.

## What We're Building

Everything the proof of concept must do to be complete:

- A single page with a stack of ritual cards.
- One example ritual present on first use.
- Add a ritual from an inline form with name, frequency, and duration.
- Calculate remaining instances from the user's answers.
- Render a grid of one square per remaining instance.
- Spend an instance by tapping a square; the count and grid update together.
- A finished state when the last square is spent.
- Remove a ritual, with confirmation.
- Persist rituals and spent squares in the browser across sessions.
- Input validation with inline messages.
- The look and feel above, including the last-square treatment and reduced-motion support.

## Deferred From the POC

- **Editing a ritual after creating it** — needs a form-in-place and re-calculation path. Deferred because adding and removing covers the demo, and editing doubles the form work.
- **Backdating already-spent instances** — genuinely useful for a real user, but it adds a date picker and a second calculation path. The POC starts everyone at a full grid.
- **Undo as a first-class action** — spending is one-way in the POC. A real undo belongs with an edit affordance.
- **Percentage of the phase elapsed** — needs a start date to be meaningful, which the POC does not collect.

## Possible Later Enhancements

- A single gentle line when a grid crosses a threshold, phrased without alarm.
- Sharing a grid as a static image, which needs no backend.
- A year-in-review view showing what got spent.

## Non-Goals

- **Predicting lifespans or health outcomes** — the app does arithmetic on the user's own estimate and must not appear to know anything more.
- **Becoming a habit tracker** — no streaks, no completion percentages, no encouragement. Missing a week should not produce a red mark.
- **Increasing engagement** — no notifications, no daily prompts, no reason to open it more often than the user wants to.
- **Multi-user or shared accounts** — one person, one browser, no server.
- **Any network request** — the app must work offline and must never transmit user data.

## Open Questions

None blocking `4-spec`. All resolved during planning:

- Storage mechanism and exact calculation rules — settled in `spec.md`.
- Whether to collect a start date — settled: no, deferred as above.
