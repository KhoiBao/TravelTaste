import {useState, type MouseEvent} from 'react';
import {useNavigate} from 'react-router-dom';
import {useApp} from '../../state/AppContext';

type LikeTarget = {id: string; name: string; liked: boolean; likeCount: number};

/**
 * Nút lưu (yêu thích) một địa điểm. Đọc trạng thái mới nhất từ context để luôn khớp với máy chủ.
 */
export default function LikeButton({place, variant = 'icon'}: {place: LikeTarget; variant?: 'icon' | 'full'}) {
  const {data, role, execute} = useApp();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const live = data.places.find(item => item.id === place.id);
  const liked = live ? live.liked : place.liked;
  const likeCount = live ? live.likeCount : place.likeCount;
  const name = live ? live.name : place.name;
  const label = `${liked ? 'Bỏ yêu thích' : 'Yêu thích'} ${name}`;

  async function toggle(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    if (role === 'GUEST') { navigate('/login'); return; }
    if (busy) return;
    setBusy(true);
    try {
      const result = await execute({type: 'TOGGLE_LIKE', id: place.id, liked: !liked});
      if (!result.ok) window.dispatchEvent(new CustomEvent('traveltaste:notice', {detail: result}));
    } finally { setBusy(false); }
  }

  const heart = <svg viewBox="0 0 24 24" aria-hidden="true" className={`h-4 w-4 ${liked ? 'fill-danger stroke-danger' : 'fill-none stroke-current'}`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" /></svg>;

  if (variant === 'full') {
    return <button type="button" onClick={toggle} disabled={busy} aria-pressed={liked} aria-label={label} title={liked ? 'Bỏ lưu địa điểm' : 'Lưu địa điểm'} className="inline-flex min-h-11 items-center gap-2 rounded-button border border-line bg-surface px-4 text-[13px] font-bold text-ink hover:bg-pale disabled:opacity-60">
      {heart}<span>{liked ? 'Đã lưu' : 'Lưu địa điểm'}</span>
      <span aria-label={`${likeCount} lượt yêu thích`} className="rounded-pill bg-pale px-2 py-0.5 text-[11px] text-primary">{likeCount}</span>
    </button>;
  }

  return <button type="button" onClick={toggle} disabled={busy} aria-pressed={liked} aria-label={label} title={liked ? 'Bỏ lưu địa điểm' : 'Lưu địa điểm'} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/95 text-ink shadow-sm transition-colors hover:bg-surface disabled:opacity-60">{heart}</button>;
}
