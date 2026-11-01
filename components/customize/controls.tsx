import React from 'react';

export const Section: React.FC<{ title: string; action?: React.ReactNode; children: React.ReactNode }> = ({
  title,
  action,
  children,
}) => (
  <section>
    <div className="flex items-center justify-between gap-3 mb-2.5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-brand-gray-100">{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

export function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly { id: T; name: string; className?: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o.id}
          type="button"
          role="radio"
          aria-checked={value === o.id}
          onClick={() => onChange(o.id)}
          className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
            value === o.id
              ? 'bg-brand-green-dark text-white'
              : 'bg-gray-100 dark:bg-brand-gray-300 hover:bg-gray-200 dark:hover:bg-brand-gray-200'
          } ${o.className ?? ''}`}
        >
          {o.name}
        </button>
      ))}
    </div>
  );
}

export const Swatch: React.FC<{ background: string; selected: boolean; label: string; onClick: () => void }> = ({
  background,
  selected,
  label,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    aria-pressed={selected}
    title={label}
    className={`w-8 h-8 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/10 transition-transform hover:scale-110 ${
      selected ? 'outline-2 outline-offset-2 outline-brand-green' : ''
    }`}
    style={{ background }}
  />
);

export const ColorInput: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({
  label,
  value,
  onChange,
}) => (
  <label className="flex items-center gap-2 text-sm font-medium">
    <span className="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-black/10 dark:ring-white/20 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand-green">
      <input
        type="color"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="absolute -inset-2 w-12 h-12 cursor-pointer border-0 p-0"
      />
    </span>
    {label}
  </label>
);

export const RangeInput: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}> = ({ label, value, min, max, step, format, onChange }) => (
  <label className="flex items-center gap-2 text-sm font-medium flex-1 min-w-[160px]">
    <span className="w-12 shrink-0">{label}</span>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={e => onChange(Number(e.target.value))}
      className="flex-1 accent-brand-green"
    />
    <span className="w-11 text-right tabular-nums text-gray-500 dark:text-brand-gray-100">{format(value)}</span>
  </label>
);

export const panel = 'flex flex-wrap items-center gap-x-5 gap-y-3 p-3 rounded-lg bg-gray-50 dark:bg-brand-gray-300/60';
