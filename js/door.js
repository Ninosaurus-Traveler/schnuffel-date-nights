// =========================
// TÜRCHEN-ANSICHT (Sheet mit Galerie & Brief)
// =========================

const sheetEl = document.getElementById("sheet");
const sheetPanel = document.getElementById("sheetPanel");
const sheetHead = document.getElementById("sheetHead");
const sheetBody = document.getElementById("sheetBody");
const galleryEl = document.getElementById("gallery");
const dotsEl = document.getElementById("galleryDots");
const letterEl = document.getElementById("letter");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let sheetCloseTimer = null;

// Signed URLs für alle Medien eines Türchens holen
function mediaPaths(door) {
  const paths = [];
  (door.media || []).forEach(m => {
    if (m.path) paths.push(m.path);
    if (m.poster) paths.push(m.poster);
  });
  return paths;
}

async function prepareDoor(api, door) {
  return api.sign(mediaPaths(door));
}

// =========================
// ÖFFNEN / SCHLIESSEN
// =========================

function showDoor(door, urls) {
  clearTimeout(sheetCloseTimer);

  document.getElementById("sheetEyebrow").textContent = `Türchen ${door.day}`;
  document.getElementById("sheetTitle").textContent = door.title || "";
  document.getElementById("letterFrom").textContent = door.sender ? `Von ${door.sender} 💛` : "";
  document.getElementById("letterText").textContent = door.message || "";
  letterEl.classList.toggle("is-empty", !door.sender && !door.message);

  renderGallery(door.media || [], urls);

  const revealEls = [
    document.getElementById("sheetEyebrow"),
    document.getElementById("sheetTitle"),
    galleryEl,
    letterEl
  ];
  revealEls.forEach((el, i) => {
    el.classList.add("reveal");
    el.style.setProperty("--delay", `${0.12 + i * 0.08}s`);
  });

  sheetBody.scrollTop = 0;
  sheetPanel.style.transform = "";
  sheetEl.hidden = false;
  document.body.classList.add("sheet-open");

  // Reflow erzwingen, damit die Einblend-Transition startet
  void sheetEl.offsetHeight;
  sheetEl.classList.add("is-visible");
  sheetEl.querySelector(".sheet-close").focus({ preventScroll: true });
}

function closeDoor() {
  if (sheetEl.hidden) return;

  sheetEl.classList.remove("is-visible");
  sheetPanel.style.transform = "";
  document.body.classList.remove("sheet-open");
  galleryEl.querySelectorAll("video").forEach(v => v.pause());

  sheetCloseTimer = setTimeout(() => {
    sheetEl.hidden = true;
    // Medien entfernen, damit keine Videos im Hintergrund weiterladen
    galleryEl.innerHTML = "";
    dotsEl.innerHTML = "";
  }, 450);
}

sheetEl.addEventListener("click", event => {
  if (event.target.closest("[data-close]")) closeDoor();
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeDoor();
});

// =========================
// GALERIE
// =========================

function renderGallery(media, urls) {
  galleryEl.innerHTML = "";
  dotsEl.innerHTML = "";

  media.forEach((item, i) => {
    const src = urls[item.path];
    if (!src) return;

    const slide = document.createElement("div");
    slide.className = "slide";

    if (item.type === "video") {
      const video = document.createElement("video");
      video.src = src;
      video.controls = true;
      video.playsInline = true;
      video.setAttribute("playsinline", "");
      video.preload = "metadata";
      if (item.poster && urls[item.poster]) video.poster = urls[item.poster];
      slide.appendChild(video);
    } else {
      const img = document.createElement("img");
      img.src = src;
      img.alt = `Bild ${i + 1}`;
      img.decoding = "async";
      img.loading = i === 0 ? "eager" : "lazy";
      slide.appendChild(img);
    }

    galleryEl.appendChild(slide);
  });

  const count = galleryEl.children.length;
  if (count > 1) {
    for (let i = 0; i < count; i++) {
      const dot = document.createElement("span");
      if (i === 0) dot.className = "is-active";
      dotsEl.appendChild(dot);
    }
  }
  galleryEl.scrollLeft = 0;
}

let galleryFrame = null;

galleryEl.addEventListener("scroll", () => {
  if (galleryFrame) return;
  galleryFrame = requestAnimationFrame(() => {
    galleryFrame = null;
    const slides = galleryEl.children;
    if (!slides.length) return;

    const width = slides[0].offsetWidth + 12;
    const active = Math.round(galleryEl.scrollLeft / width);

    [...dotsEl.children].forEach((dot, i) => dot.classList.toggle("is-active", i === active));

    // Videos außerhalb des sichtbaren Slides pausieren
    [...slides].forEach((slide, i) => {
      const video = slide.querySelector("video");
      if (video && i !== active && !video.paused) video.pause();
    });
  });
}, { passive: true });

// =========================
// NACH UNTEN WISCHEN ZUM SCHLIESSEN
// =========================

let dragStartY = null;
let dragStartTime = 0;
let dragDelta = 0;

sheetHead.addEventListener("pointerdown", event => {
  if (event.target.closest("button")) return;
  dragStartY = event.clientY;
  dragStartTime = performance.now();
  dragDelta = 0;
  sheetEl.classList.add("is-dragging");
  sheetHead.setPointerCapture(event.pointerId);
});

sheetHead.addEventListener("pointermove", event => {
  if (dragStartY === null) return;
  dragDelta = Math.max(0, event.clientY - dragStartY);
  sheetPanel.style.transform = `translateY(${dragDelta}px)`;
});

function endDrag() {
  if (dragStartY === null) return;
  const velocity = dragDelta / Math.max(1, performance.now() - dragStartTime);
  dragStartY = null;
  sheetEl.classList.remove("is-dragging");

  if (dragDelta > 120 || velocity > 0.6) {
    closeDoor();
  } else {
    sheetPanel.style.transform = "";
  }
}

sheetHead.addEventListener("pointerup", endDrag);
sheetHead.addEventListener("pointercancel", endDrag);

// =========================
// KONFETTI
// =========================

const CONFETTI_CHARS = ["★", "●", "♥", "✦"];
const CONFETTI_COLORS = ["#C8363D", "#EC7A2E", "#F4B942", "#E9A23B", "#962430"];

function confettiBurst(el) {
  if (reducedMotion.matches) return;

  const rect = el.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  for (let i = 0; i < 18; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti";
    piece.textContent = CONFETTI_CHARS[i % CONFETTI_CHARS.length];
    piece.style.color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.left = `${x}px`;
    piece.style.top = `${y}px`;
    piece.style.fontSize = `${10 + Math.random() * 10}px`;
    document.body.appendChild(piece);

    const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.4;
    const distance = 60 + Math.random() * 70;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    piece.animate([
      { transform: "translate(-50%, -50%) scale(.4)", opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${Math.random() * 180}deg)`, opacity: 1, offset: 0.6 },
      { transform: `translate(calc(-50% + ${dx * 1.1}px), calc(-50% + ${dy * 1.1 + 40}px)) scale(.8) rotate(${Math.random() * 360}deg)`, opacity: 0 }
    ], {
      duration: 1000 + Math.random() * 400,
      easing: "cubic-bezier(.2, .8, .3, 1)"
    }).onfinish = () => piece.remove();
  }
}
