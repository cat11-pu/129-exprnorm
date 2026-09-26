// print.js：打印（基线：原样输出）
import { parseExpression } from "./parse.js";

export function printCanonical(text) {
  return String(text).trim();
}
