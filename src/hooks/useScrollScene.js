import { useEffect, useRef } from 'react';

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const mix = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, value) => { const t = clamp((value - a) / (b - a)); return t * t * (3 - 2 * t); };

// Assembly stages use global SVG-space offsets. Each part follows a reversible
// path into its real mounting position; no time-based playback or scroll lock.
const assembly = [
  {name:'chassis',from:0,to:.14,x:25,y:62,angle:-3},
  {name:'board',from:.1,to:.31,x:-180,y:-56,angle:-12},
  {name:'cpu',from:.23,to:.40,x:-80,y:-168,angle:18},
  {name:'ram',from:.30,to:.48,x:168,y:-108,angle:12},
  {name:'gpu',from:.40,to:.62,x:214,y:60,angle:-10},
  {name:'cooling',from:.51,to:.73,x:36,y:-178,angle:5},
  {name:'psu',from:.59,to:.78,x:-124,y:146,angle:-9},
  {name:'ssd',from:.65,to:.83,x:-143,y:74,angle:18},
  {name:'cables',from:.72,to:.87,x:0,y:50,angle:0},
  {name:'glass',from:.82,to:.96,x:-176,y:-28,angle:-7},
];
const chapterStarts = [0,.18,.38,.58,.78,.94];

export default function useScrollScene() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const visual = root.querySelector('.scroll-visual');
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const desktop = window.matchMedia('(min-width: 900px)');
    const parts = Object.fromEntries(Array.from(root.querySelectorAll('[data-scene-part]')).map(node=>[node.dataset.scenePart,node]));
    const rotors = Array.from(root.querySelectorAll('[data-fan-rotor]'));
    const copies = Array.from(root.querySelectorAll('[data-scene-copy]'));
    const counter = root.querySelector('.scene-counter');
    const progress = root.querySelector('.scene-track i');
    let start=0,distance=1,raf=0,resizeRaf=0,enabled=false,visible=true,last=-1;

    const paint = (value,force=false) => {
      const p=clamp(value);
      if(!force && Math.abs(p-last)<.00005)return;
      last=p;
      parts.world.style.transform='translate3d(-50%,-50%,0) perspective(1400px) rotateY('+mix(-7,5,p)+'deg) rotateZ('+mix(-2,1,p)+'deg) scale('+mix(.94,1,p)+')';
      for(const step of assembly) {
        const t=smooth(step.from,step.to,p);
        const remaining=1-t;
        const node=parts[step.name];
        node.style.transform='translate('+step.x*remaining+'px,'+step.y*remaining+'px) rotate('+step.angle*remaining+'deg) scale('+mix(.92,1,t)+')';
        node.style.opacity=String(step.name==='chassis' ? mix(.32,1,t) : smooth(Math.max(0,step.from-.045),step.from+.08,p));
        node.dataset.assembled=t>.999 ? 'true':'false';
      }
      const light=smooth(.88,1,p);
      parts.lights.style.opacity=String(light);
      parts.aura.style.opacity=String(.1+light*.65);
      parts.shadow.style.opacity=String(.2+smooth(0,.3,p)*.45);
      rotors.forEach((node,i)=>{node.style.transform='rotate('+(p*(450+i*25))+'deg)';});
      let chapter=0;
      chapterStarts.forEach((threshold,i)=>{if(p>=threshold)chapter=i;});
      root.dataset.sceneChapter=String(chapter);
      root.dataset.scrollProgress=p.toFixed(4);
      counter.textContent='0'+(chapter+1)+' / 06';
      copies.forEach((node,i)=>{
        const entry=i===0?1:smooth(chapterStarts[i]-.025,chapterStarts[i]+.025,p);
        const exit=i===5?0:smooth(chapterStarts[i+1]-.025,chapterStarts[i+1]+.025,p);
        const weight=entry*(1-exit);
        node.style.opacity=String(weight);
        node.style.transform='translate3d(0,'+((1-weight)*(p>chapterStarts[i]?-16:16))+'px,0)';
      });
      progress.style.transform='scaleX('+p+')';
    };
    const update=()=>{raf=0;if(enabled && visible && !preference.matches)paint((window.scrollY-start)/distance);};
    const schedule=()=>{if(enabled && visible && !raf)raf=requestAnimationFrame(update);};
    const measure=()=>{
      resizeRaf=0;
      const styles=getComputedStyle(document.documentElement);
      const header=parseFloat(styles.getPropertyValue('--header-height'))||82;
      const bottom=desktop.matches?0:parseFloat(styles.getPropertyValue('--mobile-action-height'))||0;
      const available=window.innerHeight-header-bottom-12;
      const largeText=parseFloat(styles.fontSize)>22;
      const fits=desktop.matches?available>=Math.max(600,root.querySelector('.hero-copy').scrollHeight+48):available>=500;
      enabled=!preference.matches && !largeText && fits;
      cancelAnimationFrame(raf);raf=0;
      root.dataset.sceneMode=enabled?'scroll':'static';
      const sceneHeight=desktop.matches?available:Math.min(available,700);
      distance=desktop.matches?clamp(window.innerHeight*2.3,1450,2800):Math.max(1000,sceneHeight*1.9);
      root.style.setProperty('--scene-height',sceneHeight+'px');
      root.style.setProperty('--scroll-distance',enabled?distance+'px':'0px');
      const anchor=desktop.matches?root:root.querySelector('.scene-anchor');
      start=anchor.getBoundingClientRect().top+window.scrollY-header;
      visible=true;
      // A complete, still PC is more useful than an empty chassis without motion.
      paint(enabled?(window.scrollY-start)/distance:1,true);
      if(!enabled) for(const animation of document.getAnimations?.()||[]) {
        if(animation.effect?.target instanceof Element && root.contains(animation.effect.target))animation.cancel();
      }
    };
    const scheduleMeasure=()=>{if(!resizeRaf)resizeRaf=requestAnimationFrame(measure);};
    const observer=window.IntersectionObserver?new IntersectionObserver(entries=>{
      visible=entries[0].isIntersecting;if(visible)schedule();
    },{rootMargin:'100px'}):null;
    observer?.observe(root);
    const resizeObserver=window.ResizeObserver?new ResizeObserver(scheduleMeasure):null;
    resizeObserver?.observe(root.querySelector('.hero-copy'));
    const headerNode=document.querySelector('.site-header');
    if(headerNode)resizeObserver?.observe(headerNode);
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',scheduleMeasure,{passive:true});
    window.visualViewport?.addEventListener('resize',scheduleMeasure,{passive:true});
    preference.addEventListener('change',measure);
    desktop.addEventListener('change',measure);
    measure();
    return()=>{
      cancelAnimationFrame(raf);cancelAnimationFrame(resizeRaf);
      observer?.disconnect();resizeObserver?.disconnect();
      window.removeEventListener('scroll',schedule);
      window.removeEventListener('resize',scheduleMeasure);
      window.visualViewport?.removeEventListener('resize',scheduleMeasure);
      preference.removeEventListener('change',measure);
      desktop.removeEventListener('change',measure);
    };
  },[]);
  return ref;
}
