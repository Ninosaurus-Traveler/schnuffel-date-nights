const params = new URLSearchParams(window.location.search);
const month = params.get("month");

const monthNames = {
  januar: "Januar ❄️",
  februar: "Februar 💖",
  maerz: "März 🌱",
  april: "April 🌷",
  mai: "Mai 🏵️",
  juni: "Juni 🌸",
  juli: "Juli 🏄‍♀️",
  august: "August 🌻",
  september: "September 🍂"
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

const titleEl = document.getElementById("monthTitle");
const subtitleEl = document.querySelector(".subtitle");
const monthDatesEl = document.getElementById("monthDates");
const editBtn = document.getElementById("editModeBtn");
const addDateBtn = document.getElementById("addDateBtn");
const emptyState = document.getElementById("emptyState");

if (titleEl && monthNames[month]) {
  titleEl.textContent = monthNames[month];
}
if (subtitleEl && monthSubtitles[month]) {
  subtitleEl.textContent = monthSubtitles[month];
}

let editMode = false;

function renderMonthDates() {
  if (!monthDatesEl || !month) return;

  monthDatesEl.innerHTML = "";

  const selectedDates =
    JSON.parse(localStorage.getItem("selectedDates")) || {};

  const datesForMonth = selectedDates[month] || [];

  if (emptyState) {
    emptyState.style.display =
      datesForMonth.length ? "none" : "block";
  }

  datesForMonth.forEach((date, index) => {
    const item = document.createElement("div");
    item.className = "date-item";

    const link = document.createElement("a");
    link.href = `/Geburtstag/40-dates/date-template.html?id=${date.id}&month=${month}`;
    link.className = "date-button";
    link.textContent = date.title;

    const remove = document.createElement("button");
    remove.className = "remove-date";
    remove.textContent = "✕";

    remove.addEventListener("click", e => {
      e.preventDefault();
      e.stopPropagation();

      item.classList.add("removing");

      setTimeout(() => {
        datesForMonth.splice(index, 1);
        selectedDates[month] = datesForMonth;
        localStorage.setItem(
          "selectedDates",
          JSON.stringify(selectedDates)
        );
        renderMonthDates();
      }, 300);
    });

    item.appendChild(link);
    item.appendChild(remove);
    monthDatesEl.appendChild(item);
  });
}

renderMonthDates();

if (editBtn) {
  editBtn.addEventListener("click", () => {
    editMode = !editMode;
    monthDatesEl.classList.toggle("edit-mode", editMode);
    editBtn.textContent = editMode ? "✔️ Fertig" : "✏️ Bearbeiten";
  });
}

if (addDateBtn && month) {
  addDateBtn.href =
    `/Geburtstag/50-collection/date-select.html?month=${month}`;
}

const selectList = document.getElementById("dateSelectList");
if (selectList) {
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
      if (!selectedDates[month].some(d => d.id === date.id)) {
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

const backBtn = document.getElementById("backBtn");
if (backBtn && month) {
  backBtn.href =
    `/Geburtstag/40-dates/month.html?month=${month}`;
}
