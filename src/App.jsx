import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import MobileActionBar from './components/MobileActionBar.jsx';
import Home from './pages/Home.jsx';
import ServicePage from './pages/ServicePage.jsx';
import NotFound from './pages/NotFound.jsx';
import { pageForPath } from './data/services.js';
import useLegacyLinks from './hooks/useLegacyLinks.js';
export default function App({ pathname = '/' }) {
  const home = pathname === '/';
  const page = pageForPath(pathname);
  useLegacyLinks();
  return <><a className="skip-link" href="#main">Перейти к содержимому</a><Header home={home} />
    {home ? <Home /> : page ? <ServicePage page={page} /> : <NotFound />}
    <Footer /><MobileActionBar /></>;
}
