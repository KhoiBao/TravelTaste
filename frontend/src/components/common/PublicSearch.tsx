import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchForm from './SearchForm';

export default function PublicSearch({ initialValue = '', onSearch }: {initialValue?: string; onSearch?: (value: string) => void}) {
  const [query, setQuery] = useState(initialValue);
  const navigate = useNavigate();
  return <SearchForm value={query} onChange={setQuery} onSearch={value => onSearch ? onSearch(value) : navigate(`/search${value ? `?q=${encodeURIComponent(value)}` : ''}`)} />;
}
