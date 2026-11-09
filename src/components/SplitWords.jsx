// Пословное появление (приём Work Louder): каждое слово поднимается на 40px
// и проявляется из размытия 10px, слова идут друг за другом.
// load — анимация сразу при загрузке (CSS, без JS); иначе — при прокрутке (useScrollReveal).
export default function SplitWords({ text, as: Tag = 'span', className = '', load = false, delay = 0, children, ...rest }) {
  let index = 0;
  const words = part => part.split(/(\s+)/).map((chunk, i) => /^\s+$/.test(chunk) ? ' '
    : <span className="w" key={i} style={{ '--i': index++ }}>{chunk}</span>);
  const parts = Array.isArray(text) ? text : [text];
  return <Tag {...rest} className={(className + ' split ' + (load ? 'split-load' : '')).trim()} data-split={load ? undefined : ''} style={{ '--d': delay + 'ms' }}>
    {parts.map((part, i) => typeof part === 'string' ? <span key={i}>{words(part)}</span> : <span key={i} className={part.className}>{words(part.text)}</span>)}
    {children}
  </Tag>;
}
