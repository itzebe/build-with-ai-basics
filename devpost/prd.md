---
doc: prd
status: approved
---

# Finite — Product Requirements

One line: a single-page app that lays each recurring ritual out as a timeline of real dates, so you can see how many are still to come, which have already passed, and how many you were actually there for.
Source: `scope.md > The Core Loop`, `scope.md > The Unique Kernel`.

**Revision (2026-10-22):** the first version let the user "spend" instances by tapping,
and the grid never moved unless they did. That made the headline number a report on their
own tap discipline rather than a fact about the world — set up "weekly for 12 years", not
open the app for three months, and it still said 626. The grid is now a real timeline.
Squares pass on their own. Tapping records presence rather than consuming anything.

## The Core Journey

1. You open the app. It loads instantly and shows a short line explaining what it is, then a legend showing what the three square colours mean and that you tap a passed square if you were there.
2. Below that is a stack of ritual cards. On first use, one example ritual is already there so the screen is never empty.
3. Each card shows the ritual's name, how often it happens, two counts, and a grid of squares laid out on a timeline — one square per occurrence, in date order, from the day the phase started.
4. Squares at the front of the grid have already gone quiet. Those moments have passed. The rest are still lit. Nothing you did made that happen; time did.
5. You tap a quiet square if you were there for it. It fills in dark and the kept count goes up. Tapping it again clears it — you are recording a fact, not spending anything.
6. You tap **Add a ritual**. A small form appears: what it is, how often, how long the phase runs, and when it started.
7. You save it. The new card appears with its own timeline, already partly elapsed if you said the phase began a while ago.
8. You close the tab and come back next week. Your rituals are still there, your kept squares are still marked, one more square has gone quiet without you touching anything, and the card tells you so: *"1 moment passed since you last looked."*

Success is: a stranger opens the page, understands it in five seconds, and can tell you how many are left and when the next one is.

## Screens and Layout

One screen. No navigation, no modals, no separate routes.

Top to bottom:

- A short title and a one-line explanation. Deliberately brief — two sentences at most.
- **A legend, teaching the three square states.** This is not decoration. A pale square, a
  green square and a dark square mean three different things, and none of them is guessable
  from looking. One row: a swatch and a word for each, plus a single line saying what tapping
  does. It stays on the page rather than being dismissed, because it is the only place the
  mechanic is explained and a returning user still benefits from the reminder. Quiet enough
  to read as a caption rather than a tutorial.
- A quiet total across all rituals: how many moments remain in total. Small type, not the focus.
- The stack of ritual cards, newest added at the bottom.
- An **Add a ritual** control at the end of the stack.

Each card, top to bottom:

- The ritual's name, in serif, largest text on the card.
- Under it, a line of small text: the frequency, when it started, and **when it ends** — "Every week, for 12 years · since 26 Oct 2019, until 18 Oct 2031". The end date is taken from the last square rather than added up separately, so the stated end can never disagree with the grid.
- **Two counts, side by side.** *Left* is the large, prominent one — how many are still to come. *Kept* is smaller and quieter — how many you recorded being there for. The visual weight is deliberate: the honest number is the one that moves on its own, and the one you control should not shout.
- A short line naming the next occurrence: "Next: Saturday, 25 October." This is the only actionable thing on the card, so it is stated plainly rather than styled as a call to action.
- **On return only**, a line saying what changed while you were away: "4 moments passed since you last looked." It appears once, the first time you open the app on a new day, and then the marker moves forward. It is not a notification and does not accumulate — if you reload twice in an afternoon it does not repeat.
- The grid of squares, wrapping across as many rows as needed. Squares that have passed are visibly quieter than squares still to come.
- A small, quiet way to remove a card.

The add form appears inline under the stack, not as an overlay. It has four fields — name, frequency, duration, and when it started — a save button and a cancel. No other controls.

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

### Time passing

The kernel, and the reason the app is useful rather than a one-time calculation.

- Every occurrence of a ritual sits on a real date, worked out from the start date and the frequency.
- A square represents one occurrence. Squares whose date is in the past are rendered as passed; squares whose date is in the future are rendered as still to come.
- This is derived from the clock every time the page is drawn. Nothing is stored about which squares have passed, so the app cannot drift out of date and does not need to run in the background.
- The **Left** count is the number of future occurrences. It decreases on its own as days go by.
- The grid therefore looks different every time the user returns, even if they changed nothing. That is the point.

### Working without a mouse

The grid is 626 controls. Reaching the add form by pressing Tab through all of them is not
usable, so the grid behaves as one stop.

- Only one square per grid is in the tab order. Tab moves past the whole grid to the next control.
- Arrow keys move between squares: left and right by one, up and down by a visual row.
- Home and End jump to the first and last square that can actually be acted on.
- Movement is clamped to squares that can be acted on. A disabled button cannot take focus, so
  aiming at a future square would silently do nothing.
- Enter or Space marks the focused square, and focus stays on that square after the card
  redraws rather than dropping the user back to the top of the page.
- A grid with nothing to act on yet — every occurrence still ahead — takes no tab stop at all.

### Learning how to read it

The screen must be self-explanatory, because there is nobody to explain it.

- A legend sits directly under the lede, before the first card.
- It shows the three square states as small swatches with a word each: still to come, passed, kept.
- One line under it says what tapping does: tap a passed square if you were there for it.
- It is a caption, not a tutorial. No arrows, no numbered steps, no overlay, no dismissal.
- It stays permanently. The mechanic is not obvious even on a second visit, and a first-time
  reviewer watching a two-minute video needs it on screen in the first five seconds.

### Noticing the gap

The reason to come back, and the difference between a tool and a one-time calculation.

- Each ritual stores the date it was last looked at.
- On opening, the app compares that date to today and counts how many occurrences fell in between.
- If any did, the card says so in one quiet line, once.
- The marker then moves to today, so the line does not repeat until real time has passed again.
- This is the one thing the app says unprompted, and it is the honest version of a notification: it tells you what already happened rather than demanding you do something.

### Recording that you were there

The one interaction, and the one that makes the app personal.

- Tapping a **passed** square marks it kept. It fills in dark and the kept count rises.
- Tapping a kept square again clears it. This is deliberate and is the opposite of the first version: recording a fact about the past should be correctable, because a mistap is a data error, not a moment lost.
- Tapping a **future** square does nothing. You cannot record being present at something that has not happened.
- Kept state is stored per occurrence, so it survives reloads and is not affected by time passing.
- No count is shown of moments that passed un-kept. The app does not score you.
- If every square has passed, the card says the phase is over and offers to remove it.

### Adding a ritual

An inline form with four inputs.

- **What is it** — free text, the ritual's name. Required.
- **How often** — a choice of daily, weekly, monthly, or yearly. Required.
- **How long does this last** — a number of days, weeks, months, or years. Required.
- **When did it start** — a date, defaulting to today. Required, and the field that makes the timeline real. Without it the app cannot know which squares have already passed.

On save: the occurrence dates are worked out from the start date and frequency, the card is added with its timeline already partly elapsed if the start date is in the past, and the form resets. The new card is immediately usable.

### Removing a ritual

A quiet text control on each card, separate from the grid so it cannot be hit by accident. Asks for confirmation before removing. Removal is permanent for the POC.

## States and Boundaries

- **First use** — one example ritual is present so the screen is never empty, with a short line making clear it is an example and can be removed. Its start date is set in the past so the timeline is already partly elapsed and the mechanic is visible immediately, and the legend above it explains what the colours mean before the user has to guess.
- **Empty state** — if the user removes everything, show a single calm line inviting them to add a ritual. Not an illustration, not a call to action with an exclamation mark.
- **A ritual with many instances** — a grid of 100+ squares must still be readable and must not push the count off screen. Squares shrink past a threshold, and the grid wraps.
- **A ritual with one occurrence left** — the card should read as notable without alarm. This is where the product does its work; the last lit square should feel different in weight, not in colour.
- **A phase that has ended** — every square has passed. The card says so plainly and offers to remove it. It does not say "finished" or congratulate anyone.
- **A ritual started today** — nothing has passed yet, so the grid is entirely lit. This is the honest starting state and the app should not pretend otherwise.
- **An occurrence today** — counts as passed, because the day has begun. Stated in the spec so the boundary is not ambiguous.
- **Invalid input** — an empty name, a zero or negative duration, a start date in the future, or a duration so large the count is absurd. Show a short inline message next to the field. Never silently accept.
- **Persistence** — rituals and the occurrences you recorded are saved in the browser and survive closing the tab. There is no account and no server, so this is per-browser. Clearing site data clears the rituals, and the app says so in one small line.
- **Boundaries** — everything is local. Nothing is transmitted anywhere. The app makes no network requests at all.

## Product Decisions

- **A grid rather than a number** — the number alone is the thing that already exists elsewhere; the grid is what makes it land. This is the kernel, so it is built first.
- **Time drives the depletion, not the user** — this is the change that makes the app useful. A number that only moves when you tap it tells you about your tapping, not about your life. A number that moves on its own is true whether or not you opened the app.
- **Any ritual, not just parents** — the user names their own. This is the main difference from existing "time left with your parents" calculators.
- **The user supplies the estimate** — the app does arithmetic on what it is told. It does not model lifespans and does not imply precision it does not have.
- **Kept is correctable** — recording a fact about the past can be a mistake, so tapping again clears it. The first version made spending permanent to mirror the irreversibility of time, but that was solving the wrong problem: the moment is gone regardless, and the tap is just a note about it.
- **Un-kept moments are never counted or shown** — the app does not tell you how many you missed. That number would be the most punishing thing on the screen and would turn a reflection tool into a source of guilt.
- **No notifications** — the product depends on the user choosing to look. Being nagged would contradict the point.
- **One screen, no navigation** — keeps the build small and keeps the focus on the grid.
- **Warm and quiet, not morbid** — the tone is the difference between a tool someone keeps and one they close immediately.

## What We're Building

Everything the proof of concept must do to be complete:

- A single page with a stack of ritual cards.
- One example ritual present on first use, already partly elapsed.
- Add a ritual from an inline form with name, frequency, duration and start date.
- Work out every occurrence date from the start date and frequency.
- Render a grid of one square per occurrence, in date order.
- Mark squares whose date has passed, derived from the clock on every render, so the grid moves on its own.
- Show two counts per ritual: still to come, and kept.
- Show the date of the next occurrence.
- Record presence by tapping a passed square, and undo it by tapping again.
- Do nothing when a future square is tapped.
- A phase-ended state when every square has passed.
- Remove a ritual, with confirmation.
- Persist rituals and recorded occurrences in the browser across sessions.
- Input validation with inline messages.
- The look and feel above, including the next-square treatment and reduced-motion support.

## Deferred From the POC

- **Editing a ritual after creating it** — needs a form-in-place and re-calculation path. Deferred because adding and removing covers the demo, and editing doubles the form work.
- **A week-in-review line** — "3 passed, you were there for 2." Useful, and the data is already there, but it needs wording that does not read as a score.
- **Percentage of the phase elapsed** — a bar would compete with the grid for attention, and the grid already says it better.

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
