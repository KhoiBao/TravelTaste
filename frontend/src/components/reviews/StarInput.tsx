import { useId } from 'react';

export default function StarInput({ value, onChange, label = 'Số sao' }: {value: number; onChange: (value: number) => void; label?: string}) {
  const name = useId();
  return <fieldset className="flex min-w-0 flex-col gap-2">
    <legend className="text-[13px] font-medium text-ink">{label} <span aria-hidden="true" className="text-danger">*</span></legend>
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => <label key={star} className="relative inline-flex cursor-pointer" title={`${star} sao`}>
        <input type="radio" name={name} value={star} checked={Number(value) === star} onChange={() => onChange(star)} className="peer absolute inset-0 size-full cursor-pointer opacity-0" aria-label={`${star} sao`} required />
        <span className={`pointer-events-none rounded px-0.5 text-[30px] leading-none transition-colors peer-hover:text-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-primary ${star <= value ? 'text-accent' : 'text-line'}`} aria-hidden="true">★</span>
      </label>)}
      <span className="ml-2 text-[12px] font-medium tabular-nums text-muted">{value}/5</span>
    </div>
  </fieldset>;
}
