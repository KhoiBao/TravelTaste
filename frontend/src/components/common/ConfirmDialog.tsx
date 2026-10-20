import type {KeyboardEvent} from 'react';
import type {Confirmation} from '../../types/domain';
import { useEffect, useId, useRef } from 'react';

export default function ConfirmDialog({ request, onClose }: {request: Confirmation | null; onClose: () => void}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!request) return;
    const element = dialog.current;
    if (!element) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    if (!element.open) element.showModal();
    return () => {
      element.close();
      document.body.style.overflow = overflow;
      requestAnimationFrame(() => {
        if (opener?.isConnected && opener !== document.body) opener.focus({ preventScroll: true });
        else { const heading = document.querySelector<HTMLElement>('main h1'); heading?.setAttribute('tabindex', '-1'); heading?.focus({ preventScroll: true }); }
      });
    };
  }, [request]);
  function trap(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    const buttons = dialog.current!.querySelectorAll('button');
    if (event.shiftKey && document.activeElement === buttons[0]) { event.preventDefault(); buttons[buttons.length - 1].focus(); }
    else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) { event.preventDefault(); buttons[0].focus(); }
  }
  return <dialog ref={dialog} aria-labelledby={titleId} onKeyDown={trap} onCancel={onClose} onClose={onClose} className="m-auto w-[calc(100%-32px)] max-w-[480px] rounded-page border border-line bg-surface p-6 text-ink backdrop:bg-ink/40">
    <h2 id={titleId} className="text-[20px] font-bold">{request?.title}</h2>
    <p className="mt-4 text-[15px] text-muted">{request?.message}</p>
    <div className="mt-6 flex flex-wrap justify-end gap-3"><button autoFocus type="button" onClick={onClose} className="rounded-button bg-pale px-4 py-3 text-[14px] text-primary">Hủy</button><button type="button" onClick={() => { const action = request?.onConfirm; onClose(); action?.(); }} className="rounded-button bg-primary px-4 py-3 text-[14px] font-bold text-white">Xác nhận</button></div>
  </dialog>;
}
