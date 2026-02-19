import type { Block } from "../models";

const TITLE_IDS = new Set(["ct-1", "ct-2", "ct-3"]);
const CAP_L = [
  "cap-pet",
  "cap-role",
  "cap-v",
  "cap-r1",
  "cap-r2",
  "cap-r3",
  "cap-r4",
  "cap-r5",
  "cap-r6",
];
const CAP_R = ["cap-case", "cap-title"];
const CAP_ALL = new Set([...TITLE_IDS, ...CAP_L, ...CAP_R]);

function sub(
  s: string,
  vars: Record<string, string>,
): string {
  return s.replace(
    /\{\{(\w+)\}\}/g,
    (_, k) => vars[k]?.trim() || `[${k}]`,
  );
}

function cap(
  s: string,
  vars: Record<string, string>,
): string {
  return sub(s, vars).replace(/\n/g, "<br>");
}

export function buildDocHTML(
  blocks: Block[],
  vars: Record<string, string>,
): string {
  const titles = blocks
    .filter((b) => TITLE_IDS.has(b.id))
    .map((b) => `<div class="title">${cap(b.content, vars)}</div>`)
    .join("");

  const capLeft = blocks
    .filter((b) => CAP_L.includes(b.id))
    .map((b) => {
      const cls =
        b.type === "cap-name"
          ? "cn"
          : b.type === "cap-center"
            ? "cc"
            : "rr";
      return `<div class="${cls}">${cap(b.content, vars)}</div>`;
    })
    .join("");

  const capRight = blocks
    .filter((b) => CAP_R.includes(b.id))
    .map((b) => {
      const cls = b.type === "cap-case" ? "ck" : "cd";
      return `<div class="${cls}">${cap(b.content, vars)}</div>`;
    })
    .join("");

  const body = blocks
    .filter((b) => !CAP_ALL.has(b.id))
    .map((b) => {
      const cls =
        b.type === "heading"
          ? "heading"
          : b.type === "sig"
            ? "sig"
            : b.type === "sig-label"
              ? "sig-label"
              : "para";
      const text =
        b.type === "heading"
          ? cap(b.content, vars).toUpperCase()
          : cap(b.content, vars);
      return `<div class="${cls}">${text}</div>`;
    })
    .join("");

  const parens = Array(24).fill(")").join("<br>");

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><style>@page{size:8.5in 11in;margin:1in}body{font-family:"Times New Roman",serif;font-size:12pt;line-height:1.35}.title{text-align:center;font-weight:bold;margin:0}.heading{font-weight:bold;text-transform:uppercase;margin:18pt 0 6pt}.para{margin:0 0 10pt;text-align:justify}.sig{white-space:pre-line;margin:0 0 10pt}.sig-label{font-style:italic}table.c{width:100%;border-collapse:collapse;margin:18pt 0}table.c td{vertical-align:top;padding:0 4pt}.cl{width:55%}.cm{width:5%;text-align:center}.cr{width:40%}.cn{text-align:center;font-weight:bold}.cc{text-align:center;margin:10pt 0}.rr{margin:0 0 8pt}.ck{margin:0 0 12pt}.cd{font-weight:bold}</style></head><body>${titles}<table class="c"><tr><td class="cl">${capLeft}</td><td class="cm">${parens}</td><td class="cr">${capRight}</td></tr></table>${body}</body></html>`;
}

export function doExportDoc(
  blocks: Block[],
  vars: Record<string, string>,
  name?: string,
): void {
  const html = buildDocHTML(blocks, vars);
  const blob = new Blob(["\ufeff" + html], {
    type: "application/msword",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `habeas-${(name || "petition").replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().slice(0, 10)}.doc`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}
