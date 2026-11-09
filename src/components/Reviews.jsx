import { getContent } from '../data/content.js';
import SplitWords from './SplitWords.jsx';
import { reviews } from '../data/reviews.js';
import ContactLink from './ContactLink.jsx';
import Icon from './Icon.jsx';

export default function Reviews() {
  return <section className="section container" id="reviews" aria-labelledby="reviews-title">
    <div className="section-heading" data-reveal><div><p className="eyebrow">Обратная связь</p><SplitWords as="h2" id="reviews-title" text={getContent().reviews.title} />
      <p>{getContent().reviews.subtitle}</p></div><span className="source-badge">Источник: 2GIS</span></div>
    {reviews.length ? <div className="reviews-grid">{reviews.map((review, index) => <figure className="review-card" data-reveal data-reveal-order={index} key={review.reviewId || review.sourceUrl + review.author}>
      <figcaption className="review-person">
        <span className="review-avatar review-initials" aria-hidden="true">{review.author.split(' ').map(part => part[0]).slice(0,2).join('')}</span>
        <div className="review-person-info"><strong>{review.author}</strong><span>Отзыв в 2GIS</span>
          {review.date && <time dateTime={review.date}>{new Intl.DateTimeFormat('ru-RU', { day:'numeric', month:'long', year:'numeric', timeZone:'UTC' }).format(new Date(review.date))}</time>}
        </div>
      </figcaption>
      {review.rating && <span className="review-rating" role="img" aria-label={'Оценка автора в 2GIS: ' + review.rating + ' из 5'}>
        <span aria-hidden="true">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
      </span>}
      <blockquote>{review.excerpt}</blockquote>
      <ContactLink type="reviews" href={review.sourceUrl} showIcon={false} className="review-source-link" location="review_source">Оригинал в 2GIS <Icon name="ArrowUpRight" size={15} /></ContactLink>
    </figure>)}</div>
      : <div className="reviews-source"><div className="reviews-icon"><Icon name="MessageCircle" size={34} /></div><div><h3>Посмотрите отзывы о PRIME IT</h3>
        <p>Откройте PRIME IT в 2GIS: там можно прочитать отзывы и узнать о впечатлениях клиентов.</p></div><ContactLink type="reviews" className="button button-secondary" location="reviews" /></div>}
    {reviews.length > 0 && <ContactLink type="reviews" className="text-link" location="reviews" />}
    <div className="reviews-followup"><span>Остались вопросы о вашей технике?</span><ContactLink className="text-link" location="after_reviews">Обсудить проблему</ContactLink></div>
  </section>;
}
