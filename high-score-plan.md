# High-score list: plan

## Goal

A top-ten high-score list. After game over, a qualifying score asks for a name (max 10 characters). The list is shown on the start screen and must survive closing the browser.

Constraints: plain HTML/CSS/JS, no dependencies, no web server, runs from `file://`.

## Storage options

| Option | Survives closing the browser | Trade-offs |
|---|---|---|
| **1. localStorage** ✅ chosen | Yes | Simplest (about 20 lines). Scores belong to one browser on one computer. Lost in private windows or when site data is cleared. Players can edit them with developer tools. |
| 2. IndexedDB | Yes | Same limits as localStorage, but about three times the code and asynchronous. Only worth it for large amounts of data. |
| 3. Cookies | Unreliable | Chrome doesn't keep cookies for `file://` pages by default. |
| 4. Export/import a JSON file | Yes, and survives clearing browser data | Can move between browsers and computers, but saving needs a download or file picker. Saving silently only works in Chrome/Edge. |
| 5. Shared online leaderboard | Yes, for everyone | Needs a server or hosted service, which the constraints exclude. |

**Decision:** localStorage, read defensively. If storage is blocked or the saved data is corrupted, the game starts with an empty in-memory list instead of crashing.

## Name entry options

| Option | Trade-offs |
|---|---|
| **A. HTML text box over the canvas** ✅ chosen | Native editing, cursor, accented characters and paste. `maxlength` enforces 10 characters. Needs styling, and the game's key handler (which blocks Space and the arrow keys) must ignore keys typed into the box. |
| B. Typing drawn on the canvas | Matches the arcade look. We'd handle letters, Backspace and Enter ourselves: no paste, no cursor, and non-ASCII input is tricky. |

## Rules

- Only a score above 0 that makes the top ten asks for a name.
- An empty name is saved as `PLAYER`. Names are trimmed and cut to 10 characters.
- A tie is placed below the older entry, so a tie with the 10th doesn't qualify.
- After saving, the game returns to the start screen and highlights the new entry.
- A non-qualifying game over shows "GAME OVER". Enter goes to the start screen.

## Several open tabs

Each tab keeps its own copy of the list in memory, but they all save to the same localStorage entry. Without care, a tab would overwrite scores that another tab saved after it loaded.

- The stored list is re-read (`refreshHighScores()`) at game over, before checking whether the score qualifies, so the name prompt and the rank shown take other tabs' scores into account.
- It is re-read again just before the new entry is inserted, in case another tab saved while the name was being typed.
- If a save has failed (storage blocked), re-reading is skipped so the in-memory list for this session is kept.

## Name entry details

- An auto-repeated Space (fire key still held at game over) is ignored, so it doesn't fill the box with spaces.
- Enter that confirms a character in an input method (Chinese, Japanese, Korean) doesn't save the name yet.
- If the box loses focus (e.g. a click elsewhere), any key puts focus back, and Enter still saves the name.

## Implementation

- New start screen (`state = "start"`): title, top ten, "Press Enter to start".
- New `js/high-scores.js`, loaded before `game.js`: load, rank (`highScoreRank()`), refresh and save the list (localStorage key `invaders.highScores`).
- `game.js`: `gameOver()` refreshes the list, then chooses between `"enterName"` and `"lost"`.
- `render.js`: start screen and name-entry overlay.
- `main.js`: name input handling. The game starts in `"start"`.
- `index.html` / `style.css`: `#stage` wrapper and `#name-input` positioned over the canvas.
- `CLAUDE.md` and `README.md` describe the file, states and rules.

## Status

Implemented in `065c44b`. Handling for several open tabs and the name-entry fixes were added in `8763081` and `fbcd63f`.
