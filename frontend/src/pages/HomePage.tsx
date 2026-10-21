import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import DestinationCard from '../components/place/DestinationCard';
import { useApp } from '../state/AppContext';
import hero from '../assets/images/travel-hero.png';

export default function HomePage() {
  const { activePlaces } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  function search(event: FormEvent) {event.preventDefault(); navigate(`/search?q=${encodeURIComponent(query.trim())}`);}
  return <PublicLayout node="39:2">
    <section className="w-full space-y-6 py-3"><div><h1 className="text-[28px] font-bold leading-tight tablet:text-4xl">Đi đâu, ăn gì? Bắt đầu từ đây.</h1><p className="mt-3 text-[15px] leading-relaxed text-muted">Khám phá điểm đến, tìm món ngon và đọc trải nghiệm từ cộng đồng.</p></div>
      <div className="relative isolate flex min-h-[340px] flex-col justify-between gap-8 overflow-hidden rounded-[20px] p-5 tablet:min-h-[300px] tablet:p-8">
        <img src={hero} alt="Vịnh Hạ Long dưới ánh hoàng hôn" width={1108} height={300} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-linear-to-r from-black/45 via-black/10 to-transparent" />
        <h2 className="text-[26px] font-bold leading-snug text-white tablet:text-4xl">Một hành trình mới.<br />Ngàn trải nghiệm đáng nhớ.</h2>
        <form onSubmit={search} role="search" className="flex flex-col gap-3 rounded-[14px] bg-surface p-3 tablet:mx-4 tablet:flex-row tablet:items-center tablet:gap-6 tablet:pl-6"><label className="min-w-0 flex-1"><span className="text-[10px] font-bold text-primary">BẠN MUỐN KHÁM PHÁ ĐÂU?</span><input type="search" aria-label="Tìm địa điểm" value={query} onChange={event => setQuery(event.target.value)} placeholder="Địa điểm, thành phố hoặc món ăn…" className="mt-1 block min-h-7 w-full min-w-0 bg-transparent text-[15px] text-ink placeholder:text-muted" /></label><button className="min-h-12 shrink-0 rounded-button bg-primary px-6 py-4 text-sm font-bold text-white hover:brightness-95">Tìm kiếm <span aria-hidden="true">→</span></button></form>
      </div>
    </section>
    <section className="my-3 w-full space-y-5" aria-labelledby="favorite-title"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 id="favorite-title" className="text-[25px] font-bold">Điểm đến được yêu thích</h2><p className="mt-2 text-[13px] text-muted">Gợi ý từ cộng đồng cho chuyến đi tiếp theo của bạn.</p></div><Link to="/top-10" className="text-sm font-bold text-primary hover:underline">Xem Top 10 →</Link></div><div className="grid gap-4 tablet:grid-cols-3">{activePlaces.slice(0, 3).map(place => <DestinationCard key={place.id} place={place} />)}</div></section>
  </PublicLayout>;
}
