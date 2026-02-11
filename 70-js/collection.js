const dateListEl = document.getElementById("dateList");
const editBtn = document.getElementById("editDateListBtn");
const addForm = document.getElementById("addDateForm");

let editMode = false;

// =========================
// INIT DEFAULT DATES
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

if (!localStorage.getItem("dateCollection")) {
  localStorage.setItem(
    "dateCollection",
    JSON.stringify(defaultDates)
  );
}

// =========================
// HELPERS
// =========================
function getCollection() {
  return JSON.parse(localStorage.getItem("dateCollection")) || [];
}

function saveCollection(data) {
  localStorage.setItem("dateCollection", JSON.stringify(data));
}

// =========================
// RENDER DATE LIST
// =========================
function renderDateList() {
  if (!dateListEl) return;

  dateListEl.innerHTML = "";

  const dateCollection = getCollection();
  const selectedDates =
    JSON.parse(localStorage.getItem("selectedDates")) || {};

  dateCollection.forEach((date, index) => {
    const card = document.createElement("div");
    card.className = "date-card";

   const titleWrapper = document.createElement("div");
titleWrapper.className = "date-title-wrapper";

const titleEl = document.createElement("div");
titleEl.className = "date-title";
titleEl.textContent = date.title;
titleEl.contentEditable = editMode;

const saveIcon = document.createElement("span");
saveIcon.className = "save-icon";
saveIcon.textContent = "💾";

if (!editMode) {
  saveIcon.style.display = "none";
}

titleWrapper.appendChild(titleEl);
titleWrapper.appendChild(saveIcon);



    const tagsEl = document.createElement("div");
    tagsEl.className = "date-tags";
    tagsEl.innerHTML = date.tags
  .map(t => `<span class="tag-pill">${t}</span>`)
  .join("");

    tagsEl.contentEditable = editMode;

    titleEl.addEventListener("blur", () => {
      date.title = titleEl.textContent.trim();
      saveCollection(dateCollection);
    });

    saveIcon.addEventListener("click", () => {
  date.title = titleEl.textContent.trim();
  saveCollection(dateCollection);

  saveIcon.classList.add("saved");
  setTimeout(() => saveIcon.classList.remove("saved"), 300);
});


    tagsEl.addEventListener("blur", () => {
      date.tags = tagsEl.textContent
  .split(" ")
  .map(t => t.trim())
  .filter(Boolean);

      saveCollection(dateCollection);
      renderDateList();
    });

    const actions = document.createElement("div");
    actions.className = "date-actions";

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "action-btn delete";
    deleteBtn.textContent = "Löschen";

    deleteBtn.addEventListener("click", () => {
      const usedIn = Object.keys(selectedDates).filter(m =>
        selectedDates[m].some(d => d.id === date.id)
      );

      let warning = "Date wirklich löschen?";
      if (usedIn.length) {
        warning =
          `Dieses Date ist noch eingeplant in:\n\n${usedIn.join(", ")}\n\nTrotzdem löschen?`;
      }

      if (!confirm(warning)) return;

      card.classList.add("removing");

      setTimeout(() => {
        dateCollection.splice(index, 1);
        saveCollection(dateCollection);
        renderDateList();
      }, 300);
    });

    actions.appendChild(deleteBtn);
    card.appendChild(titleWrapper);
    card.appendChild(tagsEl);
    card.appendChild(actions);
    dateListEl.appendChild(card);
  });
}

renderDateList();

// =========================
// EDIT MODE TOGGLE
// =========================
if (editBtn) {
  editBtn.addEventListener("click", () => {
    editMode = !editMode;
    dateListEl.classList.toggle("edit-mode", editMode);
    editBtn.textContent = editMode ? "✔️ Fertig" : "✏️ Bearbeiten";
    renderDateList();
  });
}

// =========================
// ADD DATE FORM (FIXED)
// =========================
if (addForm) {
  const emojiInput = document.getElementById("dateEmoji");
  const titleInput = document.getElementById("dateTitle");
  const tagsInput = document.getElementById("dateTags");
  const addAnotherBtn = document.getElementById("addAnotherBtn");

  function addDate(clear) {
    const dateCollection = getCollection();

    const newDate = {
      id: titleInput.value
        .toLowerCase()
        .replace(/\s+/g, "-"),
      title: `${emojiInput.value} ${titleInput.value}`.trim(),
      tags: tagsInput.value
        .split(",")
        .map(t => t.trim())
        .filter(Boolean),
      file: ""
    };

    dateCollection.push(newDate);
    saveCollection(dateCollection);

    if (clear) {
      emojiInput.value = "";
      titleInput.value = "";
      tagsInput.value = "";
      emojiInput.focus();
    }
  }

  addAnotherBtn?.addEventListener("click", () => {
    addDate(true);
  });

  addForm.addEventListener("submit", e => {
    e.preventDefault();
    addDate(false);
    window.location.href =
      "/Geburtstag/50-collection/date-list.html";
  });
}
