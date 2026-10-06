import { useRef } from 'react';
import Hero from '../components/Hero.jsx';
import TrustBar from '../components/TrustBar.jsx';
import Symptoms from '../components/Symptoms.jsx';
import Services from '../components/Services.jsx';
import Pricing from '../components/Pricing.jsx';
import RepairProcess from '../components/RepairProcess.jsx';
import Reviews from '../components/Reviews.jsx';
import Licenses from '../components/Licenses.jsx';
import FAQ from '../components/FAQ.jsx';
import Location from '../components/Location.jsx';
import useScrollReveal from '../hooks/useScrollReveal.js';
import { faq } from '../data/faq.js';

export default function Home({ symptom, onSymptomSelect, message, context }) {
  const rootRef = useRef(null);
  useScrollReveal(rootRef);
  return <main id="main" ref={rootRef} className="home-page">
    <Hero message={message} context={context} />
    <TrustBar />
    <Symptoms selected={symptom} onSelect={onSymptomSelect} />
    <RepairProcess message={message} context={context} />
    <Services /><Pricing /><Reviews /><Licenses />
    <FAQ items={faq} message={message} context={context} />
    <Location message={message} context={context} />
  </main>;
}
