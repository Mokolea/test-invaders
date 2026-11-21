// Game state, wave setup and per-frame game logic.

// --- State ---
let player, shots, aliens, dir, score, state, cooldown;
let burstCount, streak, sinceLastShot, reloadTimer;
let lives, wave, waveTotal, bannerTimer, bannerText, bannerKind;
const keys = {};

// Build the formation for the current wave: each wave adds a column
// (up to MAX_COLS) and every second wave adds a row (up to MAX_ROWS).
function startWave() {
  const cols = Math.min(BASE_COLS + (wave - 1), MAX_COLS);
  const rows = Math.min(BASE_ROWS + Math.floor((wave - 1) / 2), MAX_ROWS);
  aliens = [];
  shots = [];
  const blockW = cols * ALIEN_W + (cols - 1) * ALIEN_GAP_X;
  const startX = (W - blockW) / 2;
  const startY = 70;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      aliens.push({
        x: startX + c * (ALIEN_W + ALIEN_GAP_X),
        y: startY + r * (ALIEN_H + ALIEN_GAP_Y),
        color: ROW_COLORS[r % ROW_COLORS.length],
        points: (rows - r) * 10, // top row is worth the most
      });
    }
  }
  waveTotal = aliens.length;
  dir = 1;
  showBanner(`WAVE ${wave}`, "wave");
}

// kind: "wave" or "lifeLost" (render.js picks the colour from it)
function showBanner(text, kind) {
  bannerText = text;
  bannerKind = kind;
  bannerTimer = BANNER_TIME;
  state = "banner";
}

function reset() {
  player = { x: W / 2 - PLAYER_W / 2 };
  score = 0;
  lives = START_LIVES;
  wave = 1;
  cooldown = 0;
  burstCount = 0;
  streak = 0;
  sinceLastShot = 0;
  reloadTimer = 0;
  highlightIndex = -1;
  startWave();
}

// States: "start" (title + high scores) -> "banner" <-> "playing"
// -> "enterName" (score made the top ten) or "lost" -> back to "start".
function gameOver() {
  refreshHighScores(); // check against scores saved in other tabs too
  if (qualifiesForHighScore(score)) {
    state = "enterName";
    openNameEntry();
  } else {
    state = "lost";
  }
}

// --- Update ---
function update(dt) {
  if (state === "banner") {
    bannerTimer -= dt;
    if (bannerTimer <= 0) state = "playing";
    return;
  }
  if (state !== "playing") return;

  // Player movement
  if (keys["ArrowLeft"]) player.x -= PLAYER_SPEED * dt;
  if (keys["ArrowRight"]) player.x += PLAYER_SPEED * dt;
  player.x = Math.max(0, Math.min(W - PLAYER_W, player.x));

  // Firing
  cooldown -= dt;
  sinceLastShot += dt;
  if (reloadTimer > 0) {
    reloadTimer = Math.max(0, reloadTimer - dt);
  } else if (sinceLastShot > STREAK_RESET) {
    streak = 0;
  }
  const firing = keys[" "] || keys["Spacebar"];
  if (firing && cooldown <= 0 && reloadTimer <= 0 && burstCount < BURST_SIZE) {
    shots.push({ x: player.x + PLAYER_W / 2 - SHOT_W / 2, y: PLAYER_Y - SHOT_H });
    cooldown = SHOT_COOLDOWN;
    burstCount++;
    streak++;
    sinceLastShot = 0;
    if (streak >= MAGAZINE) {
      reloadTimer = RELOAD_TIME;
      streak = 0;
    }
  }

  // Shots
  for (const s of shots) s.y -= SHOT_SPEED * dt;
  shots = shots.filter((s) => s.y + SHOT_H > 0);

  // Aliens: speed up as the formation shrinks, and with every wave
  const t = 1 - (aliens.length - 1) / (waveTotal - 1);
  const waveFactor = 1 + WAVE_SPEEDUP * (wave - 1);
  const speed = (ALIEN_BASE_SPEED + (ALIEN_MAX_SPEED - ALIEN_BASE_SPEED) * t * t) * waveFactor;
  const dx = speed * dt * dir;

  let minX = Infinity, maxX = -Infinity;
  for (const a of aliens) {
    minX = Math.min(minX, a.x + dx);
    maxX = Math.max(maxX, a.x + dx + ALIEN_W);
  }

  if (minX < 10 || maxX > W - 10) {
    // Hit an edge: reverse and step down
    dir = -dir;
    for (const a of aliens) a.y += ALIEN_STEP_DOWN;
  } else {
    for (const a of aliens) a.x += dx;
  }

  // Collisions: shots vs aliens
  for (let i = shots.length - 1; i >= 0; i--) {
    const s = shots[i];
    for (let j = aliens.length - 1; j >= 0; j--) {
      const a = aliens[j];
      if (s.x < a.x + ALIEN_W && s.x + SHOT_W > a.x &&
          s.y < a.y + ALIEN_H && s.y + SHOT_H > a.y) {
        score += a.points;
        aliens.splice(j, 1);
        shots.splice(i, 1);
        break;
      }
    }
  }

  // End conditions
  if (aliens.length === 0) {
    wave++;
    startWave();
    return;
  }
  for (const a of aliens) {
    if (a.y + ALIEN_H >= PLAYER_Y) {
      lives--;
      if (lives <= 0) {
        gameOver();
      } else {
        // Restart the current wave from the top
        startWave();
        showBanner(`LIFE LOST - WAVE ${wave}`, "lifeLost");
      }
      return;
    }
  }
}
