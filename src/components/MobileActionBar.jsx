import { useRef } from 'react';
import ContactLink from './ContactLink.jsx';
import useMeasuredHeight from '../hooks/useMeasuredHeight.js';
export default function MobileActionBar({ message, context }) {
  const barRef = useRef(null);
  useMeasuredHeight(barRef, '--mobile-action-height');
  return <nav ref={barRef} className="mobile-action-bar" aria-label="Быстрая связь с PRIME IT">
    <ContactLink className="button button-primary" location="mobile_bar" message={message} context={context}>WhatsApp</ContactLink>
    <ContactLink type="phone" className="button button-secondary" location="mobile_bar">Позвонить</ContactLink>
  </nav>;
}
