import { useId } from 'react';
import Button from './Button';

export default function SearchForm({ value, onChange, onSearch }: {value: string; onChange: (value: string) => void; onSearch: (value: string) => void}) {
  const inputId = useId();
  return (
    <form className="flex w-fit max-w-full flex-wrap items-center gap-4 bg-surface" role="search" onSubmit={event => { event.preventDefault(); onSearch(value.trim()); }}>
      <label htmlFor={inputId} className="sr-only">Tìm kiếm địa điểm</label>
      <input id={inputId} type="search" value={value} onChange={event => onChange(event.target.value)} placeholder="Tìm kiếm địa điểm" className="w-[137px] appearance-none rounded-pill border-0 bg-pale px-3 py-2 text-[13px] leading-[16px] text-primary placeholder:text-primary [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:appearance-none" />
      <Button type="submit">Tìm kiếm</Button>
    </form>
  );
}
