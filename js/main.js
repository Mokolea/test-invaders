// Keyboard input and the main loop. Loaded last.

// --- Input ---
window.addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", " ", "Spacebar"].includes(e.key)) e.preventDefault();
  keys[e.key] = true;
  if (state === "lost" && e.key === "Enter") reset();
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

reset();
requestAnimationFrame(loop);
