const { useEffect, useState, useMemo, useRef } = React;

function useFetchJSON(url) {
  const [data, setData] = useState([]);
  useEffect(() => {
    let active = true;
    fetch(url)
      .then(res => res.json())
      .then(json => { if(active) setData(json); })
      .catch(() => { if(active) setData([]); });
    return () => active = false;
  }, [url]);
  return data;
}

function chunk(arr, size) {
  const result = [];
  for(let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

function perSlideFromWidth(width) {
  return 1;
}

function Proyectos({jsonUrl="data/proyectos/proyectos.json",imgBase="data/proyectos/imagenes"}) {
  const items = useFetchJSON(jsonUrl);
  const [perSlide, setPerSlide] = useState(() => perSlideFromWidth(window.innerWidth));
  
  useEffect(() => {
    function onResize() {
      setPerSlide(perSlideFromWidth(window.innerWidth));
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  
  const groups = useMemo(() => chunk(items, perSlide), [items, perSlide]);
  
  const carouselId = useMemo(() => `proyectosCarousel-${Math.random().toString(36).slice(2,8)}`, []);
  const modalRef = useRef(null);
  const [current, setCurrent] = useState(null);
  
  useEffect(() => {
    if(modalRef.current && window.bootstrap) {
      window.bootstrap.Modal.getOrCreateInstance(modalRef.current);
    }
  }, []);
  
  useEffect(() => {
    if(!modalRef.current || !window.bootstrap) return;
    const modal = window.bootstrap.Modal.getOrCreateInstance(modalRef.current);
    if(current) modal.show();
  }, [current]);
  
  function resolveImg(name) {
    if(!name) return null;
    if(/^https?:\/\//.test(name) || name.startsWith("/")) return name;
    return imgBase.replace(/\/?$/, "/") + name;
  }
  
  function openModal(item) {
    setCurrent(item);
  }
  
  function closeModal() {
    if(!modalRef.current || !window.bootstrap) return;
    window.bootstrap.Modal.getOrCreateInstance(modalRef.current).hide();
    setCurrent(null);
  }
  
  return (
    <div>
      <div className="d-flex justify-content-between mb-3">
        <button className="btn btn-primary" type="button" data-bs-target={`#${carouselId}`} data-bs-slide="prev">‹ Anterior</button>
        <button className="btn btn-primary" type="button" data-bs-target={`#${carouselId}`} data-bs-slide="next">Siguiente ›</button>
      </div>
      
      <div id={carouselId} className="carousel slide" data-bs-ride="false">
        <div className="carousel-inner">
          {groups.map((group, i) => (
            <div className={"carousel-item" + (i === 0 ? " active" : "")} key={i}>
              <div className="row row-cols-1 row-cols-md-2 g-3">
                {group.map(p => (
                  <div className="col" key={p.id}>
                    <div className="card h-100">
                      <img src={resolveImg(p.imagen)} alt="" className="card-img-top" />
                      <div className="card-body">
                        <h5>
                          <a href="#" onClick={e => { e.preventDefault(); openModal(p); }} className="stretched-link">{p.titulo}</a>
                        </h5>
                        <p>{p.resumen}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Modal para mostrar detalle */}
      <div className="modal fade" ref={modalRef} tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{current?.titulo || ""}</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Cerrar"
                onClick={closeModal}
                data-bs-dismiss="modal"
              />
            </div>
            <div className="modal-body">
              {current?.imagen && (
                <img
                  src={resolveImg(current.imagen)}
                  alt={current.titulo || ""}
                  className="img-fluid mb-3 rounded"
                />
              )}
              <p>{current?.texto?.split('\n').map((p, i) => (
                <p key={i}>{p}</p>
                )) || "No hay descripción disponible."}</p>
              {current?.link && (
                <a
                  href={current.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary mt-3"
                >
                  Ver más
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Montar componente en contenedor
window.mountProyectos = function(el) {
  const jsonUrl = el.dataset.json || "data/proyectos/proyectos.json";
  const imgBase = el.dataset.imgBase || "data/proyectos/imagenes/";
  ReactDOM.createRoot(el).render(<Proyectos jsonUrl={jsonUrl} imgBase={imgBase} />);
};
