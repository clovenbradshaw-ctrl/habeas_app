interface Field {
  key: string;
  label: string;
  ph?: string;
}

interface FieldGroupProps {
  title: string;
  fields: Field[];
  data: Record<string, any>;
  onChange: (key: string, value: string) => void;
}

export default function FieldGroup({
  title,
  fields,
  data,
  onChange,
}: FieldGroupProps) {
  return (
    <div className="fg">
      <div className="fg-title">{title}</div>
      {fields.map((f) => (
        <div key={f.key} className="frow">
          <label className="flbl">
            {f.label}
            {data[f.key]?.trim() && <span className="fchk">&#10003;</span>}
          </label>
          <input
            type="text"
            className="finp"
            value={data[f.key] || ""}
            placeholder={f.ph || ""}
            onChange={(e) => onChange(f.key, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
