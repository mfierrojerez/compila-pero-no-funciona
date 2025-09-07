const header=document.querySelector("header.site-header");
function setHeaderHeightVar(){const h=header.getBoundingClientRect().height;document.documentElement.style.setProperty("--header-h",h+"px")}
setHeaderHeightVar();
addEventListener("resize",()=>{requestAnimationFrame(setHeaderHeightVar)});

const toggle=document.querySelector(".nav__toggle");
const menu=document.getElementById("menu-principal");
function setMenu(open){menu.dataset.open=String(open);document.body.dataset.menuOpen=String(open);toggle.setAttribute("aria-expanded",String(open));toggle.setAttribute("aria-label",open?"Cerrar menú":"Abrir menú")}
toggle&&toggle.addEventListener("click",()=>setMenu(menu.dataset.open!=="true"));
menu&&menu.addEventListener("click",e=>{const a=e.target.closest("a");if(a&&a.getAttribute("href").startsWith("#"))setMenu(false)});

const links=Array.from(document.querySelectorAll(".nav__link"));
const map=new Map(links.map(a=>[a.getAttribute("href"),a]));
const obs=new IntersectionObserver(entries=>{entries.forEach(en=>{if(en.isIntersecting){const id="#"+en.target.id;links.forEach(a=>a.removeAttribute("aria-current"));const el=map.get(id);if(el)el.setAttribute("aria-current","page")}})},{rootMargin:`-${parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h"))+24}px 0px -60% 0px`,threshold:.1});
document.querySelectorAll("main section[id]").forEach(sec=>obs.observe(sec));

document.getElementById("year").textContent=(new Date).getFullYear();

async function loadModules(){
  const loadedCss=new Set();
  const sections=document.querySelectorAll("main section[data-module]");
  for(const sec of sections){
    const css=sec.dataset.css;
    if(css&&!loadedCss.has(css)){const link=document.createElement("link");link.rel="stylesheet";link.href=css;document.head.appendChild(link);loadedCss.add(css)}
    const url=sec.dataset.module;
    const res=await fetch(url);
    const html=await res.text();
    sec.innerHTML=html;
    initSection(sec.id,sec);
  }
}
function initSection(id,root){
  if(id==="noticias"){const s=root.querySelector(".slider");if(s)sliderInit(s)}
  if(id==="departamento"){const t=root.querySelector(".tabs");if(t)tabsInit(t)}
  if(id==="contacto"){const f=root.querySelector("#form-contacto");const m=root.querySelector("#form-msg");if(f)m&&(f.addEventListener("submit",e=>{e.preventDefault();if(!f.checkValidity()){f.reportValidity();m.textContent="Por favor completa los campos requeridos.";return}m.textContent="Gracias, responderemos pronto.";f.reset()}))}
}
function sliderInit(root){
  const track=root.querySelector(".slider__track");
  const items=Array.from(root.querySelectorAll(".slider__item"));
  const prev=root.querySelector(".slider__btn--prev");
  const next=root.querySelector(".slider__btn--next");
  const dotsWrap=root.querySelector(".slider__dots");
  let perView=3,index=0,pages=0;
  function computePerView(){
    const w=root.clientWidth;
    if(w<=640)perView=1;else if(w<=980)perView=2;else perView=3;
    pages=Math.max(1,items.length-perView+1);
    if(index>pages-1)index=pages-1
  }
  function update(){
    const step=100/perView;
    track.style.transform=`translateX(-${index*step}%)`;
    prev.disabled=index===0;
    next.disabled=index>=pages-1;
    dotsWrap.innerHTML="";
    for(let i=0;i<pages;i++){const b=document.createElement("button");b.className="slider__dot";b.setAttribute("aria-current",i===index?"true":"false");b.addEventListener("click",()=>{index=i;update()});dotsWrap.appendChild(b)}
  }
  computePerView();update();
  prev.addEventListener("click",()=>{if(index>0){index--;update()}});
  next.addEventListener("click",()=>{if(index<pages-1){index++;update()}});
  addEventListener("resize",()=>{const o=perView;computePerView();if(perView!==o)update()});
  root.addEventListener("keydown",e=>{if(e.key==="ArrowLeft"){prev.click()}if(e.key==="ArrowRight"){next.click()}});
}
function tabsInit(root){
  const btns=Array.from(root.querySelectorAll(".tabs__btn"));
  const panels=Array.from(root.querySelectorAll(".tabs__panel"));
  function setActive(id){btns.forEach(b=>{const a=b.getAttribute("aria-controls")===id;b.classList.toggle("is-active",a);b.setAttribute("aria-selected",String(a))});panels.forEach(p=>{p.hidden=p.id!==id})}
  btns.forEach(b=>b.addEventListener("click",()=>setActive(b.getAttribute("aria-controls"))));
  const first=btns[0];if(first)setActive(first.getAttribute("aria-controls"));
  root.addEventListener("keydown",e=>{const i=btns.indexOf(document.activeElement);if(i>-1&&(e.key==="ArrowRight"||e.key==="ArrowLeft")){e.preventDefault();const d=e.key==="ArrowRight"?1:-1;const j=(i+d+btns.length)%btns.length;btns[j].focus()}});
}
loadModules();
