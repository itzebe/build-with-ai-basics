/* Finite — some moments run out.
   State, calculation and rendering. No dependencies, no network. */

var DAYS_PER_PERIOD = { daily: 1, weekly: 7, monthly: 30.4375, yearly: 365.25 };
var DAYS_PER_UNIT = { days: 1, weeks: 7, months: 30.4375, years: 365.25 };
var MAX_TOTAL = 2000;

var rituals = [];
var idCounter = 0;

function makeId() {
  idCounter += 1;
  return "r_" + Date.now().toString(36) + "_" + idCounter;
}

/* How many instances of this ritual fit in the phase the user described. */
function remainingFrom(input) {
  var period = DAYS_PER_PERIOD[input.freq];
  var unit = DAYS_PER_UNIT[input.durationUnit];
  if (!period || !unit) return 0;
  var days = Number(input.durationValue) * unit;
  if (!isFinite(days) || days <= 0) return 0;
  return Math.max(1, Math.floor(days / period));
}

function remaining(ritual) {
  return Math.max(0, ritual.total - ritual.spent);
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

/* "weekly, for 12 years" — plain language, no jargon. */
function describe(ritual) {
  var freq = { daily: "Every day", weekly: "Every week", monthly: "Every month", yearly: "Every year" };
  return freq[ritual.freq] + ", for " + plural(ritual.durationValue, ritual.durationUnit.replace(/s$/, ""));
}

function seed() {
  return [{
    id: makeId(),
    name: "Saturday pancakes",
    freq: "weekly",
    durationValue: 12,
    durationUnit: "years",
    total: remainingFrom({ freq: "weekly", durationValue: 12, durationUnit: "years" }),
    spent: 0,
    isExample: true
  }];
}

function buildCard(ritual) {
  var left = remaining(ritual);

  var card = document.createElement("article");
  card.className = "card";
  card.setAttribute("data-id", ritual.id);

  var name = document.createElement("h2");
  name.className = "card-name";
  name.textContent = ritual.name;
  card.appendChild(name);

  var meta = document.createElement("p");
  meta.className = "card-meta";
  meta.textContent = describe(ritual) + (ritual.isExample ? " · an example, remove it any time" : "");
  card.appendChild(meta);

  var count = document.createElement("p");
  count.className = "card-count";
  count.textContent = String(left);
  var unit = document.createElement("span");
  unit.className = "unit";
  unit.textContent = left === 1 ? "left" : "left";
  count.appendChild(unit);
  card.appendChild(count);

  var grid = document.createElement("div");
  grid.className = "grid" + (sizeClassFor(ritual.total) ? " " + sizeClassFor(ritual.total) : "");
  grid.setAttribute("role", "group");
  grid.setAttribute("aria-label", ritual.name + ": " + left + " of " + ritual.total + " remaining");

  for (var i = 0; i < left; i++) {
    var sq = document.createElement("span");
    sq.className = "sq";
    if (left === 1) sq.classList.add("is-last");
    grid.appendChild(sq);
  }

  card.appendChild(grid);
  return card;
}

function render() {
  var stack = document.getElementById("stack");
  stack.textContent = "";

  for (var i = 0; i < rituals.length; i++) {
    stack.appendChild(buildCard(rituals[i]));
  }

  var totalLeft = 0;
  for (var j = 0; j < rituals.length; j++) totalLeft += remaining(rituals[j]);

  var totalEl = document.getElementById("total");
  totalEl.textContent = rituals.length
    ? plural(totalLeft, "moment") + " left across " + plural(rituals.length, "ritual")
    : "";
}

function init() {
  rituals = seed();
  render();
}

init();
