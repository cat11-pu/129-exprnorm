// parse.js：单遍扫描把算式解析成语法树（调度场算法，显式栈，不递归）。
// 乘除优先于加减，同级从左到右结合；标识符由字母数字下划线组成；空白忽略。
// 括号不匹配报 E_UNBALANCED；运算符位置不对、不认识的字符、空括号报 E_BAD_EXPR。

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

const IDENT_CHAR = /[A-Za-z0-9_]/;

function precedence(op) {
  return op === "+" || op === "-" ? 1 : 2;
}

export function parseExpression(text) {
  const source = String(text);
  const nodes = []; // 操作数（子树）栈
  const ops = []; // 运算符与左括号栈
  let expectOperand = true;
  let depth = 0;
  let seen = false;
  let index = 0;

  function reduce() {
    const op = ops.pop();
    const right = nodes.pop();
    const left = nodes.pop();
    nodes.push({ kind: "binary", op: op, left: left, right: right });
  }

  while (index < source.length) {
    const ch = source[index];
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r" || ch === "\f" || ch === "\v") {
      index += 1;
    } else if (IDENT_CHAR.test(ch)) {
      if (!expectOperand) fail("E_BAD_EXPR", "两个操作数之间缺少运算符");
      let end = index + 1;
      while (end < source.length && IDENT_CHAR.test(source[end])) end += 1;
      nodes.push({ kind: "leaf", text: source.slice(index, end) });
      expectOperand = false;
      seen = true;
      index = end;
    } else if (ch === "+" || ch === "-" || ch === "*" || ch === "/") {
      if (expectOperand) fail("E_BAD_EXPR", "运算符出现在不该出现的位置: " + ch);
      while (ops.length > 0 && ops[ops.length - 1] !== "(" &&
             precedence(ops[ops.length - 1]) >= precedence(ch)) {
        reduce();
      }
      ops.push(ch);
      expectOperand = true;
      index += 1;
    } else if (ch === "(") {
      if (!expectOperand) fail("E_BAD_EXPR", "操作数后面直接跟了左括号");
      depth += 1;
      ops.push("(");
      expectOperand = true;
      index += 1;
    } else if (ch === ")") {
      depth -= 1;
      if (depth < 0) fail("E_UNBALANCED", "右括号没有匹配的左括号");
      if (expectOperand) fail("E_BAD_EXPR", "括号里为空或运算符后面缺少操作数");
      while (ops.length > 0 && ops[ops.length - 1] !== "(") reduce();
      ops.pop(); // 弹掉匹配的左括号
      expectOperand = false;
      index += 1;
    } else {
      fail("E_BAD_EXPR", "不认识的字符: " + ch);
    }
  }
  if (depth !== 0) fail("E_UNBALANCED", "左括号没有匹配的右括号");
  if (!seen) fail("E_BAD_EXPR", "表达式为空");
  if (expectOperand) fail("E_BAD_EXPR", "运算符后面缺少操作数");
  while (ops.length > 0) reduce();
  return nodes[0];
}
