const {useEffect,useState} = React;
const {SectionHeader} = window.UI;

function ensureCss(href){
  if(!href) return;
  if(!document.querySelector(`link[data-css="${href}"]`)){
    const l=document.createElement("link");
    l.rel="stylesheet"; l.href=href; l.dataset.css=href;
    document.head.appendChild(l);
  }
}

function useFetchJSON(url){
  const [data,setData]=useState(null);
  useEffect(()=>{
    let ok=true;
    fetch(url).then(r=>r.json()).then(j=>{ if(ok) setData(j) }).catch(()=>{ if(ok) setData(null) });
    return ()=>ok=false;
  },[url]);
  return data;
}

/* -------- Componentes de vista -------- */

function VistaDescripcion({jsonBase}){
  const data = useFetchJSON(jsonBase.replace(/\/?$/,"/")+"descripcion.json");
  const paragraphs = Array.isArray(data?.parrafos) ? data.parrafos : (data?.texto ? [data.texto] : []);
  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h5 className="fw-bold mb-3">{data?.titulo || "Descripción"}</h5>
        {(paragraphs.length ? paragraphs : ["Contenido en preparación."])
          .map((p,i)=>(<p className="mb-2" key={i}>{p}</p>))}
      </div>
    </div>
  );
}

function VistaPerfil({jsonBase}){
  const data = useFetchJSON(jsonBase.replace(/\/?$/,"/")+"perfil.json");
  const categorias = data?.categorias || {};

  return (
    <div className="card shadow-sm border-0">
      <div className="card-body">
        <h5 className="fw-bold mb-3">{data?.titulo || "Perfil de Egreso"}</h5>
        {data?.intro && <p className="mb-3">{data.intro}</p>}

        {Object.keys(categorias).length>0 ? (
          Object.entries(categorias).map(([cat, items],i)=>(
            <div className="mb-3" key={i}>
              <h6 className="fw-bold">{cat}</h6>
              <ul className="mb-0">
                {items.map((item,ix)=>(<li key={ix}>{item}</li>))}
              </ul>
            </div>
          ))
        ) : (
          <div className="text-muted">Sin perfil de egreso disponible.</div>
        )}
      </div>
    </div>
  );
}

function VistaPlan({jsonBase}){
  const data = useFetchJSON(jsonBase.replace(/\/?$/,"/")+"plan.json");
  const items = Array.isArray(data?.subsecciones) ? data.subsecciones : [];
  const accId = React.useMemo(()=> "planAcc-"+Math.random().toString(36).slice(2,8), []);

  return (
    <div className="accordion" id={accId}>
      {items.map((sec,i)=>(
        <div className="accordion-item" key={i}>
          <h2 className="accordion-header" id={`${accId}-h-${i}`}>
            <button
              className="accordion-button collapsed"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target={`#${accId}-c-${i}`}
              aria-expanded="false"
              aria-controls={`${accId}-c-${i}`}
            >
              {sec.titulo || `Sección ${i+1}`}
            </button>
          </h2>
          <div
            id={`${accId}-c-${i}`}
            className="accordion-collapse collapse"
            aria-labelledby={`${accId}-h-${i}`}
            data-bs-parent={`#${accId}`}
          >
            <div className="accordion-body">
              {Array.isArray(sec.items)
                ? <ul>{sec.items.map((it,ix)=>(<li key={ix}>{it}</li>))}</ul>
                : (sec.texto ? <p>{sec.texto}</p> : null)}
            </div>
          </div>
        </div>
      ))}
      {items.length===0 && (
        <div className="text-muted">Sin plan de estudio para mostrar.</div>
      )}
    </div>
  );
}

/* -------- Componente principal -------- */

function Carrera({jsonBase="data/carreras"}){
  const [tab,setTab] = useState("descripcion"); // 'descripcion' | 'perfil' | 'plan'

  return (
    <div className="nw-bs mod-carrera">
      <SectionHeader eyebrow="Nuestra Carrera" title="Ingeniería Civil" lead="Descripción, perfil de egreso y plan de estudio."/>

      <div className="d-flex flex-wrap gap-2 mb-3">
        <button className={`btn ${tab==='descripcion'?'btn-primary':'btn-outline-dark'}`} onClick={()=>setTab('descripcion')}>Descripción</button>
        <button className={`btn ${tab==='perfil'?'btn-primary':'btn-outline-dark'}`} onClick={()=>setTab('perfil')}>Perfil de Egreso</button>
        <button className={`btn ${tab==='plan'?'btn-primary':'btn-outline-dark'}`} onClick={()=>setTab('plan')}>Plan de Estudio</button>
      </div>

      {tab==='descripcion' && <VistaDescripcion jsonBase={jsonBase} />}
      {tab==='perfil'      && <VistaPerfil jsonBase={jsonBase} />}
      {tab==='plan'        && <VistaPlan jsonBase={jsonBase} />}
    </div>
  );
}

/* -------- Montaje -------- */

window.mountCarreras = function(el){
  const jsonBase = el.dataset.json || "data/carreras";
  ensureCss(el.dataset.css || "modulos/carreras-style.css");
  const root = ReactDOM.createRoot(el);
  root.render(<Carrera jsonBase={jsonBase} />);
};
