import React, { useMemo, useState, useRef } from "react";
import { Wrench, Cpu, ShieldCheck, Clock, Star, MessageSquare, CheckCircle2, Phone, MapPin, ChevronRight, Sparkles, Monitor, Laptop, HardDrive, Fan, Layers3, MousePointerClick } from "lucide-react";
import { KeyRound } from "lucide-react";

// ЛОГО: лежит в public/logo.jpg (можно сменить на .png)
const LOGO = "/logo.jpg";

const BRAND = {
  name: "PRIME IT",
  city: "Алматы",
  address: "Алматы, Ади Шарипова 100",
  phoneDisplay: "8 (707) 684-06-25",
  phoneTel: "+77076840625",
  whatsapp: "77076840625",
  whatsappPreset: "Здравствуйте! Хочу записаться на ремонт.",
  map2gis: "https://go.2gis.com/f7IzE",
};

const SERVICES = [
  { id:"winms", icon:Monitor, title:"Установка Windows и MS Office", desc:"Установлю Windows 10/11 с драйверами и необходимыми программами. Microsoft Office. Быстро, аккуратно, с сохранением ваших файлов. Срок: от 1 часа. Установку Office при необходимости делаем удалённо через AnyDesk.", price:10000, pricePrefix:"от", badge:"Популярно" },
  { id:"clean", icon:Fan, title:"Чистка от пыли и замена термопасты", desc:"Полная чистка ноутбука или ПК от пыли с разбором и заменой качественной термопасты (Arctic MX-4, Thermal Grizzly и др.). Срок: от 2 часов.", price:8000, pricePrefix:"от" },
  { id:"gpu_service", icon:Cpu, title:"Обслуживание видеокарт (GPU)", desc:"Чистка, замена термопасты и термопрокладок. GTX 10 / RTX 20–50 серия. Снижает температуры, повышает FPS. Рекомендуем 1 раз в год.", price:12000, pricePrefix:"от", priceNote:"до 22 000 — по модели" },
  { id:"data", icon:HardDrive, title:"Восстановление данных", desc:"Восстановлю удалённые или потерянные фото, документы и видео с флешек, HDD, карт памяти. Срок: 2–3 часа.", price:12000, pricePrefix:"от" },

  /* — поменяли местами: сначала ГРАФ. ПРОГРАММЫ, потом УСКОРЕНИЕ — */
  { id:"soft", icon:Layers3, title:"Установка графических программ (Autodesk, Adobe)", desc:"Установка и настройка AutoCAD, Revit, Photoshop, Illustrator, Premiere Pro и других. Срок: от 40 минут. Возможна удалённая установка через AnyDesk.", price:5000, pricePrefix:"от" },
  { id:"build", icon:Cpu, title:"Сборка компьютера", desc:"Соберу игровой, офисный или дизайнерский ПК под ваши задачи и бюджет. Установка и настройка всех программ. Срок: 1 день.", price:16000, pricePrefix:"от" },
  { id:"speedup", icon:Layers3, title:"Ускорение ПК/ноутбука (SSD + ОЗУ)", desc:"Подбор и установка SSD и оперативной памяти. Перенос системы, настройка, оптимизация.", price:7000, pricePrefix:"от" },

  { id:"parts", icon:Laptop, title:"Замена матрицы, клавиатуры, кулера", desc:"Профессиональная замена экрана, клавиатуры, вентилятора охлаждения на ноутбуках всех моделей.", price:10000, pricePrefix:"от", priceNote:"+ деталь" },
  { id:"hinge", icon:Laptop, title:"Ремонт петель ноутбука, замена корпуса", desc:"Ремонт или замена петель крышки, восстановление корпуса ноутбука после поломок. Срок: 1–2 дня.", price:8000, pricePrefix:"от" },
  { id:"battery", icon:HardDrive, title:"Замена батареи и зарядки", desc:"Замена аккумуляторов ноутбука и блоков питания. Срок: ~1 час при наличии детали.", price:5000, pricePrefix:"от", priceNote:"+ деталь" },
  { id:"misc", icon:Wrench, title:"Другие услуги", desc:"Настройка Wi-Fi, драйверов, печати, BIOS/UEFI, мелкий ремонт и пр.", price:5000, pricePrefix:"от" },
  { id:"sale", icon:Monitor, title:"Продажа ноутбуков и ПК", desc:"Подбор, тестирование и продажа ноутбуков и компьютеров. Установка Windows, Office и нужных программ в подарок. Срок: 1 день.", price:45000, pricePrefix:"от" },
];

const LICENSES = [
  { key:'windows', name:"Windows 10/11 (Home/Pro)", term:"Бессрочно", price:"16 000–19 000 ₸" },
  { key:'office', name:"Microsoft Office 2021/2024", term:"Бессрочно", price:"18 000–25 000 ₸" },
  { key:'autodesk', name:"Autodesk (AutoCAD, 3ds Max, Revit, Maya и др.)", term:"1 год", price:"40 000 ₸" },
  { key:'adobe', name:"Adobe Creative Cloud", term:"4 месяца", price:"40 000 ₸" },
  { key:'kaspersky', name:"Kaspersky (1–3 устройства)", term:"1–3 года", price:"6 500–20 000 ₸" },
  { key:'eset', name:"ESET NOD32 / Bitdefender", term:"1–3 устройства, 12 мес.", price:"по запросу" },
];

const BENEFITS = [
  { icon: ShieldCheck, title: "Гарантия до 3 мес.", text: "Официальные чек и гарантийный талон." },
  { icon: Clock, title: "Сроки от 1 часа", text: "Большинство работ в день обращения." },
  { icon: MapPin, title: `Выезд по городу ${BRAND.city}`, text: "Приезжаем домой или в офис по согласованию." },
  { icon: Wrench, title: "Делаем до конца", text: "Не уходим, пока всё не работает и клиент доволен." },
  { icon: Cpu, title: "Собираем ПК на любой вкус и бюджет", text: "С любыми комплектующими — дешевле не найдёте." },
  { icon: ShieldCheck, title: "Оплата после результата", text: "Оплачиваете, когда всё работает." },
];

const FAQ = [
  { q:"Что если проблему не удалось решить?", a:"Оплату за работу не берём. Обсудим альтернативы (замена детали, перенос данных) — любые расходы согласуем заранее." },
  { q:"Сколько стоит диагностика?", a:"Диагностика стоит 3000 ₸, но если остаётесь на ремонт — диагностика бесплатна и вы не платите за неё отдельно." },
  { q:"Сколько времени занимает ремонт?", a:"Простые работы — от 1 часа. Корпусные/сложные — 1–2 дня." },
  { q:"Даете ли вы гарантию?", a:"Да, гарантия на работы — до 3 мес. На запчасти — гарантия поставщика." },
  { q:"Можно ли вызвать мастера на дом?", a:`Да, по ${BRAND.city}. Ориентир +2000 ₸ к услуге.` },
];

function currency(n){ return new Intl.NumberFormat("ru-RU").format(n) + " ₸"; }

// Резервная картинка
function placeholder(text){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0ea5e9' offset='0'/><stop stop-color='#10b981' offset='1'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/><text x='50%' y='50%' font-family='Inter,Arial' font-size='20' fill='white' text-anchor='middle' dominant-baseline='middle'>${text}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
// Тематический запасной источник (если файлов нет)
function imgForService(id){
  const m = {
    winms:"windows,computer,setup", clean:"laptop,cleaning,fan", gpu_service:"graphics-card,gpu,pc",
    data:"data,recovery,hard-drive", speedup:"ssd,ram,upgrade", build:"gaming,pc,build",
    soft:"adobe,autocad,software", parts:"laptop,keyboard,screen", hinge:"laptop,hinge,repair",
    battery:"laptop,battery,charger", misc:"computer,service,tech", sale:"laptop,computer,sale"
  };
  const q = m[id] || "computer,repair";
  return `https://source.unsplash.com/640x420/?${q}`;
}
// === Картинки услуг из public/services с авто-поиском расширений ===
const SERVICE_EXTS = ["png", "webp", "jpg", "jpeg"];
const serviceSrcStart = (id) => `/services/${id}.${SERVICE_EXTS[0]}`;
const handleServiceError = (id) => (e) => {
  const el = e.currentTarget;
  const idx = Number(el.dataset.extIdx || 0);
  if (idx < SERVICE_EXTS.length - 1) {
    const nextIdx = idx + 1;
    el.dataset.extIdx = String(nextIdx);
    el.src = `/services/${id}.${SERVICE_EXTS[nextIdx]}`;
    return;
  }
  if (!el.dataset.triedUnsplash) {
    el.dataset.triedUnsplash = "1";
    el.src = imgForService(id);
    return;
  }
  el.onerror = null;
  el.src = placeholder(id);
};
// Иконка программы/лицензии (Windows/Office/Autodesk/Adobe и т.д.)
function ProgramIcon({ type }) {
  let classes = "h-8 w-8 rounded-lg flex items-center justify-center font-bold text-white ring-1 ";
  let label = "•";
  if (type === "windows") { classes += "bg-sky-500/30 ring-sky-400/40"; label = "W"; }
  else if (type === "office") { classes += "bg-orange-500/30 ring-orange-400/40"; label = "O"; }
  else if (type === "autodesk") { classes += "bg-teal-500/30 ring-teal-400/40"; label = "A"; }
  else if (type === "adobe") { classes += "bg-red-500/30 ring-red-400/40"; label = "A"; }
  else if (type === "kaspersky") { classes += "bg-green-500/30 ring-green-400/40"; label = "K"; }
  else if (type === "eset") { classes += "bg-cyan-500/30 ring-cyan-400/40"; label = "E"; }
  else { classes += "bg-white/10 ring-white/20"; label = "•"; }
  return <div className={classes} aria-label={type}>{label}</div>;
}

function ServiceCard({ s, selected, toggle, onImgError }) {
  return (
    <div className="min-w-[280px] md:min-w-0 rounded-3xl bg-white/5 ring-1 ring-white/10 p-5 flex flex-col">
      <div className="aspect-[16/9] rounded-xl overflow-hidden ring-1 ring-white/10 mb-3">
        <img
          src={`/services/${s.id}.png`}
          data-ext-idx="0"
          alt={s.title}
          loading="lazy"
          decoding="async"
          width="640" height="360"
          onError={onImgError(s.id)}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex items-center gap-3">
        <s.icon className="h-6 w-6"/>
        <div className="font-semibold leading-tight">{s.title}</div>
        {s.badge && (
          <span className="text-xs rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 ring-1 ring-emerald-400/30">
            {s.badge}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-white/70">{s.desc}</p>
      <div className="mt-4 flex items-center gap-2 text-base font-semibold">
        {s.pricePrefix && <span className="text-white/60">{s.pricePrefix}</span>}
        <span>{new Intl.NumberFormat("ru-RU").format(s.price)} ₸</span>
        {s.priceNote && <span className="text-xs text-white/60 ml-2">{s.priceNote}</span>}
      </div>
      <button
        onClick={() => toggle(s.id)}
        className={`mt-4 inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium ring-1 ring-white/15 ${
          selected.has(s.id) ? "bg-white text-slate-900" : "hover:bg-white/10"
        }`}
      >
        {selected.has(s.id) ? "В заказе" : "Добавить в заказ"}
      </button>
    </div>
  );
}

export default function Landing(){
  const [selected, setSelected] = useState(()=>new Set(["winms","clean"]));
  const [rush, setRush] = useState(false);
  const [onsite, setOnsite] = useState(false);
  const [showLicenses, setShowLicenses] = useState(false);
  const [showPromo, setShowPromo] = useState(true);

  const total = useMemo(()=> {
    let sum=0; for (const s of SERVICES) if (selected.has(s.id)) sum+=s.price;
    if (rush) sum = Math.round(sum*1.2);
    if (onsite) sum += 2000;
    function SliderMore({ list, selected, toggle, onImgError }) {
  const ref = useRef(null);
  const scroll = (dx) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dx, behavior: "smooth" });
  };
  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3">
        <div className="text-lg font-semibold text-white/90">Ещё услуги</div>
        <div className="hidden md:flex gap-2">
          <button onClick={() => scroll(-400)} className="rounded-xl border border-white/15 px-3 py-1 hover:bg-white/10">←</button>
          <button onClick={() => scroll(400)} className="rounded-xl border border-white/15 px-3 py-1 hover:bg-white/10">→</button>
        </div>
      </div>
      <div
        ref={ref}
        className="overflow-x-auto no-scrollbar flex gap-4 snap-x snap-mandatory"
      >
        {list.map((s) => (
          <div key={s.id} className="snap-start">
            <ServiceCard
              s={s}
              selected={selected}
              toggle={toggle}
              onImgError={onImgError}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

    return Math.max(sum,0);
  }, [selected,rush,onsite]);

  const toggle = (id)=>{ const next=new Set(selected); next.has(id)?next.delete(id):next.add(id); setSelected(next); };

  const whatsappLink = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
    `${BRAND.whatsappPreset}\n\nВыбранные услуги: ${[...selected].map(id=>SERVICES.find(s=>s.id===id)?.title).filter(Boolean).join(", ")||"—"}\nСрочно: ${rush?"да":"нет"}\nВыезд: ${onsite?"да":"нет"}\nИтого ориентир: ${currency(total)}\n\nИмя: `
  )}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
              <img src={LOGO} alt={BRAND.name} className="h-10 w-10 object-contain" />
            </span>
            <div>
              <div className="text-lg font-semibold">{BRAND.name}</div>
              <div className="text-xs text-white/60 flex items-center gap-1"><MapPin className="h-3 w-3"/>{BRAND.city}</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#services" className="hover:text-white/90 text-white/70">Услуги</a>
            <a href="#pricing" className="hover:text-white/90 text-white/70">Цены</a>
            <a href="#benefits" className="hover:text-white/90 text-white/70">Преимущества</a>
            <a href="#faq" className="hover:text-white/90 text-white/70">FAQ</a>
            <button onClick={()=>setShowLicenses(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-1 text-white/80 hover:text-white hover:bg-white/10"><KeyRound className="h-3 w-3"/> Лицензии</button>
          </nav>
          <div className="flex items-center gap-3">
            <a href={`tel:${BRAND.phoneTel}`} className="hidden sm:flex items-center gap-2 rounded-2xl border border-white/15 px-4 py-2 text-sm hover:bg-white/10"><Phone className="h-4 w-4"/> {BRAND.phoneDisplay}</a>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-medium hover:bg-emerald-400"><MessageSquare className="h-4 w-4"/> Написать в WhatsApp</a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-extrabold leading-tight">Ремонт ПК и ноутбуков в {BRAND.city}</h1>
          <p className="mt-4 text-white/70 text-base md:text-lg">Установим Windows, почистим от пыли, ускорим ноутбук SSD и решим любые проблемы с техникой. Честные цены и гарантия.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#pricing" className="inline-flex items-center gap-2 rounded-2xl bg-white text-slate-900 px-5 py-3 font-semibold">Посмотреть цены <ChevronRight className="h-4 w-4"/></a>
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-5 py-3 font-semibold hover:bg-white/10">Записаться в WhatsApp <MousePointerClick className="h-4 w-4"/></a>
          </div>
        </div>
        <div className="aspect-video rounded-3xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
          <img src="https://source.unsplash.com/960x600/?computer,repair,workshop" alt="Ремонт компьютеров" loading="lazy" onError={(e)=>{e.currentTarget.src=placeholder('PRIME IT'); e.currentTarget.onerror=null;}} className="w-full h-full object-cover"/>
        </div>
      </section>

      <section id="benefits" className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid md:grid-cols-4 gap-4">
          {BENEFITS.map((b,i)=>(
            <div key={i} className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
              <div className="flex items-center gap-3"><b.icon className="h-5 w-5"/><div className="font-semibold">{b.title}</div></div>
              <div className="mt-2 text-white/70 text-sm">{b.text}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="services" className="mx-auto max-w-7xl px-4 py-4 md:py-12">
  <div className="flex items-end justify-between gap-4">
    <h2 className="text-2xl md:text-3xl font-bold">Услуги</h2>
    <a href="#pricing" className="text-sm text-white/70 hover:text-white">Смотреть цены</a>
  </div>

  {/* ТОП-6 в сетке */}
  <div className="mt-6 grid md:grid-cols-3 gap-4">
    {SERVICES.slice(0, 6).map((s) => (
      <ServiceCard
        key={s.id}
        s={s}
        selected={selected}
        toggle={toggle}
        onImgError={handleServiceError}
      />
    ))}
  </div>

  {/* Остальные — горизонтальный слайдер */}
  {SERVICES.length > 6 && (
    <SliderMore
      list={SERVICES.slice(6)}
      selected={selected}
      toggle={toggle}
      onImgError={handleServiceError}
    />
  )}
</section>


      <section id="pricing" className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-3xl bg-white/5 ring-1 ring-white/10 p-6">
            <h3 className="text-xl md:text-2xl font-bold">Калькулятор стоимости</h3>
            <p className="mt-1 text-white/70 text-sm">Отметьте услуги — увидите ориентир. Итог фиксируем после диагностики.</p>
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              {SERVICES.map(s=>(
                <label key={s.id} className={`flex items-start gap-3 rounded-2xl p-3 ring-1 ring-white/10 bg-white/5 cursor-pointer ${selected.has(s.id) ? "outline outline-2 outline-white/30" : ""}`}>
                  <input type="checkbox" className="mt-1" checked={selected.has(s.id)} onChange={()=>toggle(s.id)} />
                  <div className="flex-1"><div className="font-medium leading-tight">{s.title}</div><div className="text-xs text-white/60">{s.pricePrefix?`${s.pricePrefix} `:""}{currency(s.price)}{s.priceNote?` • ${s.priceNote}`:""}</div></div>
                </label>
              ))}
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-3">
              <label className="flex items-center gap-3 rounded-2xl p-3 ring-1 ring-white/10 bg-white/5 cursor-pointer"><input type="checkbox" checked={rush} onChange={()=>setRush(!rush)} /><div><div className="font-medium">Срочно сегодня</div><div className="text-xs text-white/60">+20% к стоимости</div></div></label>
              <label className="flex items-center gap-3 rounded-2xl p-3 ring-1 ring-white/10 bg-white/5 cursor-pointer"><input type="checkbox" checked={onsite} onChange={()=>setOnsite(!onsite)} /><div><div className="font-medium">Выезд мастера</div><div className="text-xs text-white/60">+2000 ₸ по {BRAND.city}</div></div></label>
            </div>
            <div className="mt-6 flex items中心 justify-between rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
              <div><div className="text-sm text-white/60">Ориентировочная стоимость</div><div className="text-2xl font-extrabold">{currency(total)}</div></div>
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold hover:bg-emerald-400">Оформить заявку в WhatsApp <ChevronRight className="h-4 w-4"/></a>
            </div>
          </div>
          <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-6">
            <h3 className="text-xl font-bold">Почему {BRAND.name}</h3>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400"/> Оплата после результата.</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400"/> Делаем до конца — не уходим, пока всё не работает.</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400"/> Прозрачные цены — без скрытых платежей.</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 в-4 mt-0.5 text-emerald-400"/> Опыт в сборке и апгрейде игровых ПК.</li>
              <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400"/> Бережная разборка, фотоотчёт по желанию.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="licenses" className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold">Лицензионные ключи</h2>
        <p className="mt-1 text-white/70 text-sm">Windows, Office, Autodesk, Adobe, антивирусы — можем установить удалённо через AnyDesk.</p>
        <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {LICENSES.slice(0,5).map((l,i)=>(
            <div key={i} className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5 flex items-center gap-4">
              <ProgramIcon type={l.key}/>
              <div className="flex-1"><div className="font-semibold leading-tight">{l.name}</div><div className="text-xs text-white/60">Срок: {l.term}</div></div>
              <div className="text-sm text-white/80 w-28">{l.price}</div>
              <a href={`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(`Здравствуйте! Хочу купить лицензию: ${l.name} (${l.term}).`)}`} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold hover:bg-emerald-400">Заказать</a>
            </div>
          ))}
        </div>
      </section>

      <section id="guarantee" className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold">Гарантия и принципы работы</h2>
        <ul className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
          <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400"/> Делаем до конца — не уходим, пока всё не работает</li>
          <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400"/> Оплата после результата</li>
          <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400"/> Без навязывания лишних услуг</li>
          <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400"/> Фото/видео отчёт по желанию</li>
        </ul>
      </section>

      {/* ОТЗЫВЫ — горизонтальная прокрутка */}
      <section className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold">Отзывы клиентов</h2>
        <div className="mt-6 overflow-x-auto snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] no-scrollbar">
          <div className="flex gap-4">
            {[
              { name: "Акулина Романовна", text: "Муса — отличный специалист. Проблему выявил сразу, компьютер заработал. Рекомендую!", rating: 5 },
              { name: "Ринами́", text: "Качественно сделал работу и быстро ответил. За час диагностика и решение — 5 звёзд.", rating: 5 },
              { name: "Kudret Sultan", text: "Писал в 23:30 — ответили чётко по делу. Лучший!", rating: 5 },
              { name: "Куралай Байгожанова", text: "Быстро помогли с проблемой. Сервис и мастера своего дела!", rating: 5 },
              { name: "Aisana Azamat", text: "Устанавливала Office, Revit, AutoCAD удалённо — всё за считанные минуты.", rating: 5 },
              { name: "Sergey Batalov", text: "Чистка и замена термопасты — быстро и профессионально. Рекомендую.", rating: 5 },
              { name: "Нина Петрищева", text: "Срочно ночью исправили систему, все файлы сохранили. Однозначно рекомендую.", rating: 5 },
              { name: "Parizat Turganova", text: "Вечером установили Windows и программы, проблему со звуком решили быстро.", rating: 5 },
              { name: "John Tim", text: "Needed quick laptop service during my trip — very professional, highly recommend.", rating: 5 },
            ].map((r,i)=>(
              <div key={i} className="snap-start min-w-[280px] md:min-w-[32%] rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
                <div className="flex items-center gap-2">
                  {Array.from({length:r.rating}).map((_,j)=>(<Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400"/>))}
                </div>
                <p className="mt-3 text-sm text-white/80">{r.text}</p>
                <div className="mt-4 text-sm text-white/60">— {r.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-7xl px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold">Вопросы и ответы</h2>
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          {FAQ.map((f, i) => (
            <div key={i} className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
              <div className="font-semibold">{f.q}</div>
              <div className="mt-2 text-sm text-white/70">{f.a}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="contact" className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 rounded-3xl bg-white/5 ring-1 ring-white/10 p-6">
            <h2 className="text-2xl font-bold">Связаться</h2>
            <div className="mt-5 flex flex-wrap gap-3">
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold hover:bg-emerald-400"><MessageSquare className="h-4 w-4"/> WhatsApp</a>
              <a href={`tel:${BRAND.phoneTel}`} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 font-semibold hover:bg-white/10"><Phone className="h-4 w-4"/> Позвонить</a>
              <a href={BRAND.map2gis} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 font-semibold hover:bg-white/10"><MapPin className="h-4 w-4"/> 2GIS (Маршрут)</a>
            </div>
            <div className="mt-5 text-sm text-white/70 flex items-center gap-2"><MapPin className="h-4 w-4"/> {BRAND.address}</div>
          </div>
          <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-6">
            <h3 className="text-lg font-bold">График</h3>
            <ul className="mt-3 text-sm text-white/80 space-y-1"><li>Без выходных: 10:00–20:00</li></ul>
            <h3 className="mt-6 text-lg font-bold">Оплата</h3>
            <ul className="mt-3 text-sm text-white/80 space-y-1">
              <li>Наличные</li><li>Kaspi QR</li><li>Kaspi перевод</li><li>Банковские карты (POS)</li><li>Безнал: счёт на компанию</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="mx-auto max-w-7xl px-4 py-10 border-t border-white/10 text-sm text-white/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div><div className="font-semibold text-white">{BRAND.name}</div><div className="mt-1">Сервисный центр • {BRAND.city}</div></div>
          <div className="flex items-center gap-4"><a href="#services" className="hover:text-white">Услуги</a><a href="#pricing" className="hover:text-white">Цены</a><a href="#faq" className="hover:text-white">FAQ</a></div>
        </div>
        <div className="mt-6 text-xs">© {new Date().getFullYear()} {BRAND.name}. Все права защищены.</div>
      </footer>

      {showLicenses && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl bg-slate-900 ring-1 ring-white/10 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-lg"><KeyRound className="h-5 w-5"/> Лицензионные ключи</div>
              <button onClick={()=>setShowLicenses(false)} className="rounded-xl border border-white/15 px-3 py-1 text-sm hover:bg-white/10">Закрыть</button>
            </div>
            <div className="mt-4 divide-y divide-white/10">
              {LICENSES.map((l,i)=>(
                <div key={i} className="py-3 flex items-center gap-3">
                  <ProgramIcon type={l.key}/>
                  <div className="flex-1"><div className="font-medium">{l.name}</div><div className="text-xs text-white/60">Срок: {l.term}</div></div>
                  <div className="text-sm text-white/80 w-28">{l.price}</div>
                  <a href={`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(`Здравствуйте! Хочу купить лицензию: ${l.name} (${l.term}).`)}`} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold hover:bg-emerald-400">Заказать</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <a href={whatsappLink} target="_blank" rel="noreferrer" className="fixed bottom-6 right-6 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 font-semibold shadow-lg hover:bg-emerald-400"><MessageSquare className="h-5 w-5"/> Написать в WhatsApp</a>
      <button onClick={()=>setShowLicenses(true)} className="fixed bottom-6 left-6 inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-5 py-3 font-semibold shadow-lg hover:bg-white/20"><KeyRound className="h-5 w-5"/> Ключи</button>
    </div>
  );
}
