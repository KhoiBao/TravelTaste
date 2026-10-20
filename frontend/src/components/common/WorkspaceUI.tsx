import { cloneElement, useId } from 'react';
import { Link } from 'react-router-dom';
import type {ReactNode, ReactElement, InputHTMLAttributes} from 'react';

export const fieldClass = 'w-full min-w-0 rounded-button border border-line bg-surface px-3 py-2 text-[14px] leading-[20px] text-ink disabled:bg-canvas';
export const actionClass = 'inline-flex items-center justify-center rounded-button bg-primary px-5 py-[14px] text-[15px] font-bold leading-[18px] text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50';
export const quietActionClass = 'rounded-button bg-pale px-3 py-2 text-[13px] text-primary hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50';

export function Field({ label, children, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'children'> & {label: string; children?: (id: string) => ReactElement<{'aria-label'?: string}>}) {
  const id = useId();
  return <label htmlFor={id} className="flex min-w-0 flex-col gap-2 text-[13px] text-ink">{label}{children ? cloneElement(children(id), { 'aria-label': label }) : <input id={id} aria-label={label} className={fieldClass} {...props} />}</label>;
}

export function WirePanel({ label, children, height = 110, open = true }: {label: string; children?: ReactNode; height?: 70 | 95 | 110 | 140; open?: boolean}) {
  const minHeight = { 70: 'min-h-[70px]', 95: 'min-h-[95px]', 110: 'min-h-[110px]', 140: 'min-h-[140px]' }[height];
  if (!children) return <div className={`${minHeight} w-full rounded-card bg-surface px-4 pb-3 pt-[14px] text-[15px] leading-[18px] text-muted`}>{label}</div>;
  return <details open={open || undefined} className={`${minHeight} w-full rounded-2xl border border-line bg-surface p-5`}>
    <summary className="cursor-pointer text-[16px] font-bold leading-6 text-ink hover:text-primary">{label}</summary>
    <div className="mt-4 flex min-w-0 flex-col gap-4 text-[14px] text-ink">{children}</div>
  </details>;
}

export function StatusPanel({ notice = '' }) {
  return notice ? <p role="status" aria-live="polite" className="w-full rounded-2xl border border-line p-4 text-sm">{notice}</p> : null;
}

export function EmptyState({ children = 'Chưa có dữ liệu phù hợp.' }: {children?: ReactNode}) { return <p role="status" className="rounded-button bg-canvas p-4 text-[14px] text-muted">{children}</p>; }

export function StatusBadge({ status }: {status: string}) { return <span className={`inline-block rounded-pill px-2 py-1 text-[11px] ${status === 'ACTIVE' ? 'bg-pale text-primary' : 'bg-canvas text-muted'}`}>{status}</span>; }

export function RowCard({ title, subtitle, status, children }: {title: string; subtitle?: string; status?: string; children?: ReactNode}) {
  return <article className="flex min-w-0 flex-col gap-3 border-t border-line py-4 first:border-t-0 tablet:flex-row tablet:items-center tablet:justify-between"><div className="min-w-0"><h3 className="break-words text-[15px] font-bold">{title}</h3><p className="mt-2 break-words text-[13px] text-muted">{subtitle}</p>{status && <div className="mt-2"><StatusBadge status={status} /></div>}</div><div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div></article>;
}

export function Pagination({ page, total, onChange }: {page: number; total: number; onChange: (page: number) => void}) {
  return total > 1 && <nav aria-label="Phân trang" className="flex flex-wrap items-center gap-3 text-[13px]"><button type="button" className={quietActionClass} disabled={page <= 1} onClick={() => onChange(page - 1)}>Trước</button><span>Trang {page} / {total}</span><button type="button" className={quietActionClass} disabled={page >= total} onClick={() => onChange(page + 1)}>Sau</button></nav>;
}

export function WorkspaceNavigation({ admin = false }) {
  const items = admin ? [['/admin', 'Tổng quan'], ['/admin/places', 'Địa điểm'], ['/admin/categories', 'Danh mục'], ['/admin/reviews', 'Review'], ['/admin/comments', 'Bình luận'], ['/admin/users', 'Người dùng'], ['/admin/statistics', 'Thống kê']] : [['/profile', 'Hồ sơ'], ['/my-reviews', 'Review của tôi'], ['/reviews/new', 'Viết review']];
  return <nav aria-label={admin ? 'Quản trị' : 'Tài khoản'} className="flex w-full flex-wrap gap-x-5 gap-y-3 border-t border-line pt-5 text-[13px] text-primary">{items.map(([to, label]) => <Link key={to} to={to} className="underline">{label}</Link>)}</nav>;
}
