// Keyboard input, name entry and the main loop. Loaded last.

// --- Name entry (HTML input over the canvas) ---
const nameInput = document.getElementById("name-input");
nameInput.maxLength = NAME_MAX_LENGTH;

function openNameEntry() {
  for (const k in keys) keys[k] = false; // don't keep the ship moving
  nameInput.value = "";
  nameInput.hidden = false;
  nameInput.focus();
}

function submitName() {
  highlightIndex = addHighScore(nameInput.value, score);
  nameInput.hidden = true;
  nameInput.blur();
  state = "start";
}

nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    submitName();
  }
});

// --- Game input ---
window.addEventListener("keydown", (e) => {
  if (e.target === nameInput) return; // typing a name, not playing
  if (state === "enterName") {
    nameInput.focus(); // focus was lost (e.g. a click elsewhere); take it back
    return;
  }
  if (["ArrowLeft", "ArrowRight", " ", "Spacebar"].includes(e.key)) e.preventDefault();
  keys[e.key] = true;
  if (e.key === "Enter" && !e.repeat) {
    if (state === "start") reset();
    else if (state === "lost") state = "start";
  }
});
window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
  // Releasing the space bar ends the current burst
  if (e.key === " " || e.key === "Spacebar") burstCount = 0;
});

// --- Main loop ---
let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05); // clamp to avoid jumps after tab switch
  last = now;
  update(dt);
  draw(now);
  requestAnimationFrame(loop);
}

state = "start";
requestAnimationFrame(loop);
