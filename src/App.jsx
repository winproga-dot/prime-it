import React, { useMemo, useState, useRef, useEffect } from "react";
import {
  Wrench, Cpu, ShieldCheck, Clock, Star, MessageSquare, CheckCircle2,
  Phone, MapPin, ChevronRight, Sparkles, Monitor, Laptop, HardDrive,
  Fan, Layers3, MousePointerClick, KeyRound, ChevronUp
} from "lucide-react";

// логотип (положи в public/logo.jpg или замени путь)
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
  email: "prime.it.08@gmail.com",
};

// Порядок: 'soft' выше, 'speedup' ниже
const SERVICES = [
  { id:"winms", icon:Monitor, title:"Установка Windows и MS Office", desc:"Установлю Windows 10/11 с драйверами и необходимыми программами. Microsoft Office. Быстро, аккуратно, с сохранением ваших файлов. Срок: от 1 часа. Office при необходимости ставим удалённо через AnyDesk.", price:10000, pricePrefix:"от", badge:"Популярно" },
  { id:"clean", icon:Fan, title:"Чистка от пыли и замена термопасты", desc:"Полная чистка ноутбука или ПК от пыли с разбором и заменой качественной термопасты (Arctic MX-4, Thermal Grizzly и др.). Срок: от 2 часов.", price:8000, pricePrefix:"от" },
  { id:"gpu_service", icon:Cpu, title:"Обслуживание видеокарт (GPU)", desc:"Чистка, замена термопасты и термопрокладок. GTX 10 / RTX 20–50 серии. Снижает температуры, повышает FPS. Рекомендуем раз в год.", price:12000, pricePrefix:"от", priceNote:"до 22 000 — по модели" },
  { id:"data", icon:HardDrive, title:"Восстановление данных", desc:"Фото, документы и видео с флешек, HDD, карт памяти. Срок: 2–3 часа.", price:12000, pricePrefix:"от" },
  { id:"soft", icon:Layers3, title:"Установка графических программ (Autodesk, Adobe)", desc:"AutoCAD, Revit, Photoshop, Illustrator, Premiere Pro и др. Возможна удалённая установка через AnyDesk.", price:5000, pricePrefix:"от" },
  { id:"build", icon:Cpu, title:"Сборка компьютера", desc:"Игровой, офисный или дизайнерский ПК под задачи и бюджет. Установка и настройка ПО. Срок: 1 день.", price:16000, pricePrefix:"от" },

  { id:"speedup", icon:Layers3, title:"Ускорение ПК/ноутбука (SSD + ОЗУ)", desc:"Подбор и установка SSD и оперативной памяти. Перенос системы, настройка, оптимизация.", price:7000, pricePrefix:"от" },
  { id:"parts", icon:Laptop, title:"Замена матрицы, клавиатуры, кулера", desc:"Профессиональная замена экрана, клавиатуры, вентилятора охлаждения на ноутбуках всех моделей.", price:10000, pricePrefix:"от", priceNote:"+ деталь" },
  { id:"hinge", icon:Laptop, title:"Ремонт петель ноутбука, замена корпуса", desc:"Ремонт или замена петель крышки, восстановление корпуса. Срок: 1–2 дня.", price:8000, pricePrefix:"от" },
  { id:"battery", icon:HardDrive, title:"Замена батареи и зарядки", desc:"Замена аккумуляторов ноутбука и блоков питания. Срок: ~1 час при наличии детали.", price:5000, pricePrefix:"от", priceNote:"+ деталь" },
  { id:"misc", icon:Wrench, title:"Другие услуги", desc:"Настройка Wi-Fi, драйверов, печати, BIOS/UEFI, мелкий ремонт и пр.", price:5000, pricePrefix:"от" },
  { id:"sale", icon:Monitor, title:"Продажа ноутбуков и ПК", desc:"Подбор, тестирование и продажа. Windows + Office + нужные программы — в подарок.", price:45000, pricePrefix:"от" },
];

const LICENSES = [
  { key:'windows', name:"Windows 10/11 (Home/Pro)", term:"Бессрочно", price:"16 000–19 000 ₸" },
  { key:'office', name:"Microsoft Office 2021/2024", term:"Бессрочно", price:"18 000–25 000 ₸" },
  { key:'autodesk', name:"Autodesk (AutoCAD, 3ds Max, Revit, Maya и др.)", term:"1 год", price:"40 000 ₸" },
  { key:'adobe', name:"Adobe Creative Cloud", term:"4 месяца", price:"40 000 ₸" },
  { key:'kaspersky', name:"Kaspersky (1–3 устройства)", term:"1–3 года", price:"6 500–20 000 ₸" },
];

const BENEFITS = [
  { icon: ShieldCheck, title: "Гарантия до 2 лет (на отдельные товары)", text: "Официальные чек и гарантийный талон." },
  { icon: Clock, title: "Сроки от 1 часа", text: "Большинство работ в день обращения." },
  { icon: MapPin, title: `Выезд по ${BRAND.city}`, text: "Домой или в офис — по согласованию." },
  { icon: Wrench, title: "Делаем до конца", text: "Не уходим, пока всё не работает." },
];

const FAQ = [
  { q:"Что если проблему не удалось решить?", a:"Оплату за работу не берём. Предложим альтернативы (замена детали, перенос данных) — всё согласуем заранее." },
  { q:"Сколько стоит диагностика?", a:"3000 ₸. Если остаётесь на ремонт — диагностика бесплатна." },
  { q:"Можно ли сохранить данные при переустановке Windows?", a:"Да, делаем резервную копию и переносим важные файлы, если носитель в порядке." },
  { q:"Вы устанавливаете программы удалённо?", a:"Да. Лицензионные ключи и программы (Office, Autodesk, Adobe) можем установить удалённо через AnyDesk." },
  { q:"Как оплачивать?", a:"Наличные, Kaspi QR, Kaspi перевод, банковские карты (POS), безнал — счёт на компанию." },
  { q:"Гарантия на работы?", a:"До 3 месяцев на выполненные работы. На запчасти — гарантия поставщика." },
  { q:"График работы?", a:"Без выходных, с 10:00 до 20:00." },
];

function currency(n){ return new Intl.NumberFormat("ru-RU").format(n) + " ₸"; }
function placeholder(text){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='640' height='420'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#0ea5e9' offset='0'/><stop stop-color='#10b981' offset='1'/></linearGradient></defs><rect width='100%' height='100%' fill='url(#g)'/><text x='50%' y='50%' font-family='Inter,Arial' font-size='20' fill='white' text-anchor='middle' dominant-baseline='middle'>${text}</text></svg>`;
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// локальные картинки: /public/services/<id>.png -> webp -> jpg -> jpeg -> Unsplash -> placeholder
const SERVICE_EXTS = ["png","webp","jpg","jpeg"];
const handleServiceError = (id) => (e) => {
  const el = e.currentTarget;
  const idx = Number(el.dataset.extIdx || 0);
  if (idx < SERVICE_EXTS.length - 1) {
    const next = idx + 1;
    el.dataset.extIdx = String(next);
    el.src = `/services/${id}.${SERVICE_EXTS[next]}`;
    return;
  }
  if (!el.dataset.triedUnsplash) {
    el.dataset.triedUnsplash = "1";
    el.src = `https://source.unsplash.com/640x420/?computer,repair,${id}`;
    return;
  }
  el.onerror = null;
  el.src = placeholder(id);
};

// Иконки программ (для блока «Лицензии»)
function ProgramIcon({ type }) {
  let classes = "h-8 w-8 rounded-lg flex items-center justify-center font-bold text-white ring-1 ";
  let label = "•";
  if (type==='windows'){classes+="bg-sky-500/30 ring-sky-400/40"; label='W';}
  else if (type==='office'){classes+="bg-orange-500/30 ring-orange-400/40"; label='O';}
  else if (type==='autodesk'){classes+="bg-teal-500/30 ring-teal-400/40"; label='A';}
  else if (type==='adobe'){classes+="bg-red-500/30 ring-red-400/40"; label='A';}
  else if (type==='kaspersky'){classes+="bg-green-500/30 ring-green-400/40"; label='K';}
  else {classes+="bg-white/10 ring-white/20"; label='•';}
  return <div className={classes} aria-label={type}>{label}</div>;
}

// Reveal-анимации (без сторонних библиотек)
function Reveal({ children, className = "", delay = 0, variant = "up" }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { el.classList.add("reveal-in"); io.unobserve(el); }
      }),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`reveal-base reveal-${variant} ${className}`}
      style={{ transitionDelay: `${delay}s` }}
    >
      {children}
    </div>
  );
}

// Карточка услуги
function ServiceCard({ s, selected, toggle, onImgError }) {
  return (
    <div className="min-w-[280px] md:min-w-0 rounded-3xl bg-white/5 ring-1 ring-white/10 p-5 flex flex-col transition duration-300 hover:-translate-y-1 hover:ring-white/20">
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
        <span>{currency(s.price)}</span>
        {s.priceNote && <span className="text-xs text-white/60 ml-2">{s.priceNote}</span>}
      </div>
      <button
        onClick={() => toggle(s.id)}
        className={`mt-4 inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium ring-1 ring-white/15 ${
          selected.has(s.id) ? "bg-white text-slate-900" : "hover:bg-white/10"
        }`}
      >
        {selected.has(s.id) ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
        {selected.has(s.id) ? "В заказе" : "Добавить в заказ"}
      </button>
    </div>
  );
}

export default function Landing(){
  // по умолчанию отмечена только Windows
  const [selected, setSelected] = useState(()=>new Set(["winms"]));
  const [rush, setRush] = useState(false);
  const [onsite, setOnsite] = useState(false);
  const [showLicenses, setShowLicenses] = useState(false);

  const moreRef = useRef(null);
  const scrollMore = (dx) => moreRef.current?.scrollBy({ left: dx, behavior: "smooth" });

  // авто-прокрутка ленты «Ещё услуги»
  const [isHoverMore, setIsHoverMore] = useState(false);
  useEffect(() => {
    const el = moreRef.current;
    if (!el) return;
    const id = setInterval(() => {
      if (isHoverMore) return;
      const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 12;
      if (nearEnd) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: 320, behavior: "smooth" });
    }, 2800);
    return () => clearInterval(id);
  }, [isHoverMore]);

  // кнопка «вверх»
  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const total = useMemo(()=> {
    let sum=0; for (const s of SERVICES) if (selected.has(s.id)) sum+=s.price;
    if (rush) sum = Math.round(sum*1.2);
    if (onsite) sum += 2000;
    return Math.max(sum,0);
  }, [selected,rush,onsite]);

  const toggle = (id)=>{ const next=new Set(selected); next.has(id)?next.delete(id):next.add(id); setSelected(next); };

  const whatsappLink = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
    `${BRAND.whatsappPreset}\n\nВыбранные услуги: ${[...selected].map(id=>SERVICES.find(s=>s.id===id)?.title).filter(Boolean).join(", ")||"—"}\nСрочно: ${rush?"да":"нет"}\nВыезд: ${onsite?"да":"нет"}\nОриентир: ${currency(total)}\n\nИмя: `
  )}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* CSS локально */}
      <style>{`
  /* Глобально: плавный скролл и отступ для якорей под фикс-хедер */
  html{
    scroll-behavior:smooth;
    scroll-padding-top: 96px; /* подстройка под высоту шапки */
  }
  @media (max-width: 767px){
    html{ scroll-padding-top: 80px; }
  }

  .reveal-base{opacity:0; transform:translateY(14px); transition:opacity .6s ease, transform .6s ease; will-change:opacity,transform}
  .reveal-right{transform:translateX(16px)}
  .reveal-scale{transform:scale(.98)}
  .reveal-in{opacity:1; transform:none}
  @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
  .btn-floaty{animation:floaty 2.8s ease-in-out infinite}
  .text-glow{text-shadow:0 2px 18px rgba(0,0,0,.55),0 1px 4px rgba(0,0,0,.45)}

  /* WhatsApp CTA: мягкий пульс + рипплы */
  .whats-cta{ 
    position: relative;
    animation: whatsGlow 3.8s ease-in-out infinite;
    will-change: box-shadow;
    isolation: isolate;
  }
  .whats-cta::after,
  .whats-cta::before{
    content:"";
    position:absolute;
    inset:-6px;
    border-radius:9999px;
    border:2px solid rgba(16,185,129,.45);
    transform:scale(1);
    opacity:0;
    pointer-events:none;
  }
  .whats-cta::after{ animation: whatsRipple 2.9s ease-out infinite; }
  .whats-cta::before{ animation: whatsRipple 2.9s ease-out 1.45s infinite; }

  @keyframes whatsGlow{
    0%,100%{ box-shadow: 0 0 0 0 rgba(16,185,129,0), 0 12px 24px rgba(0,0,0,.25); }
    60%   { box-shadow: 0 0 0 10px rgba(16,185,129,.10), 0 12px 24px rgba(0,0,0,.25); }
  }
  @keyframes whatsRipple{
    from { transform:scale(1);    opacity:.35; }
    to   { transform:scale(1.35); opacity:0;   }
  }

  @media (max-width: 767px){
    .whats-cta::after, .whats-cta::before{ inset:-4px; }
    .whats-cta{ animation-duration: 4.4s; }
  }
  @media (prefers-reduced-motion: reduce){
    .whats-cta, .whats-cta::before, .whats-cta::after{ animation:none !important; }
  }
  .whats-cta:hover{ animation-play-state: paused; }
  .whats-cta:hover::before, .whats-cta:hover::after{ animation-play-state: paused; }
`}</style>

      {/* PROMO BAR */}
      <div className="bg-emerald-600 text-white text-xs md:text-sm py-2 text-center">
        −10% на следующий заказ, если оставите отзыв в 2GIS.{" "}
        <a href={BRAND.map2gis} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          Открыть 2GIS
        </a>
      </div>

      {/*HEADER*/}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-slate-950/70 border-b border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 overflow-hidden">
              <img src={LOGO} alt={BRAND.name} className="h-10 w-10 object-contain"/>
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
            <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-medium hover:bg-emerald-400"><MessageSquare className="h-4 w-4"/> WhatsApp</a>
          </div>
        </div>
      </header>

      {/* HERO — твоё видео, лёгкий градиент и компактный текст снизу слева */}
      <section id="hero" className="relative h-[72vh] md:h-[86vh]">
        {/* ВИДЕО ФОН */}
        <div className="absolute inset-0 overflow-hidden">
          <video
            className="w-full h-full object-cover"
            autoPlay
            muted
            playsInline
            preload="metadata"
            poster="/hero.webp"
            onEnded={(e) => {
              const v = e.currentTarget;
              v.currentTime = Math.max(0, v.duration - 0.02);
              v.pause();
            }}
          >
            <source src="/hero.mp4" type="video/mp4" />
          </video>

          {/* Лёгкий градиент: не убивает картинку */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/55" />
        </div>

        {/* КОНТЕНТ — компактный, у края, без «плашек» */}
        <div className="relative h-full">
          <div className="absolute bottom-8 left-4 md:bottom-12 md:left-8 max-w-xl">
            <h1 className="text-white text-glow text-3xl md:text-5xl font-extrabold leading-tight">
              Ремонт ПК и ноутбуков в {BRAND.city}
            </h1>
            <p className="mt-3 text-white/90 text-base md:text-lg text-glow max-w-lg">
              Windows, чистка, ускорение SSD/ОЗУ, видеокарты. Честные цены и гарантия.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <a
                href="#pricing"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/90 text-slate-900 px-4 py-2 font-semibold shadow-lg hover:bg-white"
              >
                Посмотреть цены <ChevronRight className="h-4 w-4"/>
              </a>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl bg-black/35 px-4 py-2 font-semibold hover:bg-black/45"
              >
                Записаться <MousePointerClick className="h-4 w-4"/>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/*BENEFITS*/}
      <section id="benefits" className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid md:grid-cols-4 gap-4">
          {BENEFITS.map((b,i)=>(
            <Reveal key={i} delay={i*0.05}>
              <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
                <div className="flex items-center gap-3"><b.icon className="h-5 w-5"/><div className="font-semibold">{b.title}</div></div>
                <div className="mt-2 text-white/70 text-sm">{b.text}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/*SERVICES*/}
      <section id="services" className="mx-auto max-w-7xl px-4 py-4 md:py-12">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl md:text-3xl font-bold">Услуги</h2>
          <a href="#pricing" className="text-sm text-white/70 hover:text-white">Смотреть цены</a>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          {SERVICES.slice(0, 6).map((s, i) => (
            <Reveal key={s.id} delay={i*0.05}>
              <ServiceCard s={s} selected={selected} toggle={toggle} onImgError={handleServiceError}/>
            </Reveal>
          ))}
        </div>

        {SERVICES.length > 6 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-3">
              <div className="text-lg font-semibold text-white/90">Ещё услуги</div>
              <div className="hidden md:flex gap-2">
                <button onClick={() => scrollMore(-400)} className="rounded-xl border border-white/15 px-3 py-1 hover:bg-white/10">←</button>
                <button onClick={() => scrollMore(400)} className="rounded-xl border border-white/15 px-3 py-1 hover:bg-white/10">→</button>
              </div>
            </div>
            <div
              ref={moreRef}
              onMouseEnter={() => setIsHoverMore(true)}
              onMouseLeave={() => setIsHoverMore(false)}
              className="overflow-x-auto flex gap-4 snap-x snap-mandatory cursor-grab active:cursor-grabbing"
            >
              {SERVICES.slice(6).map((s, i) => (
                <div key={s.id} className="snap-start">
                  <Reveal delay={i*0.03}>
                    <ServiceCard s={s} selected={selected} toggle={toggle} onImgError={handleServiceError}/>
                  </Reveal>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/*PRICING CALC*/}
      <section id="pricing" className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-6">
          <Reveal className="lg:col-span-2">
            <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-6">
              <h3 className="text-xl md:text-2xl font-bold">Калькулятор стоимости</h3>
              <p className="mt-1 text-white/70 text-sm">Ориентировочно. Точную цену подтверждаем после диагностики.</p>

              <div className="mt-4 grid md:grid-cols-2 gap-3">
                {SERVICES.map(s=>(
                  <label key={s.id} className={`flex items-start gap-3 rounded-2xl p-3 ring-1 ring-white/10 bg-white/5 cursor-pointer ${selected.has(s.id) ? "outline outline-2 outline-white/30" : ""}`}>
                    <input type="checkbox" className="mt-1" checked={selected.has(s.id)} onChange={()=>toggle(s.id)} />
                    <div className="flex-1">
                      <div className="font-medium leading-tight">{s.title}</div>
                      <div className="text-xs text-white/60">{s.pricePrefix?`${s.pricePrefix} `:""}{currency(s.price)}{s.priceNote?` • ${s.priceNote}`:""}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-4 grid md:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 rounded-2xl p-3 ring-1 ring-white/10 bg-white/5 cursor-pointer"><input type="checkbox" checked={rush} onChange={()=>setRush(!rush)} /><div><div className="font-medium">Срочно сегодня</div><div className="text-xs text-white/60">+20% к стоимости</div></div></label>
                <label className="flex items-center gap-3 rounded-2xl p-3 ring-1 ring-white/10 bg-white/5 cursor-pointer"><input type="checkbox" checked={onsite} onChange={()=>setOnsite(!onsite)} /><div><div className="font-medium">Выезд мастера</div><div className="text-xs text-white/60">+2000 ₸ по {BRAND.city}</div></div></label>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
                <div><div className="text-sm text-white/60">Ориентировочная стоимость</div><div className="text-2xl font-extrabold">{currency(total)}</div></div>
                <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold hover:bg-emerald-400">Отправить расчёт в WhatsApp <ChevronRight className="h-4 w-4"/></a>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-6">
              <h3 className="text-xl font-bold">Почему {BRAND.name}</h3>
              <ul className="mt-3 space-y-3 text-sm">
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400"/> Оплата после результата.</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400"/> Делаем до конца — не уходим, пока всё не работает.</li>
                <li className="flex gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-400"/> Прозрачные цены, без навязывания.</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/*LICENSES*/}
      <section id="licenses" className="mx-auto max-w-7xl px-4 py-12">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold">Лицензионные ключи</h2>
          <p className="mt-1 text-white/70 text-sm">Windows, Office, Autodesk, Adobe, антивирусы — можем установить удалённо через AnyDesk.</p>
          <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {LICENSES.map((l,i)=>(
              <Reveal key={i} delay={i*0.05}>
                <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5 flex items-center gap-4">
                  <ProgramIcon type={l.key}/>
                  <div className="flex-1"><div className="font-semibold leading-tight">{l.name}</div><div className="text-xs text-white/60">Срок: {l.term}</div></div>
                  <div className="text-sm text-white/80 w-28">{l.price}</div>
                  <a href={`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(`Здравствуйте! Хочу купить лицензию: ${l.name} (${l.term}).`)}`} target="_blank" rel="noreferrer" className="rounded-xl bg-emerald-500 px-3 py-2 text-sm font-semibold hover:bg-emerald-400">Заказать</a>
                </div>
              </Reveal>
            ))}
          </div>
        </Reveal>
      </section>

      {/*FAQ*/}
      <section id="faq" className="mx-auto max-w-7xl px-4 py-10">
        <Reveal>
          <h2 className="text-2xl md:text-3xl font-bold">FAQ</h2>
          <div className="mt-4 divide-y divide-white/10 rounded-3xl bg-white/5 ring-1 ring-white/10">
            {FAQ.map((f,i)=>(
              <div key={i} className="p-5">
                <div className="font-semibold">{f.q}</div>
                <div className="text-sm text-white/70 mt-1">{f.a}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/*CONTACT — без встроенной карты*/}
      <section id="contact" className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid md:grid-cols-1 gap-6">
          <Reveal>
            <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-6">
              <h2 className="text-2xl font-bold">Связаться</h2>
              <div className="mt-5 flex flex-wrap gap-3">
                <a href={whatsappLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-semibold hover:bg-emerald-400"><MessageSquare className="h-4 w-4"/> WhatsApp</a>
                <a href={`tel:${BRAND.phoneTel}`} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 font-semibold hover:bg-white/10"><Phone className="h-4 w-4"/> {BRAND.phoneDisplay}</a>
                <a href={`mailto:${BRAND.email}`} className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 font-semibold hover:bg-white/10">Email: {BRAND.email}</a>
                <a href={BRAND.map2gis} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-white/15 px-5 py-3 font-semibold hover:bg-white/10"><MapPin className="h-4 w-4"/> 2GIS (Маршрут)</a>
              </div>
              <div className="mt-5 text-sm text-white/70 space-y-1">
                <div className="flex items-center gap-2"><MapPin className="h-4 w-4"/> {BRAND.address}</div>
                <div>Тел.: {BRAND.phoneDisplay}</div>
                <div>Email: {BRAND.email}</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/*FOOTER*/}
      <footer className="mx-auto max-w-7xl px-4 py-10 border-t border-white/10 text-sm text-white/60">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div><div className="font-semibold text-white">{BRAND.name}</div><div className="mt-1">Сервисный центр • {BRAND.city}</div></div>
          <div className="flex items-center gap-4"><a href="#services" className="hover:text-white">Услуги</a><a href="#pricing" className="hover:text-white">Цены</a><a href="#faq" className="hover:text-white">FAQ</a></div>
        </div>
        <div className="mt-6 text-xs">© {new Date().getFullYear()} {BRAND.name}. Все права защищены.</div>
      </footer>

      {/*Модал с лицензиями*/}
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

      {/*Плавающие кнопки*/}
      {showTop && (
        <button
          onClick={scrollTop}
          className="fixed bottom-24 right-6 inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-4 py-3 font-semibold shadow-lg hover:bg-white/20 btn-floaty"
          aria-label="Наверх"
          title="Наверх"
        >
          <ChevronUp className="h-5 w-5"/> Наверх
        </button>
      )}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        className="whats-cta fixed bottom-6 right-6 z-50 relative inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 font-semibold shadow-lg hover:bg-emerald-400"
        aria-label="Написать в WhatsApp"
      >
        <MessageSquare className="h-5 w-5"/> WhatsApp
      </a>
      <button onClick={()=>setShowLicenses(true)} className="fixed bottom-6 left-6 inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-white/15 px-5 py-3 font-semibold shadow-lg hover:bg-white/20"><KeyRound className="h-5 w-5"/> Ключи</button>
    </div>
  );
}
