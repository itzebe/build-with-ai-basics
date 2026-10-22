# Finite

Some moments run out. Finite shows you how many are left, one square at a time.

You name a ritual — Saturday pancakes, the weekly call with your dad, Sunday
lunch at your mum's. You say how often it happens, how long the phase lasts, and
when it started. Finite works out the date of every occurrence and draws one square
for each, in order.

**The grid moves on its own.** Squares whose date has passed go quiet, whether or
not you ever opened the app. So the number is not a report on how diligent you have
been with a tracker — it is what is actually happening. Come back in a week and one
more square has gone quiet without you touching anything.

You tap a quiet square when you were there for it. It fills in dark, and the kept
count goes up. Tap it again to take it back; it is a note about the past, not the
moment itself. The number is easy to ignore, but a grid you can watch run out is not.

And when you come back after a while, the app tells you what changed while you were
gone: *"4 moments passed since you last looked."* No other app says that. It is the
reason to open it again.

## Who it is for

Two people, really.

A parent of a young child. Saturday pancakes, bedtime stories, being carried to
bed. These stop on a Tuesday without a last time.

An adult with ageing parents. The weekly phone call, Sunday lunch, the visit home.
The arithmetic there is uncomfortable and most people avoid doing it.

Both share the same blind spot. The phase ends before you notice it was a phase.

## Running it

No install, no build step, no dependencies, no API keys.

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

Any static server works — `npx serve` and `php -S localhost:8000` are fine too. A
server is recommended rather than opening `index.html` directly, because browsers
treat `file://` pages inconsistently and some will not save anything on that origin.

## How it is built

Three files.

| File | What it does |
|---|---|
| `index.html` | The shell. Header, the legend, the stack container, and the add form. |
| `styles.css` | Palette, typography, and the squares. |
| `app.js` | State, the calculation, rendering, and saving. |

Plain HTML, CSS and JavaScript. No framework and no build step, deliberately: the
product is one screen and one calculation, and a build step would add a dependency
that could break in the middle of a demo without making the grid any better.

**Nothing leaves your browser.** There is no server, no account, and no network
request of any kind — the app works with the network unplugged. Rituals are kept in
`localStorage`, which means they are per-browser and clearing site data clears them.

### How the count is worked out

Both sides are converted to days and divided:

```
total = floor(duration × daysPerUnit ÷ daysPerPeriod)
```

So weekly for 12 years is `12 × 365.25 ÷ 7` → **626**. Yearly for 20 years → **20**.
Monthly for 3 years → **36**. `floor` rather than round, so the count never promises
an occurrence that does not fit. The maximum is 2000 — past that the grid stops
meaning anything.

### How the grid knows what has passed

Occurrence *n* is the start date plus *n* periods, added with calendar arithmetic
rather than by adding milliseconds. That matters: adding `7 × 86,400,000` ms across a
daylight-saving boundary drifts by an hour and can land an occurrence on the wrong
day. Month ends are clamped too, so starting on 31 January gives 31 Jan → 28 Feb →
31 Mar, not a march into the wrong month.

**Nothing about the present is stored.** Only the start date, the count, which
occurrences you marked, and the day you last opened the app. The passed/upcoming split
is recomputed from your device's clock every time the page is drawn. That is why the
grid can never be quietly out of date, and why there is no timer or background process
anywhere in the app.

The one stored date is `lastSeenISO`. It exists so the app can count what fell between
your last visit and now, and then it moves forward. The count itself is never stored —
it is a difference between two dates, not a fact about the ritual, and storing it would
let it go stale in exactly the way the old counter did.

## Using it

1. Open the page. A short legend under the title shows what the three square colours
   mean, and what tapping does. Then one example ritual is already there, partly elapsed
   so you can see the mechanic straight away.
2. The quiet squares are the ones that have already happened. The lit ones are still
   to come. Beside them: how many are left, and how many you have kept.
3. Tap a quiet square if you were there for it. Tap again to undo.
4. Use **Add a ritual** for your own: a name, how often, how long it lasts, and when
   it started.
5. Come back next week. Your kept marks are still there, one more square has gone quiet
   on its own, and the card says how many moments slipped by.

You cannot mark a square that has not happened yet. There is nothing to record.

## What was built and why

The full planning trail lives in `devpost/`.

- **[`scope.md`](devpost/scope.md)** — the idea, who it is for, and what was cut.
- **[`prd.md`](devpost/prd.md)** — what it does, screen by screen.
- **[`spec.md`](devpost/spec.md)** — how it is built, in detail.
- **[`checklist.md`](devpost/checklist.md)** — the six build slices and how each was verified.
- **[`app-map.html`](devpost/app-map.html)** — a map of the finished code.

`scope.md`, `prd.md` and `spec.md` are also copied to the repository root, because the
submission rules require those three filenames to be present. The copies in `devpost/`
are the originals; the root files carry a header saying so.

Built for the Devpost **Build With AI: Basics** hackathon, following that
curriculum's plan-first workflow.

### Two decisions worth calling out

**The legend carries the same classes as the grid.** The three swatches in the legend are
styled by the same rules as the real squares (`.sq.is-passed, .key-swatch.is-passed`, and so
on), so the legend cannot drift out of step with what it describes. Change a colour in the
stylesheet and both change together. A legend that lies about the colours is worse than no
legend at all.

**A grid rather than a number.** "How many times will I see my parents?" already
exists as a calculator, and people read the number once and forget it. The grid is
the difference — it is the same information, but you can see it. Everything else in
the app exists to support that one interaction.

**Time drives it, not your taps.** The first version only moved when you tapped it.
That meant setting up "weekly for 12 years", not opening the app for three months,
and still being told 626 — which is not useful, it is wrong. Now the squares sit on
real dates and pass on their own, so the headline number is true whether or not you
opened the app. Tapping records that you were there rather than consuming anything,
which also means it can be undone. Both changes are recorded in `checklist.md`.

## What is not here

No accounts, no sync, no sharing, no notifications, no reminders, no AI, no
analytics. Notifications in particular are left out on purpose — the app depends on
you choosing to look, and being nagged would work against that.

Editing a ritual after creating it is also not in this version, along with
backdating instances that already happened. Both are noted in `prd.md`.

## Honest limitations

Finite does arithmetic on what you tell it. It does not predict lifespans and does
not know anything about anyone's health. If the estimate is wrong, the number is
wrong.

The grid is derived from your device's clock, and it has no network to check that
against. A device with the wrong date will show the wrong grid.

The app never tells you how many moments passed without you. That number is trivial
to compute and is left out on purpose — it would turn a reflection tool into a
source of guilt.

There is no reminder or notification, so the app only tells you the truth on the
days you choose to open it. The line about what passed while you were away is not a
notification either — it waits for you, and it appears once rather than nagging.

## Licence

MIT — see [LICENSE](LICENSE).
