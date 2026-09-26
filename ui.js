// ui.js：操作面板与视图（原生 DOM，无弹窗）
import { render } from "./app.js";

export function mount(spec, parts) {
  let text = (spec.expressions || []).join("\n");
  parts.log.textContent = "表达式 " + (spec.expressions || []).length + " 条，点按钮看归一化结果。";

  function draw() {
    const list = text.split("\n").map((line) => line.trim()).filter(Boolean);
    const scene = Object.assign({}, spec, { expressions: list });
    let view = null;
    try {
      view = render(scene);
    } catch (error) {
      parts.out.textContent = String(error && error.code ? error.code : error);
      parts.log.textContent = "跑不动：" + String(error && error.message ? error.message : error);
      return;
    }
    parts.out.textContent = JSON.stringify(view, null, 1);
    parts.stage.textContent = "";
    view.forms.forEach(function (form, spot) {
      const row = document.createElement("div");
      row.className = "row";
      const head = document.createElement("span");
      head.textContent = (spot + 1) + ". 原样";
      row.appendChild(head);
      const mark = document.createElement("span");
      mark.className = "chip ok";
      mark.textContent = form;
      row.appendChild(mark);
      parts.stage.appendChild(row);
    });
    parts.legend.textContent = "表达式 " + view.count + " 条，运算符 " + view.operators + " 个，括号对 " + view.parens;
    parts.log.textContent = "最长归一化结果 " + view.longest + " 个字符";
  }

  const runButton = document.createElement("button");
  runButton.className = "primary";
  runButton.textContent = "归一化";
  runButton.addEventListener("click", draw);
  parts.controls.appendChild(runButton);

  const addButton = document.createElement("button");
  addButton.textContent = "追加一条";
  addButton.addEventListener("click", function () {
    text = text + "\n(a)";
    draw();
  });
  parts.controls.appendChild(addButton);

  const label = document.createElement("label");
  label.textContent = "表达式（一行一条）";
  parts.controls.appendChild(label);

  const box = document.createElement("input");
  box.type = "text";
  box.value = "a+b*c";
  box.addEventListener("input", function () {
    const list = (spec.expressions || []).concat([box.value]);
    try {
      const view = render(Object.assign({}, spec, { expressions: list }));
      parts.out.textContent = box.value + " 归一化成 " + view.forms[view.forms.length - 1];
    } catch (error) {
      parts.out.textContent = String(error && error.code ? error.code : error);
    }
  });
  parts.controls.appendChild(box);

  const readButton = document.createElement("button");
  readButton.textContent = "只看括号对数";
  readButton.addEventListener("click", function () {
    const list = text.split("\n").map((line) => line.trim()).filter(Boolean);
    const view = render(Object.assign({}, spec, { expressions: list }));
    parts.out.textContent = "括号对 " + view.parens + "，最长 " + view.longest;
  });
  parts.controls.appendChild(readButton);

  draw();
}
