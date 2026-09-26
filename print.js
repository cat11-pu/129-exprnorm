// print.js：归一化打印（运算符两侧各一个空格，去掉所有多余的括号）
import { parseExpression } from "./parse.js";

const PREC = { "+": 1, "-": 1, "*": 2, "/": 2 };

// 子式优先级低于外层，或同级且位于减法/除法右侧时，必须保留括号
function needsParens(node, parentOp, isRight) {
  if (parentOp === null) return false;
  const diff = PREC[node.op] - PREC[parentOp];
  if (diff < 0) return true;
  if (diff > 0) return false;
  return isRight && (parentOp === "-" || parentOp === "/");
}

export function printCanonical(text) {
  const root = parseExpression(text);
  const parts = [];
  const stack = [{ node: root, parentOp: null, isRight: false }];
  while (stack.length > 0) {
    const item = stack.pop();
    if (typeof item === "string") { parts.push(item); continue; }
    const node = item.node;
    if (node.kind === "ident") { parts.push(node.name); continue; }
    const wrap = needsParens(node, item.parentOp, item.isRight);
    if (wrap) stack.push(")");
    stack.push({ node: node.right, parentOp: node.op, isRight: true });
    stack.push(" " + node.op + " ");
    stack.push({ node: node.left, parentOp: node.op, isRight: false });
    if (wrap) stack.push("(");
  }
  return parts.join("");
}
