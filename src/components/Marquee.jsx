// Бегущая лента-лозунг (как «All work & no play —» у Work Louder).
export default function Marquee({ items, tone = 'accent', label }) {
  const row = items.flatMap(item => [item, '—']);
  return <div className={'marquee marquee--' + tone} aria-label={label || items.join(', ')} role="note">
    <div className="marquee-track" aria-hidden="true">{[0, 1].map(copy => <div key={copy}>{row.map((item, i) => <span key={i}>{item}</span>)}</div>)}</div>
  </div>;
}
