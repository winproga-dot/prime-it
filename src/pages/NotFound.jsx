import ContactLink from '../components/ContactLink.jsx';
export default function NotFound() {
  return <main id="main" className="container not-found"><p className="eyebrow">PRIME IT · 404</p><h1>Страница не найдена</h1>
    <p>Услуга могла переехать. Все направления ремонта собраны на главной странице.</p>
    <div className="hero-actions"><a href="/" className="button button-secondary">На главную</a><ContactLink className="button button-primary" location="404">Спросить в WhatsApp</ContactLink></div></main>;
}
