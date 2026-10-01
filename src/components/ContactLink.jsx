import { brand } from '../data/brand.js';
import { messages, whatsappUrl } from '../utils/whatsapp.js';
import { track } from '../utils/analytics.js';
import Icon from './Icon.jsx';
export default function ContactLink({ type = 'whatsapp', message = messages.hero,
  children, className = '', location = 'content', context, showIcon = true, ...props }) {
  const links = {
    whatsapp: { href: whatsappUrl(message), event: 'whatsapp_click', icon: 'MessageCircle', label: 'WhatsApp' },
    phone: { href: 'tel:' + brand.phoneTel, event: 'phone_click', icon: 'Phone', label: 'Позвонить' },
    route: { href: brand.routeUrl, event: 'route_click', icon: 'MapPin', label: 'Построить маршрут' },
    reviews: { href: brand.twoGisUrl ? brand.twoGisUrl + '/tab/reviews' : brand.twoGisSearch,
      event: 'review_2gis_click', icon: 'ArrowUpRight',
      label: brand.twoGisUrl ? 'Смотреть все отзывы в 2GIS' : 'Найти PRIME IT в 2GIS' },
  };
  const link = links[type];
  return <a href={link.href} className={className}
    {...((type === 'route' || type === 'reviews') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    onClick={() => {
      if (context?.service) track('service_click', { service: context.service, location });
      track(link.event, { location, ...context });
    }} {...props}>{showIcon && <Icon name={link.icon} />}{typeof children === 'string' || !children ? <span>{children || link.label}</span> : children}</a>;
}
