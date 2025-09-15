// modulos/memorias/memorias.jsx
const {useEffect,useState} = React;
const {SectionHeader, CarouselGrid} = window.UI;

// helpers
function useFetchJSON(url){
  const [data,setData]=useState(null);
  useEffect(()=>{
    let ok=true;
    fetch(url).then(r=>r.json())
      .then(j=>{ if(ok) setData(j) })
      .catch(()=>{ if(ok) setData(null) });
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

function Memorias({jsonUrl="data/memorias/memorias.json"}){
  const data = useFetchJSON(jsonUrl);
  // Soporta {titulo, intro, items:[...]} o directamente [...]
  const items = Array.isArray(data) ? data : (data?.items || []);
  const titulo = Array.isArray(data) ? "Memorias" : (data?.titulo || "Memorias");
  const intro  = Array.isArray(data) ? "" : (data?.intro || "Memorias destacadas de estudiantes.");

  function Card(m){
    return (
    <div className="card h-100 shadow-sm border-0">
      <div className="card-body py-3">
        <h5 className="mb-2 fw-bold">{m.titulo}</h5>

        <p className="mb-1">
          <span className="text-muted">Estudiante(s):</span>{' '}
          {Array.isArray(m.estudiantes) && m.estudiantes.length
            ? m.estudiantes.join(', ')
            : '—'}
        </p>

        <p className="mb-1">
          <span className="text-muted">Carrera:</span> {m.carrera || '—'}
        </p>

        {m.area && (
          <p className="mb-1">
            <span className="text-muted">Área:</span> {m.area}
          </p>
        )}

        <p className="mb-0">
          <span className="text-muted">Comisión Revisora:</span>{' '}
          {Array.isArray(m.comision_revisora) && m.comision_revisora.length
            ? m.comision_revisora.join(', ')
            : '—'}
        </p>
      </div>
    </div>
  );
  }

  return (
    <section className="nw-bs">
      <SectionHeader eyebrow="Académico" title={titulo} lead={intro}/>
      {/* Carrusel 2 columnas × 3 filas, controles arriba */}
      <CarouselGrid
        id="memoriasCarousel"
        items={items}
        renderItem={Card}
        cols={[1,2,2]}
        rows={3}
        controlsTop={true}
      />
    </section>
  );
}

window.mountMemorias = function(el){
  const jsonUrl = el.dataset.json || "data/memorias/memorias.json";
  ensureCss(el.dataset.css || "modulos/memorias/memorias-style.css");
  const root = ReactDOM.createRoot(el);
  root.render(<Memorias jsonUrl={jsonUrl} />);
};

