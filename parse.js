// parse.js：解析算式为语法树（单遍扫描，乘除优先于加减，同级从左到右）
export class ExprError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

const PREC = { "+": 1, "-": 1, "*": 2, "/": 2 };

function isIdentChar(ch) {
  return (ch >= "a" && ch <= "z") || (ch >= "A" && ch <= "Z") ||
         (ch >= "0" && ch <= "9") || ch === "_";
}

function isSpace(ch) {
  return ch === " " || ch === "\t" || ch === "\n" || ch === "\r" || ch === "\f" || ch === "\v";
}

// 加法/乘法满足结合律：把 a+(b±c)、a*(b÷c) 旋转成左结合，归一化结果再解析能得到同一棵树
function normalize(root) {
  const order = [];
  const stack = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    order.push(node);
    if (node.kind === "op") {
      stack.push(node.left);
      stack.push(node.right);
    }
  }
  for (let i = order.length - 1; i >= 0; i -= 1) {
    let node = order[i];
    while (node.kind === "op" && node.right.kind === "op" &&
           PREC[node.right.op] === PREC[node.op] &&
           (node.op === "+" || node.op === "*")) {
      const right = node.right;
      node.right = right.right;
      right.right = right.left;
      right.left = node.left;
      node.left = right;
      const op = node.op;
      node.op = right.op;
      right.op = op;
      node = node.left;
    }
  }
  return root;
}

export function parseExpression(text) {
  const src = String(text);
  const values = [];
  const ops = [];
  let pos = 0;
  let last = null; // null | "ident" | "op" | "lparen" | "rparen"

  function reduce(op) {
    const right = values.pop();
    const left = values.pop();
    values.push({ kind: "op", op: op, left: left, right: right });
  }

  while (pos < src.length) {
    const ch = src[pos];
    if (isSpace(ch)) { pos += 1; continue; }
    if (isIdentChar(ch)) {
      if (last === "ident" || last === "rparen") {
        throw new ExprError("E_BAD_EXPR", "标识符前面缺少运算符");
      }
      let end = pos + 1;
      while (end < src.length && isIdentChar(src[end])) end += 1;
      values.push({ kind: "ident", name: src.slice(pos, end) });
      pos = end;
      last = "ident";
      continue;
    }
    if (ch === "(") {
      if (last === "ident" || last === "rparen") {
        throw new ExprError("E_BAD_EXPR", "左括号前面缺少运算符");
      }
      ops.push("(");
      pos += 1;
      last = "lparen";
      continue;
    }
    if (ch === ")") {
      if (last === "lparen") throw new ExprError("E_BAD_EXPR", "括号里为空");
      if (last === "op") throw new ExprError("E_BAD_EXPR", "运算符后面缺少操作数");
      if (last === null) throw new ExprError("E_UNBALANCED", "多余的右括号");
      let found = false;
      while (ops.length > 0) {
        const top = ops.pop();
        if (top === "(") { found = true; break; }
        reduce(top);
      }
      if (!found) throw new ExprError("E_UNBALANCED", "多余的右括号");
      pos += 1;
      last = "rparen";
      continue;
    }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/") {
      if (last === null || last === "op" || last === "lparen") {
        throw new ExprError("E_BAD_EXPR", "运算符出现在不该出现的位置");
      }
      while (ops.length > 0 && ops[ops.length - 1] !== "(" &&
             PREC[ops[ops.length - 1]] >= PREC[ch]) {
        reduce(ops.pop());
      }
      ops.push(ch);
      pos += 1;
      last = "op";
      continue;
    }
    throw new ExprError("E_BAD_EXPR", "不认识的字符 " + ch);
  }

  if (last === null) throw new ExprError("E_BAD_EXPR", "表达式为空");
  if (last === "op") throw new ExprError("E_BAD_EXPR", "运算符后面缺少操作数");
  while (ops.length > 0) {
    const top = ops.pop();
    if (top === "(") throw new ExprError("E_UNBALANCED", "左括号没有配对");
    reduce(top);
  }
  return normalize(values[0]);
}
