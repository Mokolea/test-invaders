// ESLint setup for the game's classic scripts (dev-only; the game never loads this).
//
// The scripts in js/ share one global scope, so a top-level name declared in one
// file is a global in the others. Instead of keeping a hand-written list, this
// reads the <script src="js/..."> tags from index.html, parses each file and
// declares its top-level names as globals for every script:
//   let/var -> "writable", const/function/class -> "readonly".
// no-undef then catches misspelt or missing cross-file names, and
// no-global-assign catches assigning to another file's const or function.

import { readFileSync } from "node:fs";
import js from "@eslint/js";
import globals from "globals";
import * as espree from "espree";

const html = readFileSync(new URL("index.html", import.meta.url), "utf8");
const scripts = [...html.matchAll(/<script\s+src="(js\/[^"]+\.js)"/g)].map((m) => m[1]);

const shared = {};
for (const file of scripts) {
  const source = readFileSync(new URL(file, import.meta.url), "utf8");
  const ast = espree.parse(source, { ecmaVersion: "latest", sourceType: "script" });
  for (const node of ast.body) {
    if (node.type === "VariableDeclaration") {
      const access = node.kind === "const" ? "readonly" : "writable";
      for (const decl of node.declarations) {
        if (decl.id.type === "Identifier") shared[decl.id.name] = access;
      }
    } else if ((node.type === "FunctionDeclaration" || node.type === "ClassDeclaration") && node.id) {
      shared[node.id.name] = "readonly";
    }
  }
}

export default [
  {
    files: ["js/**/*.js"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "script",
      globals: { ...globals.browser, ...shared },
    },
    rules: {
      ...js.configs.recommended.rules,
      // Each name is declared in its own file and also listed above as a global.
      "no-redeclare": ["error", { builtinGlobals: false }],
      // Top-level names are often used only from other files.
      "no-unused-vars": ["error", { vars: "local" }],
    },
  },
  {
    files: ["eslint.config.mjs"],
    languageOptions: {
      sourceType: "module",
      globals: globals.node,
    },
  },
];
