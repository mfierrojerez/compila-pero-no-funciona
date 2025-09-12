const {useEffect,useMemo,useRef,useState}=React;

function ensureCss(href){
  if(!href) return;
  if(!document.querySelector(`link[data-css="${href}"]`)){
    const l=document.createElement("link");
    l.rel="stylesheet"; l.href=href; l.dataset.css=href; document.head.appendChild(l);
  }
}
function useFetchJSON(url){
  const [data,setData]=useState([]);
  useEffect(()=>{let ok=true;
    fetch(url).then(r=>r.json()).then(j=>{if(ok)setData(j)}).catch(()=>{if(ok)setData([])});
    return ()=>ok=false;
  },[url]);
  return data;
}
function chunk(arr,n){const o=[];for(let i=0;i<arr.length;i+=n)o.push(arr.slice(i,i+n));return o}
function perSlideFromWidth(w){if(w<=576)return 1; return 2}

function Noticias({jsonUrl="data/noticias/noticiasfake.json",imgBase="data/noticias/imagenes/"}){
  const items=useFetchJSON(jsonUrl);

  const [perSlide,setPerSlide]=useState(()=>perSlideFromWidth(window.innerWidth));
  useEffect(()=>{
    const r=()=>setPerSlide(perSlideFromWidth(window.innerWidth));
    window.addEventListener("resize",r);
    return()=>window.removeEventListener("resize",r);
  },[]);
  const groups=useMemo(()=>chunk(items||[],perSlide),[items,perSlide]);

  const carouselId="newsCarousel";
  const modalRef=useRef(null);
  const [current,setCurrent]=useState(null);

  useEffect(()=>{ if(modalRef.current&&window.bootstrap) window.bootstrap.Modal.getOrCreateInstance(modalRef.current); },[]);
  useEffect(()=>{ if(!modalRef.current||!window.bootstrap) return; const m=window.bootstrap.Modal.getOrCreateInstance(modalRef.current); if(current) m.show(); },[current]);

  function resolveImg(name){
    if(!name) return null;
    if(/^https?:\/\//.test(name)||name.startsWith("/")) return name;
    return imgBase.replace(/\/?$/,"/")+name;
  }
  function openModal(item){ setCurrent(item) }
  function closeModal(){ if(!modalRef.current||!window.bootstrap) return; window.bootstrap.Modal.getOrCreateInstance(modalRef.current).hide(); setCurrent(null) }

  return (
    <div className="nw-bs">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <button type="button" className="btn btn-primary" data-bs-target={`#${carouselId}`} data-bs-slide="prev" aria-label="Anterior">‹ Anterior</button>
        <button type="button" className="btn btn-primary" data-bs-target={`#${carouselId}`} data-bs-slide="next" aria-label="Siguiente">Siguiente ›</button>
      </div>

      <div id={carouselId} className="carousel slide" data-bs-ride="false" data-bs-interval="false">
        <div className="carousel-inner">
          {groups.map((group,i)=>(
            <div className={"carousel-item"+(i===0?" active":"")} key={i}>
              <div className="row row-cols-1 row-cols-md-2 g-3">
                {group.map(n=>(
                  <div className="col" key={n.id}>
                    <div className="card h-100 shadow-sm border-0">
                      <div className="card-body py-3">
                        <div className="d-flex flex-column flex-md-row gap-3 align-items-start">
                          {n.imagenes && n.imagenes.length>0
                            ? <img className="thumb-portrait img-fluid d-block" src={resolveImg(n.imagenes[0])} alt=""/>
                            : <div className="thumb-portrait"></div>}
                          <div className="position-relative w-100">
                            <h5 className="mb-1">
                              <a href="#" className="stretched-link text-decoration-none fw-bold" onClick={e=>{e.preventDefault();openModal(n)}}>{n.titulo}</a>
                            </h5>
                            <div className="text-muted small mb-2">
                              {new Date(n.fecha).toLocaleDateString("es-CL",{year:"numeric",month:"long",day:"2-digit"})}
                            </div>
                            <p className="news-summary mb-0">{n.resumen}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="modal fade" ref={modalRef} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{current?.titulo||""}</h5>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick={closeModal} data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              {current && current.imagenes && current.imagenes.length>1 ? (
                <>
                  {(()=>{ const galleryId=`newsGallery-${current.id}`; return (
                    <>
                      <div id={galleryId} className="carousel slide mb-2" data-bs-ride="false" data-bs-interval="false">
                        <div className="carousel-inner">
                          {current.imagenes.map((img,idx)=>(
                            <div className={"carousel-item"+(idx===0?" active":"")} key={idx}>
                              <img src={resolveImg(img)} alt="" className="img-fluid d-block rounded"/>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="d-flex justify-content-between">
                        <button type="button" className="btn btn-primary" data-bs-target={`#${galleryId}`} data-bs-slide="prev" aria-label="Anterior">‹ Anterior</button>
                        <button type="button" className="btn btn-primary" data-bs-target={`#${galleryId}`} data-bs-slide="next" aria-label="Siguiente">Siguiente ›</button>
                      </div>
                    </>
                  )})()}
                </>
              ) : current && current.imagenes && current.imagenes.length===1 ? (
                <img src={resolveImg(current.imagenes[0])} alt="" className="img-fluid mb-3"/>
              ) : null}

              <div className="text-muted small mb-2">
                {current ? new Date(current.fecha).toLocaleDateString("es-CL",{year:"numeric",month:"long",day:"2-digit"}) : ""}
              </div>
              <p className="mb-0">{current?.texto||""}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.mountNoticias=function(el){
  const jsonUrl=el.dataset.json||"data/noticias/noticiasfake.json";
  const imgBase=el.dataset.imgBase||"data/noticias/imagenes/";
  ensureCss(el.dataset.css||"modulos/noticias/noticias-style.css");
  const root=ReactDOM.createRoot(el);
  root.render(<Noticias jsonUrl={jsonUrl} imgBase={imgBase} />);
};






