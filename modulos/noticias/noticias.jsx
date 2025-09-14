const {useEffect,useState}=React;
const {SectionHeader,CarouselGrid,ModalGallery}=window.UI;

function useFetchJSON(url){
  const [data,setData]=useState([]);
  useEffect(()=>{let ok=true;fetch(url).then(r=>r.json()).then(j=>{if(ok)setData(j)}).catch(()=>{if(ok)setData([])});return()=>ok=false},[url]);
  return data;
}

function ensureCss(href){
  if(!href) return;
  if(!document.querySelector(`link[data-css="${href}"]`)){
    const l=document.createElement("link");
    l.rel="stylesheet"; l.href=href; l.dataset.css=href; document.head.appendChild(l);
  }
}

function Noticias({jsonUrl="data/noticias/noticias.json",imgBase="data/noticias/imagenes/"}){
  const items=useFetchJSON(jsonUrl);
  const [current,setCurrent]=useState(null);
  const modalRef=React.useRef(null);
  useEffect(()=>{
  if(!modalRef.current || !window.bootstrap) return;
  const m = window.bootstrap.Modal.getOrCreateInstance(modalRef.current,{backdrop:true,focus:true});
  const onHide = () => {
    const ae=document.activeElement;
    if(ae && modalRef.current.contains(ae)) ae.blur();
  };
  const onHidden = () => setCurrent(null);
  modalRef.current.addEventListener("hide.bs.modal", onHide);
  modalRef.current.addEventListener("hidden.bs.modal", onHidden);
  return ()=>{
    modalRef.current?.removeEventListener("hide.bs.modal", onHide);
    modalRef.current?.removeEventListener("hidden.bs.modal", onHidden);
  };
},[]);

useEffect(()=>{
  if(!modalRef.current || !window.bootstrap) return;
  const m = window.bootstrap.Modal.getOrCreateInstance(modalRef.current);
  if(current){ requestAnimationFrame(()=>m.show()); }
},[current]);

  function url(p){if(!p)return null;if(/https?:\/\//.test(p)||p.startsWith("/")) return p; return imgBase.replace(/\/?$/,"/")+p;}
  
  function Card(n){
    const img=n.imagenes&&n.imagenes[0]?url(n.imagenes[0]):null;
    return (
      <div className="card h-100 shadow-sm border-0">
        <div className="card-body py-3">
          <div className="d-flex flex-column flex-md-row gap-3 align-items-start">
            {img?<img className="thumb-portrait img-fluid d-block" src={img} alt=""/>:<div className="thumb-portrait"></div>}
            <div className="position-relative w-100">
              <h5 className="mb-1">
                <a href="#" className="stretched-link text-decoration-none fw-bold" onClick={e=>{e.preventDefault();setCurrent(n)}}>
                  {n.titulo}
                </a>
              </h5>
              <div className="text-muted small mb-2">{new Date(n.fecha).toLocaleDateString("es-CL",{year:"numeric",month:"long",day:"2-digit"})}</div>
              <p className="news-summary mb-0">{n.resumen}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="nw-bs">
      <SectionHeader eyebrow="Actualidad" title="Noticias" lead="Principales novedades y anuncios institucionales."/>
      <CarouselGrid id="newsCarousel" items={items} renderItem={Card} cols={[1,2,2]} rows={2} />
      <div className="modal fade" ref={modalRef} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{current?.titulo||""}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              {current?<ModalGallery id={`newsGallery-${current.id}`} images={(current.imagenes||[]).map(url)} />:null}
              <div className="text-muted small mb-2">{current?new Date(current.fecha).toLocaleDateString("es-CL",{year:"numeric",month:"long",day:"2-digit"}):""}</div>
              <p className="mb-0">{current?.resumen||""}</p>
              <p className="mb-0">{current?.texto||""}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.mountNoticias=function(el){
  const jsonUrl=el.dataset.json||"data/noticias/noticias.json";
  const imgBase=el.dataset.imgBase||"data/noticias/imagenes/";
  ensureCss(el.dataset.css||"modulos/noticias/noticias-style.css");
  const root=ReactDOM.createRoot(el);
  root.render(<Noticias jsonUrl={jsonUrl} imgBase={imgBase} />);
};






