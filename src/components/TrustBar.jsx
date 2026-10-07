import Icon from './Icon.jsx';
const items = [
  { icon: 'Search', title: 'Бесплатная диагностика', text: 'Определим причину и согласуем ремонт.' },
  { icon: 'ShieldCheck', title: 'Гарантия до 3 месяцев', text: 'На работы. На запчасти — гарантия поставщика.' },
  { icon: 'Clock3', title: 'Ремонт от 1 часа', text: 'Для установки Windows и простых работ. Срок уточним.' },
  { icon: 'MapPin', title: 'Сервис и выезд', text: 'Время приёма или выезда согласуем по звонку.' },
];
export default function TrustBar() {
  return <section className="container trust-bar" aria-label="Преимущества PRIME IT" id="benefits">
    {items.map(item => <div className="trust-item" key={item.title}><Icon name={item.icon} size={24} />
      <div><strong>{item.title}</strong><p>{item.text}</p></div></div>)}
  </section>;
}
