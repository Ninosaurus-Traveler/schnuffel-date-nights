// =========================
// KALENDER
// =========================

const api = demoApi || supabaseApi;
const OPENED_KEY = api.storageKey || "advent-opened";
const COLOMBO_OFFSET_MS = 5.5 * 3600 * 1000;

// Farbe pro Türchen (passend zur Anordnung in css/advent.css → grid-template-areas)
const VARIANTS = {
  1: "cream", 2: "cream", 3: "yellow", 4: "red", 5: "cream", 6: "deep",
  7: "red", 8: "deep", 9: "cream", 10: "orange", 11: "yellow", 12: "orange",
  13: "yellow", 14: "red", 15: "orange", 16: "deep", 17: "orange", 18: "cream",
  19: "yellow", 20: "orange", 21: "deep", 22: "red", 23: "deep", 24: "red"
};
const WIDE = [13, 18, 23];
const TALL = [11, 14];
const DECO = ["✦", "❄", "♥", "✧", "★"];

// Reihenfolge von oben nach unten → gestaffeltes Einblenden
const VISUAL_ORDER = [7, 18, 3, 12, 21, 24, 9, 15, 1, 16, 11, 20, 4, 13, 8, 22, 2, 17, 6, 19, 14, 10, 5, 23];

const calendarEl = document.getElementById("calendar");
const countdownEl = document.getElementById("countdown");
const statusEl = document.getElementById("status");
const toastEl = document.getElementById("toast");

const doorEls = new Map();   // day → button
const states = new Map();    // day → { unlockAt: Date, isOpen: bool }
const contents = new Map();  // day → Zeile aus advent_doors
let serverOffset = 0;        // Serverzeit - Gerätezeit
let refreshing = null;
let busy = false;

// =========================
// HILFSFUNKTIONEN
// =========================

function serverNow() {
  return new Date(Date.now() + serverOffset);
}

function loadOpened() {
  try {
    return new Set(JSON.parse(localStorage.getItem(OPENED_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

function saveOpened(set) {
  try {
    localStorage.setItem(OPENED_KEY, JSON.stringify([...set]));
  } catch {
    // Private Mode o. Ä. – Animation kommt dann eben nochmal
  }
}

const opened = loadOpened();

function isUnlocked(day) {
  const state = states.get(day);
  return !!state && (state.isOpen || state.unlockAt <= serverNow());
}

let toastTimer = null;

function toast(text) {
  toastEl.textContent = text;
  toastEl.classList.add("is-visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove("is-visible"), 2600);
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =========================
// RENDERN
// =========================

function buildCalendar() {
  calendarEl.innerHTML = "";

  for (let day = 1; day <= 24; day++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `door v-${VARIANTS[day]}`;
    if (day === 24) btn.classList.add("is-big");
    if (WIDE.includes(day)) btn.classList.add("is-wide");
    if (TALL.includes(day)) btn.classList.add("is-tall");
    btn.style.gridArea = `d${day}`;
    btn.style.setProperty("--delay", `${0.15 + VISUAL_ORDER.indexOf(day) * 0.035}s`);
    btn.dataset.day = day;
    btn.setAttribute("aria-label", `Türchen ${day}`);

    btn.innerHTML = `
      <span class="door-inside"><span class="inside-art">✨</span></span>
      <span class="door-leaf">
        <span class="door-deco" aria-hidden="true">${DECO[day % DECO.length]}</span>
        <span class="door-num">${day}</span>
      </span>`;

    btn.addEventListener("animationend", event => {
      if (event.animationName === "pop") btn.classList.add("is-ready");
      if (event.animationName === "shake") btn.classList.remove("is-shaking");
    });
    btn.addEventListener("click", () => onDoorTap(day));

    calendarEl.appendChild(btn);
    doorEls.set(day, btn);
  }

  const deco = document.createElement("div");
  deco.className = "deco-tile";
  deco.style.setProperty("--delay", `${0.15 + 24 * 0.035}s`);
  deco.innerHTML = `<span class="deco-heart">❤️</span><span>für dich</span>`;
  calendarEl.appendChild(deco);
}

function updateDoors() {
  doorEls.forEach((btn, day) => {
    const unlocked = isUnlocked(day);
    const wasOpened = opened.has(day) && unlocked;

    btn.classList.toggle("is-locked", !unlocked);
    btn.classList.toggle("is-opened", wasOpened);
    btn.classList.toggle("is-new", unlocked && !wasOpened);
    btn.setAttribute(
      "aria-label",
      `Türchen ${day}${!unlocked ? " (noch zu)" : wasOpened ? " (schon geöffnet)" : " (bereit zum Öffnen!)"}`
    );
  });
}

function thumbPath(door) {
  const media = door.media || [];
  const image = media.find(m => m.type === "image");
  if (image) return image.path;
  const video = media.find(m => m.poster);
  return video ? video.poster : null;
}

async function loadThumbs() {
  const wanted = [];
  contents.forEach(door => {
    const path = thumbPath(door);
    if (path) wanted.push([door.day, path]);
  });
  if (!wanted.length) return;

  try {
    const urls = await api.sign(wanted.map(([, path]) => path));
    wanted.forEach(([day, path]) => {
      const inside = doorEls.get(day)?.querySelector(".door-inside");
      if (!inside || !urls[path]) return;
      inside.style.backgroundImage = `url("${urls[path]}")`;
      inside.classList.add("has-thumb");
    });
  } catch (error) {
    console.warn("Vorschaubilder konnten nicht geladen werden:", error);
  }
}

// =========================
// DATEN LADEN
// =========================

async function refresh() {
  if (refreshing) return refreshing;

  refreshing = (async () => {
    const rows = await api.states();
    if (rows.length) {
      serverOffset = new Date(rows[0].server_now).getTime() - Date.now();
    }
    rows.forEach(row => {
      states.set(row.day, { unlockAt: new Date(row.unlock_at), isOpen: row.is_open });
    });

    const doors = await api.openDoors();
    doors.forEach(door => contents.set(door.day, door));

    updateDoors();
    loadThumbs();
  })();

  try {
    await refreshing;
  } finally {
    refreshing = null;
  }
}

function showError() {
  statusEl.hidden = false;
  statusEl.innerHTML = `Der Kalender macht gerade ein Nickerchen 😴<br>Versuch's gleich nochmal!
    <button type="button" id="retryBtn">Nochmal versuchen</button>`;
  document.getElementById("retryBtn").addEventListener("click", start);
}

async function start() {
  statusEl.hidden = true;
  try {
    await refresh();
    tickCountdown();
  } catch (error) {
    console.error("Kalender konnte nicht geladen werden:", error);
    showError();
  }
}

// =========================
// TÜRCHEN ANTIPPEN
// =========================

function colomboDecemberDay(date) {
  const local = new Date(date.getTime() + COLOMBO_OFFSET_MS);
  return local.getUTCMonth() === 11 ? local.getUTCDate() : 0;
}

function lockedMessage(day) {
  const now = serverNow();
  const today = colomboDecemberDay(now);
  const unlockAt = states.get(day)?.unlockAt;

  let daysLeft = today
    ? day - today
    : Math.ceil((unlockAt - now) / 86400000);

  if (daysLeft <= 1) return "Morgen ist dieses Türchen dran 🤭";
  if (daysLeft <= 3) return `Noch ${daysLeft} Tage, Schnuffel – nicht schummeln 🙈`;
  return `Psst … noch ${daysLeft} Tage Geduld 🤭`;
}

async function onDoorTap(day) {
  if (busy) return;
  const btn = doorEls.get(day);

  if (!isUnlocked(day)) {
    btn.classList.remove("is-shaking");
    void btn.offsetWidth;
    btn.classList.add("is-shaking");
    if (navigator.vibrate) navigator.vibrate(30);
    toast(lockedMessage(day));
    return;
  }

  busy = true;
  try {
    // Türchen ist gerade erst aufgegangen → Inhalte nachladen
    if (!contents.has(day)) await refresh();

    const door = contents.get(day);
    if (!door) {
      toast("Hier wird noch gebastelt … 🎨 Schau gleich nochmal!");
      return;
    }

    const urlsPromise = prepareDoor(api, door);

    if (!opened.has(day)) {
      opened.add(day);
      saveOpened(opened);
      btn.classList.remove("is-new");
      btn.classList.add("is-opened");
      confettiBurst(btn);
      await wait(reducedMotion.matches ? 0 : 750);
    }

    showDoor(door, await urlsPromise);
  } catch (error) {
    console.error(error);
    toast("Ups, das hat nicht geklappt – versuch's nochmal 💛");
  } finally {
    busy = false;
  }
}

// =========================
// COUNTDOWN
// =========================

function nextLocked() {
  for (let day = 1; day <= 24; day++) {
    if (!isUnlocked(day)) return day;
  }
  return null;
}

function formatDuration(ms) {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours >= 1) return `${hours} Std ${minutes} Min`;

  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, "0")} Min`;
}

function tickCountdown() {
  if (!states.size) return;

  const day = nextLocked();
  if (day === null) {
    countdownEl.textContent = "Frohe Weihnachten, Schnuffel 🎄💛";
    return;
  }

  const diff = states.get(day).unlockAt - serverNow();

  if (diff <= 0) {
    refresh().catch(() => {});
    return;
  }

  const days = Math.floor(diff / 86400000);
  if (day === 1 && days >= 1) {
    countdownEl.textContent = days === 1
      ? "Morgen geht's los 🎄"
      : `Noch ${days} Tage bis zum ersten Türchen 🎄`;
  } else if (days >= 1) {
    countdownEl.textContent = `Türchen ${day} öffnet in ${days} ${days === 1 ? "Tag" : "Tagen"}`;
  } else {
    countdownEl.textContent = `Türchen ${day} öffnet in ${formatDuration(diff)} ⏳`;
  }

  // Wenn gerade ein Türchen aufgegangen ist (Zeit abgelaufen), Status neu setzen
  updateDoors();
}

setInterval(tickCountdown, 1000);

// App kommt aus dem Hintergrund zurück (z. B. am nächsten Morgen) → neu laden
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible" && states.size) {
    refresh().then(tickCountdown).catch(() => {});
  }
});

// =========================
// GLITZER
// =========================

function createSparkles() {
  if (reducedMotion.matches) return;

  const container = document.querySelector(".sparkles");
  for (let i = 0; i < 16; i++) {
    const s = document.createElement("span");
    s.className = "sparkle";
    s.textContent = i % 3 === 0 ? "✦" : "•";
    s.style.left = `${Math.random() * 100}%`;
    s.style.fontSize = `${8 + Math.random() * 8}px`;
    s.style.animationDuration = `${10 + Math.random() * 10}s`;
    s.style.animationDelay = `${-Math.random() * 20}s`;
    s.style.setProperty("--o", (0.3 + Math.random() * 0.35).toFixed(2));
    s.style.setProperty("--drift", `${-30 + Math.random() * 60}px`);
    container.appendChild(s);
  }
}

// =========================
// START
// =========================

buildCalendar();
createSparkles();
start();
