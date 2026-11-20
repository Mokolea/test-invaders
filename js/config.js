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
const ROW_COLORS = ["#ff5a7a", "#ffb84d", "#ffe45c", "#6cf08a", "#5ac8ff"];

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
