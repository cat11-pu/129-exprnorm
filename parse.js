// parse.js：解析（基线：不解析，整串当叶子）
export function parseExpression(text) {
  return { kind: "leaf", text: String(text).trim() };
}
