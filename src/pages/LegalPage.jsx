export default function LegalPage({ page }) {
  return <main id="main" className="container legal-page">
    <nav className="breadcrumbs" aria-label="Хлебные крошки"><ol><li><a href="/">Главная</a></li><li aria-current="page">{page.breadcrumb}</li></ol></nav>
    <h1>{page.h1}</h1>
    <dl className="legal-table">{page.table.map(([term, value]) => <div key={term}><dt>{term}</dt><dd>{value}</dd></div>)}</dl>
    {page.sections.map(section => <section key={section.h}><h2>{section.h}</h2>{section.p.map(text => <p key={text}>{text}</p>)}</section>)}
  </main>;
}
