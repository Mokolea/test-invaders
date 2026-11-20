// High-score list: top ten scores kept in localStorage so they survive
// closing the browser. Storage failures (private mode, blocked storage,
// corrupted data) fall back to an in-memory list instead of breaking the game.

const HIGH_SCORE_KEY = "invaders.highScores";
const HIGH_SCORE_COUNT = 10;
const NAME_MAX_LENGTH = 10;
const DEFAULT_NAME = "PLAYER";

let highScores = loadHighScores();
let highlightIndex = -1; // row of the most recently added entry, or -1

function loadHighScores() {
  try {
    const data = JSON.parse(localStorage.getItem(HIGH_SCORE_KEY));
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
  } catch {
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

// Inserts the entry below any existing equal scores and returns its rank index.
function addHighScore(name, value) {
  const cleanName = name.trim().slice(0, NAME_MAX_LENGTH) || DEFAULT_NAME;
  let index = highScores.findIndex((e) => e.score < value);
  if (index === -1) index = highScores.length;
  highScores.splice(index, 0, { name: cleanName, score: value });
  highScores = highScores.slice(0, HIGH_SCORE_COUNT);
  saveHighScores();
  return index < HIGH_SCORE_COUNT ? index : -1;
}
