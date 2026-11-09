import { messages } from '../utils/whatsapp.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
import SplitWords from './SplitWords.jsx';
// Витрина главных услуг: крупная фраза + фото + цена + «подробнее» (как продукты у Work Louder).
// Выбраны самые частые запросы: ремонт, перегрев, медленная работа, сборка ПК.
const items = [
  { id: 'repair', label: '01 / Ремонт', title: 'Не включается? Найдём причину на месте.', text: 'Ноутбуки и ПК: питание, плата, экран, клавиатура, петли. Мастер приедет домой или в офис.', price: 'Диагностика — бесплатно', path: '/remont-noutbukov-almaty/', image: 'repair', service: 'Ремонт компьютеров и ноутбуков' },
  { id: 'clean', label: '02 / Чистка', title: 'Греется и шумит? Остынет за 2 часа.', text: 'Чистка от пыли, замена термопасты и термопрокладок, проверка температур под нагрузкой.', price: 'от 8 000 ₸', path: '/chistka-noutbuka-almaty/', image: 'clean', service: 'Чистка и замена термопасты' },
  { id: 'speedup', label: '03 / Апгрейд', title: 'Тормозит? Поставим SSD — и полетит.', text: 'Подберём совместимые SSD и оперативную память, перенесём систему и файлы.', price: 'от 7 000 ₸', path: '/upgrade-noutbuka-kompyutera-almaty/', image: 'speedup', service: 'Ускорение ПК/ноутбука (SSD + ОЗУ)' },
  { id: 'build', label: '04 / Сборка', title: 'Игровой ПК мечты. С подсветкой.', text: 'Подбор комплектующих под задачи и бюджет, сборка, кабель-менеджмент, тесты.', price: 'от 16 000 ₸', path: '/sborka-kompyutera-almaty/', image: 'build', service: 'Сборка компьютера' },
];
export default function Showcase() {
  return <section className="section container showcase" id="services" aria-labelledby="showcase-title">
    <div className="section-heading"><div><p className="eyebrow">Что мы делаем</p>
      <SplitWords as="h2" id="showcase-title" text="Чиним, ускоряем, собираем." /></div></div>
    <div className="showcase-grid">{items.map((item, index) => <article key={item.id} className={'showcase-card' + (index % 3 === 0 ? ' is-wide' : '')} data-reveal data-reveal-order={index % 2}>
      <div className="showcase-media"><img src={'/media/' + item.image + '-960.webp'} srcSet={'/media/' + item.image + '-640.webp 640w, /media/' + item.image + '-960.webp 960w'}
        sizes="(max-width: 767px) 100vw, 60vw" width="960" height="600" alt="" loading="lazy" decoding="async" /></div>
      <div className="showcase-copy">
        <span className="mono">{item.label}</span>
        <SplitWords as="h3" text={item.title} />
        <p>{item.text}</p>
        <div className="showcase-foot"><strong>{item.price}</strong>
          <div className="showcase-actions">
            <ContactLink className="button button-primary" message={messages.service(item.service)} context={{ service: item.id }} location="showcase">Узнать цену</ContactLink>
            <a className="button button-ghost" href={item.path}>Подробнее <Icon name="ArrowUpRight" size={16} /></a>
          </div></div>
      </div>
    </article>)}</div>
  </section>;
}
