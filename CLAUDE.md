# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

"Invaders": a browser game on an 800x600 canvas. The player's ship moves with ←/→, fires with Space; waves of aliens move sideways as a block and step down at the edges. Enter restarts after game over.

## Constraints

- Plain HTML, CSS and JavaScript only: no frameworks, libraries, dependencies or build step.
- Do not start a web server. The game must run when `index.html` is opened directly from `file://`.
- Because of `file://`, the scripts are **classic `<script>` tags, not ES modules** (browsers block module scripts from `file://`). Don't convert them to `import`/`export`.

## Commands

There is no build, lint or test tooling.

- Run: `open index.html` (macOS default browser).
- Syntax check (Node is not installed; this uses macOS's JavaScriptCore and only parses, it doesn't run):
  ```
  osascript -l JavaScript -e 'ObjC.import("Foundation"); var all = ["config","game","render","main"].map(function(n){ return $.NSString.stringWithContentsOfFileEncodingError("js/"+n+".js", $.NSUTF8StringEncoding, null).js; }).join("\n"); new Function(all); "SYNTAX OK"'
  ```

## Architecture

The four scripts in `js/` share one global scope: top-level `const`/`let`/`function` declarations in one file are visible in the others. **Load order in `index.html` matters**: `config.js` → `game.js` → `render.js` → `main.js`.

- `config.js`: gets the canvas/`ctx`, defines `W`/`H`, and holds every tuning constant (alien grid size and caps, speeds, per-wave speedup, lives, shooting limits). Change gameplay numbers here.
- `game.js`: all mutable state (`let` globals), `startWave()`, `reset()`, and `update(dt)` (movement, firing rules, collisions, wave/life transitions).
- `render.js`: `draw(time)` and its helpers. Reads state only and never changes it.
- `main.js`: keyboard listeners (`keys` map) and the `requestAnimationFrame` loop. It calls `reset()` to start the game.

State machine (`state` in `game.js`): `"banner"` (a timed "WAVE n" or "LIFE LOST" message; nothing moves) → `"playing"` → either a new wave via `startWave()` (back to `"banner"`) or `"lost"` (game over; Enter calls `reset()`). Clearing a wave increments `wave`. An alien reaching the player's row (`PLAYER_Y`) costs a life and restarts the same wave.

Mechanics that span files:
- Alien speed depends on two things: the share of the wave already destroyed (`waveTotal` is set in `startWave`) and the wave number (`WAVE_SPEEDUP`).
- Firing rules: at most `BURST_SIZE` shots per press of the space bar, because the `keyup` handler in `main.js` resets `burstCount`. After `MAGAZINE` shots in a row (a pause longer than `STREAK_RESET` resets the count), the player can't fire for `RELOAD_TIME`. The ammo display in the top-right corner shows `streak`/`reloadTimer`.
- Each alien carries its own `color` and `points`, set from its row in `startWave`.

## Git workflow

Don't commit directly on `main`: create a branch, commit there, and merge into `main` (fast-forward) only when asked. Don't push unless asked.
