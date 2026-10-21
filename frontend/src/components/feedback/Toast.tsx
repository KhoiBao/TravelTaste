import { useEffect, useState } from 'react';
import type {Result} from '../../types/domain';
export default function Toast() {
  const [notice, setNotice] = useState<Result | null>(null);
  useEffect(() => {const receive = (event: Event) => setNotice((event as CustomEvent<Result>).detail); window.addEventListener('traveltaste:notice', receive); return () => window.removeEventListener('traveltaste:notice', receive);}, []);
  useEffect(() => {if (!notice) return; const timer = setTimeout(() => setNotice(null), 5000); return () => clearTimeout(timer);}, [notice]);
  return <div role="status" aria-live="polite" aria-atomic="true" className="pointer-events-none fixed bottom-5 right-5 z-50 max-w-[calc(100vw-40px)]">{notice && <div className={`pointer-events-auto flex items-start gap-4 rounded-2xl border bg-surface p-4 shadow-lg ${notice.ok ? 'border-primary' : 'border-danger'}`}><p className="max-w-sm text-sm leading-relaxed">{notice.message}</p><button type="button" onClick={() => setNotice(null)} aria-label="Đóng thông báo" className="rounded text-sm text-primary">✕</button></div>}</div>;
}
