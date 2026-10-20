import { createContext, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useBlocker, useLocation } from 'react-router-dom';
import ConfirmDialog from './ConfirmDialog';
import type {ReactNode, KeyboardEvent as ReactKeyboardEvent} from 'react';
import type {PopupValue, Confirmation} from '../../types/domain';

const PopupContext = createContext<PopupValue | null>(null);
const emptyAuth = { name: '', username: '', identity: '', email: '', password: '', confirmation: '' };

export function PopupProvider({ children }: {children: ReactNode}) {
  const [active, setActive] = useState(false);
  const [dirty, setDirty] = useState(false);
  const dirtyRef = useRef(false);
  function updateDirty(value: boolean) { dirtyRef.current = value; setDirty(value); }
  const [confirmation, confirm] = useState<Confirmation | null>(null);
  const [authDraft, setAuthDraft] = useState(emptyAuth);
  return <PopupContext.Provider value={{ active, setActive, dirty, dirtyRef, setDirty: updateDirty, confirmation, confirm, authDraft, setAuthDraft, clearAuth: () => setAuthDraft(emptyAuth) }}>
    {children}
    <ConfirmDialog request={active ? null : confirmation} onClose={() => confirm(null)} />
  </PopupContext.Provider>;
}

/** @returns {import('../../types/domain').PopupValue} */
export const usePopup = (): PopupValue => { const value = useContext(PopupContext); if (!value) throw new Error('PopupProvider is required'); return value; };

export function usePopupForm(values: unknown) {
  const popup = usePopup();
  const initial = useRef(JSON.stringify(values));
  const serialized = JSON.stringify(values);
  useLayoutEffect(() => { popup.setDirty(serialized !== initial.current); }, [serialized]);
  return () => { initial.current = serialized; popup.setDirty(false); };
}

export function PopupShell({ children, title, close, large = false }: {children: ReactNode; title: string; close: () => void; large?: boolean}) {
  const { setActive, dirty, dirtyRef, setDirty, confirmation, confirm, clearAuth } = usePopup();
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef(document.activeElement instanceof HTMLElement ? document.activeElement : null);
  const location = useLocation();
  const titleId = 'traveltaste-popup-title';
  const focusTarget = useRef<HTMLElement | null>(null);
  const blocker = useBlocker(({ nextLocation }) => dirtyRef.current && !(['/login', '/register'].includes(location.pathname) && ['/login', '/register'].includes(nextLocation.pathname)));
  function requestClose() {
    if (confirmation) { confirmation.onCancel?.(); confirm(null); return; }
    if (dirty) confirm({ title: 'Bỏ thay đổi chưa lưu?', message: 'Nội dung đang nhập sẽ không được lưu. Bạn có muốn đóng biểu mẫu?', onConfirm: () => { setDirty(false); close(); } });
    else close();
  }
  function trapFocus(event: ReactKeyboardEvent<HTMLDialogElement>) {
    if (event.key !== 'Tab') return;
    if (!dialog.current) return;
    const controls = [...dialog.current.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled),[tabindex="0"]')].filter(element => element.getClientRects().length && !element.closest('[hidden]'));
    const first = controls[0];
    const last = controls.at(-1);
    if (!first) { event.preventDefault(); dialog.current.focus(); return; }
    if (event.shiftKey && (document.activeElement === first || !dialog.current.contains(document.activeElement))) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && (document.activeElement === last || !dialog.current.contains(document.activeElement))) { event.preventDefault(); first.focus(); }
  }
  useEffect(() => {
    const oldOverflow = document.body.style.overflow;
    const scrollY = window.scrollY;
    setActive(true);
    document.body.style.overflow = 'hidden';
    dialog.current?.showModal();
    return () => {
      dialog.current?.close();
      document.body.style.overflow = oldOverflow;
      setActive(false); setDirty(false); confirm(null); clearAuth();
      window.scrollTo(0, scrollY);
      requestAnimationFrame(() => {
        if (opener.current?.isConnected && opener.current !== document.body) opener.current.focus({ preventScroll: true });
        else { const heading = document.querySelector<HTMLElement>('main h1'); heading?.setAttribute('tabindex', '-1'); heading?.focus({ preventScroll: true }); }
      });
    };
  }, []);
  useEffect(() => {
    if (confirmation) {
      focusTarget.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      requestAnimationFrame(() => dialog.current?.querySelector<HTMLElement>('[data-cancel-confirmation]')?.focus());
    } else if (focusTarget.current?.isConnected) focusTarget.current.focus();
  }, [confirmation]);
  useLayoutEffect(() => {
    if (!dirty) return;
    const beforeUnload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    confirm({ title: 'Bỏ thay đổi chưa lưu?', message: 'Rời biểu mẫu sẽ bỏ nội dung đang nhập.', onCancel: () => blocker.reset(), onConfirm: () => { setDirty(false); blocker.proceed(); } });
  }, [blocker.state]);
  return <dialog ref={dialog} aria-labelledby={titleId} onKeyDown={trapFocus} onCancel={event => { event.preventDefault(); requestClose(); }} onClick={event => { if (dialog.current && event.target === dialog.current) { const rect = dialog.current.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) requestClose(); } }} className={`fixed inset-0 m-auto h-dvh max-h-dvh w-full max-w-none overflow-auto overscroll-contain border-0 bg-surface p-0 text-ink backdrop:bg-black/45 tablet:h-auto tablet:max-h-[calc(100dvh-48px)] tablet:rounded-page tablet:border tablet:border-line ${large ? 'tablet:w-[min(820px,calc(100%-40px))]' : 'tablet:w-[min(560px,calc(100%-40px))]'}`}>
    <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-surface px-5 py-4 tablet:px-7">
      <div><p className="text-[12px] font-bold text-primary">TravelTaste</p><h2 id={titleId} className="mt-1 text-[22px] font-bold leading-[28px]">{confirmation?.title || title}</h2></div>
      <button type="button" aria-label="Đóng popup" onClick={requestClose} className="shrink-0 rounded-button bg-pale px-3 py-2 text-[13px] text-primary">Đóng</button>
    </div>
    <div className="p-5 tablet:p-7">
      {confirmation && <section aria-label="Xác nhận thao tác"><p className="text-[15px] text-muted">{confirmation.message}</p><div className="mt-6 flex flex-wrap justify-end gap-3"><button type="button" data-cancel-confirmation onClick={() => { confirmation.onCancel?.(); confirm(null); }} className="rounded-button bg-pale px-4 py-3 text-[14px] text-primary">Tiếp tục chỉnh sửa</button><button type="button" onClick={() => { const callback = confirmation.onConfirm; confirm(null); callback?.(); }} className="rounded-button bg-primary px-4 py-3 text-[14px] font-bold text-white">Xác nhận</button></div></section>}
      <div hidden={!!confirmation}>{children}</div>
      {!confirmation && <div className="mt-5 flex justify-end"><button type="button" onClick={requestClose} className="rounded-button bg-pale px-4 py-3 text-[14px] text-primary">Hủy</button></div>}
      {!confirmation && <p className="mt-6 border-t border-line pt-4 text-[12px] text-muted">Thay đổi được lưu khi máy chủ xác nhận thành công.</p>}
    </div>
  </dialog>;
}
