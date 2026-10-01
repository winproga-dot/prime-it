import Icon from './Icon.jsx';
const steps = [
  { number:'01', icon:'MessageCircle', title:'Расскажите о проблеме', text:'Напишите в WhatsApp, позвоните или приезжайте в сервис.' },
  { number:'02', icon:'Search', title:'Бесплатная диагностика', text:'Определим неисправность, сообщим стоимость и срок.' },
  { number:'03', icon:'CheckCircle2', title:'Ремонт по согласованию', text:'После вашего согласия выполним работу и проверим устройство.' },
];
export default function RepairProcess() {
  return <section className="section container" aria-labelledby="process-title"><div className="section-heading"><div><p className="eyebrow">Без лишней неопределённости</p>
    <h2 id="process-title">Как проходит ремонт</h2></div><span className="section-index" aria-hidden="true">03 / ПРОЦЕСС</span></div>
    <ol className="process-grid">{steps.map(step => <li key={step.number}><div className="process-top"><span>{step.number}</span><Icon name={step.icon} size={25} /></div>
      <h3>{step.title}</h3><p>{step.text}</p></li>)}</ol>
  </section>;
}
