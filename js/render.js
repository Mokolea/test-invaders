// Drawing: aliens, player, shots, HUD and overlays.

// --- Drawing ---
function drawPlayer() {
  const x = player.x, y = PLAYER_Y;
  ctx.fillStyle = "#7df9ff";
  ctx.fillRect(x, y + 8, PLAYER_W, PLAYER_H - 8);
  ctx.fillRect(x + 6, y + 4, PLAYER_W - 12, 4);
  ctx.fillRect(x + PLAYER_W / 2 - 4, y - 4, 8, 8);
}

function drawAlien(a, frame) {
  const x = a.x, y = a.y;
  ctx.fillStyle = a.color;
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
  ctx.fillStyle = "#000";
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

function draw(time) {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, W, H);

  // ground line
  ctx.fillStyle = "#2a2f45";
  ctx.fillRect(0, H - 14, W, 2);

  const frame = Math.floor(time / 400) % 2 === 0;
  for (const a of aliens) drawAlien(a, frame);

  ctx.fillStyle = "#fff";
  for (const s of shots) ctx.fillRect(s.x, s.y, SHOT_W, SHOT_H);

  drawPlayer();

  // Score (top left)
  ctx.fillStyle = "#fff";
  ctx.font = 'bold 20px "Courier New", monospace';
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillText(`SCORE: ${score}`, 16, 16);

  // Lives as small ships under the score
  ctx.fillStyle = "#7df9ff";
  for (let i = 0; i < lives; i++) {
    const lx = 16 + i * 30, ly = 46;
    ctx.fillRect(lx, ly + 4, 22, 6);
    ctx.fillRect(lx + 3, ly + 2, 16, 2);
    ctx.fillRect(lx + 9, ly - 1, 4, 3);
  }

  // Wave number (top center)
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "center";
  ctx.fillText(`WAVE ${wave}`, W / 2, 16);
  ctx.textAlign = "left";

  // Ammo / reload indicator (top right)
  const pipW = 6, pipH = 14, pipGap = 4;
  const pipsX = W - 16 - MAGAZINE * (pipW + pipGap) + pipGap;
  if (reloadTimer > 0) {
    ctx.fillStyle = "#ff5a7a";
    ctx.textAlign = "right";
    ctx.fillText("RELOADING", pipsX - 12, 16);
    const progress = 1 - reloadTimer / RELOAD_TIME;
    ctx.fillStyle = "#2a2f45";
    ctx.fillRect(pipsX, 19, W - 16 - pipsX, pipH);
    ctx.fillStyle = "#ffb84d";
    ctx.fillRect(pipsX, 19, (W - 16 - pipsX) * progress, pipH);
  } else {
    for (let i = 0; i < MAGAZINE; i++) {
      ctx.fillStyle = i < MAGAZINE - streak ? "#7df9ff" : "#2a2f45";
      ctx.fillRect(pipsX + i * (pipW + pipGap), 19, pipW, pipH);
    }
  }

  if (state === "banner") {
    const color = bannerText.startsWith("LIFE LOST") ? "#ff5a7a" : "#6cf08a";
    drawCenteredText(bannerText, H / 2, 40, color);
  } else if (state === "lost") {
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    ctx.fillRect(0, 0, W, H);
    drawCenteredText("GAME OVER", H / 2 - 30, 48, "#ff5a7a");
    drawCenteredText(`Final score: ${score}  -  Wave ${wave}`, H / 2 + 20, 22, "#fff");
    drawCenteredText("Press Enter to play again", H / 2 + 56, 18, "#aaa");
  }
}
