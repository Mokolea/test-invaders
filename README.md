# Invaders

A small arcade shooter for the browser. Waves of aliens march sideways as a block and step down at each edge of the screen; shoot them all before they reach you. It is written in plain HTML, CSS and JavaScript, with no frameworks, dependencies or build step.

## Running

Open `index.html` in a browser. It works straight from the file system (`file://`), so you don't need a web server.

```sh
open index.html       # macOS
xdg-open index.html   # Linux
```

## Controls

| Key       | Action                                       |
|-----------|----------------------------------------------|
| ← / →     | Move the ship                                |
| Space     | Fire                                         |
| Enter     | Start a game, or save your name for a high score |

The switch in the header toggles between dark and light themes. The choice is remembered; on first visit the game follows your system setting.

## Gameplay

- **Lives:** you start with 3. You lose one when an alien reaches your row, and the same wave restarts.
- **Waves:** clearing a wave starts the next one. Each new wave has a larger formation, up to 7 × 11 aliens, and the aliens move 25% faster per wave.
- **Speed-up:** within a wave, the aliens move faster as their numbers drop. The last alien is very fast.
- **Scoring:** each alien is worth 10 points per row counted from the bottom, so the top row pays the most.
- **Firing limits:** each press of Space fires at most 3 shots. After 12 shots in a row, the gun has to reload for 2 seconds. Pausing for more than 1.2 seconds resets that count. The ammo display in the top-right corner shows how many shots are left and how far the reload has got.

## High scores

The start screen shows the top ten scores. If your final score makes the list, you are asked for a name (up to 10 characters; an empty name is saved as `PLAYER`). Scores are saved in the browser's `localStorage`, so they persist between sessions. Scores saved from other open tabs are merged in rather than overwritten. If storage is blocked, the list still works but lasts only for the current session.

## Project layout

```
index.html          Page with the header, theme switch, canvas and name-entry input
style.css           Page, header and overlay styling, with light/dark colour tokens
js/config.js        Canvas setup, tuning constants and colour palettes
js/high-scores.js   Top-ten list and localStorage persistence
js/game.js          Game state, waves, update loop logic, collisions
js/render.js        All drawing (game, start screen, name entry)
js/main.js          Keyboard input, name entry, animation loop
eslint.config.mjs   ESLint setup (dev-only)
package.json        Dev-only lint tooling; the game itself needs none of it
CLAUDE.md           Notes for working on the code with Claude Code
high-score-plan.md  Design plan for the high-score feature
```

The scripts are classic `<script>` tags (not ES modules, because browsers block module scripts loaded from `file://`). They share one global scope, so they must load in the order listed in `index.html`.

To change gameplay values such as speeds, lives, formation size and firing limits, edit `js/config.js`.

## Linting

The code is checked with ESLint, which needs Node.js (22 or newer). This is only for development; playing the game needs no installation.

```sh
npm install     # once
npm run lint
```
