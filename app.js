// app.js：渲染结果
import { parseExpression } from "./parse.js";
import { printCanonical } from "./print.js";

export function render(spec) {
  const list = spec.expressions || [];
  const forms = list.map((item) => printCanonical(item));
  const operators = forms.reduce((total, item) => total + (item.match(/[+*/-]/g) || []).length, 0);
  const parens = forms.reduce((total, item) => total + (item.match(/\(/g) || []).length, 0);
  return { forms: forms, count: forms.length, operators: operators, parens: parens,
           longest: forms.reduce((best, item) => Math.max(best, item.length), 0) };
}
