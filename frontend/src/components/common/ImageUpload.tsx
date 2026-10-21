import type {ChangeEvent, DragEvent} from 'react';
import type {ReviewImage} from '../../types/domain';
import { useId, useState } from 'react';
import {api} from '../../services/api';

export default function ImageUpload({ images, onChange, max = 5, label = 'Ảnh đính kèm' }: {images: ReviewImage[]; onChange: (images: ReviewImage[]) => void; max?: number; label?: string}) {
  const id = useId();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [dragging, setDragging] = useState(false);

  async function addFiles(files: File[]) {
    if (!files.length) return;
    if (images.length + files.length > max) { setError(`Chọn tối đa ${max} ảnh.`); return; }
    if (files.some(file => !['image/png', 'image/jpeg'].includes(file.type) || file.size > 5 * 1024 * 1024)) { setError('Chỉ nhận PNG, JPG, tối đa 5 MB mỗi ảnh.'); return; }
    setBusy(true); setError('');
    try {
      const next: ReviewImage[] = [];
      for (const file of files) { const result = await api.upload(file); next.push({src: result.url, name: file.name}); }
      onChange([...images, ...next]);
    } catch (error) { setError(error instanceof Error ? error.message : 'Không tải được ảnh. Vui lòng chọn lại.'); } finally { setBusy(false); }
  }
  function select(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files || [])];
    event.target.value = '';
    void addFiles(files);
  }
  function drop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault(); setDragging(false);
    if (busy || images.length >= max) return;
    void addFiles([...event.dataTransfer.files]);
  }
  const full = images.length >= max;

  return <div className="flex min-w-0 flex-col gap-2">
    <span className="text-[13px] font-medium text-ink">{label} <span className="font-normal text-muted">(tối đa {max} ảnh)</span></span>
    <div onDragOver={event => { event.preventDefault(); if (!full && !busy) setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop} className={`rounded-card border border-dashed p-3 transition-colors ${dragging ? 'border-primary bg-pale/60' : 'border-line bg-canvas/60'}`}>
      {images.length === 0
        ? <label htmlFor={id} className="flex min-h-[128px] cursor-pointer flex-col items-center justify-center gap-2 rounded-button px-4 py-5 text-center hover:bg-pale/50">
          <svg viewBox="0 0 24 24" aria-hidden="true" className="h-8 w-8 text-primary" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m0 0L8 8m4-4 4 4" /><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg>
          <span className="text-[13px] font-medium text-ink">Kéo thả ảnh vào đây hoặc <span className="text-primary">chọn ảnh</span></span>
          <span className="text-[11px] text-muted">PNG, JPG · tối đa 5 MB mỗi ảnh · {max} ảnh</span>
        </label>
        : <div className="flex flex-wrap items-center gap-3">
          {images.map((image, index) => <figure key={`${index}-${image.name}`} className="relative h-20 w-20 shrink-0">
            <img src={image.src} alt={image.name || `Ảnh đính kèm ${index + 1}`} className="h-full w-full rounded-button border border-line object-cover" />
            <button type="button" aria-label={`Xóa ảnh ${index + 1}`} onClick={() => onChange(images.filter((_, itemIndex) => itemIndex !== index))} className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-white shadow-sm hover:bg-danger"><svg viewBox="0 0 20 20" aria-hidden="true" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 5l10 10M15 5 5 15" /></svg></button>
          </figure>)}
          {!full && <label htmlFor={id} className={`flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-button border border-dashed border-line bg-surface text-primary hover:border-primary hover:bg-pale/50 ${busy ? 'pointer-events-none opacity-60' : ''}`}>
            <span className="text-[20px] leading-none" aria-hidden="true">+</span>
            <span className="text-[11px] font-medium">Thêm ảnh</span>
          </label>}
        </div>}
    </div>
    <input id={id} type="file" accept="image/png,image/jpeg" multiple={max > 1} onChange={select} disabled={busy || full} className="sr-only" />
    {busy && <p role="status" className="text-[12px] text-muted">Đang tải ảnh lên máy chủ…</p>}
    {error && <p role="alert" className="text-[12px] text-danger">{error}</p>}
  </div>;
}
