import { useId } from 'react';

export default function StarInput({ value, onChange, label = 'Số sao' }: {value: number; onChange: (value: number) => void; label?: string}) {
  const name = useId();
  return <fieldset className="flex flex-wrap items-center gap-2 text-[22px] font-bold leading-[27px] text-accent"><legend className="sr-only">{label}</legend><span aria-hidden="true">{label}: </span>{[1, 2, 3, 4, 5].map(star => <label key={star} className="relative inline-flex cursor-pointer"><input type="radio" name={name} value={star} checked={Number(value) === star} onChange={() => onChange(star)} className="peer absolute inset-0 size-full cursor-pointer opacity-0" aria-label={`${star} sao`} required /><span className={`pointer-events-none rounded peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-primary ${star <= value ? 'text-accent' : 'text-line'}`} aria-hidden="true">★</span></label>)}</fieldset>;
}
