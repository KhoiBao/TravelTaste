import type {ReactNode} from 'react';
export default function AdminPanel({ title, children }: {title: string; children: ReactNode}) {
  return <details open className="w-full rounded-2xl border border-line bg-surface p-5 tablet:p-6"><summary className="cursor-pointer text-lg font-bold hover:text-primary">{title}</summary><div className="mt-5 flex min-w-0 flex-col gap-4">{children}</div></details>;
}
