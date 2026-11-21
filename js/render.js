// Drawing: aliens, player, shots, HUD and overlays.

// --- Drawing ---
function drawPlayer() {
  const x = player.x, y = PLAYER_Y;
  ctx.fillStyle = palette.accent;
  ctx.fillRect(x, y + 8, PLAYER_W, PLAYER_H - 8);
  ctx.fillRect(x + 6, y + 4, PLAYER_W - 12, 4);
  ctx.fillRect(x + PLAYER_W / 2 - 4, y - 4, 8, 8);
}

function drawAlien(a, frame) {
  const x = a.x, y = a.y;
  ctx.fillStyle = palette.rows[a.row];
  // body
  ctx.fillRect(x + 6, y + 4, ALIEN_W - 12, ALIEN_H - 10);
  ctx.fillRect(x, y + 8, ALIEN_W, 8);
  // antennae
  ctx.fillRect(x + 8, y, 4, 4);
  ctx.fillRect(x + ALIEN_W - 12, y, 4, 4);
  // legs (two-frame wiggle)
  if (frame) {
    ctx.fillRect(x + 2, y + ALIEN_H - 6, 6, 6);
    ctx.fillRect(x + ALIEN_W - 8, y + ALIEN_H - 6, 6, 6);
  } else {
    ctx.fillRect(x + 10, y + ALIEN_H - 6, 6, 6);
    ctx.fillRect(x + ALIEN_W - 16, y + ALIEN_H - 6, 6, 6);
  }
  // eyes
  ctx.fillStyle = palette.eyes;
  ctx.fillRect(x + 11, y + 9, 4, 4);
  ctx.fillRect(x + ALIEN_W - 15, y + 9, 4, 4);
}

function drawCenteredText(text, y, size, color) {
  ctx.fillStyle = color;
  ctx.font = `bold ${size}px "Courier New", monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, W / 2, y);
}

function drawStartScreen(time) {
  drawCenteredText("INVADERS", 80, 64, palette.accent);
  drawCenteredText("HIGH SCORES", 160, 26, palette.text);

  ctx.font = 'bold 22px "Courier New", monospace';
  ctx.textBaseline = "middle";
  for (let i = 0; i < HIGH_SCORE_COUNT; i++) {
    const y = 205 + i * 28;
    const entry = highScores[i];
    ctx.fillStyle = i === highlightIndex ? palette.highlight : entry ? palette.secondary : palette.empty;
    ctx.textAlign = "right";
    ctx.fillText(`${i + 1}.`, 260, y);
    ctx.textAlign = "left";
    ctx.fillText(entry ? entry.name : "----------", 280, y);
    ctx.textAlign = "right";
    ctx.fillText(entry ? String(entry.score) : "-", 540, y);
  }

  if (Math.floor(time / 500) % 2 === 0) {
    drawCenteredText("Press Enter to start", 510, 24, palette.success);
  }
  drawCenteredText("← → move   Space fire", 555, 16, palette.faint);
}

function drawNameEntry() {
  ctx.fillStyle = palette.overlayStrong;
  ctx.fillRect(0, 0, W, H);
  const rank = highScoreRank(score);
  drawCenteredText("GAME OVER", 170, 48, palette.danger);
  drawCenteredText("NEW HIGH SCORE!", 225, 28, palette.highlight);
  drawCenteredText(`Score: ${score}  -  Rank ${rank + 1}`, 262, 22, palette.text);
  drawCenteredText("Enter your name:", 298, 18, palette.muted);
  // The HTML input (#name-input) sits at y = 318..362 here.
  drawCenteredText("Press Enter to save", 395, 18, palette.muted);
}

function draw(time) {
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, W, H);

  if (state === "start") {
    drawStartScreen(time);
    return;
  }

  // ground line
  ctx.fillStyle = palette.line;
  ctx.fillRect(0, H - 14, W, 2);

  const frame = Math.floor(time / 400) % 2 === 0;
  for (const a of aliens) drawAlien(a, frame);

  ctx.fillStyle = palette.text;
  for (const s of shots) ctx.fillRect(s.x, s.y, SHOT_W, SHOT_H);

  drawPlayer();

  // Score (top left)
  ctx.fillStyle = palette.text;
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`SCORE: ${score}`, 16, 16);

  // Lives as small ships under the score
  ctx.fillStyle = palette.accent;
  for (let i = 0; i < lives; i++) {
    const lx = 16 + i * 30, ly = 46;
    ctx.fillRect(lx, ly + 4, 22, 6);
    ctx.fillRect(lx + 3, ly + 2, 16, 2);
    ctx.fillRect(lx + 9, ly - 1, 4, 3);
  }

  // Wave number (top center)
  ctx.fillStyle = palette.muted;
  ctx.textAlign = "center";
  ctx.fillText(`WAVE ${wave}`, W / 2, 16);
  ctx.textAlign = "left";

  // Ammo / reload indicator (top right)
  const pipW = 6, pipH = 14, pipGap = 4;
  const pipsX = W - 16 - MAGAZINE * (pipW + pipGap) + pipGap;
  if (reloadTimer > 0) {
    ctx.fillStyle = palette.danger;
    ctx.textAlign = "right";
    ctx.fillText("RELOADING", pipsX - 12, 16);
    const progress = 1 - reloadTimer / RELOAD_TIME;
    ctx.fillStyle = palette.line;
    ctx.fillRect(pipsX, 19, W - 16 - pipsX, pipH);
    ctx.fillStyle = palette.warn;
    ctx.fillRect(pipsX, 19, (W - 16 - pipsX) * progress, pipH);
  } else {
    for (let i = 0; i < MAGAZINE; i++) {
      ctx.fillStyle = i < MAGAZINE - streak ? palette.accent : palette.line;
      ctx.fillRect(pipsX + i * (pipW + pipGap), 19, pipW, pipH);
    }
  }

  if (state === "banner") {
    const color = bannerKind === "lifeLost" ? palette.danger : palette.success;
    drawCenteredText(bannerText, H / 2, 40, color);
  } else if (state === "lost") {
    ctx.fillStyle = palette.overlay;
    ctx.fillRect(0, 0, W, H);
    drawCenteredText("GAME OVER", H / 2 - 30, 48, palette.danger);
    drawCenteredText(`Final score: ${score}  -  Wave ${wave}`, H / 2 + 20, 22, palette.text);
    drawCenteredText("Press Enter to continue", H / 2 + 56, 18, palette.muted);
  } else if (state === "enterName") {
    drawNameEntry();
  }
}
