import { useRef, useEffect, useCallback } from "react";

const CLS_MAP: Record<string, string> = {
  title: "blk-title",
  heading: "blk-heading",
  para: "blk-para",
  "cap-name": "blk-cap-name",
  "cap-center": "blk-cap-center",
  "cap-resp": "blk-cap-resp",
  "cap-case": "blk-cap-case",
  "cap-doctitle": "blk-cap-doctitle",
  sig: "blk-sig",
  "sig-label": "blk-sig-label",
};

interface EditableBlockProps {
  block: { id: string; type: string; content: string };
  vars: Record<string, string>;
  onEdit?: (blockId: string, newContent: string, oldContent: string) => void;
  readOnly?: boolean;
}

export default function EditableBlock({
  block,
  vars,
  onEdit,
  readOnly,
}: EditableBlockProps) {
  const el = useRef<HTMLDivElement>(null);
  const editing = useRef(false);

  const toHtml = useCallback(
    (c: string) => {
      let h = c.replace(/\n/g, "<br/>");
      return h.replace(/\{\{(\w+)\}\}/g, (_, k) => {
        const v = vars[k]?.trim();
        return v
          ? `<span data-var="${k}" contenteditable="false" class="vf">${v}</span>`
          : `<span data-var="${k}" contenteditable="false" class="ve">\u27E8${k}\u27E9</span>`;
      });
    },
    [vars],
  );

  const extract = useCallback((e: HTMLElement) => {
    const c = e.cloneNode(true) as HTMLElement;
    c.querySelectorAll("br").forEach((b) =>
      b.replaceWith("\n"),
    );
    c.querySelectorAll("[data-var]").forEach((s) =>
      s.replaceWith(`{{${(s as HTMLElement).dataset.var}}}`),
    );
    return c.textContent || "";
  }, []);

  useEffect(() => {
    if (!editing.current && el.current) {
      el.current.innerHTML = toHtml(block.content);
    }
  }, [block.content, vars, toHtml]);

  return (
    <div
      ref={el}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      onFocus={
        readOnly
          ? undefined
          : () => {
              editing.current = true;
            }
      }
      onBlur={
        readOnly
          ? undefined
          : () => {
              editing.current = false;
              if (!el.current) return;
              const nc = extract(el.current);
              const norm = (s: string) =>
                s.replace(/\s+/g, " ").trim();
              if (norm(nc) !== norm(block.content)) {
                onEdit?.(block.id, nc, block.content);
              }
              el.current.innerHTML = toHtml(
                norm(nc) !== norm(block.content) ? nc : block.content,
              );
            }
      }
      className={`blk ${CLS_MAP[block.type] || "blk-para"}`}
      data-block-id={block.id}
    />
  );
}
