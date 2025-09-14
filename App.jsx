const {useEffect,useRef,useState,useMemo}=React;

const SECTIONS=[
  {id:"inicio",title:"Inicio",module:"modulos/hero/hero.html",css:"modulos/hero/hero-style.css"},
  {id:"noticias",title:"Noticias",module:"modulos/noticias/noticias.html",css:"modulos/noticias/noticias-style.css"},
  {id:"departamento",title:"Departamento",module:"modulos/departamento/departamento.html",css:"modulos/departamento/departamento-style.css"},
  {id:"staff",title:"STAFF",module:"modulos/staff/staff.html",css:"modulos/staff/staff-style.css"},
  {id:"carreras",title:"Carreras",module:"modulos/carreras.html",css:"modulos/carreras-style.css"},
  {id:"proyectos",title:"Proyectos",module:"modulos/proyectos/proyectos.html",css:"modulos/proyectos/proyectos-style.css"},
  {id:"investigacion",title:"Investigación",module:"modulos/investigacion.html",css:"modulos/investigacion-style.css"},
  {id:"eventos",title:"Eventos",module:"modulos/eventos.html",css:"modulos/eventos-style.css"},
  {id:"contacto",title:"Contacto",module:"modulos/contacto/contacto.html",css:"modulos/contacto/contacto-style.css"}
];

function SectionLoader({moduleUrl,cssUrl,sectionId}){
  const ref=useRef(null);
  useEffect(()=>{
    let alive=true;
    async function boot(){
      if(cssUrl&&!document.querySelector(`link[data-css="${cssUrl}"]`)){
        const link=document.createElement("link");
        link.rel="stylesheet";
        link.href=cssUrl;
        link.dataset.css=cssUrl;
        document.head.appendChild(link);
      }
      const res=await fetch(moduleUrl);
      const html=await res.text();
      if(alive&&ref.current){ref.current.innerHTML=html;initSection(sectionId,ref.current)}
    }
    boot();
    return()=>{alive=false}
  },[moduleUrl,cssUrl,sectionId]);
  return <div ref={ref} />;
}

function App(){
  const headerRef=useRef(null);
  const [activeHref,setActiveHref]=useState("#inicio");
  const ids=useMemo(()=>SECTIONS.map(s=>s.id),[]);
  useEffect(()=>{
    function setH(){if(!headerRef.current)return;const h=headerRef.current.getBoundingClientRect().height;document.documentElement.style.setProperty("--header-h",h+"px")}
    setH();
    const r=()=>setH();
    window.addEventListener("resize",r);
    return()=>window.removeEventListener("resize",r)
  },[]);
  useEffect(()=>{
    const els=ids.map(id=>document.getElementById(id)).filter(Boolean);
    const obs=new IntersectionObserver(es=>{
      es.forEach(en=>{if(en.isIntersecting)setActiveHref("#"+en.target.id)})
    },{rootMargin:`-${parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h"))+24}px 0px -60% 0px`,threshold:.1});
    els.forEach(e=>obs.observe(e));
    return()=>obs.disconnect()
  },[ids]);
  return(
    <>
      <header ref={headerRef} className="sticky-top bg-white bg-opacity-90 border-bottom" style={{backdropFilter:"saturate(140%) blur(8px)"}}>
        <nav className="navbar navbar-expand-lg container py-2">
          <a className="navbar-brand fw-bold d-flex align-items-center gap-2" href="#inicio">
            <img src="data/logo.png" alt="Universidad" className="brand__img" />
            <div className="d-flex flex-column lh-1">
              <span className="fw-bold">DEPARTAMENTO OBRAS CIVILES ULS</span>
              <small className="text-muted">UNIVERSIDAD DE LA SERENA</small>
            </div>
          </a>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#main-nav" aria-controls="main-nav" aria-expanded="false" aria-label="Menu">≡</button>
          <div className="collapse navbar-collapse" id="main-nav">
            <ul className="navbar-nav ms-auto">
              {SECTIONS.map(s=>(
                <li className="nav-item" key={s.id}>
                  <a className={"nav-link fw-semibold"+(activeHref==="#"+s.id?" active":"")} href={"#"+s.id}>{s.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      <main>
        {SECTIONS.map(s=>(
          <section id={s.id} key={s.id} className="py-section">
            <div className="container">
              <SectionLoader moduleUrl={s.module} cssUrl={s.css} sectionId={s.id}/>
            </div>
          </section>
        ))}
      </main>

      <footer className="bg-dark text-light py-4 mt-4">
        <div className="container">
          <small>© <span>{new Date().getFullYear()}</span> Mesa Central Universidad de La Serena - Universidad de La Serena - Teléfono: 51 2 204000 - Dirigir su consulta al siguiente correo electrónico institucional de contacto consultas@userena.cl</small>
        </div>
      </footer>
    </>
  )
}

function initSection(id, root){
  if(id==="inicio"){
    const host = root.querySelector("[data-hero-root]");
    if (window.mountHero && host) window.mountHero(host);
    return;
  }

  if(id==="noticias"){
    const host = root.querySelector("[data-noticias-root]");
    if (window.mountNoticias && host) window.mountNoticias(host);
    return;
  }

  if(id==="staff"){
    const host = root.querySelector("[data-staff-root]");
    if (window.mountStaff && host) window.mountStaff(host);
    return; // evita que corra tabs/slider legacy
  }

  if(id==="departamento"){
    const host = root.querySelector("[data-departamento-root]");
    if (window.mountDepartamento && host) window.mountDepartamento(host);
    return; // evita que corra tabs/slider legacy
  }

  if(id==="carreras"){ const t=root.querySelector(".tabs"); if(t) tabsInit(t) }
  if(id==="eventos"){ const cal=root.querySelector(".calendar"); if(cal) calendarInit(cal) }
  if(id==="contacto"){
    const host = root.querySelector("[data-contacto-root]");
    if (window.mountContacto && host) window.mountContacto(host);
    return;
}
}

function sliderInit(root){
  const track=root.querySelector(".slider__track");
  const items=Array.from(root.querySelectorAll(".slider__item"));
  const prev=root.querySelector(".slider__btn--prev");
  const next=root.querySelector(".slider__btn--next");
  const dotsWrap=root.querySelector(".slider__dots");
  let perView=3,index=0,pages=0;
  function computePerView(){
    const forced=parseInt(root.dataset.perView||"");
    if(forced){perView=forced}else{const w=root.clientWidth;if(w<=640)perView=1;else if(w<=980)perView=2;else perView=3}
    perView=Math.max(1,Math.min(perView,items.length));
    pages=Math.max(1,items.length-perView+1);
    if(index>pages-1)index=pages-1
  }
  function update(){
    const step=100/perView;
    track.style.transition="transform .3s ease";
    track.style.transform=`translateX(-${index*step}%)`;
    if(prev)prev.disabled=index===0;
    if(next)next.disabled=index>=pages-1;
    if(dotsWrap){
      dotsWrap.innerHTML="";
      for(let i=0;i<pages;i++){const b=document.createElement("button");b.className="slider__dot";b.setAttribute("aria-current",i===index?"true":"false");b.addEventListener("click",()=>{index=i;update()});dotsWrap.appendChild(b)}
    }
  }
  computePerView();update();
  prev&&prev.addEventListener("click",()=>{if(index>0){index--;update()}}); 
  next&&next.addEventListener("click",()=>{if(index<pages-1){index++;update()}}); 
  addEventListener("resize",()=>{const o=perView;computePerView();if(perView!==o)update()});
  root.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"&&prev)prev.click();if(e.key==="ArrowRight"&&next)next.click()});
  let dragging=false,startX=0,deltaX=0;
  function onDown(e){dragging=true;startX=e.clientX||e.touches&&e.touches[0].clientX;track.style.transition="none"}
  function onMove(e){if(!dragging)return;const x=e.clientX||e.touches&&e.touches[0].clientX;deltaX=x-startX;const pct=(deltaX/root.clientWidth)*100;const step=100/perView;track.style.transform=`translateX(calc(-${index*step}% + ${pct}%))`}
  function onUp(){if(!dragging)return;dragging=false;const thresh=root.clientWidth*0.18;if(Math.abs(deltaX)>thresh){if(deltaX<0&&index<pages-1)index++;if(deltaX>0&&index>0)index--}deltaX=0;update()}
  track.addEventListener("pointerdown",onDown,{passive:true});
  window.addEventListener("pointermove",onMove,{passive:true});
  window.addEventListener("pointerup",onUp,{passive:true});
  track.addEventListener("touchstart",e=>onDown(e.touches[0]),{passive:true});
  window.addEventListener("touchmove",e=>onMove(e.touches[0]),{passive:true});
  window.addEventListener("touchend",onUp,{passive:true});
}

function tabsInit(root){
  const btns=Array.from(root.querySelectorAll(".tabs__btn"));
  const panels=Array.from(root.querySelectorAll(".tabs__panel"));
  function setActive(id){btns.forEach(b=>{const a=b.getAttribute("aria-controls")===id;b.classList.toggle("is-active",a);b.setAttribute("aria-selected",String(a))});panels.forEach(p=>{p.hidden=p.id!==id})}
  btns.forEach(b=>b.addEventListener("click",()=>setActive(b.getAttribute("aria-controls"))));
  const first=btns[0];if(first)setActive(first.getAttribute("aria-controls"));
  root.addEventListener("keydown",e=>{const i=btns.indexOf(document.activeElement);if(i>-1&&(e.key==="ArrowRight"||e.key==="ArrowLeft")){e.preventDefault();const d=e.key==="ArrowRight"?1:-1;const j=(i+d+btns.length)%btns.length;btns[j].focus()}});
}

function calendarInit(root){
  const head=root.querySelector(".calendar__head");
  const grid=root.querySelector(".calendar__grid");
  const list=root.querySelector(".calendar__list");
  let now=new Date();
  const ev=JSON.parse(root.dataset.events||"[]");
  function ymd(d){return d.toISOString().slice(0,10)}
  function render(){
    const y=now.getFullYear();const m=now.getMonth();
    head.querySelector(".calendar__title").textContent=now.toLocaleDateString("es-CL",{month:"long",year:"numeric"});
    grid.innerHTML="";
    const first=new Date(y,m,1);
    const start=((first.getDay()+6)%7);
    for(let i=0;i<start;i++){const c=document.createElement("div");c.className="calendar__day calendar__day--pad";grid.appendChild(c)}
    const days=new Date(y,m+1,0).getDate();
    for(let d=1;d<=days;d++){
      const cell=document.createElement("button");
      cell.className="calendar__day";
      cell.textContent=String(d);
      const dateStr=ymd(new Date(y,m,d));
      if(ev.some(x=>x.date===dateStr))cell.classList.add("has-event");
      cell.addEventListener("click",()=>show(dateStr));
      grid.appendChild(cell)
    }
    show(ymd(new Date(y,m,1)))
  }
  function show(dateStr){
    list.innerHTML="";
    const items=ev.filter(x=>x.date===dateStr);
    if(items.length===0){const li=document.createElement("li");li.textContent="Sin eventos";list.appendChild(li)}
    else{
      items.forEach(e=>{
        const li=document.createElement("li");
        const t=document.createElement("strong");t.textContent=e.title;li.appendChild(t);
        if(e.time){const s=document.createElement("span");s.textContent=" · "+e.time;li.appendChild(s)}
        if(e.place){const p=document.createElement("div");p.textContent=e.place;li.appendChild(p)}
        list.appendChild(li)
      })
    }
  }
  head.querySelector("[data-prev]").addEventListener("click",()=>{now=new Date(now.getFullYear(),now.getMonth()-1,1);render()});
  head.querySelector("[data-next]").addEventListener("click",()=>{now=new Date(now.getFullYear(),now.getMonth()+1,1);render()});
  render()
}

window.App = App;

