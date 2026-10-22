# Devpost Submission — copy and paste

Everything below is written to be pasted straight into the Devpost form. The field names
match the standard Devpost project form for **Build With AI: Basics**.

---

## Project name

```
Finite
```

## Elevator pitch (one line, ~140 chars)

```
Some moments run out. Finite draws one square for every time a ritual will happen, and the squares pass on their own.
```

## Short description

```
Finite turns a recurring moment into a grid of squares you can watch run out.

You name a ritual — Saturday pancakes, the weekly call with your dad — say how often it happens, how long the phase lasts and when it started, and Finite draws one square per occurrence on its real date. Squares whose date has passed go quiet whether or not you ever opened the app. Tap a quiet square when you were there for it and it fills in; tap again to undo.

The grid is not a report on your discipline. It moves on its own, so the number is true whether or not you looked.
```

## Links

| Field | Value |
|---|---|
| Repository | `https://github.com/itzebe/build-with-ai-basics` |
| Live demo | `https://work-1-yrluinyyypugxots.prod-runtime.all-hands.dev/` |
| Demo video | `finite-demo.mp4` in the repository root — `https://github.com/itzebe/build-with-ai-basics/blob/main/finite-demo.mp4` |

> **The live link is temporary.** It is a sandbox URL that stops working when the session
> ends. Put it in the form if the form asks, but do not rely on reviewers reaching it. The
> video is the durable artefact and the repository runs with `python3 -m http.server`.

---

## About the project

### Inspiration

Every ritual in a life is finite and almost none of them announce their last occurrence. The
weekly call with your dad stops on an ordinary Tuesday. Saturday pancakes stop when the child
stops asking. You find out it was a phase only after it has ended.

The existing answer to "how many times will I see my parents?" is a calculator. You read the
number once, feel something for an afternoon, and forget it. A number is trivia. We wanted the
feeling of depletion rather than a fact you read once, so Finite draws the occurrences as a
grid of squares and lets you watch it get smaller.

### What it does

You name a ritual, say how often it happens, how long the phase lasts, and when it started.
Finite works out the date of every occurrence and draws one square per occurrence, in date
order.

The grid is a timeline. Squares whose date has passed sit quiet; the rest stay lit. Because
the squares sit on real dates, the grid has already moved since you last looked — **without
you tapping anything.** That is the whole idea. If you set up "weekly for 12 years" and do not
open the app for three months, you are not still shown 626. Time did the work.

You tap a quiet square when you were there for it. It fills in dark and the kept count rises.
Tap again to take it back — it is a note about the past, not a consumption of anything.

And when you come back after a gap, the card tells you what changed while you were away:
*"4 moments passed since you last looked."* That line is the reason to open it again, and it
appears once rather than nagging.

Two numbers per ritual, and the difference between them is the point: **Left** is still to
come and moves on its own; **Kept** is what you actually recorded being present for.

### Who it is for

Two specific people.

A parent of a young child — Saturday pancakes, bedtime stories, being carried to bed. These
stop on a Tuesday without a last time.

An adult with ageing parents — the weekly phone call, Sunday lunch, the visit home. The
arithmetic there is uncomfortable and most people avoid doing it.

Both share the same blind spot: the phase ends before you notice it was a phase.

### How we built it

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies, no API keys, no
server, and no network request of any kind — the app works with the network unplugged. Rituals
live in `localStorage`.

That is a deliberate choice rather than a limitation. The product is one screen and one
calculation, and a build step would add a dependency that could break mid-demo without making
the grid any better.

Three files do the work: `index.html` (shell, legend, form), `styles.css` (palette, typography,
squares), `app.js` (state, calculation, rendering, persistence).

**The calculation** converts both sides to days and divides, using `floor` so the count never
promises an occurrence that does not fit:

```
total = floor(duration × daysPerUnit ÷ daysPerPeriod)
```

Weekly for 12 years is `12 × 365.25 ÷ 7` → **626**. Yearly for 20 years → **20**.

**Occurrences are added with calendar arithmetic, not milliseconds.** Adding
`7 × 86,400,000` ms across a daylight-saving boundary drifts by an hour and can land an
occurrence on the wrong day, so occurrence *n* is the start date plus *n* periods, with month
ends clamped (31 Jan → 28 Feb → 31 Mar, not a march into the wrong month).

**Nothing about the present is stored.** Only the start date, the count, which occurrences you
marked, and the day you last opened the app. The passed/upcoming split is recomputed from the
device clock every time the page is drawn — which is why the grid can never be quietly out of
date, and why there is no timer or background process anywhere in the app.

Built for this hackathon by running the **Build With AI: Basics** skills in an AI coding
agent — `1-start`, `2-scope`, `3-prd`, `4-spec`, `5-build`, `6-ship`, pinned in
`skills-lock.json`. The planning documents they generated are in the repository root
(`scope.md`, `prd.md`, `spec.md`) with originals in `devpost/`.

### Challenges we ran into

**The first version only moved when you tapped it.** That made the number a report on your own
discipline rather than a fact about the world. Set up "weekly for 12 years", do not open the app
for three months, and it still said 626 — which is not merely unhelpful, it is wrong. We
rewrote the grid as a real timeline so squares pass on their own, and changed tapping from
*consuming* an instance to *recording* that you were there. The second change is what makes it
undoable. Both are recorded in `devpost/checklist.md`.

**A grid of 626 squares had to stay readable.** Sizes step down by count, and the three states
had to stay distinguishable — passed fill is deliberately low-contrast (1.41:1) and carries a
hairline edge at 3.15:1 so it recedes but survives a projector. Passed versus upcoming is
4.13:1.

**The grid is one tab stop, not 626.** A keyboard user cannot press Tab once per passed square.
Only one square per grid is in the tab order; arrow keys move inside it, and movement is clamped
to squares that can actually be acted on, because a disabled button cannot take focus and an
unclamped move would appear to do nothing.

**Persistence was the load-bearing assumption.** Whether saved rituals genuinely survive closing
the browser — or whether the app would look broken on camera — was the one thing we were unsure
of, so it was pulled forward and verified early rather than discovered during recording.

### What we learned

The biggest lesson was that **who does the work changes what the product is.** The first
version had the user's taps driving the depletion. It looked the same and demoed fine, but it
made the number a comment on your diligence instead of a fact about the world. Making time the
driver is what turned it from a tracker into a mirror. That was a product decision, not a
coding one, and it came from asking what the number was actually claiming to be true.

The second was that **planning first paid for itself at the rewrite.** Because `scope.md` had
written down the kernel as "the depletion", the contradiction was obvious the moment the
time-driven idea arrived — and the spec wording that disagreed with it got corrected instead
of quietly drifting. Writing the kernel down in one sentence is what made the inconsistency
visible.

### What's next

Editing a ritual after creating it, and backdating instances that already happened. Notifications
are deliberately left out — the app depends on you choosing to look, and being nagged would work
against the entire point.

### Built with

```
html, css, javascript, localstorage, ai-coding-agent
```

---

## Judge-facing notes

**Design** — one screen, one interaction, one calculation. Nothing is bolted on. The legend is
styled by the same CSS classes as the real grid, so it cannot drift out of step with what it
describes.

**Innovation** — the differentiator is not the arithmetic, which is trivial; it is that the grid
depletes on real time rather than on your input, and that it tells you what changed while you
were away. Both exist to make the number honest rather than motivational.

**Presentation** — the video is a screen recording of the running app with a narrated
voiceover, showing the count moving on its own, the return-visit line, and the grid on a phone.
Captions stay on screen so it works muted.

**Honest limitations, stated up front** — Finite does arithmetic on what you tell it. It does
not predict lifespans and knows nothing about anyone's health. If the input is wrong, the number
is wrong. It derives the grid from the device clock with no network to check against, so a
device with the wrong date shows the wrong grid. And it never tells you how many moments passed
without you — that number is trivial to compute and is left out on purpose, because it would
turn a reflection tool into a source of guilt.

---

## Before you hit submit

- [ ] **Rewrite "What we learned" in your own words.** It is drafted from the real build, but it
      is the one section a judge reads to hear *you*, and it is currently written for you. Change
      it or it is not yours.
- [ ] **Check the project name.** `Finite` is the working name. It cannot be spoken by the
      narration voice in the video, which is why the video shows it on the title card and never
      says it. If you rename the project, the video stays correct; if you keep the name, that is
      worth knowing.
- [ ] **Upload the video to the Devpost form or YouTube.** GitHub will not play it inside the
      Devpost submission, and reviewers will not clone the repo.
- [ ] **Confirm the repo is public** — it is, verified.
- [ ] **Confirm `scope.md`, `prd.md`, `spec.md` are at the repository root** — they are, verified.
- [ ] **Decide about the live link.** It is a sandbox URL and will die. Include it only if the
      form demands a live URL, and know that the video is what reviewers will actually use.
