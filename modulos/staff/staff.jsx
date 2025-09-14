const {useEffect,useState}=React;
const {SectionHeader,CarouselGrid,ModalGallery,InfoGrid, MediaInfoList}=window.UI;

function useFetchJSON(url){
  const [data,setData]=useState([]);
  useEffect(()=>{
    let ok=true;
    fetch(url).then(r=>r.json()).then(j=>{ if(ok) setData(j) }).catch(()=>{ if(ok) setData([]) });
    return ()=>ok=false;
  },[url]);
  return data;
}

function ensureCss(href){
  if(!href) return;
  if(!document.querySelector(`link[data-css="${href}"]`)){
    const l=document.createElement("link");
    l.rel="stylesheet"; l.href=href; l.dataset.css=href;
    document.head.appendChild(l);
  }
}

function Staff({jsonUrl="data/staff/", imgBase="data/staff/imagenes/"}){
  const [tab,setTab]=useState("acad"); // acad | admin | hist | pt

  function resolveJson(baseOrFile, t){
    if(/\.json$/i.test(baseOrFile)) return baseOrFile; // si viene un .json explícito, úsalo tal cual
    const file = t==="acad" ? "academicos.json"
               : t==="admin" ? "administrativos.json"
               : t==="hist" ? "historicos.json"
               : "parttime.json";
    return baseOrFile.replace(/\/?$/,"/")+file;
  }

  const items=useFetchJSON(resolveJson(jsonUrl, tab));

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

  function url(p){if(!p) return null; if(/https?:\/\//.test(p)||p.startsWith("/")) return p; return imgBase.replace(/\/?$/,"/")+p.replace(/^\/+/,"");}

  function Card(n){
    const img = n.imagen ? url(n.imagen) : (n.imagenes&&n.imagenes[0] ? url(n.imagenes[0]) : null);
    return (
      <div className="card h-100 shadow-sm border-0">
        <div className="card-body py-3">
          <div className="d-flex gap-3 align-items-start flex-column flex-md-row">
            {img ? <img className="thumb-portrait img-fluid d-block rounded" src={img} alt=""/>
                 : <div className="thumb-portrait rounded"></div>}
            <div className="position-relative w-100">
              <h5 className="mb-1">
                <a href="#" className="stretched-link text-decoration-none fw-bold"
                   onClick={e=>{e.preventDefault();setCurrent(n)}}>
                  {n.nombre}
                </a>
              </h5>
              {n.cargo ? <div className="text-muted small mb-1">{n.cargo}</div> : null}
              {n.correo ? <div className="small"><a href={`mailto:${n.correo}`}>{n.correo}</a></div> : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function CardHistoric(h){
  const img = h.imagen ? url(h.imagen) : (h.imagenes&&h.imagenes[0] ? url(h.imagenes[0]) : null);
  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="card-body py-3">
        <div className="d-flex gap-3 align-items-start flex-column flex-md-row">
          {img ? <img className="thumb-portrait img-fluid d-block rounded" src={img} alt=""/> : <div className="thumb-portrait rounded"></div>}
          <div className="w-100">
            <h5 className="mb-1 fw-bold">{h.nombre}</h5>
            {h.rol && <div className="text-muted mb-2">{h.rol}</div>}
            {h.resumen && <p className="mb-2">{h.resumen}</p>}
            {Array.isArray(h.formacion) && h.formacion.length>0 && (
              <>
                <h6 className="mb-1">Formación</h6>
                <ul className="mb-2">{h.formacion.map((li,i)=><li key={i}>{li}</li>)}</ul>
              </>
            )}
            {h.asignaturas && <p className="mb-0"><span className="text-muted">Asignaturas dictadas:</span> {h.asignaturas}</p>}
          </div>
        </div>
      </div>
    </div>
  );
  }

  function CardPartTime(p){
  const titulo = p.tituloAsignaturas || p.titulo || (p.semestre || p.periodo || p.etiqueta ? `Asignaturas ${p.semestre||p.periodo||p.etiqueta}` : "Asignaturas");
  return (
    <div className="card h-100 shadow-sm border-0">
      <div className="card-body py-3">
        <h5 className="mb-1 fw-bold">{p.nombre}</h5>
        <div className="text-muted mb-2">{titulo}:</div>
        {Array.isArray(p.asignaturas) && p.asignaturas.length>0 && (
          <ul className="mb-0 ps-4">
            {p.asignaturas.map((a,i)=>(<li key={i}>{a}</li>))}
          </ul>
        )}
      </div>
    </div>
  );
}


  return (
    <div className="nw-bs">
      <SectionHeader eyebrow="Personas" title="STAFF" lead="Académicos, administrativos, históricos y part-time."/>

      {/* Botones para cambiar carrusel */}
      <div className="d-flex flex-wrap gap-2 mb-3">
        <button className={`btn ${tab==='acad'?'btn-primary':'btn-outline-dark'}`} onClick={()=>setTab('acad')}>Académicos</button>
        <button className={`btn ${tab==='admin'?'btn-primary':'btn-outline-dark'}`} onClick={()=>setTab('admin')}>Administrativos</button>
        <button className={`btn ${tab==='hist'?'btn-primary':'btn-outline-dark'}`} onClick={()=>setTab('hist')}>Históricos</button>
        <button className={`btn ${tab==='pt'?'btn-primary':'btn-outline-dark'}`} onClick={()=>setTab('pt')}>Part-time</button>
      </div>

      {tab === 'admin' ? (
        <MediaInfoList
          items={items}
          cols={[1,1,1]}
          limit={3}
          resolveImage={(p)=> p.imagen ? url(p.imagen) : (p.imagenes && p.imagenes[0] ? url(p.imagenes[0]) : null)}
          renderText={(p)=>(
          <>
            <h5 className="mb-1 fw-bold">{p.nombre}</h5>
            {p.cargo && <div className="text-muted mb-2">{p.cargo}</div>}
            {p.ubicacion && <p className="mb-1"><span className="text-muted">Ubicación:</span> {p.ubicacion}</p>}
            {p.fono && <p className="mb-1"><span className="text-muted">Fono:</span> {p.fono}</p>}
            {p.correo && <p className="mb-0"><span className="text-muted">Correo:</span> <a href={`mailto:${p.correo}`}>{p.correo}</a></p>}
          </>
          )}
        />
      ) : tab === 'hist' ? (
        <CarouselGrid
          id={`staffCarousel-${tab}`}
          items={items}
          renderItem={CardHistoric}
          cols={[1,2,2]}
          rows={2}
        />
      ) : tab === 'pt' ? (
          <InfoGrid
            items={items}
            renderItem={CardPartTime}
            cols={[1,2,2]}
          />
      ) : (
        <CarouselGrid id={`staffCarousel-${tab}`} items={items} renderItem={Card} cols={[1,2,2]} rows={2} />
      )}


      {/* Modal detalle */}
      <div className="modal fade" ref={modalRef} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{current?.nombre||""}</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div className="modal-body">
              {current ? (
                <>
                  <ModalGallery
                    id={`staffGallery-${(current.id||current.nombre||'x').toString().replace(/\s+/g,'-')}`}
                    images={
                      (current.imagenes && current.imagenes.length
                        ? current.imagenes
                        : (current.imagen ? [current.imagen] : [])
                      ).map(url)
                    }
                  />
                  {current.cargo ? <p className="mb-1"><strong>{current.cargo}</strong></p> : null}
                  {current.correo ? <p className="mb-2"><a href={`mailto:${current.correo}`}>{current.correo}</a></p> : null}
                  {current.formacion && current.formacion.length ? (
                    <>
                      <ul className="mb-0">
                        {current.formacion.map((li,i)=>(<li key={i}>{li}</li>))}
                      </ul>
                    </>
                  ) : null}
                  {current.investigacion && current.investigacion.length ? (
                    <>
                      <h6 className="mt-3">Líneas de Investigación:</h6>
                      <ul className="mb-0">
                        {current.investigacion.map((li,i)=>(<li key={i}>{li}</li>))}
                      </ul>
                    </>
                  ) : null}
                  {current.asignaturas && current.asignaturas.length ? (
                    <>
                      <h6 className="mt-3">Asignaturas Semestre Otoño 2025:</h6>
                      <ul className="mb-0">
                        {current.asignaturas.map((li,i)=>(<li key={i}>{li}</li>))}
                      </ul>
                    </>
                  ) : null}
                </>
              ): null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.mountStaff=function(el){
  const jsonUrl = el.dataset.json || "data/staff/";                
  const imgBase = el.dataset.imgBase || "data/staff/imagenes/";
  ensureCss(el.dataset.css || "modulos/staff/staff-style.css");
  const root=ReactDOM.createRoot(el);
  root.render(<Staff jsonUrl={jsonUrl} imgBase={imgBase} />);
};

