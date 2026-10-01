import { reviews } from '../data/reviews.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';
export default function Reviews() {
  return <section className="section container" id="reviews" aria-labelledby="reviews-title">
    <div className="section-heading"><div><p className="eyebrow">Обратная связь</p><h2 id="reviews-title">Отзывы клиентов PRIME IT</h2>
      <p>Мнение клиентов о ремонте и обслуживании — в 2GIS.</p></div><span className="source-badge">Источник: 2GIS</span></div>
    {reviews.length ? <div className="reviews-grid">{reviews.map(review => <figure className="review-card" key={review.sourceUrl + review.author}>
      <blockquote>{review.excerpt}</blockquote><figcaption><strong>{review.author}</strong>{review.date && <time dateTime={review.date}>{new Intl.DateTimeFormat('ru-RU', { timeZone:'UTC' }).format(new Date(review.date))}</time>}
        <ContactLink type="reviews" href={review.sourceUrl} showIcon={false} location="review_source">Оригинал в 2GIS <Icon name="ArrowUpRight" size={15} /></ContactLink></figcaption></figure>)}</div>
      : <div className="reviews-source"><div className="reviews-icon"><Icon name="MessageCircle" size={34} /></div><div><h3>Посмотрите отзывы перед визитом</h3>
        <p>Откройте PRIME IT в 2GIS: там можно прочитать отзывы и узнать о впечатлениях клиентов.</p></div><ContactLink type="reviews" className="button button-secondary" location="reviews" /></div>}
    {reviews.length > 0 && <ContactLink type="reviews" className="text-link" location="reviews" />}
    <div className="reviews-followup"><span>Остались вопросы о вашей технике?</span><ContactLink className="text-link" location="after_reviews">Обсудить проблему</ContactLink></div>
  </section>;
}
