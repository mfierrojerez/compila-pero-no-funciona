const { useMemo } = React;

function Hero({ img="data/portada.jpg" }) {
  const alt = useMemo(()=> "Campus universitario", []);
  return (
    <section className="hero-section">
      <div className="container py-5">
        <div className="row align-items-center g-4">
          <div className="col-12 col-lg-5 col-xl-5">
            <span className="eyebrow d-block mb-1">Bienvenidos</span>
            <h1 className="mb-2">Departamento de Ingeniería en Obras Civiles</h1>
            <p className="lead mb-3">Forma tu futuro con excelencia académica.</p>
            <div className="d-flex flex-wrap gap-2">
              <a className="btn btn-primary"
                 href="http://admision.userena.cl/carreras/ingenieria-civil">
                Postula Ahora
              </a>
              <a className="btn btn-outline-secondary" href="#carreras">
                Oferta Académica
              </a>
            </div>
          </div>

          <div className="col-12 col-lg-7 col-xl-7">
            <img
              className="img-fluid w-100 rounded-3 shadow-sm hero-img"
              alt={alt}
              loading="lazy"
              decoding="async"
              src={img}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

window.mountHero = function(el){
  const img = el.dataset.img || "data/portada.jpg";
  const root = ReactDOM.createRoot(el);
  root.render(<Hero img={img} />);
};
