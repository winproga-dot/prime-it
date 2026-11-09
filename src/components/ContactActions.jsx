import ContactLink from './ContactLink.jsx';
export default function ContactActions({ message, context, location = 'hero' }) {
  return <div className="hero-actions">
    <ContactLink className="button button-primary" message={message} context={context} location={location}>Узнать стоимость в WhatsApp</ContactLink>
    <ContactLink type="phone" className="button button-secondary" location={location} context={context}>Вызвать мастера</ContactLink>
  </div>;
}
