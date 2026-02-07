/*
const button = document.getElementById("surpriseBtn");
const surprise = document.getElementById("surprise");



button.addEventListener("click", () => {
  surprise.style.display = "block";
  button.style.display = "none";
});

const data = JSON.parse(localStorage.getItem("dates")) || {};

document.querySelectorAll(".month-card").forEach(card => {
  const month = card.dataset.month;

  if (data[month] && Object.values(data[month]).some(v => v)) {
    card.classList.add("completed");
  }
});

//localStorage.removeItem("dates");

const memoryKey = `${month}_${dateId}_memory`;
const memoryField = document.getElementById("memoryText");

// Laden
memoryField.value = localStorage.getItem(memoryKey) || "";

// Speichern
memoryField.addEventListener("input", () => {
  localStorage.setItem(memoryKey, memoryField.value);
});

const imageInput = document.getElementById("imageInput");
const imageGallery = document.getElementById("imageGallery");
const imageKey = `${month}_${dateId}_images`;

// Laden
const storedImages = JSON.parse(localStorage.getItem(imageKey)) || [];
storedImages.forEach(src => addImage(src));

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    storedImages.push(reader.result);
    localStorage.setItem(imageKey, JSON.stringify(storedImages));
    addImage(reader.result);
  };
  reader.readAsDataURL(file);
});

function addImage(src) {
  const img = document.createElement("img");
  img.src = src;
  imageGallery.appendChild(img);
}
*/