import { ts } from "../lib/utils";

interface ProvenanceBadgeProps {
  record: {
    createdBy?: string;
    createdAt?: string;
    updatedBy?: string;
    updatedAt?: string;
    history?: Array<{ by: string; at: string; change: string }>;
  };
}

export default function ProvenanceBadge({
  record,
}: ProvenanceBadgeProps) {
  if (!record?.createdBy) return null;
  return (
    <div className="prov">
      <span className="prov-item">
        Created by <strong>{record.createdBy}</strong>{" "}
        {record.createdAt && ts(record.createdAt)}
      </span>
      {record.updatedAt &&
        record.updatedAt !== record.createdAt && (
          <span className="prov-item">
            Updated by <strong>{record.updatedBy}</strong>{" "}
            {ts(record.updatedAt)}
          </span>
        )}
      {record.history && record.history.length > 0 && (
        <details className="prov-details">
          <summary className="prov-sum">
            {record.history.length} change
            {record.history.length > 1 ? "s" : ""}
          </summary>
          <div className="prov-log">
            {record.history.map((h, i) => (
              <div key={i} className="prov-entry">
                <span className="prov-ts">{ts(h.at)}</span>{" "}
                <strong>{h.by}</strong>: {h.change}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
