// =========================
// DATE COLLECTION
// =========================

const dateListEl = document.getElementById("dateList");

// =========================
// INIT DATE COLLECTION
// =========================

const defaultDates = [
  {
    id: "kinoabend",
    title: "🍿 Kinoabend zuhause",
    tags: ["ruhig", "gemütlich", "drinnen"],
    file: "/Geburtstag/40-dates/date/februar/kinoabend.html"
  },
  {
    id: "wandern",
    title: "🥾 Wandern gehen",
    tags: ["draußen", "aktiv", "natur"],
    file: "/Geburtstag/40-dates/date/maerz/wandern.html"
  },
  {
    id: "museum",
    title: "🖼️ Museums Date",
    tags: ["ruhig", "kreativ", "inspiration"],
    file: "/Geburtstag/40-dates/date/april/museum.html"
  }
];

// 👉 EINMALIG initialisieren
if (!localStorage.getItem("dateCollection")) {
  localStorage.setItem(
    "dateCollection",
    JSON.stringify(defaultDates)
  );
}

// Ab jetzt IMMER aus localStorage lesen
const dateCollection =
  JSON.parse(localStorage.getItem("dateCollection"));


// Anzeigen
if (dateListEl) {
  dateCollection.forEach(date => {
    const card = document.createElement("div");
    card.className = "date-card";

    card.innerHTML = `
      <div class="date-title">${date.title}</div>
      <div class="date-tags">
        ${date.tags.map(tag => `<span>#${tag}</span>`).join("")}
      </div>
    `;

    dateListEl.appendChild(card);
  });
}

// Speichern (für später)
localStorage.setItem(
  "dateCollection",
  JSON.stringify(dateCollection)
);

// =========================
// DATE ADD FORM
// =========================

const addForm = document.getElementById("addDateForm");

if (addForm) {
  const emojiInput = document.getElementById("dateEmoji");
  const titleInput = document.getElementById("dateTitle");
  const tagsInput = document.getElementById("dateTags");
  const addAnotherBtn = document.getElementById("addAnotherBtn");

  let dateCollection =
    JSON.parse(localStorage.getItem("dateCollection")) || [];

  function saveDate(clearForm) {
    const newDate = {
  id: titleInput.value
    .toLowerCase()
    .replace(/\s+/g, "-"),
  title: `${emojiInput.value} ${titleInput.value}`,
  tags: tagsInput.value
    .split(",")
    .map(tag => tag.trim()),
  file: "" // wird später manuell ergänzt
};


    dateCollection.push(newDate);
    localStorage.setItem(
      "dateCollection",
      JSON.stringify(dateCollection)
    );

    if (clearForm) {
      emojiInput.value = "";
      titleInput.value = "";
      tagsInput.value = "";
      emojiInput.focus();
    }
  }

  addAnotherBtn.addEventListener("click", () => {
    saveDate(true);
  });

  addForm.addEventListener("submit", e => {
    e.preventDefault();
    saveDate(false);
    window.location.href =
      "/Geburtstag/50-collection/date-list.html";
  });
}

