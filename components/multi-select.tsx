"use client";

interface Option { id: number; label: string }

export function MultiSelect({
  label,
  options,
  value,
  onChange,
  error,
}: {
  label: string;
  options: Option[];
  value: number[];
  onChange: (ids: number[]) => void;
  error?: string;
}) {
  const toggle = (id: number) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <fieldset>
      <legend className="mb-1 text-sm text-neutral-300">{label}</legend>
      <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-lg border border-neutral-700 bg-neutral-900 p-2">
        {options.length === 0 && <span className="text-sm text-neutral-500">No options yet</span>}
        {options.map((o) => (
          <button
            type="button"
            key={o.id}
            onClick={() => toggle(o.id)}
            aria-pressed={value.includes(o.id)}
            className={`rounded-full px-3 py-1 text-sm transition ${
              value.includes(o.id)
                ? "bg-blue-600 text-white"
                : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {error && <span className="mt-1 block text-sm text-red-400">{error}</span>}
    </fieldset>
  );
}
