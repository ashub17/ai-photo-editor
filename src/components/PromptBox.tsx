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
      <span className="text-sm font-medium text-slate-200">{label}</span>
      <textarea
        id={id}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={7}
        className="mt-2 w-full resize-y rounded-lg border border-white/10 bg-slate-950/70 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-300 focus:ring-2 focus:ring-teal-300/20 disabled:cursor-not-allowed disabled:opacity-60"
      />
    </label>
  );
}
