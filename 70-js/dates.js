// =========================
// Monat aus URL lesen
// =========================
const params = new URLSearchParams(window.location.search);
const month = params.get("month");

// =========================
// Monatsnamen
// =========================
const monthNames = {
  januar: "Januar ❄️",
  februar: "Februar 💖",
  maerz: "März 🌱",
  april: "April 🌷",
  mai: "Mai 🏵️",
  juni: "Juni 🌸",
  juli: "Juli 🏄‍♀️",
  august: "August 🌻",
  september: "September 🍂",
  oktober: "Oktober 🎃",
  november: "November 🍁",
  dezember: "Dezember 🎄"
};

const monthSubtitles = {
  februar: "Kuschelige Winterdates 💕",
  maerz: "Frühling liegt in der Luft 🐣",
  april: "Zeit für Neues 🐇",
  mai: "Draußen sein & genießen 💆",
  juni: "Lange Tage, schöne Abende 🌇",
  juli: "Sommer, Sonne, Wir 🌊",
  august: "Warme Nächte & Abenteuer 🌞",
  september: "Goldene Momente 🍂"
};

const subtitleEl = document.querySelector(".subtitle");

if (subtitleEl && month && monthSubtitles[month]) {
  subtitleEl.textContent = monthSubtitles[month];
}

// Titel setzen
const titleEl = document.getElementById("monthTitle");

if (titleEl && month && monthNames[month]) {
  titleEl.textContent = monthNames[month];
}

// =========================
// Dates für Monat laden
// =========================
const monthDatesEl = document.getElementById("monthDates");

// Struktur:
// selectedDates = {
//   februar: [
//     { id: "kinoabend", title: "Kinoabend", file: "/40-dates/date/februar/kinoabend.html" }
//   ]
// }

const selectedDates =
  JSON.parse(localStorage.getItem("selectedDates")) || {};

const datesForMonth = selectedDates[month] || [];

if (monthDatesEl) {
  datesForMonth.forEach(date => {
    const link = document.createElement("a");
    link.href = date.file;
    link.className = "date-button";
    link.textContent = date.title;
    monthDatesEl.appendChild(link);
  });
}


// =========================
// + Button verlinken
// =========================
const addDateBtn = document.getElementById("addDateBtn");
if (addDateBtn && month) {
  addDateBtn.href =
    `/Geburtstag/50-collection/date-select.html?month=${month}`;
}

const emptyState = document.getElementById("emptyState");

if (emptyState) {
  if (datesForMonth.length === 0) {
    emptyState.style.display = "block";
  } else {
    emptyState.style.display = "none";
  }
}


// =========================
// DATE SELECT PAGE
// =========================

const selectList = document.getElementById("dateSelectList");

if (selectList) {
  const params = new URLSearchParams(window.location.search);
  const month = params.get("month");

  const dateCollection =
    JSON.parse(localStorage.getItem("dateCollection")) || [];

  const selectedDates =
    JSON.parse(localStorage.getItem("selectedDates")) || {};

  dateCollection.forEach(date => {
    const btn = document.createElement("button");
    btn.className = "date-button";
    btn.textContent = date.title;

    btn.addEventListener("click", () => {
      selectedDates[month] = selectedDates[month] || [];

      const alreadyAdded = selectedDates[month]
        .some(d => d.id === date.id);

      if (!alreadyAdded) {
        selectedDates[month].push(date);
        localStorage.setItem(
          "selectedDates",
          JSON.stringify(selectedDates)
        );
      }

      window.location.href =
        `/Geburtstag/40-dates/month.html?month=${month}`;
    });

    selectList.appendChild(btn);
  });
}


// =========================
// DATE SELECT – BACK BUTTON
// =========================

const backBtn = document.getElementById("backBtn");

if (backBtn) {
  const params = new URLSearchParams(window.location.search);
  const month = params.get("month");

  if (month) {
    backBtn.href =
      `/Geburtstag/40-dates/month.html?month=${month}`;
  }
}

if (month) {
  backBtn.textContent = `← Zurück zu ${month.charAt(0).toUpperCase() + month.slice(1)}`;
}
