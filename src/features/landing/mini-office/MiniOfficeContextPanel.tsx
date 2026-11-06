import { useEffect, useRef } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { officeStories, tourStops, type OfficeTarget } from './miniOfficeContent';

type Props = {
  target: OfficeTarget; tourIndex: number | null; onClose: () => void;
  onTour: (index: number | null) => void;
  onAction: (target: OfficeTarget) => void;
};

export function MiniOfficeContextPanel({ target, tourIndex, onClose, onTour, onAction }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const story = officeStories[target];
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [target, onClose]);
  return <aside role="dialog" aria-modal="false" aria-labelledby="office-panel-title"
    className="absolute bottom-5 left-4 right-4 z-20 max-h-[57svh] overflow-y-auto rounded-[1.3rem] border border-cyan-200/25 bg-[#0b1b21]/92 p-5 text-white shadow-[0_18px_65px_rgba(0,0,0,.58),0_0_25px_rgba(71,185,204,.12)] backdrop-blur-2xl sm:bottom-8 sm:left-8 sm:right-auto sm:w-[370px] sm:max-h-[70svh] sm:p-6">
    <div className="flex items-start justify-between gap-3">
      <span className="text-[10px] font-semibold uppercase tracking-[.22em] text-cyan-200/80">Stack44 · Oficina interactiva</span>
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Cerrar panel"
        className="-mr-1 -mt-1 rounded-full p-2 text-white/75 hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"><X size={18} /></button>
    </div>
    <p className="mt-3 text-xs font-semibold text-[#d9c294]">{story.role}</p>
    <h2 id="office-panel-title" className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">{story.title}</h2>
    <p className="mt-3 text-sm leading-relaxed text-slate-200">{story.description}</p>
    <ul className="mt-4 space-y-2 text-xs leading-relaxed text-slate-300">
      {story.points.map(point => <li key={point} className="flex gap-2"><span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300" />{point}</li>)}
    </ul>
    {story.links.length > 0 && <div className="mt-5 flex flex-wrap gap-2">
      {story.links.map(link => <a key={link.href + link.label} href={link.href} onClick={onClose}
        className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-cyan-200/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 hover:bg-cyan-300/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">
        {link.label}<ArrowRight size={12} /></a>)}
    </div>}
    {target === 'Secretaria' && <button type="button" onClick={() => onAction('printer')}
      className="mt-3 min-h-9 rounded-full border border-[#d9c294]/40 px-3 text-xs font-semibold text-[#f4dfaf] hover:bg-white/10">Ver impresión y entrega</button>}
    {target === 'Apolo' && <button type="button" onClick={() => onAction('coffee')}
      className="mt-3 min-h-9 rounded-full border border-[#d9c294]/40 px-3 text-xs font-semibold text-[#f4dfaf] hover:bg-white/10">Ver pausa de café</button>}
    {target === 'Zeus' && <button type="button" onClick={() => onAction('meeting')}
      className="mt-3 min-h-9 rounded-full border border-[#d9c294]/40 px-3 text-xs font-semibold text-[#f4dfaf] hover:bg-white/10">Ver reunión</button>}
    {tourIndex === null ? <button type="button" onClick={() => onTour(0)}
      className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-cyan-300 px-4 py-2 text-xs font-bold text-[#0b1b21] hover:bg-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300">
      Conoce Stack44 <ArrowRight size={14} />
    </button> : <div className="mt-5 border-t border-white/10 pt-4">
      <p className="text-[11px] text-slate-300">Recorrido {tourIndex + 1} de {tourStops.length} · Datos ilustrativos</p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button type="button" disabled={tourIndex === 0} onClick={() => onTour(tourIndex - 1)}
          className="inline-flex min-h-9 items-center gap-1 rounded-full border border-white/20 px-3 text-xs disabled:opacity-35"><ChevronLeft size={14} />Anterior</button>
        {tourIndex < tourStops.length - 1 ? <button type="button" onClick={() => onTour(tourIndex + 1)}
          className="inline-flex min-h-9 items-center gap-1 rounded-full bg-cyan-300 px-3 text-xs font-bold text-[#0b1b21]">Siguiente<ChevronRight size={14} /></button>
          : <button type="button" onClick={onClose} className="min-h-9 rounded-full bg-cyan-300 px-3 text-xs font-bold text-[#0b1b21]">Terminar</button>}
        <button type="button" onClick={onClose} className="min-h-9 px-2 text-xs text-slate-300 hover:text-white">Saltar recorrido</button>
      </div>
    </div>}
  </aside>;
}
