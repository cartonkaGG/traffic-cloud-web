export default function HeroAmbient() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <div className="hero-aurora absolute inset-0 opacity-65" />
      <div className="hero-ambient-glow hero-ambient-glow--cyan" />
      <div className="hero-ambient-glow hero-ambient-glow--indigo" />
    </div>
  );
}
