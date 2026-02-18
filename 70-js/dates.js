// =========================
// PARAMS
// =========================

const params = new URLSearchParams(window.location.search);
const month = params.get("month");

// =========================
// MONTH META
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

// =========================
// LOAD MONTH DATES
// =========================

async function loadMonthDates() {

  const { data, error } = await supabaseClient
    .from("month_dates")
    .select(`
      id,
      month,
      date_idea_id,
      date_ideas (
        id,
        title,
        emoji
      )
    `)
    .eq("month", month);

  if (error) {
    console.error("Fehler beim Laden:", error);
    return [];
  }

  return data;
}

// =========================
// RENDER MONTH
// =========================

async function renderMonthDates() {

  if (!monthDatesEl || !month) return;

  monthDatesEl.innerHTML = "";

  const entries = await loadMonthDates();

  if (emptyState) {
    emptyState.style.display =
      entries.length ? "none" : "block";
  }

  entries.forEach(entry => {

    const item = document.createElement("div");
    item.className = "date-item";

    const link = document.createElement("a");
    link.className = "date-button";
    link.href =
      `/Geburtstag/40-dates/date-template.html?id=${entry.date_ideas.id}&month=${month}`;

    link.textContent =
      `${entry.date_ideas.emoji || "✨"} ${entry.date_ideas.title}`;

    item.appendChild(link);

    if (editMode) {
      const remove = document.createElement("button");
      remove.className = "remove-date";
      remove.textContent = "✕";

      remove.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        item.classList.add("removing");

        setTimeout(async () => {
          await supabaseClient
            .from("month_dates")
            .delete()
            .eq("id", entry.id);

          renderMonthDates();
        }, 300);
      });

      item.appendChild(remove);
    }

    monthDatesEl.appendChild(item);
  });
}

renderMonthDates();

// =========================
// EDIT MODE
// =========================

if (editBtn) {
  editBtn.addEventListener("click", () => {
    editMode = !editMode;
    monthDatesEl.classList.toggle("edit-mode", editMode);
    editBtn.textContent = editMode ? "✔️ Fertig" : "✏️ Bearbeiten";
    renderMonthDates();
  });
}

// =========================
// ADD BUTTON
// =========================

if (addDateBtn && month) {
  addDateBtn.href =
    `/Geburtstag/50-collection/date-select.html?month=${month}`;
}

// =========================
// DATE SELECT PAGE
// =========================

const selectList = document.getElementById("dateSelectList");

if (selectList && month) {

  async function loadIdeas() {
    const { data, error } = await supabaseClient
      .from("date_ideas")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Fehler beim Laden:", error);
      return [];
    }

    return data;
  }

  loadIdeas().then(dateCollection => {

    dateCollection.forEach(date => {

      const btn = document.createElement("button");
      btn.className = "date-button";
      btn.textContent =
        `${date.emoji || "✨"} ${date.title}`;

      btn.addEventListener("click", async () => {

        const { error } = await supabaseClient
          .from("month_dates")
          .insert([{
            month: month,
            date_idea_id: date.id
          }]);

        if (error) {
          console.error("Insert Fehler:", error);
          alert("Fehler beim Hinzufügen 😢");
          return;
        }

        window.location.href =
          `/Geburtstag/40-dates/month.html?month=${month}`;
      });

      selectList.appendChild(btn);
    });
  });
}

// =========================
// BACK BUTTON
// =========================

const backBtn = document.getElementById("backBtn");

if (backBtn && month) {
  backBtn.href =
    `/Geburtstag/40-dates/month.html?month=${month}`;
}
