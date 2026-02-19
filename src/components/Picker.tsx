interface PickerProps {
  label: string;
  items: Array<{ id: string; [key: string]: any }>;
  displayKey: string | ((item: any) => string);
  value: string;
  onChange: (id: string) => void;
  onNew?: () => void;
}

export default function Picker({
  label,
  items,
  displayKey,
  value,
  onChange,
  onNew,
}: PickerProps) {
  return (
    <div className="picker">
      <label className="flbl">{label}</label>
      <div className="picker-row">
        <select
          className="finp picker-sel"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">— Select —</option>
          {items.map((it) => (
            <option key={it.id} value={it.id}>
              {typeof displayKey === "function"
                ? displayKey(it)
                : it[displayKey] || it.id}
            </option>
          ))}
        </select>
        {onNew && (
          <button className="hbtn sm" onClick={onNew}>
            +
          </button>
        )}
      </div>
    </div>
  );
}
