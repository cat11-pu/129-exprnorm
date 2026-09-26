// print.js：打印归一化写法（显式栈遍历，深树也不爆栈）。运算符两侧各留一个空格，
// 去掉所有多余的括号。只有子式优先级低于外层、或优先级与外层相同且位于
// 减法或除法的右侧时，才保留括号。
import { parseExpression } from "./parse.js";

function precedence(op) {
  return op === "+" || op === "-" ? 1 : 2;
}

export function printCanonical(text) {
  const root = parseExpression(text);
  const parts = [];
  const stack = [{ node: root, parent: null, isRight: false }];
  while (stack.length > 0) {
    const frame = stack.pop();
    if (typeof frame === "string") {
      parts.push(frame);
      continue;
    }
    const node = frame.node;
    if (node.kind === "leaf") {
      parts.push(node.text);
      continue;
    }
    let needParens = false;
    if (frame.parent !== null) {
      const childPrec = precedence(node.op);
      const parentPrec = precedence(frame.parent.op);
      needParens =
        childPrec < parentPrec ||
        (childPrec === parentPrec && frame.isRight &&
         (frame.parent.op === "-" || frame.parent.op === "/"));
    }
    // 栈是后进先出，按输出顺序的逆序压栈
    if (needParens) stack.push(")");
    stack.push({ node: node.right, parent: node, isRight: true });
    stack.push(" " + node.op + " ");
    stack.push({ node: node.left, parent: node, isRight: false });
    if (needParens) stack.push("(");
  }
  return parts.join("");
}
