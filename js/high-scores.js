// High-score list: top ten scores kept in localStorage so they survive
// closing the browser. Storage failures (private mode, blocked storage,
// corrupted data) fall back to an in-memory list instead of breaking the game.

const HIGH_SCORE_KEY = "invaders.highScores";
const HIGH_SCORE_COUNT = 10;
const NAME_MAX_LENGTH = 10;
const DEFAULT_NAME = "PLAYER";

let storageWorks = true; // false once a save has failed
let highScores = loadHighScores() || [];
let highlightIndex = -1; // row of the most recently added entry, or -1

// Returns the stored list, [] if nothing valid is stored, or null if storage
// can't be read at all.
function loadHighScores() {
  let raw;
  try {
    raw = localStorage.getItem(HIGH_SCORE_KEY);
  } catch {
    return null;
  }
  try {
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data
      .filter((e) => e && typeof e.name === "string" && Number.isFinite(e.score))
      .map((e) => ({ name: e.name.slice(0, NAME_MAX_LENGTH), score: Math.floor(e.score) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, HIGH_SCORE_COUNT);
  } catch {
    return [];
  }
}

function saveHighScores() {
  try {
    localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(highScores));
    storageWorks = true;
  } catch {
    storageWorks = false;
    // Storage unavailable: the list still works for this session.
  }
}

// A score qualifies if it is above zero and beats the lowest entry
// (or the list is not full yet). Ties do not displace older entries.
function qualifiesForHighScore(value) {
  if (value <= 0) return false;
  if (highScores.length < HIGH_SCORE_COUNT) return true;
  return value > highScores[highScores.length - 1].score;
}

// Rank index the score would get: below any existing equal scores.
function highScoreRank(value) {
  const index = highScores.findIndex((e) => e.score < value);
  return index === -1 ? highScores.length : index;
}

// Re-reads the stored list so scores saved meanwhile in another tab are
// included. Skipped when saving fails, so the in-memory list is kept.
function refreshHighScores() {
  if (storageWorks) highScores = loadHighScores() || highScores;
}

// Inserts the entry and returns its rank index (-1 if it fell off the list).
function addHighScore(name, value) {
  const cleanName = name.trim().slice(0, NAME_MAX_LENGTH) || DEFAULT_NAME;
  refreshHighScores(); // another tab may have saved while the name was typed
  const index = highScoreRank(value);
  highScores.splice(index, 0, { name: cleanName, score: value });
  highScores = highScores.slice(0, HIGH_SCORE_COUNT);
  saveHighScores();
  return index < HIGH_SCORE_COUNT ? index : -1;
}
