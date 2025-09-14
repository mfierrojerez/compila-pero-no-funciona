/** shared/ui.jsx **/
const {useEffect,useMemo,useState}=React;

function chunk(a,n){const o=[];for(let i=0;i<a.length;i+=n)o.push(a.slice(i,i+n));return o}
function perColsFromWidth(w,one,two,three){if(w<=576)return one; if(w<=992)return two; return three}

function SectionHeader({eyebrow,title,lead}) {
  return (
    <div className="section__header">
      {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
      <h2>{title}</h2>
      {lead ? <p className="lead">{lead}</p> : null}
    </div>
  );
}

/* CarouselGrid con soporte de filas (rows) y 1/2/3 columnas por breakpoint */
function CarouselGrid({id,items=[],renderItem,cols=[1,2,2],rows=1,controlsTop=true}){
  const colsForW = ()=>perColsFromWidth(window.innerWidth, cols[0]||1, cols[1]||cols[0]||1, cols[2]||cols[1]||cols[0]||1);
  const computePerSlide = ()=> colsForW()*rows;

  const [perSlide,setPerSlide]=useState(computePerSlide());
  useEffect(()=>{ const onR=()=>setPerSlide(computePerSlide()); addEventListener("resize",onR); return ()=>removeEventListener("resize",onR) },[cols,rows]);

  const groups=useMemo(()=>chunk(items,perSlide),[items,perSlide]);

  const rowClass=[
    "row","g-3",
    `row-cols-${cols[0]||1}`,
    cols[1]?`row-cols-md-${cols[1]}`:"",
    cols[2]?`row-cols-lg-${cols[2]}`:""
  ].filter(Boolean).join(" ");

  return (
    <div className="nw-bs">
      {controlsTop&&(
        <div className="d-flex justify-content-between align-items-center mb-3">
          <button type="button" className="btn btn-primary" data-bs-target={`#${id}`} data-bs-slide="prev" aria-label="Anterior">‹ Anterior</button>
          <button type="button" className="btn btn-primary" data-bs-target={`#${id}`} data-bs-slide="next" aria-label="Siguiente">Siguiente ›</button>
        </div>
      )}
      <div id={id} className="carousel slide" data-bs-ride="false" data-bs-interval="false">
        <div className="carousel-inner">
          {groups.map((group,i)=>(
            <div className={"carousel-item"+(i===0?" active":"")} key={i}>
              <div className={rowClass}>
                {group.map((it,idx)=>(<div className="col" key={idx}>{renderItem(it)}</div>))}
                {group.length<perSlide && Array.from({length:perSlide-group.length}).map((_,k)=>(<div className="col" key={"ghost-"+k}></div>))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ModalGallery({id,images}) {
  if(!images||images.length===0) return null;
  if(images.length===1) return <img src={images[0]} alt="" className="img-fluid mb-3 rounded"/>;
  return (
    <>
      <div id={id} className="carousel slide mb-2" data-bs-ride="false" data-bs-interval="false">
        <div className="carousel-inner">
          {images.map((src,i)=>(
            <div className={"carousel-item"+(i===0?" active":"")} key={i}>
              <img src={src} alt="" className="img-fluid d-block rounded"/>
            </div>
          ))}
        </div>
      </div>
      <div className="d-flex justify-content-between">
        <button type="button" className="btn btn-primary" data-bs-target={`#${id}`} data-bs-slide="prev" aria-label="Anterior">‹ Anterior</button>
        <button type="button" className="btn btn-primary" data-bs-target={`#${id}`} data-bs-slide="next" aria-label="Siguiente">Siguiente ›</button>
      </div>
    </>
  );
}

function InfoGrid({items=[], renderItem, cols=[1,2,3], limit=null, className="", emptyText="No hay elementos para mostrar."}){
  const shown = Array.isArray(items) ? (limit ? items.slice(0,limit) : items) : [];
  const rowClass = [
    "row","g-3",
    `row-cols-${cols[0]||1}`,
    cols[1]?`row-cols-md-${cols[1]}`:"",
    cols[2]?`row-cols-lg-${cols[2]}`:""
  ].filter(Boolean).join(" ");
  if(!shown.length) return <p className="text-muted mb-0">{emptyText}</p>;
  return (
    <div className={className}>
      <div className={rowClass}>
        {shown.map((it,i)=>(<div className="col" key={i}>{renderItem(it)}</div>))}
      </div>
    </div>
  );
}

function MediaInfoList({items=[], resolveImage=null, renderText, cols=[1,1,1], limit=null, className="", emptyText="No hay elementos para mostrar."}){
  const shown = Array.isArray(items) ? (limit ? items.slice(0,limit) : items) : [];
  const rowClass = [
    "row","g-3",
    `row-cols-${cols[0]||1}`,
    cols[1]?`row-cols-md-${cols[1]}`:"",
    cols[2]?`row-cols-lg-${cols[2]}`:""
  ].filter(Boolean).join(" ");

  if(!shown.length) return <p className="text-muted mb-0">{emptyText}</p>;

  return (
    <div className={className}>
      <div className={rowClass}>
        {shown.map((it,i)=>{
          const src = resolveImage ? resolveImage(it) : null;
          return (
            <div className="col" key={i}>
              <div className="card h-100 shadow-sm border-0">
                <div className="card-body py-3">
                  <div className="d-flex gap-3 align-items-start flex-column flex-md-row">
                    {src
                      ? <img className="thumb-portrait img-fluid d-block rounded" src={src} alt=""/>
                      : <div className="thumb-portrait rounded"></div>}
                    <div className="w-100 position-relative">
                      {renderText(it)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* expón exactamente una vez */
window.UI = { SectionHeader, CarouselGrid, ModalGallery, InfoGrid, MediaInfoList};

