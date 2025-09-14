const {useEffect,useState}=React;
const {SectionHeader}=window.UI;

function ensureCss(href){
  if(!href) return;
  if(!document.querySelector(`link[data-css="${href}"]`)){
    const l=document.createElement("link");
    l.rel="stylesheet"; l.href=href; l.dataset.css=href;
    document.head.appendChild(l);
  }
}
function useFetchJSON(url){
  const [data,setData]=useState([]);
  useEffect(()=>{
    let ok=true;
    fetch(url).then(r=>r.json()).then(j=>{ if(ok) setData(j) }).catch(()=>{ if(ok) setData([]) });
    return ()=>ok=false;
  },[url]);
  return data;
}
function resolveImg(base, name){
  if(!name) return null;
  if(/^https?:\/\//.test(name) || name.startsWith("/")) return name;
  return base.replace(/\/?$/,"/")+name.replace(/^\/+/,"");
}

/* -------- Componentes de vista -------- */

function VistaResena({jsonBase,imgBase}){
  const data = useFetchJSON(jsonBase.replace(/\/?$/,"/")+"reseña.json");
  const src  = resolveImg(imgBase, data?.imagen);
  const paragraphs = Array.isArray(data?.parrafos) ? data.parrafos : (data?.texto ? [data.texto] : []);
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <div className="row g-3 align-items-start">
          {src && (
            <div className="col-md-4">
              <img className="img-fluid w-100 rounded depto-thumb" src={src} alt="Imagen reseña"/>
            </div>
          )}
          <div className={src ? "col-md-8" : "col-12"}>
            <h5 className="fw-bold mb-2">{data?.titulo || "Reseña"}</h5>
            {(paragraphs.length ? paragraphs : ["Contenido en preparación."])
              .map((p,i)=>(<p className="mb-2" key={i}>{p}</p>))}
          </div>
        </div>
      </div>
    </div>
  );
}

function VistaAreas({jsonBase}){
  const data = useFetchJSON(jsonBase.replace(/\/?$/,"/")+"areas.json");
  const items = Array.isArray(data) ? data : [];   // 3 paneles esperados
  const accId = React.useMemo(()=> "areasAcc-"+Math.random().toString(36).slice(2,8), []);

  return (
    <div className="accordion" id={accId}>
      {items.map((a,i)=>(
        <div className="accordion-item" key={a.id||i}>
          <h2 className="accordion-header" id={`${accId}-h-${i}`}>
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#${accId}-c-${i}`}
              aria-expanded="false"
              aria-controls={`${accId}-c-${i}`}
            >
              {a.titulo || a.nombre || `Área ${i+1}`}
            </button>
          </h2>
          <div
            id={`${accId}-c-${i}`}
            className="accordion-collapse collapse"
            aria-labelledby={`${accId}-h-${i}`}
            data-bs-parent={`#${accId}`}
          >
            <div className="accordion-body">
              {a.descripcion && <p className="mb-2">{a.descripcion}</p>}
              {Array.isArray(a.parrafos) && a.parrafos.map((p,ix)=>(<p className="mb-2" key={ix}>{p}</p>))}
              {a.academicos && (
                typeof a.academicos === "string"
                  ? <p className="mb-0"><strong>Académicos del Área:</strong> {a.academicos}</p>
                  : Array.isArray(a.academicos) && a.academicos.length>0
                    ? <>
                        <p className="mb-1"><strong>Académicos del Área:</strong></p>
                        <ul className="mb-0">
                          {a.academicos.map((n,ni)=>(<li key={ni}>{n}</li>))}
                        </ul>
                      </>
                    : null
              )}
            </div>
          </div>
        </div>
      ))}
      {items.length===0 && (
        <div className="text-muted">Sin áreas para mostrar.</div>
      )}
    </div>
  );
}

function VistaLaboratorios({jsonBase, imgBase}){
  const data  = useFetchJSON(jsonBase.replace(/\/?$/,"/")+"laboratorios.json");
  const items = Array.isArray(data) ? data : [];
  const accId = React.useMemo(()=> "labsAcc-"+Math.random().toString(36).slice(2,8), []);

  function imgSrc(name){
    if(!name) return null;
    if(/^https?:\/\//.test(name) || name.startsWith("/")) return name;
    return (imgBase||"").replace(/\/?$/,"/")+name.replace(/^\/+/,"");
  }

  return (
    <div className="accordion" id={accId}>
      {items.map((lab,i)=>{
        const src = imgSrc(lab.imagen);
        return (
          <div className="accordion-item" key={lab.id||i}>
            <h2 className="accordion-header" id={`${accId}-h-${i}`}>
              <button
                className="accordion-button collapsed"
                type="button"
                data-bs-toggle="collapse"
                data-bs-target={`#${accId}-c-${i}`}
                aria-expanded="false"
                aria-controls={`${accId}-c-${i}`}
              >
                {lab.titulo || `Laboratorio ${i+1}`}
              </button>
            </h2>
            <div
              id={`${accId}-c-${i}`}
              className="accordion-collapse collapse"
              aria-labelledby={`${accId}-h-${i}`}
              data-bs-parent={`#${accId}`}
            >
              <div className="accordion-body">
                <div className="row g-3 align-items-start">
                  {src && (
                    <div className="col-md-4">
                      <img className="img-fluid w-100 rounded lab-thumb" src={src} alt={lab.titulo||"Laboratorio"}/>
                    </div>
                  )}
                  <div className={src ? "col-md-8" : "col-12"}>
                    {Array.isArray(lab.parrafos)
                      ? lab.parrafos.map((p,ix)=>(<p className="mb-2" key={ix}>{p}</p>))
                      : (lab.descripcion ? <p className="mb-2">{lab.descripcion}</p> : null)
                    }
                    {lab.jefe && <p className="mb-1"><strong>Jefe Laboratorio:</strong> {lab.jefe}</p>}
                    {lab.encargado && <p className="mb-0"><strong>Encargado:</strong> {lab.encargado}</p>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      {items.length===0 && <div className="text-muted">Sin laboratorios para mostrar.</div>}
    </div>
  );
}


/* -------- Componente principal -------- */

function Departamento({jsonBase="data/departamento", imgBase="data/departamento/imagenes"}){
  const [tab,setTab] = useState("reseña"); // 'resena' | 'areas' | 'labs'

  return (
    <div className="nw-bs mod-depto">
      <SectionHeader eyebrow="Nuestro Departamento" title="Departamento" lead="Reseña institucional, áreas y laboratorios."/>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <button className={`btn ${tab==='resena'?'btn-primary':'btn-outline-dark'}`} onClick={()=>setTab('reseña')}>Reseña</button>
        <button className={`btn ${tab==='areas'?'btn-primary':'btn-outline-dark'}`} onClick={()=>setTab('areas')}>Áreas</button>
        <button className={`btn ${tab==='labs'?'btn-primary':'btn-outline-dark'}`} onClick={()=>setTab('labs')}>Laboratorios</button>
      </div>

      {tab==='reseña' && <VistaResena jsonBase={jsonBase} imgBase={imgBase} />}
      {tab==='areas'  && <VistaAreas  jsonBase={jsonBase} />}
      {tab==='labs'   && <VistaLaboratorios jsonBase={jsonBase} imgBase={imgBase} />}
    </div>
  );
}


window.mountDepartamento = function(el){
  const jsonBase = el.dataset.json || "data/departamento";
  const imgBase  = el.dataset.imgBase || "data/departamento/imagenes";
  ensureCss(el.dataset.css || "modulos/departamento/departamento-style.css");
  const root = ReactDOM.createRoot(el);
  root.render(<Departamento jsonBase={jsonBase} imgBase={imgBase} />);
};


