# Finite

Some moments run out. Finite shows you how many are left, one square at a time.

You name a ritual — Saturday pancakes, the weekly call with your dad, Sunday
lunch at your mum's. You say how often it happens and roughly how long the phase
lasts. Finite works out how many times it will happen before it is over, and draws
one square for each one.

Tapping a square spends it. The square goes, the grid gets smaller, and the count
drops. That is the whole idea: the number is easy to ignore, but a grid you can
watch run out is not.

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
| `index.html` | The shell. Header, the stack container, and the add form. |
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
an instance that does not fit. The maximum is 2000 — past that the grid stops
meaning anything.

## Using it

1. Open the page. One example ritual is there so the screen is never empty.
2. Tap a square when a ritual happens. The grid shrinks by one.
3. Use **Add a ritual** for your own: a name, how often, and how long the phase lasts.
4. Come back later. Your rituals and their spent squares are still there.

Spending is one-way. You do not get a Saturday back.

## What was built and why

The full planning trail lives in `devpost/`.

- **[`scope.md`](devpost/scope.md)** — the idea, who it is for, and what was cut.
- **[`prd.md`](devpost/prd.md)** — what it does, screen by screen.
- **[`spec.md`](devpost/spec.md)** — how it is built, in detail.
- **[`checklist.md`](devpost/checklist.md)** — the six build slices and how each was verified.
- **[`app-map.html`](devpost/app-map.html)** — a map of the finished code.

Built for the Devpost **Build With AI: Basics** hackathon, following that
curriculum's plan-first workflow.

### Two decisions worth calling out

**A grid rather than a number.** "How many times will I see my parents?" already
exists as a calculator, and people read the number once and forget it. The grid is
the difference — it is the same information, but you can see it. Everything else in
the app exists to support that one interaction.

**Spent squares disappear instead of greying out.** The first draft of the spec had
them staying on screen as greyed-out, disabled squares, which is what a habit
tracker does. That contradicts the point: the grid getting *smaller* is the feeling.
The spec was corrected to match, and it is recorded in `checklist.md`.

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

Instances are consumed when you tap, not as days pass. The grid does not move on
its own, so the count shows what you have marked rather than what the calendar
says.

## Licence

MIT — see [LICENSE](LICENSE).
