// Canvas setup and tunable game settings.

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const W = canvas.width;
const H = canvas.height;

// --- Configuration ---
const BASE_ROWS = 5;           // formation size in wave 1
const BASE_COLS = 8;
const MAX_ROWS = 7;            // formation size cap for later waves
const MAX_COLS = 11;
const WAVE_SPEEDUP = 0.25;     // +25% alien speed per wave
const START_LIVES = 3;
const BANNER_TIME = 1.6;       // seconds the "WAVE n" / "LIFE LOST" banner shows
const ALIEN_W = 36;
const ALIEN_H = 24;
const ALIEN_GAP_X = 24;
const ALIEN_GAP_Y = 18;
const ALIEN_STEP_DOWN = 20;
const ALIEN_BASE_SPEED = 40;   // px per second at full formation
const ALIEN_MAX_SPEED = 260;   // px per second when one alien is left

// --- Colour themes ---
// Every canvas colour, per theme. The page colours are the CSS tokens in
// style.css; keep bg/border in step with them. The light theme darkens the
// neon hues so text and sprites keep at least 4.5:1 contrast on its background.
const PALETTES = {
  dark: {
    bg: "#000",
    line: "#2a2f45",        // ground line, empty ammo pips, reload bar track
    text: "#fff",           // score, shots, overlay text
    accent: "#7df9ff",      // player, lives, title, ammo pips
    danger: "#ff5a7a",      // GAME OVER, LIFE LOST, RELOADING
    warn: "#ffb84d",        // reload progress
    highlight: "#ffe45c",   // new high score
    success: "#6cf08a",     // "Press Enter", WAVE banner
    secondary: "#ccc",      // high-score entries
    muted: "#aaa",          // wave number, hints
    faint: "#888",          // controls help
    empty: "#555",          // empty high-score slots
    eyes: "#000",
    overlayStrong: "rgba(0, 0, 0, 0.75)",
    overlay: "rgba(0, 0, 0, 0.6)",
    rows: ["#ff5a7a", "#ffb84d", "#ffe45c", "#6cf08a", "#5ac8ff"],
  },
  light: {
    bg: "#f7f8fc",
    line: "#c5cadb",
    text: "#1b1f2e",
    accent: "#00778f",
    danger: "#c8143c",
    warn: "#a85600",
    highlight: "#8a6d00",
    success: "#1a7f37",
    secondary: "#3d4357",
    muted: "#555b70",
    faint: "#686e84",
    empty: "#a3a8b8",
    eyes: "#f7f8fc",
    overlayStrong: "rgba(247, 248, 252, 0.85)",
    overlay: "rgba(247, 248, 252, 0.7)",
    rows: ["#c8143c", "#a85600", "#8a6d00", "#1a7f37", "#0b6db5"],
  },
};
let palette = PALETTES.dark;   // set by applyTheme() in main.js

const PLAYER_W = 48;
const PLAYER_H = 18;
const PLAYER_Y = H - 40;
const PLAYER_SPEED = 320;

const SHOT_W = 4;
const SHOT_H = 14;
const SHOT_SPEED = 520;
const SHOT_COOLDOWN = 0.35;    // seconds between shots
const BURST_SIZE = 3;          // max shots per press of the space bar
const MAGAZINE = 12;           // successive shots before a forced reload
const RELOAD_TIME = 2.0;       // seconds of forced reload
const STREAK_RESET = 1.2;      // seconds without firing that reset the successive-shot count
