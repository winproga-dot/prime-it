import { brand } from '../data/brand.js';
import { messages, whatsappUrl } from '../utils/whatsapp.js';
import { track } from '../utils/analytics.js';
import { getAdSource } from '../utils/adSource.js';
import Icon from './Icon.jsx';
export default function ContactLink({ type = 'whatsapp', message = messages.hero,
  children, className = '', location = 'content', context, showIcon = true, ...props }) {
  const links = {
    whatsapp: { href: whatsappUrl(message), event: 'whatsapp_click', icon: 'MessageCircle', label: 'WhatsApp' },
    phone: { href: 'tel:' + brand.phoneTel, event: 'phone_click', icon: 'Phone', label: 'Позвонить' },
    route: { href: brand.routeUrl, event: 'route_click', icon: 'MapPin', label: 'Построить маршрут' },
    reviews: { href: brand.twoGisReviewsUrl || brand.twoGisUrl,
      event: 'review_2gis_click', icon: 'ArrowUpRight',
      label: 'Смотреть все отзывы в 2GIS' },
  };
  const link = links[type];
  return <a href={link.href} className={className}
    {...((type === 'route' || type === 'reviews') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    onClick={event => {
      const ad = getAdSource();
      // Пришёл с рекламы — подписываем в сообщении, откуда клиент узнал о PRIME IT.
      if (ad && type === 'whatsapp') event.currentTarget.href = whatsappUrl(message + '\n\nОткуда узнали: ' + ad.label);
      const source = ad ? { ad_source: ad.source } : {};
      if (context?.service) track('service_click', { service: context.service, location, ...source });
      track(link.event, { location, ...context, ...source });
    }} {...props}>{showIcon && <Icon name={link.icon} />}{typeof children === 'string' || !children ? <span>{children || link.label}</span> : children}</a>;
}
