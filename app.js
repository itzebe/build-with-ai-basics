/* Finite — some moments run out.
   State, dates, calculation, rendering and persistence. No dependencies, no network.

   The one idea worth knowing: nothing about the present is stored. Whether a square
   has passed is worked out from the clock every time the page is drawn, so the grid
   moves on its own and can never be quietly out of date. The only thing saved about
   the past is which occurrences you recorded being there for. */

var DAYS_PER_PERIOD = { daily: 1, weekly: 7, monthly: 30.4375, yearly: 365.25 };
var DAYS_PER_UNIT = { days: 1, weeks: 7, months: 30.4375, years: 365.25 };
var MAX_TOTAL = 2000;
var MS_PER_DAY = 86400000;

var rituals = [];
var idCounter = 0;

/* How many occurrences slipped by since the user last opened this. Transient:
   recomputed at startup, never stored, because it is a comparison between two
   dates rather than a fact about the ritual. */
var sinceLastSeen = {};

function makeId() {
  idCounter += 1;
  return "r_" + Date.now().toString(36) + "_" + idCounter;
}

/* ---------- dates ---------- */

function startOfToday() {
  var d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/* Local calendar date as YYYY-MM-DD. Not toISOString(), which is UTC and can
   land on the wrong day either side of midnight. */
function toISODate(date) {
  var m = String(date.getMonth() + 1);
  var d = String(date.getDate());
  if (m.length < 2) m = "0" + m;
  if (d.length < 2) d = "0" + d;
  return date.getFullYear() + "-" + m + "-" + d;
}

function fromISODate(iso) {
  var parts = String(iso).split("-");
  return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
}

/* Calendar arithmetic, not milliseconds: adding 7 x 86,400,000ms across a
   daylight-saving boundary drifts by an hour and can land on the wrong day.
   Note the `n === undefined` check rather than `n || 1` — with `|| 1` an n of 0
   silently became 1, which made occurrence 0 a duplicate of occurrence 1. */
function addPeriod(date, freq, n) {
  var d = new Date(date.getTime());
  var amount = (n === undefined || n === null) ? 1 : n;
  if (freq === "daily") {
    d.setDate(d.getDate() + amount);
  } else if (freq === "weekly") {
    d.setDate(d.getDate() + 7 * amount);
  } else if (freq === "monthly") {
    var day = d.getDate();
    d.setDate(1);
    d.setMonth(d.getMonth() + amount);
    /* Clamp to the last day of the target month, so 31 Jan + 1 month is
       28/29 Feb rather than overflowing into March. */
    var lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    d.setDate(Math.min(day, lastDay));
  } else {
    d.setFullYear(d.getFullYear() + amount);
  }
  return d;
}

/* ---------- calculation ---------- */

/* How many occurrences fit in the phase the user described. */
function totalFrom(input) {
  var period = DAYS_PER_PERIOD[input.freq];
  var unit = DAYS_PER_UNIT[input.durationUnit];
  if (!period || !unit) return 0;
  var days = Number(input.durationValue) * unit;
  if (!isFinite(days) || days <= 0) return 0;
  return Math.max(1, Math.floor(days / period));
}

/* Every occurrence of a ritual, in date order. Pure: depends only on the stored
   fields, so it returns the same list every call — which is what makes an index
   in `kept` a stable way to identify a moment. */
function occurrences(ritual) {
  var list = [];
  var start = fromISODate(ritual.startISO);
  for (var n = 0; n < ritual.total; n++) {
    list.push(addPeriod(start, ritual.freq, n));
  }
  return list;
}

/* Split into what has gone and what is still to come. An occurrence today counts
   as passed, because the day has already begun. */
function splitOccurrences(list, today) {
  var passed = [];
  var upcoming = [];
  for (var i = 0; i < list.length; i++) {
    if (list[i].getTime() <= today.getTime()) passed.push(i);
    else upcoming.push(i);
  }
  return { passed: passed, upcoming: upcoming };
}

function isKept(ritual, index) {
  return ritual.kept.indexOf(index) !== -1;
}

/* Square size steps down as the count grows, so a big grid stays legible. */
function sizeClassFor(total) {
  if (total <= 60) return "";
  if (total <= 200) return "is-sm";
  if (total <= 600) return "is-xs";
  return "is-xxs";
}

function plural(n, word) {
  return n + " " + word + (n === 1 ? "" : "s");
}

var FREQ_WORDS = { daily: "Every day", weekly: "Every week", monthly: "Every month", yearly: "Every year" };

function describe(ritual) {
  return FREQ_WORDS[ritual.freq] + ", for " +
    plural(ritual.durationValue, ritual.durationUnit.replace(/s$/, ""));
}

var MONTHS = ["January", "February", "March", "April", "May", "June",
              "July", "August", "September", "October", "November", "December"];
var WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function prettyDate(date) {
  return WEEKDAYS[date.getDay()] + " " + date.getDate() + " " +
    MONTHS[date.getMonth()] + " " + date.getFullYear();
}

function shortDate(date) {
  return date.getDate() + " " + MONTHS[date.getMonth()].slice(0, 3) + " " + date.getFullYear();
}

/* "about 10 years", "about 4 months", "about 3 weeks" — a rough sense of scale. */
function roughSpan(from, to) {
  var days = Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
  if (days < 14) return "about " + plural(days, "day");
  if (days < 70) return "about " + plural(Math.round(days / 7), "week");
  if (days < 730) return "about " + plural(Math.round(days / 30.4375), "month");
  return "about " + plural(Math.round(days / 365.25), "year");
}

/* ---------- seeding ---------- */

/* Starts seven years ago on purpose: a ritual starting today would show a fully
   lit grid, which hides the whole mechanic on first run. Snapped to a Saturday so
   the seeded "Saturday pancakes" actually lands on Saturdays. */
function seed() {
  var start = startOfToday();
  start.setFullYear(start.getFullYear() - 7);
  var toSaturday = (6 - start.getDay() + 7) % 7;
  start.setDate(start.getDate() + toSaturday);
  return [{
    id: makeId(),
    name: "Saturday pancakes",
    freq: "weekly",
    durationValue: 12,
    durationUnit: "years",
    startISO: toISODate(start),
    total: totalFrom({ freq: "weekly", durationValue: 12, durationUnit: "years" }),
    kept: [],
    lastSeenISO: toISODate(startOfToday()),
    isExample: true
  }];
}

/* ---------- rendering ---------- */

function buildCard(ritual) {
  var list = occurrences(ritual);
  var split = splitOccurrences(list, startOfToday());
  var left = split.upcoming.length;
  var kept = ritual.kept.length;
  var next = left ? list[split.upcoming[0]] : null;

  var card = document.createElement("article");
  card.className = "card";
  card.setAttribute("data-id", ritual.id);

  var name = document.createElement("h2");
  name.className = "card-name";
  name.textContent = ritual.name;
  card.appendChild(name);

  var meta = document.createElement("p");
  meta.className = "card-meta";
  meta.textContent = describe(ritual) + " · since " + shortDate(fromISODate(ritual.startISO)) +
    (ritual.isExample ? " · an example, remove it any time" : "");
  card.appendChild(meta);

  var counts = document.createElement("div");
  counts.className = "card-counts";

  var leftBlock = document.createElement("p");
  leftBlock.className = "count count-left";
  leftBlock.textContent = String(left);
  var leftUnit = document.createElement("span");
  leftUnit.className = "unit";
  leftUnit.textContent = "left";
  leftBlock.appendChild(leftUnit);
  counts.appendChild(leftBlock);

  var keptBlock = document.createElement("p");
  keptBlock.className = "count count-kept";
  keptBlock.textContent = String(kept);
  var keptUnit = document.createElement("span");
  keptUnit.className = "unit";
  keptUnit.textContent = "kept";
  keptBlock.appendChild(keptUnit);
  counts.appendChild(keptBlock);

  card.appendChild(counts);

  var when = document.createElement("p");
  when.className = "card-when";
  when.textContent = next
    ? "Next: " + prettyDate(next) + " · " + roughSpan(startOfToday(), next) + " from now"
    : "This one is over.";
  card.appendChild(when);

  /* The payoff for coming back: the thing that happened while you were away. */
  if (sinceLastSeen[ritual.id] > 0) {
    var slip = document.createElement("p");
    slip.className = "card-slip";
    slip.textContent = plural(sinceLastSeen[ritual.id], "moment") +
      " passed since you last looked.";
    card.appendChild(slip);
  }

  var grid = document.createElement("div");
  grid.className = "grid" + (sizeClassFor(ritual.total) ? " " + sizeClassFor(ritual.total) : "");
  grid.setAttribute("role", "group");
  grid.setAttribute("aria-label", ritual.name + ": " + left + " still to come, " +
    kept + " recorded as kept, out of " + ritual.total);

  var passedSet = {};
  for (var p = 0; p < split.passed.length; p++) passedSet[split.passed[p]] = true;

  for (var i = 0; i < list.length; i++) {
    var isPassed = passedSet[i] === true;
    var marked = isKept(ritual, i);

    var sq = document.createElement("button");
    sq.type = "button";
    sq.className = "sq " + (isPassed ? "is-passed" : "is-upcoming");
    sq.setAttribute("data-id", ritual.id);
    sq.setAttribute("data-index", String(i));
    if (marked) sq.classList.add("is-kept");

    if (isPassed) {
      sq.setAttribute("aria-label", prettyDate(list[i]) + ", passed. " +
        (marked ? "Marked as kept. Tap to clear."
                : "Not marked. Tap to record you were there."));
    } else {
      sq.disabled = true;
      sq.setAttribute("aria-label", prettyDate(list[i]) + ", still to come.");
    }

    grid.appendChild(sq);
  }

  var upcoming = grid.querySelectorAll(".is-upcoming");
  if (upcoming.length) upcoming[0].classList.add("is-next");

  card.appendChild(grid);

  if (!left) {
    card.classList.add("is-over");
    var over = document.createElement("p");
    over.className = "card-over";
    over.textContent = "Every one of these has passed.";
    card.appendChild(over);
  }

  card.appendChild(buildRemove(ritual));
  return card;
}

/* Separated from the grid so it cannot be hit by accident. */
function buildRemove(ritual) {
  var wrap = document.createElement("p");
  wrap.className = "card-remove-wrap";
  var btn = document.createElement("button");
  btn.type = "button";
  btn.className = "card-remove";
  btn.setAttribute("data-remove", ritual.id);
  btn.textContent = "Remove";
  wrap.appendChild(btn);
  return wrap;
}

/* Compare each ritual against the day the user last opened the app, so the card
   can say what slipped by while they were away. Runs once at startup, then moves
   the marker forward. */
function notePassage() {
  var today = startOfToday();
  for (var i = 0; i < rituals.length; i++) {
    var ritual = rituals[i];
    var then = ritual.lastSeenISO ? fromISODate(ritual.lastSeenISO) : null;

    if (then && !isNaN(then.getTime()) && then.getTime() < today.getTime()) {
      var list = occurrences(ritual);
      var before = 0;
      var now = 0;
      for (var k = 0; k < list.length; k++) {
        var at = list[k].getTime();
        if (at <= then.getTime()) before += 1;
        if (at <= today.getTime()) now += 1;
      }
      if (now - before > 0) sinceLastSeen[ritual.id] = now - before;
    }

    ritual.lastSeenISO = toISODate(today);
  }
  save();
}

function render() {
  var stack = document.getElementById("stack");
  stack.textContent = "";
  var today = startOfToday();

  if (!rituals.length) {
    var empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No rituals yet. Add one, and it will show you how many are still to come.";
    stack.appendChild(empty);
  }

  var totalLeft = 0;
  for (var i = 0; i < rituals.length; i++) {
    stack.appendChild(buildCard(rituals[i]));
    totalLeft += splitOccurrences(occurrences(rituals[i]), today).upcoming.length;
  }

  var totalEl = document.getElementById("total");
  totalEl.textContent = rituals.length
    ? plural(totalLeft, "moment") + " still to come across " + plural(rituals.length, "ritual")
    : "";
}

/* ---------- interaction ---------- */

function findRitual(id) {
  for (var i = 0; i < rituals.length; i++) {
    if (rituals[i].id === id) return rituals[i];
  }
  return null;
}

/* Recording is reversible: a tap is a note about the past, not the moment itself. */
function toggleKept(id, index, square) {
  var ritual = findRitual(id);
  if (!ritual) return;

  var list = occurrences(ritual);
  if (index < 0 || index >= list.length) return;
  if (list[index].getTime() > startOfToday().getTime()) return;

  var at = ritual.kept.indexOf(index);
  if (at === -1) ritual.kept.push(index);
  else ritual.kept.splice(at, 1);
  ritual.kept.sort(function (a, b) { return a - b; });

  save();

  if (square && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    square.classList.add("is-marking");
    window.setTimeout(render, 150);
  } else {
    render();
  }
}

function removeRitual(id) {
  var ritual = findRitual(id);
  if (!ritual) return;
  if (!window.confirm('Remove "' + ritual.name + '"? This cannot be undone.')) return;
  var next = [];
  for (var i = 0; i < rituals.length; i++) {
    if (rituals[i].id !== id) next.push(rituals[i]);
  }
  rituals = next;
  save();
  render();
}

function handleClick(event) {
  var removeBtn = event.target.closest("[data-remove]");
  if (removeBtn) {
    removeRitual(removeBtn.getAttribute("data-remove"));
    return;
  }
  var sq = event.target.closest(".sq");
  if (!sq || sq.disabled) return;
  toggleKept(sq.getAttribute("data-id"), Number(sq.getAttribute("data-index")), sq);
}

/* ---------- persistence ---------- */

var STORAGE_KEY = "finite.rituals.v1";
var storageOK = true;

/* Each restored ritual is checked for the fields it needs, so a malformed or
   half-written record is discarded rather than rendered as NaN. */
function isUsableRitual(r) {
  return r && typeof r === "object" &&
    typeof r.name === "string" && r.name.length > 0 &&
    typeof r.freq === "string" && DAYS_PER_PERIOD[r.freq] !== undefined &&
    typeof r.durationValue === "number" && isFinite(r.durationValue) && r.durationValue > 0 &&
    typeof r.durationUnit === "string" && DAYS_PER_UNIT[r.durationUnit] !== undefined &&
    typeof r.startISO === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.startISO) &&
    !isNaN(fromISODate(r.startISO).getTime()) &&
    typeof r.total === "number" && isFinite(r.total) && r.total > 0 && r.total <= MAX_TOTAL &&
    Array.isArray(r.kept);
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rituals));
    return true;
  } catch (err) {
    storageOK = false;
    return false;
  }
}

function load() {
  var raw;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch (err) {
    storageOK = false;
    return null;
  }
  if (!raw) return null;

  var parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return null;
  }
  if (!Array.isArray(parsed)) return null;

  var clean = [];
  for (var i = 0; i < parsed.length; i++) {
    var r = parsed[i];
    if (!isUsableRitual(r)) continue;

    /* Keep only indices naming a real occurrence, so a stale mark cannot point
       at a square that does not exist. */
    var kept = [];
    for (var k = 0; k < r.kept.length; k++) {
      var idx = r.kept[k];
      if (typeof idx === "number" && idx >= 0 && idx < r.total && kept.indexOf(idx) === -1) {
        kept.push(idx);
      }
    }
    kept.sort(function (a, b) { return a - b; });

    clean.push({
      id: typeof r.id === "string" && r.id ? r.id : makeId(),
      name: r.name,
      freq: r.freq,
      durationValue: r.durationValue,
      durationUnit: r.durationUnit,
      startISO: r.startISO,
      total: r.total,
      kept: kept,
      lastSeenISO: typeof r.lastSeenISO === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.lastSeenISO)
        ? r.lastSeenISO : "",
      isExample: r.isExample === true
    });
  }
  return clean.length ? clean : null;
}

/* If the browser will not keep anything, say so once rather than pretending. */
function noteIfStorageUnavailable() {
  if (storageOK) return;
  document.getElementById("storage-note").textContent =
    "This browser is not keeping data right now, so your rituals will not be here next time.";
}

/* ---------- adding a ritual ---------- */

function setError(fieldId, message) {
  document.getElementById(fieldId).textContent = message || "";
}

function clearErrors() {
  setError("e-name", "");
  setError("e-dur", "");
  setError("e-start", "");
}

function handleAdd(event) {
  event.preventDefault();
  clearErrors();

  var name = document.getElementById("f-name").value.trim();
  var freq = document.getElementById("f-freq").value;
  var durationValue = parseInt(document.getElementById("f-dur").value, 10);
  var durationUnit = document.getElementById("f-unit").value;
  var startISO = document.getElementById("f-start").value;

  var ok = true;

  if (!name) {
    setError("e-name", "Give it a name.");
    ok = false;
  }

  if (!isFinite(durationValue) || durationValue <= 0) {
    setError("e-dur", "How long does this last? Enter a number above zero.");
    ok = false;
  } else {
    var total = totalFrom({ freq: freq, durationValue: durationValue, durationUnit: durationUnit });
    if (total > MAX_TOTAL) {
      setError("e-dur", "That works out to " + total.toLocaleString() +
        " moments — more than this can draw. Try a shorter stretch.");
      ok = false;
    }
  }

  var start = null;
  if (!startISO) {
    setError("e-start", "When did it start? Today is fine.");
    ok = false;
  } else {
    start = fromISODate(startISO);
    if (isNaN(start.getTime())) {
      setError("e-start", "That date does not look right.");
      ok = false;
    } else if (start.getTime() > startOfToday().getTime()) {
      setError("e-start", "This cannot start in the future.");
      ok = false;
    }
  }

  if (!ok) return;

  rituals.push({
    id: makeId(),
    name: name,
    freq: freq,
    durationValue: durationValue,
    durationUnit: durationUnit,
    startISO: toISODate(start),
    total: totalFrom({ freq: freq, durationValue: durationValue, durationUnit: durationUnit }),
    kept: [],
    lastSeenISO: toISODate(startOfToday())
  });

  save();
  render();

  document.getElementById("f-name").value = "";
  document.getElementById("f-dur").value = "12";
  document.getElementById("f-start").value = toISODate(startOfToday());
  document.getElementById("add-fields").hidden = true;
  document.getElementById("add-toggle").setAttribute("aria-expanded", "false");
}

/* ---------- start ---------- */

function init() {
  var stored = load();
  if (stored) {
    rituals = stored;
  } else {
    rituals = seed();
    save();
  }
  noteIfStorageUnavailable();

  document.getElementById("f-start").value = toISODate(startOfToday());

  document.getElementById("stack").addEventListener("click", handleClick);
  document.getElementById("add-form").addEventListener("submit", handleAdd);

  document.getElementById("add-toggle").addEventListener("click", function () {
    var fields = document.getElementById("add-fields");
    fields.hidden = !fields.hidden;
    this.setAttribute("aria-expanded", fields.hidden ? "false" : "true");
    if (!fields.hidden) document.getElementById("f-name").focus();
  });

  document.getElementById("add-cancel").addEventListener("click", function () {
    clearErrors();
    document.getElementById("add-fields").hidden = true;
    document.getElementById("add-toggle").setAttribute("aria-expanded", "false");
  });

  notePassage();
  render();
}

init();
