interface PromptBoxProps {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function PromptBox({
  id,
  label,
  value,
  placeholder,
  onChange,
  disabled
}: PromptBoxProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-widest text-app-secondary">
        {label}
      </span>
      <textarea
        id={id}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={6}
        className="w-full resize-none rounded-lg border border-app-border bg-app-input px-4 py-3 text-sm leading-relaxed text-app-text outline-none transition-colors duration-150 placeholder:text-app-muted focus:border-app-accent focus:ring-2 focus:ring-app-accent/15 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </label>
  );
}
