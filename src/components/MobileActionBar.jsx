import ContactLink from './ContactLink.jsx';
export default function MobileActionBar() {
  return <aside className="mobile-action-bar" aria-label="Быстро связаться с PRIME IT">
    <ContactLink className="button button-primary" location="mobile_bar">WhatsApp</ContactLink>
    <ContactLink type="phone" className="button button-secondary" location="mobile_bar">Позвонить</ContactLink>
  </aside>;
}
