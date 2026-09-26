import assert from "node:assert";
import { parseExpression } from "../parse.js";
import { printCanonical } from "../print.js";
import { render } from "../app.js";

let failed = 0;
function check(name, fn) {
  try { fn(); console.log("ok " + name); } catch (e) { failed += 1; console.log("FAIL " + name + " :: " + e.message); }
}

check("parseExpression returns an object", () => {
  assert.strictEqual(typeof parseExpression("a+b"), "object");
});

check("printCanonical returns text", () => {
  assert.strictEqual(typeof printCanonical("a+b"), "string");
});

check("render returns one form per expression", () => {
  assert.strictEqual(render({ expressions: ["a", "b"] }).forms.length, 2);
});

check("render counts operators", () => {
  assert.strictEqual(typeof render({ expressions: ["a"] }).operators, "number");
});

check("render counts parentheses", () => {
  assert.strictEqual(typeof render({ expressions: ["a"] }).parens, "number");
});

console.log("5 cases, " + failed + " failed");
process.exit(failed === 0 ? 0 : 1);
