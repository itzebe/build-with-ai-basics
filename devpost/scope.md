---
doc: scope
status: approved
---

# Finite

One line: a small app that shows you how many times you have left of the recurring moments you love, so you stop treating any of them as infinite.

## The Unique Kernel

Every ritual you have is finite and nobody tells you when it ends. You find out afterwards.

Most tools answer "how many times will I see my parents?" with a single number about one fixed relationship. Finite is different in three ways: it works for **any** ritual the user names, the user supplies it rather than a lookup table, and it is **a grid of squares you watch deplete** rather than a number you read once.

The kernel is the depletion. A number is trivia. Tapping one square and watching the grid get smaller is a feeling.

## Who It's For

Two people, both specific:

- **A parent of a young child.** Saturday-morning pancakes, bedtime stories, being carried to bed. These stop on a Tuesday without a last time.
- **An adult with ageing parents.** The weekly phone call, Sunday lunch, the visit home. The arithmetic here is uncomfortable and most people avoid doing it.

Both share the same blind spot: the phase ends before you notice it is a phase.

What they do today instead: nothing, or they do the calculation once after reading an article about it, feel bad for an afternoon, and forget.

## The Core Loop

They open it. They see their rituals as a stack of grids. Each grid has some squares still lit and some spent.

They tap a square when a ritual happens — one more used up. The grid shrinks by one. The count drops.

They come back because the number moved. It is the only app that tells them the truth every week: **you have N left.**

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

You open a single page. There is a ritual already there — say, Saturday pancakes, with a grid of squares.

You tap one square. It goes dark. The count next to it drops by one, and the grid is visibly smaller.

You add your own ritual: a name, how often it happens, and roughly when the phase ends. It appears in the stack with a full grid, and its count is calculated from your answers. Close the tab, reopen it, and it is still there with the squares you spent still spent.

**The "oh, that's cool" beat:** tapping a square and watching the row shrink in real time. The number and the grid move together, and for a second the abstraction becomes visible.

## The POC Boundary

In:

- One screen, a stack of rituals.
- Add a ritual: name, frequency, remaining timeframe.
- A grid of squares per ritual, one square per remaining instance.
- Tap a square to spend an instance. The grid shrinks and the count drops.
- Rituals persist in the browser between visits.

Out: accounts, sharing, notifications, reminders, syncing, editing a ritual after it is created, calendars, statistics, export.

## Later

- Editing and deleting a ritual.
- A gentle nudge when a grid crosses a threshold.
- Backdating: marking instances that already happened before you installed it.
- Showing the percentage of the phase already gone.

## Explicitly Cut

- **Accounts and sync** — local browser storage gives the same persistence feel for one user, and auth would eat the build budget without proving the kernel.
- **Notifications and reminders** — the point is deliberate opening, not being nagged. A reminder is the opposite of the product's intent.
- **AI-generated messages or reflections** — would add an API dependency and a failure mode, and would not strengthen the depletion idea. Cut for the POC.
- **Sharing a grid** — tempting and genuinely nice, but it needs a backend. Named so it does not sneak back in.
- **Precision beyond the user's own estimate** — the app reports what the user told it. It does not predict lifespans, and it should not imply that it does.
