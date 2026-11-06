import { lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import ModulesBento from '../components/ModulesBento';
import FAQSection from '../components/FAQSection';

const MiniOfficeHero = lazy(() => import('../mini-office/MiniOfficeHero').then(module => ({ default: module.MiniOfficeHero })));

export default function LandingPage() {
  return <main className="overflow-x-hidden bg-[#101b19]">
    <section className="relative h-[82svh] min-h-[600px] overflow-hidden md:h-[100svh] md:min-h-[520px]" aria-label="Oficina miniatura Stack44">
      <Suspense fallback={null}><MiniOfficeHero /></Suspense>
      <Link to="/login" className="absolute right-5 top-5 z-10 rounded-full border border-white/20 bg-[#10221d]/80 px-5 py-2.5 text-sm font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-[#254c3c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:right-8 md:top-7">Iniciar sesión</Link>
    </section>
    <ModulesBento />
    <FAQSection />
  </main>;
}
