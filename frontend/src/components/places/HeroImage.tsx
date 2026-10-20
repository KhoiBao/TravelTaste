export default function HeroImage({ src, alt }: {src: string; alt: string}) {
  return <img src={src} alt={alt} width="900" height="165" fetchPriority="high" className="h-[165px] w-full max-w-[900px] rounded-card object-cover" />;
}
