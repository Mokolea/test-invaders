# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Invaders": a browser game on an 800x600 canvas. The player's ship moves with ←/→, fires with Space; waves of aliens move sideways as a block and step down at the edges. A start screen shows the top-ten high scores; Enter starts a game. A header bar above the canvas has a light/dark theme switch.

## Constraints

- Plain HTML, CSS and JavaScript only: no frameworks, libraries, dependencies or build step.
- Do not start a web server. The game must run when `index.html` is opened directly from `file://`.
- Because of `file://`, the scripts are **classic `<script>` tags, not ES modules** (browsers block module scripts from `file://`). Don't convert them to `import`/`export`.

## Commands

There is no build, lint or test tooling, and Node is not installed. The project is worked on from both macOS and Linux; use the commands for the current platform.

- Run: `open index.html` (macOS) or `xdg-open index.html` (Linux).
- Load check on Linux: headless Chromium loads the page and runs the scripts, and every uncaught error is printed as a `CONSOLE` log line. No output means the page loaded cleanly. It catches syntax errors and load-time errors such as a missing global, but not bugs that only show up during play:
  ```
  chromium --headless --disable-gpu --enable-logging=stderr --v=0 --dump-dom "file://$PWD/index.html" 2>&1 >/dev/null | grep CONSOLE
  ```
  Chromium is a snap and can't read hidden directories such as `~/.claude/...`, so check a copy only from a non-hidden path, for example a temporary folder inside the repo that you delete afterwards.
- Syntax check on macOS (uses JavaScriptCore and only parses, it doesn't run):
  ```
  osascript -l JavaScript -e 'ObjC.import("Foundation"); var all = ["config","high-scores","game","render","main"].map(function(n){ return $.NSString.stringWithContentsOfFileEncodingError("js/"+n+".js", $.NSUTF8StringEncoding, null).js; }).join("\n"); new Function(all); "SYNTAX OK"'
  ```

## Architecture

The five scripts in `js/` share one global scope: top-level `const`/`let`/`function` declarations in one file are visible in the others. **Load order in `index.html` matters**: `config.js` → `high-scores.js` → `game.js` → `render.js` → `main.js`.

- `config.js`: gets the canvas/`ctx`, defines `W`/`H`, and holds every tuning constant (alien grid size and caps, speeds, per-wave speedup, lives, shooting limits). Change gameplay numbers here. It also holds `PALETTES` (`dark`/`light`, every canvas colour) and the current `palette`.
- `high-scores.js`: the top-ten list (`highScores`), saved to `localStorage` under `invaders.highScores`. Every storage access is wrapped in try/catch, so blocked or corrupted storage falls back to an in-memory list. Has no DOM or game-state code.
- `game.js`: all mutable game state (`let` globals), `startWave()`, `reset()`, `gameOver()`, and `update(dt)` (movement, firing rules, collisions, wave/life transitions).
- `render.js`: `draw(time)` and its helpers, including the start screen and the name-entry overlay. Reads state only and never changes it.
- `main.js`: the theme switch (`applyTheme`), the name-entry `<input>` (`openNameEntry`/`submitName`), keyboard listeners (which fill the `keys` map declared in `game.js`) and the `requestAnimationFrame` loop. It sets `state = "start"` on load.

State machine (`state` in `game.js`): `"start"` (title and high scores; Enter calls `reset()`) → `"banner"` (a timed "WAVE n" or "LIFE LOST" message; nothing moves) → `"playing"` → either a new wave via `startWave()` (back to `"banner"`) or `gameOver()`. `gameOver()` goes to `"enterName"` if the score makes the top ten, otherwise to `"lost"`; both lead back to `"start"`. Clearing a wave increments `wave`. An alien reaching the player's row (`PLAYER_Y`) costs a life and restarts the same wave.

Name entry is a real HTML `<input id="name-input">` positioned over the canvas (`#stage` in `style.css`). Its `top` in CSS must line up with the gap that `drawNameEntry()` leaves on the canvas. The window `keydown` handler ignores events coming from the input, so the game's `preventDefault` on Space and the arrow keys doesn't block typing.

Mechanics that span files:
- Alien speed depends on two things: the share of the wave already destroyed (`waveTotal` is set in `startWave`) and the wave number (`WAVE_SPEEDUP`).
- Firing rules: at most `BURST_SIZE` shots per press of the space bar, because the `keyup` handler in `main.js` resets `burstCount`. After `MAGAZINE` shots in a row (a pause longer than `STREAK_RESET` resets the count), the player can't fire for `RELOAD_TIME`. The ammo display in the top-right corner shows `streak`/`reloadTimer`.
- Each alien carries a `row` colour index and its `points`, set from its row in `startWave`; `drawAlien` looks the colour up in `palette.rows`, so switching theme mid-wave recolours it.
- Theme: an inline script in `index.html`'s `<head>` picks the starting theme (saved `invaders.theme` in `localStorage`, else `prefers-color-scheme`, else dark) and sets `data-theme` on `<html>` before first paint. CSS colours are tokens per `data-theme` in `style.css`; canvas colours come from `PALETTES` in `config.js`. Keep the two in step. `applyTheme()` in `main.js` sets `data-theme`, `palette` and the switch's `aria-checked`, and saves the choice. The window `keydown` handler ignores events from the switch, and a mouse click blurs it so Space goes back to firing. Light colours keep at least 4.5:1 contrast on the light canvas.
- High-score rules: a score above 0 qualifies if the list has fewer than ten entries or the score beats the 10th. A tie is placed below the older entry, so a tie with the 10th doesn't qualify. Names are trimmed and cut to 10 characters; an empty name becomes `PLAYER`. `gameOver()` and `addHighScore()` call `refreshHighScores()` to re-read storage, so scores saved in another open tab are counted and not overwritten (skipped once a save has failed, to keep the in-memory list).

## Git workflow

Commit directly on `main`; no feature branches. Don't push unless asked. The remote is `origin` (GitHub, private), and HTTPS credentials come from the macOS keychain on macOS and from git's `cache` helper on Linux.
