// =========================
// LOAD DATE IDEAS
// =========================

async function loadDateIdeas() {
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

// =========================
// GLOBALS
// =========================

const dateListEl = document.getElementById("dateList");
const editBtn = document.getElementById("editDateListBtn");

let editMode = false;

// =========================
// RENDER
// =========================

async function renderDateList() {
  if (!dateListEl) return;

  const dateCollection = await loadDateIdeas();
  dateListEl.innerHTML = "";

  dateCollection.forEach(date => {

    const card = document.createElement("div");
    card.className = "date-card";

    // =========================
    // DELETE BUTTON (IMMER ERZEUGEN)
    // Sichtbarkeit über CSS + edit-mode
    // =========================

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "remove-date";
    deleteBtn.textContent = "✕";

    deleteBtn.addEventListener("click", async () => {
      if (!confirm("Date wirklich löschen?")) return;

      const { error } = await supabaseClient
        .from("date_ideas")
        .delete()
        .eq("id", date.id);

      if (error) {
        console.error("Delete Fehler:", error);
        alert("Fehler beim Löschen 😢");
        return;
      }

      renderDateList();
    });

    card.appendChild(deleteBtn);

    // =========================
    // TITLE ROW
    // =========================

    const titleWrapper = document.createElement("div");
    titleWrapper.className = "date-title";

    const emojiEl = document.createElement("span");
    emojiEl.className = "date-emoji";
    emojiEl.textContent = date.emoji || "✨";

    const titleEl = document.createElement("span");
    titleEl.className = "date-title-text";
    titleEl.textContent = date.title;

    if (editMode) {
      emojiEl.contentEditable = true;
      titleEl.contentEditable = true;
    }

    titleWrapper.appendChild(emojiEl);
    titleWrapper.appendChild(titleEl);

    // =========================
    // TAGS
    // =========================

    const tagsEl = document.createElement("div");
    tagsEl.className = "date-tags";

    if (editMode) {
      tagsEl.contentEditable = true;
      tagsEl.textContent = (date.tags || []).join(", ");
    } else {
      (date.tags || []).forEach(tag => {
        const span = document.createElement("span");
        span.className = "tag-pill";
        span.textContent = tag;
        tagsEl.appendChild(span);
      });
    }

    // =========================
    // UPDATE FUNCTION
    // =========================

    async function updateDate() {

      const updatedEmoji = emojiEl.textContent.trim();
      const updatedTitle = titleEl.textContent.trim();
      const updatedTags = tagsEl.textContent
        .split(",")
        .map(t => t.trim())
        .filter(Boolean);

      const { error } = await supabaseClient
        .from("date_ideas")
        .update({
          emoji: updatedEmoji,
          title: updatedTitle,
          tags: updatedTags
        })
        .eq("id", date.id);

      if (error) {
        console.error("Update Fehler:", error);
      }
    }

    if (editMode) {
      emojiEl.addEventListener("blur", updateDate);
      titleEl.addEventListener("blur", updateDate);
      tagsEl.addEventListener("blur", updateDate);
    }

    card.appendChild(titleWrapper);
    card.appendChild(tagsEl);
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

    // 🔥 DAS WAR DER FEHLENDE TEIL
    dateListEl.classList.toggle("edit-mode", editMode);

    editBtn.textContent = editMode
      ? "✔️ Fertig"
      : "✏️ Bearbeiten";

    renderDateList();
  });
}

// =========================
// ADD DATE (SUPABASE)
// =========================

const addForm = document.getElementById("addDateForm");

if (addForm) {
  const emojiInput = document.getElementById("dateEmoji");
  const titleInput = document.getElementById("dateTitle");
  const tagsInput = document.getElementById("dateTags");

  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newDate = {
      title: titleInput.value.trim(),
      emoji: emojiInput.value.trim(),
      tags: tagsInput.value
        .split(",")
        .map(t => t.trim())
        .filter(Boolean)
    };

    const { error } = await supabaseClient
      .from("date_ideas")
      .insert([newDate]);

    if (error) {
      console.error("Insert Fehler:", error);
      alert("Fehler beim Speichern 😢");
      return;
    }

    window.location.href =
      "../50-collection/date-list.html";
  });
}
