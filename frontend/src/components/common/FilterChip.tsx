import type { ButtonHTMLAttributes } from 'react';
export default function FilterChip({ children, selected, className = '', ...props }: ButtonHTMLAttributes<HTMLButtonElement> & {selected?: boolean}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={`inline-flex items-center justify-center rounded-pill bg-pale px-3 py-2 text-[13px] leading-[normal] text-primary transition-[filter] hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50 ${selected ? 'ring-2 ring-primary ring-offset-2' : ''} ${className}`}
      {...props}
    >{children}</button>
  );
}
