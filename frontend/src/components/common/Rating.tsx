export default function Rating({ value, count, className = '' }: {value: number; count: number; className?: string}) {
  return (
    <p className={`text-[12px] leading-[normal] text-muted ${className}`} aria-label={`${value} trên 5 sao, ${count} đánh giá`}>
      <span aria-hidden="true">★ {value} &nbsp;·&nbsp; {count} đánh giá</span>
    </p>
  );
}
