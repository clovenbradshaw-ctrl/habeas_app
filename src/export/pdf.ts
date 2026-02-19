import type { Block } from "../models";
import { buildDocHTML } from "./word";

export function doExportPDF(
  blocks: Block[],
  vars: Record<string, string>,
): void {
  const w = window.open("", "_blank", "width=850,height=1100");
  if (!w) {
    alert("Allow popups for PDF export");
    return;
  }
  w.document.write(buildDocHTML(blocks, vars));
  w.document.close();
  setTimeout(() => {
    w.focus();
    w.print();
  }, 500);
}
