// =========================
// DATE TEMPLATE (SUPABASE FULL VERSION)
// =========================

const params = new URLSearchParams(window.location.search);
const dateId = params.get("id");
const month = params.get("month");

const calendarGrid = document.getElementById("calendarGrid");
const calendarToggle = document.getElementById("calendarToggle");
const calendarContent = document.getElementById("calendarContent");
const doneBtn = document.getElementById("doneBtn");
const backBtn = document.getElementById("backBtn");
const icalBtn = document.getElementById("icalBtn");

let selectedDay = null;
let currentEntryId = null;

const currentYear = new Date().getFullYear();


// =========================
// CALENDAR TOGGLE
// =========================

if (calendarToggle && calendarContent) {
  calendarToggle.style.cursor = "pointer";

  calendarToggle.addEventListener("click", () => {
    calendarContent.classList.toggle("collapsed");
  });
}


// =========================
// LOAD DATE META
// =========================

async function loadDateMeta() {
  if (!dateId) return;

  const { data } = await supabaseClient
    .from("date_ideas")
    .select("*")
    .eq("id", dateId)
    .single();

  if (!data) return;

  const titleEl = document.getElementById("dateTitle");
  const subtitleEl = document.getElementById("dateSubtitle");

  if (titleEl) {
    titleEl.textContent = `${data.emoji || "✨"} ${data.title}`;
  }

  if (subtitleEl && month) {
    const prettyMonth =
      month.charAt(0).toUpperCase() + month.slice(1);

    subtitleEl.textContent =
      `${prettyMonth} · ${data.tags?.join(" · ") || ""}`;
  }
}


// =========================
// ENSURE DATE ENTRY EXISTS
// =========================

async function ensureEntry() {

  const { data } = await supabaseClient
    .from("date_entries")
    .select("*")
    .eq("date_idea_id", dateId)
    .eq("month", month)
    .single();

  if (data) {
    currentEntryId = data.id;
    selectedDay = data.selected_day;
    populateFields(data);
    renderCalendar();
    return;
  }

  const { data: inserted } = await supabaseClient
    .from("date_entries")
    .insert([{
      date_idea_id: dateId,
      month: month,
      year: currentYear
    }])
    .select()
    .single();

  if (inserted) {
    currentEntryId = inserted.id;
    renderCalendar();
  }
}


// =========================
// CALENDAR RENDER
// =========================

function renderCalendar() {

  if (!calendarGrid || !month) return;

  const monthIndexMap = {
    januar: 0,
    februar: 1,
    maerz: 2,
    april: 3,
    mai: 4,
    juni: 5,
    juli: 6,
    august: 7,
    september: 8,
    oktober: 9,
    november: 10,
    dezember: 11
  };

  const monthIndex = monthIndexMap[month];
  const firstDay = new Date(currentYear, monthIndex, 1).getDay();
  const daysInMonth =
    new Date(currentYear, monthIndex + 1, 0).getDate();

  const offset = (firstDay + 6) % 7;

  calendarGrid.innerHTML = "";

  for (let i = 0; i < offset; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    calendarGrid.appendChild(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {

    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";
    dayEl.textContent = day;

    const position = offset + (day - 1);
    const weekdayIndex = position % 7;

    if (weekdayIndex === 5 || weekdayIndex === 6) {
      dayEl.classList.add("weekend");
    }

    if (selectedDay === day) {
      dayEl.classList.add("selected");
    }

    dayEl.addEventListener("click", async () => {

      selectedDay = day;

      document
        .querySelectorAll(".calendar-day")
        .forEach(d => d.classList.remove("selected"));

      dayEl.classList.add("selected");

      await supabaseClient
        .from("date_entries")
        .update({ selected_day: day })
        .eq("id", currentEntryId);
    });

    calendarGrid.appendChild(dayEl);
  }
}


// =========================
// MEMORY FIELDS
// =========================

function bindField(id, dbColumn) {
  const el = document.getElementById(id);
  if (!el) return;

  el.addEventListener("input", async () => {
    await supabaseClient
      .from("date_entries")
      .update({ [dbColumn]: el.value })
      .eq("id", currentEntryId);
  });
}

function populateFields(data) {
  document.getElementById("memoryTitle").value =
    data.memory_title || "";
  document.getElementById("memoryStory").value =
    data.story || "";
  document.getElementById("memoryHighlight").value =
    data.highlight || "";
  document.getElementById("memoryLesson").value =
    data.lesson || "";
  document.getElementById("memoryNext").value =
    data.next_time || "";

  if (data.images) renderImages(data.images);

  if (data.done && doneBtn) {
    doneBtn.classList.add("active");
  }
}

bindField("memoryTitle", "memory_title");
bindField("memoryStory", "story");
bindField("memoryHighlight", "highlight");
bindField("memoryLesson", "lesson");
bindField("memoryNext", "next_time");


// =========================
// IMAGE UPLOAD
// =========================

const imageInput = document.getElementById("imageInput");
const imageGallery = document.getElementById("imageGallery");

function renderImages(images) {
  imageGallery.innerHTML = "";
  images.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    img.className = "memory-image";
    imageGallery.appendChild(img);
  });
}

if (imageInput) {
  imageInput.addEventListener("change", async () => {

    const files = Array.from(imageInput.files);
    let base64Images = [];

    for (const file of files) {
      const reader = new FileReader();
      await new Promise(resolve => {
        reader.onload = () => {
          base64Images.push(reader.result);
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    await supabaseClient
      .from("date_entries")
      .update({ images: base64Images })
      .eq("id", currentEntryId);

    renderImages(base64Images);
  });
}


// =========================
// DONE BUTTON
// =========================

if (doneBtn) {

  doneBtn.addEventListener("click", async () => {

    const newState =
      doneBtn.classList.toggle("active");

    await supabaseClient
      .from("date_entries")
      .update({ done: newState })
      .eq("id", currentEntryId);

    sparkle(doneBtn);
  });
}

function sparkle(el) {

  for (let i = 0; i < 6; i++) {
    const star = document.createElement("span");
    star.textContent = "✨";
    star.style.position = "absolute";
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.animation = "sparkleFloat 0.8s ease forwards";
    star.style.fontSize = "16px";

    el.appendChild(star);

    setTimeout(() => star.remove(), 800);
  }
}


// =========================
// BACK BUTTON
// =========================

if (backBtn && month) {
  backBtn.href =
    `../40-dates/month.html?month=${month}`;

  backBtn.textContent =
    `← Zurück zu ${month.charAt(0).toUpperCase() + month.slice(1)}`;
}


// =========================
// ICS EXPORT
// =========================

function downloadICS() {

  if (!selectedDay || !month) return;

  const monthIndexMap = {
    januar: 0, februar: 1, maerz: 2, april: 3,
    mai: 4, juni: 5, juli: 6, august: 7,
    september: 8, oktober: 9, november: 10, dezember: 11
  };

  const monthIndex = monthIndexMap[month];

  const dateObj =
    new Date(currentYear, monthIndex, selectedDay);

  const isoDate =
    dateObj.toISOString().split("T")[0].replace(/-/g, "");

  const eventTitle =
    document.getElementById("dateTitle").textContent;

  const icsContent =
`BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTAMP:${isoDate}T000000Z
DTSTART;VALUE=DATE:${isoDate}
SUMMARY:${eventTitle}
DESCRIPTION:Unser Date 💕
END:VEVENT
END:VCALENDAR`;

  const blob = new Blob([icsContent], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "date-event.ics";
  a.click();

  URL.revokeObjectURL(url);
}

if (icalBtn) {
  icalBtn.addEventListener("click", downloadICS);
}


// =========================
// INIT
// =========================

(async function init() {
  await loadDateMeta();
  await ensureEntry();
})();
