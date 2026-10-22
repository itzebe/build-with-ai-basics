<!-- Canonical copy: devpost/scope.md — this root copy exists so the submission requirement is visible at a glance. Edit devpost/scope.md. -->

---
doc: scope
status: approved
---

# Finite

One line: a small app that shows you how many times you have left of the recurring moments you love, so you stop treating any of them as infinite.

## The Unique Kernel

Every ritual you have is finite and nobody tells you when it ends. You find out afterwards.

Most tools answer "how many times will I see my parents?" with a single number about one fixed relationship. Finite is different in three ways: it works for **any** ritual the user names, the user supplies it rather than a lookup table, and it is **a grid of squares you watch deplete** rather than a number you read once.

The kernel is the depletion. A number is trivia. A grid you watch get smaller is a feeling.

**Revision (2026-10-22): the depletion is driven by real time, not by taps.** In the
first version the grid only moved when the user tapped it, which made the number a
report on the user's own discipline rather than a fact about the world. If you set up
"weekly for 12 years" and did not open the app for three months, it still said 626. That
is not useful — it is wrong. The grid is now a timeline: each square sits on a real date,
and squares pass on their own as the weeks go by. Tapping no longer consumes anything.
It records that you were there.

## Who It's For

Two people, both specific:

- **A parent of a young child.** Saturday-morning pancakes, bedtime stories, being carried to bed. These stop on a Tuesday without a last time.
- **An adult with ageing parents.** The weekly phone call, Sunday lunch, the visit home. The arithmetic here is uncomfortable and most people avoid doing it.

Both share the same blind spot: the phase ends before you notice it is a phase.

What they do today instead: nothing, or they do the calculation once after reading an article about it, feel bad for an afternoon, and forget.

## The Core Loop

They open it. They see their rituals as a stack of grids. Each grid is a timeline from
the day the phase started to the day it ends — one square per occurrence, in date order.

Because the squares are on real dates, the grid has already moved since last time. Some
squares at the front have gone quiet: those moments have passed. The rest are still lit:
they have not happened yet.

They tap a passed square when they were there for it. It fills in dark. That is not
spending anything — it is keeping a record. The count of kept moments goes up.

They come back because the number moved without them, and because the app tells them so:
on returning after a gap it says how many moments slipped by while they were away — *"4
moments passed since you last looked."* That line exists nowhere else, and it is the only
thing that tells them the truth every week: **you have N left, and the next one is on
Saturday.**

Two numbers per ritual, and the difference between them is the point:

- **Left** — still to come. Moves on its own. This is the honest one.
- **Kept** — how many you recorded being present for. This is what you did with them.

## Inspiration & Identity

Mood: quiet, warm, a little solemn. Not morbid and not gamified. Closer to a beautifully printed wall calendar than to a productivity dashboard.

References:

- **See Your Folks** (seeyourfolks.com) — for the honesty of the arithmetic, not the presentation. Their insight is the number; the missing piece is making it live.
- **Kevin Kelly / Oliver Burkeman**, *Four Thousand Weeks* — the framing that finitude is clarifying rather than depressing, and that "the good kind of pressure" comes from treating time as scarce.
- **Japanese calendars and hanko stamps** — the idea of marking a day as spent with a physical act.

Aesthetic direction: warm paper background rather than stark white. Serif headings, generous spacing, no gradients, no stock photography, no emoji. The grid squares should look like printed blocks, not like a habit-tracker's checkboxes.

Energy: unhurried. The interface should never rush the user. Nothing here should look like it is trying to increase engagement.

## Why This Matters to the Learner

The idea comes from a real discomfort: the realisation that a phase you are currently inside — one you may be finding tiring rather than precious — will end, and you will not get a warning. The app is a small attempt to notice before the fact rather than after.

This is a personal tool first. It is being built as a working proof of concept for the Devpost *Build With AI: Basics* hackathon.

## What "Working" Looks Like

You open a single page. There is a ritual already there — Saturday pancakes, with a grid
of squares laid out along a timeline.

Before anything else there is a legend: a pale square marked *passed*, a green one marked
*still to come*, a dark one marked *kept*, and one line saying to tap a passed square if you
were there for it. Nothing about the grid is guessable, so it is explained rather than left
to be worked out.

You can see at a glance that some squares at the start have gone quiet. Those Saturdays
have already happened. The rest are still lit. Beside them: **522 left**, and underneath,
*about 10 years*.

You tap a quiet square — one you were there for. It fills in dark, and the kept count
goes up. You can tap it again to undo, because you are recording a fact about the past,
not spending anything.

You add your own ritual: a name, how often it happens, how long the phase lasts, and when
it started. It appears in the stack with its own timeline, already partly elapsed if you
told it the phase began a while ago. Close the tab, reopen it, and it is still there with
your kept squares still marked.

**The "oh, that's cool" beat:** the grid has moved on its own. Come back a week later and
one more square has gone quiet without you doing anything. The number is not a report on
your discipline. It is what is actually happening.

## The POC Boundary

In:

- One screen, a stack of rituals.
- Add a ritual: name, frequency, how long the phase lasts, and when it started.
- A grid of squares per ritual, one square per occurrence, laid out on real dates.
- Squares pass on their own as time goes by, whether or not the app is open.
- Tap a passed square to record that you were there; tap again to undo.
- Two counts per ritual: still to come, and kept.
- The next occurrence's date, so the app tells you something you can act on.
- When the phase ends, taken from the last square so it cannot contradict the grid.
- A note on return saying how many moments passed since you last looked.
- Rituals and recorded moments persist in the browser between visits.

Out: accounts, sharing, notifications, reminders, syncing, editing a ritual after it is created, calendars, statistics, export.

## Later

- Editing and deleting a ritual.
- A gentle nudge when a grid crosses a threshold.
- A week-in-review line: what passed, what you kept.
- Sharing a grid as a static image.

## Explicitly Cut

- **Accounts and sync** — local browser storage gives the same persistence feel for one user, and auth would eat the build budget without proving the kernel.
- **Notifications and reminders** — the point is deliberate opening, not being nagged. A reminder is the opposite of the product's intent.
- **AI-generated messages or reflections** — would add an API dependency and a failure mode, and would not strengthen the depletion idea. Cut for the POC.
- **Sharing a grid** — tempting and genuinely nice, but it needs a backend. Named so it does not sneak back in.
- **Precision beyond the user's own estimate** — the app reports what the user told it. It does not predict lifespans, and it should not imply that it does.
- **Guilt mechanics** — no red marks for un-kept moments, no streaks, no percentage-present score. The moment has passed either way; scoring it would turn a reflection tool into a source of shame, and that is the opposite of the intent.
