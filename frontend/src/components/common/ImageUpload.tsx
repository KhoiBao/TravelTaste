import type {ChangeEvent} from 'react';
import type {ReviewImage} from '../../types/domain';
import { useId, useState } from 'react';
import {api} from '../../services/api';

export default function ImageUpload({ images, onChange, max = 5, label = 'Ảnh đính kèm' }: {images: ReviewImage[]; onChange: (images: ReviewImage[]) => void; max?: number; label?: string}) {
  const id = useId();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function select(event: ChangeEvent<HTMLInputElement>) {
    const files = [...(event.target.files || [])];
    event.target.value = '';
    if (images.length + files.length > max) { setError(`Chọn tối đa ${max} ảnh.`); return; }
    if (files.some(file => !['image/png', 'image/jpeg'].includes(file.type) || file.size > 5 * 1024 * 1024)) { setError('Chỉ nhận PNG, JPG, tối đa 5 MB mỗi ảnh.'); return; }
    setBusy(true); setError('');
    try {
      const next: ReviewImage[] = [];
      for (const file of files) { const result = await api.upload(file); next.push({src: result.url, name: file.name}); }
      onChange([...images, ...next]);
    } catch (error) { setError(error instanceof Error ? error.message : 'Không tải được ảnh. Vui lòng chọn lại.'); } finally { setBusy(false); }
  }
  return <div className="flex flex-col items-start gap-3"><label htmlFor={id} className="text-[13px] text-ink">{label} <span className="text-muted">(PNG/JPG, tối đa {max} ảnh)</span></label><input id={id} type="file" accept="image/png,image/jpeg" multiple={max > 1} onChange={select} disabled={busy || images.length >= max} className="w-full max-w-full text-[13px] file:mr-3 file:rounded-button file:border-0 file:bg-pale file:px-3 file:py-2 file:text-primary" />{busy && <p role="status" className="text-[13px] text-muted">Đang tải ảnh lên máy chủ…</p>}{error && <p role="alert" className="text-[13px] text-ink">{error}</p>}<div className="flex flex-wrap gap-3">{images.map((image, index) => <figure key={`${index}-${image.name}`} className="w-28"><img src={image.src} alt={image.name || `Ảnh đính kèm ${index + 1}`} className="h-20 w-28 rounded-card object-cover" /><button type="button" className="mt-2 text-[12px] text-primary underline" onClick={() => onChange(images.filter((_, itemIndex) => itemIndex !== index))}>Bỏ ảnh {index + 1}</button></figure>)}</div></div>;
}
