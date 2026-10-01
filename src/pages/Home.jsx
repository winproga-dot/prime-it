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
import { faq } from '../data/faq.js';
export default function Home({ symptom, onSymptomSelect }) {
  return <main id="main"><Hero /><TrustBar /><Symptoms selected={symptom} onSelect={onSymptomSelect} /><Services /><Pricing /><RepairProcess /><Reviews /><Licenses /><FAQ items={faq} /><Location /></main>;
}
