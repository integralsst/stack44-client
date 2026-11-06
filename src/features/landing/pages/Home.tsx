import { lazy, Suspense } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import Comparison from '../components/Comparison';
import { DiagnosticQuiz } from '../components/DiagnosticQuiz';
import { SGSSTDashboard } from '../components/SGSSTDashboard';
import FeaturesBento from '../components/ModulesBento';
import FAQSection from '../components/FAQSection';
import Footer from '../../../components/layouts/Footer';

const MiniOfficeHero = lazy(() =>
  import('../mini-office/MiniOfficeHero').then(module => ({
    default: module.MiniOfficeHero,
  })),
);

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: .7, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Portada compacta e inmersiva; el resto del contenido informativo de
 * Stack44 permanece debajo del hero y vuelve a ser accesible con scroll.
 * No se agregan etiquetas ni navegación encima de la maqueta Three.js.
 */
export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-x-clip bg-[#05080a]">
      <section
        aria-label="Oficina 3D Stack44"
        className="relative h-[100svh] min-h-[520px] overflow-hidden bg-[#101b19]"
      >
        <Suspense fallback={null}>
          <MiniOfficeHero />
        </Suspense>
        <Link
          to="/login"
          className="absolute right-5 top-5 z-10 rounded-full border border-white/20 bg-[#10221d]/80 px-5 py-2.5 text-sm font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-[#254c3c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:right-8 md:top-7"
        >
          Iniciar sesión
        </Link>
      </section>

      {/* La maqueta termina aquí; el scroll continúa por la landing previa. */}
      <div aria-hidden="true" className="h-12 bg-gradient-to-b from-[#101b19] to-[#05080a]" />

      <motion.section
        id="comparativa"
        className="relative z-10 scroll-mt-12 bg-[#05080a]"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
      >
        <Comparison />
      </motion.section>

      <motion.section
        id="diagnostico"
        className="relative z-10 scroll-mt-16 bg-[#05080a] pt-8 md:pt-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
      >
        <DiagnosticQuiz />
      </motion.section>

      <motion.section
        id="dashboard"
        className="relative z-10 scroll-mt-16 bg-[#05080a] pt-8 md:pt-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
      >
        <SGSSTDashboard />
      </motion.section>

      <motion.section
        id="modulos"
        className="relative z-10 scroll-mt-16 bg-[#05080a] pt-8 md:pt-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
      >
        <FeaturesBento />
      </motion.section>

      <motion.section
        id="faq"
        className="relative z-10 scroll-mt-16 bg-[#05080a] pt-8 md:pt-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={fadeUp}
      >
        <FAQSection />
      </motion.section>

      <Footer />
    </main>
  );
}
