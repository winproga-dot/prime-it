import { useState } from 'react';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import MobileActionBar from './components/MobileActionBar.jsx';
import Home from './pages/Home.jsx';
import ServicePage from './pages/ServicePage.jsx';
import NotFound from './pages/NotFound.jsx';
import { pageForPath } from './data/services.js';
import { messages } from './utils/whatsapp.js';
import useLegacyLinks from './hooks/useLegacyLinks.js';
export default function App({ pathname = '/' }) {
  const home = pathname === '/';
  const page = pageForPath(pathname);
  const [symptom, setSymptom] = useState('');
  const message = page ? messages.service(page.h1) : symptom ? messages.symptom(symptom) : messages.hero;
  const context = page ? { service:page.slug } : symptom ? { symptom } : undefined;
  useLegacyLinks();
  return <><a className="skip-link" href="#main">Перейти к содержимому</a>
    <Header home={home} localSections={Boolean(page)} message={message} context={context} />
    {home ? <Home symptom={symptom} onSymptomSelect={setSymptom} message={symptom ? message : undefined} context={context} /> : page ? <ServicePage page={page} /> : <NotFound />}
    <Footer /><MobileActionBar message={message} context={context} /></>;
}
