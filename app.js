/* Finite — some moments run out.
   State, calculation, rendering and persistence. No dependencies, no network. */

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

var FREQ_WORDS = { daily: "Every day", weekly: "Every week", monthly: "Every month", yearly: "Every year" };

/* "Every week, for 12 years" — plain language, no jargon. */
function describe(ritual) {
  return FREQ_WORDS[ritual.freq] + ", for " +
    plural(ritual.durationValue, ritual.durationUnit.replace(/s$/, ""));
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
  unit.textContent = left === 0 ? "all spent" : "left";
  count.appendChild(unit);
  card.appendChild(count);

  /* Every square used up. Say so plainly, offer to remove it. */
  if (left === 0) {
    card.classList.add("is-finished");
    var done = document.createElement("p");
    done.className = "card-finished";
    done.textContent = "That is all of them.";
    card.appendChild(done);
    card.appendChild(buildRemove(ritual));
    return card;
  }

  var grid = document.createElement("div");
  grid.className = "grid" + (sizeClassFor(ritual.total) ? " " + sizeClassFor(ritual.total) : "");
  grid.setAttribute("role", "group");
  grid.setAttribute("aria-label", ritual.name + ": " + left + " of " + ritual.total + " remaining");

  /* One square per moment still to come. The grid is the count. */
  for (var i = 0; i < left; i++) {
    var sq = document.createElement("button");
    sq.type = "button";
    sq.className = "sq";
    sq.setAttribute("data-id", ritual.id);
    sq.setAttribute("data-index", String(i));
    if (i === left - 1) sq.classList.add("is-next");
    sq.setAttribute("aria-label",
      "Mark one " + ritual.name + " as used. " + (left - 1) + " would remain.");
    grid.appendChild(sq);
  }

  card.appendChild(grid);
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

function render() {
  var stack = document.getElementById("stack");
  stack.textContent = "";

  if (!rituals.length) {
    var empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No rituals yet. Add one, and it will show you how many times it happens before it is over.";
    stack.appendChild(empty);
  }

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

function findRitual(id) {
  for (var i = 0; i < rituals.length; i++) {
    if (rituals[i].id === id) return rituals[i];
  }
  return null;
}

/* Spending is one-way. You do not get a Saturday back.
   The square fades, then the grid redraws one smaller, so the count and the
   grid move together and the loss is visible rather than merely stated. */
function spend(id, square) {
  var ritual = findRitual(id);
  if (!ritual || remaining(ritual) <= 0) return;

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !square) {
    ritual.spent += 1;
    save();
    render();
    return;
  }

  square.classList.add("is-leaving");
  square.disabled = true;
  window.setTimeout(function () {
    ritual.spent += 1;
    save();
    render();
  }, 150);
}

function removeRitual(id) {
  var ritual = findRitual(id);
  if (!ritual) return;
  if (!window.confirm("Remove \"" + ritual.name + "\"? This cannot be undone.")) return;
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
  spend(sq.getAttribute("data-id"), sq);
}

/* ---------- persistence ---------- */

var STORAGE_KEY = "finite.rituals.v1";
var storageOK = true;

/* Each restored ritual is checked for the fields it needs, so a malformed
   or half-written record is discarded rather than rendered as NaN. */
function isUsableRitual(r) {
  return r && typeof r === "object" &&
    typeof r.name === "string" && r.name.length > 0 &&
    typeof r.freq === "string" && DAYS_PER_PERIOD[r.freq] !== undefined &&
    typeof r.durationValue === "number" && isFinite(r.durationValue) && r.durationValue > 0 &&
    typeof r.durationUnit === "string" && DAYS_PER_UNIT[r.durationUnit] !== undefined &&
    typeof r.total === "number" && isFinite(r.total) && r.total > 0 &&
    typeof r.spent === "number" && isFinite(r.spent) && r.spent >= 0;
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
    if (isUsableRitual(parsed[i])) {
      clean.push({
        id: parsed[i].id || makeId(),
        name: parsed[i].name,
        freq: parsed[i].freq,
        durationValue: parsed[i].durationValue,
        durationUnit: parsed[i].durationUnit,
        total: parsed[i].total,
        spent: Math.min(parsed[i].spent, parsed[i].total),
        isExample: parsed[i].isExample === true
      });
    }
  }
  return clean.length ? clean : null;
}

/* If the browser will not keep anything, say so once rather than pretending. */
function noteIfStorageUnavailable() {
  if (storageOK) return;
  var note = document.getElementById("storage-note");
  note.textContent = "This browser is not keeping data right now, so your rituals will not be here next time.";
}

/* ---------- adding a ritual ---------- */

function setError(fieldId, message) {
  document.getElementById(fieldId).textContent = message || "";
}

function clearErrors() {
  setError("e-name", "");
  setError("e-dur", "");
}

function handleAdd(event) {
  event.preventDefault();
  clearErrors();

  var name = document.getElementById("f-name").value.trim();
  var freq = document.getElementById("f-freq").value;
  var durationValue = parseInt(document.getElementById("f-dur").value, 10);
  var durationUnit = document.getElementById("f-unit").value;

  var ok = true;

  if (!name) {
    setError("e-name", "Give it a name.");
    ok = false;
  }

  if (!isFinite(durationValue) || durationValue <= 0) {
    setError("e-dur", "How long does this last? Enter a number above zero.");
    ok = false;
  } else {
    var total = remainingFrom({ freq: freq, durationValue: durationValue, durationUnit: durationUnit });
    if (total > MAX_TOTAL) {
      setError("e-dur", "That works out to " + total.toLocaleString() +
        " moments — more than this can draw. Try a shorter stretch.");
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
    total: remainingFrom({ freq: freq, durationValue: durationValue, durationUnit: durationUnit }),
    spent: 0
  });

  save();
  render();

  document.getElementById("f-name").value = "";
  document.getElementById("f-dur").value = "12";
  document.getElementById("add-fields").hidden = true;
  document.getElementById("add-toggle").setAttribute("aria-expanded", "false");
}

function init() {
  var stored = load();
  if (stored) {
    rituals = stored;
  } else {
    rituals = seed();
    save();
  }
  noteIfStorageUnavailable();

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

  render();
}

init();
