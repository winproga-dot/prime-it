import Icon from './Icon.jsx';
const items = [
  { icon: 'Search', title: 'Бесплатная диагностика', text: 'Определим причину и согласуем ремонт.' },
  { icon: 'ShieldCheck', title: 'Гарантия до 3 месяцев', text: 'На работы. На запчасти — гарантия поставщика.' },
  { icon: 'Clock3', title: 'Ремонт от 1 часа', text: 'Для установки Windows и простых работ. Срок уточним.' },
  { icon: 'MapPin', title: 'Выезд на дом и в офис', text: 'Мастер приедет в удобное время по Алматы.' },
];
export default function TrustBar() {
  return <section className="container trust-bar" aria-label="Преимущества PRIME IT" id="benefits">
    {items.map(item => <div className="trust-item" key={item.title} data-reveal><Icon name={item.icon} size={24} />
      <div><strong>{item.title}</strong><p>{item.text}</p></div></div>)}
  </section>;
}
