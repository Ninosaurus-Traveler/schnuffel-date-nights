// =========================
// DATE TEMPLATE LOGIC
// =========================

const params = new URLSearchParams(window.location.search);
const dateId = params.get("id");
const month = params.get("month");

let selectedDay = null;

// =========================
// DATE META
// =========================

const dateCollection =
  JSON.parse(localStorage.getItem("dateCollection")) || [];

const currentDate =
  dateCollection.find(d => d.id === dateId);

if (currentDate) {
  document.getElementById("dateTitle").textContent =
    currentDate.title;
}

// =========================
// 📅 CALENDAR
// =========================

const calendarToggle = document.getElementById("calendarToggle");
const calendarContent = document.getElementById("calendarContent");

if (calendarToggle && calendarContent) {
  calendarToggle.addEventListener("click", () => {
    calendarContent.classList.toggle("collapsed");
  });
}


if (calendarGrid && month) {

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

  const currentYear = new Date().getFullYear();
  const monthIndex = monthIndexMap[month];

  const firstDay = new Date(currentYear, monthIndex, 1).getDay();
  const daysInMonth =
    new Date(currentYear, monthIndex + 1, 0).getDate();

  // Montag als Wochenstart
  const offset = (firstDay + 6) % 7;

  const storedDate =
    localStorage.getItem(`${dateId}_date`);

  calendarGrid.innerHTML = "";

  // Leere Felder vor Monatsbeginn
  for (let i = 0; i < offset; i++) {
    const empty = document.createElement("div");
    empty.className = "calendar-day empty";
    calendarGrid.appendChild(empty);
  }

  // Tage erzeugen
  for (let day = 1; day <= daysInMonth; day++) {

    const dayEl = document.createElement("div");
    dayEl.className = "calendar-day";
    dayEl.textContent = day;

    // Position im Grid berechnen (0 = Montag, 6 = Sonntag)
    const position = offset + (day - 1);
    const weekdayIndex = position % 7;

    // 🌸 Weekend markieren
    if (weekdayIndex === 5 || weekdayIndex === 6) {
      dayEl.classList.add("weekend");
    }

    // 💗 Gespeicherten Tag markieren
    if (storedDate == day) {
      dayEl.classList.add("selected");
      selectedDay = day;
    }

    dayEl.addEventListener("click", () => {

      selectedDay = day;

      localStorage.setItem(`${dateId}_date`, day);

      document
        .querySelectorAll(".calendar-day")
        .forEach(d => d.classList.remove("selected"));

      dayEl.classList.add("selected");
    });

    calendarGrid.appendChild(dayEl);
  }
}

// =========================
// 📅 ICS EXPORT
// =========================

function downloadICS() {

  if (!selectedDay || !month) return;

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

  const currentYear = new Date().getFullYear();
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

// =========================
// 📝 MEMORY FIELDS
// =========================

function bindMemoryField(id) {
  const el = document.getElementById(id);
  const key = `${dateId}_${id}`;
  if (!el) return;

  el.value = localStorage.getItem(key) || "";

  el.addEventListener("input", () => {
    localStorage.setItem(key, el.value);
  });
}

bindMemoryField("memoryTitle");
bindMemoryField("memoryStory");
bindMemoryField("memoryHighlight");
bindMemoryField("memoryLesson");
bindMemoryField("memoryNext");

// =========================
// 🖼 IMAGE UPLOAD
// =========================

const imageInput = document.getElementById("imageInput");
const imageGallery = document.getElementById("imageGallery");

const imageKey = `${dateId}_images`;
const storedImages =
  JSON.parse(localStorage.getItem(imageKey)) || [];

function renderImages() {
  if (!imageGallery) return;

  imageGallery.innerHTML = "";

  storedImages.forEach(src => {
    const img = document.createElement("img");
    img.src = src;
    imageGallery.appendChild(img);
  });
}

renderImages();

if (imageInput) {
  imageInput.addEventListener("change", () => {

    const files = Array.from(imageInput.files);

    files.forEach(file => {
      const reader = new FileReader();

      reader.onload = () => {
        storedImages.push(reader.result);
        localStorage.setItem(
          imageKey,
          JSON.stringify(storedImages)
        );
        renderImages();
      };

      reader.readAsDataURL(file);
    });
  });
}

// =========================
// DONE BUTTON
// =========================

const doneBtn = document.getElementById("doneBtn");

if (doneBtn) {

  const doneKey = `${dateId}_done`;
  const isDone = localStorage.getItem(doneKey);

  if (isDone) {
    doneBtn.textContent = "💖 Erledigt";
  }

  doneBtn.addEventListener("click", () => {
    localStorage.setItem(doneKey, true);
    doneBtn.textContent = "💖 Erledigt";
  });
}

// =========================
// BACK BUTTON
// =========================

const backBtn = document.getElementById("backBtn");

if (backBtn) {

  if (month) {
    backBtn.href =
      `/Geburtstag/40-dates/month.html?month=${month}`;

    backBtn.textContent =
      `← Zurück zu ${month.charAt(0).toUpperCase() + month.slice(1)}`;
  } else {
    backBtn.href =
      "/Geburtstag/40-dates/index.html";

    backBtn.textContent =
      "← Zurück zur Übersicht";
  }
}
