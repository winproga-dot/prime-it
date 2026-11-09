import { getContent } from '../data/content.js';
import { useRef } from 'react';
import Hero from '../components/Hero.jsx';
import Marquee from '../components/Marquee.jsx';
import Symptoms from '../components/Symptoms.jsx';
import Showcase from '../components/Showcase.jsx';
import PriceBook from '../components/PriceBook.jsx';
import RepairProcess from '../components/RepairProcess.jsx';
import Reviews from '../components/Reviews.jsx';
import Licenses from '../components/Licenses.jsx';
import FAQ from '../components/FAQ.jsx';
import Location from '../components/Location.jsx';
import useScrollReveal from '../hooks/useScrollReveal.js';
import { faq } from '../data/faq.js';
import { brand } from '../data/brand.js';

// Порядок по воронке: оффер → доверие → вход через проблему → главные услуги →
// все цены → отзывы → как работаем → вопросы → призыв.
export default function Home({ symptom, onSymptomSelect, message, context }) {
  const rootRef = useRef(null);
  useScrollReveal(rootRef);
  return <main id="main" ref={rootRef} className="home-page">
    <Hero message={message} context={context} />
    <Marquee items={getContent().marquee.items.filter(Boolean)} label="Преимущества PRIME IT" />
    <Symptoms selected={symptom} onSelect={onSymptomSelect} />
    <Showcase />
    <PriceBook />
    <Licenses />
    <Reviews />
    <RepairProcess compact message={message} context={context} />
    <FAQ items={faq} message={message} context={context} />
    <Marquee tone="outline" items={['Мастер приедет сам', 'PRIME IT®', brand.serviceType]} />
    <Location message={message} context={context} />
  </main>;
}
