import type { ReactNode } from 'react';
export function Skeleton({count = 3}: {count?: number}) {
  return <div role="status" className="grid gap-4 tablet:grid-cols-3"><span className="sr-only">Đang tải địa điểm…</span>{Array.from({length: count}, (_, i) => <div key={i} aria-hidden="true" className="h-64 animate-pulse rounded-2xl border border-line bg-pale motion-reduce:animate-none" />)}</div>;
}
export function EmptyState({children, action}: {children: ReactNode; action?: ReactNode}) {
  return <div role="status" className="rounded-2xl border border-dashed border-line bg-surface p-8 text-center"><p className="text-muted">{children}</p>{action && <div className="mt-4">{action}</div>}</div>;
}
export function ErrorState({retry, message}: {retry: () => void; message?: string}) {
  return <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6"><p>{message || 'Không tải được dữ liệu.'}</p><button onClick={retry} className="mt-3 rounded-button bg-primary px-4 py-3 text-sm font-bold text-white">Thử lại</button></div>;
}
