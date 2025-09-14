const {useMemo} = React;
const {SectionHeader} = window.UI || {};

function Contacto({mapSrc="data/contacto/ubicacion.jpg"}) {
  const collapseId = useMemo(()=>`mapCollapse-${Math.random().toString(36).slice(2,8)}`,[]);
  return (
    <section className="nw-bs">
      {SectionHeader
        ? <SectionHeader eyebrow="Hablemos" title="Contacto" lead="Escribenos"/>
        : (
          <div className="section__header">
            <span className="eyebrow">Hablemos</span>
            <h2>Contacto</h2>
            <p className="lead">Dirección, teléfonos y redes.</p>
          </div>
        )
      }

      <div className="row g-3">
  {/* Fila 1: Información + botón (en la misma tarjeta) */}
  <div className="col-12">
    <div className="card h-100 shadow-sm border-0">
      <div className="card-body">
          <div className="ms-md-auto">
            <h3 className="h6  mb-2">Escríbenos</h3>
            <p className=" mb-3">Pronto habilitaremos el formulario.</p>
            <button type="button" className="btn btn-primary">Enviar mensaje</button>
          </div>
      </div>
    </div>
  </div>

  {/* Fila 2: Cómo llegar (mapa) */}
  <div className="col-12">
    <div className="card h-100 shadow-sm border-0">
      <div className="card-body">
        <h3 className="h5">Cómo llegar</h3>
        <p className="text-muted">Presiona para ver el mapa.</p>

        <button
          className="btn btn-outline-secondary mb-3"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target={`#${collapseId}`}
          aria-expanded="false"
          aria-controls={collapseId}
        >
          Mostrar mapa
        </button>

        <div id={collapseId} className="collapse contact-map">
          <img
            src={mapSrc}
            alt="Mapa de ubicación"
            className="img-fluid w-100 rounded"
            loading="lazy"
            decoding="async"
          />
        </div>
      </div>
    </div>
  </div>
</div>

    </section>
  );
}

window.mountContacto = function(el){
  const mapSrc = el.dataset.img || "data/contacto/ubicacion.jpg";
  const root = ReactDOM.createRoot(el);
  root.render(<Contacto mapSrc={mapSrc} />);
};
