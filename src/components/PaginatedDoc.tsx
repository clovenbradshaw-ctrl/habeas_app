import {
  useRef,
  useState,
  useMemo,
  useEffect,
  useLayoutEffect,
} from "react";
import EditableBlock from "./EditableBlock";
import type { Block } from "../models";

const PAGE_W = 816;
const PAGE_H = 1056;
const MG = 96;
const USABLE_H = PAGE_H - 2 * MG - 28;

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

interface PaginatedDocProps {
  blocks: Block[];
  vars: Record<string, string>;
  onEdit: (blockId: string, newContent: string, oldContent: string) => void;
  caseNo: string;
}

interface PageDef {
  ids: string[];
  first: boolean;
}

export default function PaginatedDoc({
  blocks,
  vars,
  onEdit,
  caseNo,
}: PaginatedDocProps) {
  const mRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<PageDef[]>([]);
  const [tick, setTick] = useState(0);

  const body = useMemo(
    () => blocks.filter((b) => !CAP_ALL.has(b.id)),
    [blocks],
  );

  useEffect(() => {
    setTick((t) => t + 1);
  }, [blocks, vars]);

  useLayoutEffect(() => {
    const c = mRef.current;
    if (!c) return;
    const capH =
      (c.querySelector("[data-mr='cap']") as HTMLElement)
        ?.offsetHeight || 0;
    const els = Array.from(
      c.querySelectorAll("[data-mr='body']>[data-block-id]"),
    ) as HTMLElement[];
    const hs = els.map((e) => ({
      id: e.dataset.blockId!,
      h: e.offsetHeight,
    }));
    const res: PageDef[] = [];
    let cur: string[] = [];
    let rem = USABLE_H - capH;
    let pi = 0;
    for (const { id, h } of hs) {
      if (h > rem && cur.length > 0) {
        res.push({ ids: cur, first: pi === 0 });
        cur = [];
        rem = USABLE_H;
        pi++;
      }
      cur.push(id);
      rem -= h;
    }
    if (cur.length > 0 || res.length === 0) {
      res.push({ ids: cur, first: pi === 0 });
    }
    setPages(res);
  }, [tick]);

  const bm = useMemo(() => {
    const m: Record<string, Block> = {};
    blocks.forEach((b) => {
      m[b.id] = b;
    });
    return m;
  }, [blocks]);

  const total = pages.length || 1;

  const renderCap = (edit: boolean) => (
    <>
      {blocks
        .filter((b) => TITLE_IDS.has(b.id))
        .map((b) => (
          <EditableBlock
            key={b.id}
            block={b}
            vars={vars}
            onEdit={edit ? onEdit : () => {}}
            readOnly={!edit}
          />
        ))}
      <div className="caption-grid">
        <div className="cap-left-col">
          {blocks
            .filter((b) => CAP_L.includes(b.id))
            .map((b) => (
              <EditableBlock
                key={b.id}
                block={b}
                vars={vars}
                onEdit={edit ? onEdit : () => {}}
                readOnly={!edit}
              />
            ))}
        </div>
        <div className="cap-mid-col">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i}>)</div>
          ))}
        </div>
        <div className="cap-right-col">
          {blocks
            .filter((b) => CAP_R.includes(b.id))
            .map((b) => (
              <EditableBlock
                key={b.id}
                block={b}
                vars={vars}
                onEdit={edit ? onEdit : () => {}}
                readOnly={!edit}
              />
            ))}
        </div>
      </div>
    </>
  );

  return (
    <>
      <div
        ref={mRef}
        className="measure-box"
        aria-hidden="true"
        style={{
          width: PAGE_W - 2 * MG,
        }}
      >
        <div data-mr="cap">{renderCap(false)}</div>
        <div data-mr="body">
          {body.map((b) => (
            <EditableBlock
              key={b.id}
              block={b}
              vars={vars}
              onEdit={() => {}}
              readOnly
            />
          ))}
        </div>
      </div>
      {pages.map((pg, pi) => (
        <div key={pi} className="page-shell">
          <div
            className="page-paper"
            style={{
              width: PAGE_W,
              height: PAGE_H,
            }}
          >
            <div
              className="page-margin"
              style={{ padding: MG, paddingBottom: 0 }}
            >
              {pg.first && renderCap(true)}
              {pg.ids.map((id) => {
                const b = bm[id];
                return b ? (
                  <EditableBlock
                    key={b.id}
                    block={b}
                    vars={vars}
                    onEdit={onEdit}
                  />
                ) : null;
              })}
            </div>
            <div
              className="page-foot"
              style={{
                height: MG,
                padding: `12px ${MG}px 0`,
              }}
            >
              <span>{caseNo}</span>
              <span>
                Page {pi + 1} of {total}
              </span>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
