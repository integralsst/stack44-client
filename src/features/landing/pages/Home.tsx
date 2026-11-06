import { lazy, Suspense } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LogIn } from 'lucide-react';
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
const LoginLink = motion.create(Link);

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
  const reducedMotion = useReducedMotion();
  return (
    <main className="relative min-h-screen w-full overflow-x-clip bg-[#05080a]">
      <section
        aria-label="Oficina 3D Stack44"
        className="relative h-[78svh] min-h-[560px] overflow-hidden bg-[#101b19] md:h-[100svh] md:min-h-[520px]"
      >
        <Suspense fallback={null}>
          <MiniOfficeHero />
        </Suspense>
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-28 bg-gradient-to-b from-transparent via-[#0b1413]/40 to-[#0b1413]" />
        <LoginLink
          to="/login"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .5 }}
          className="group absolute right-5 top-5 z-10 inline-flex min-h-11 items-center gap-3 overflow-hidden rounded-full border border-cyan-300/55 bg-[#071a23]/90 px-5 py-2.5 text-sm font-semibold text-[#f4fbff] shadow-[0_8px_30px_rgba(0,0,0,.4),0_0_25px_rgba(68,200,225,.22)] backdrop-blur-xl transition-[border-color,background,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-cyan-200 hover:bg-[#10303b] hover:shadow-[0_12px_35px_rgba(0,0,0,.45),0_0_29px_rgba(68,200,225,.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-200 md:right-8 md:top-7"
        >
          Iniciar sesión
          <motion.span
            aria-hidden="true"
            animate={reducedMotion ? undefined : { y: [0, -2, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="text-cyan-200 transition-transform group-hover:translate-x-0.5"
          >
            <LogIn size={16} />
          </motion.span>
        </LoginLink>
      </section>

      {/* La maqueta termina aquí; el scroll continúa por la landing previa. */}
      <div aria-hidden="true" className="h-12 bg-gradient-to-b from-[#0b1413] via-[#09100f] to-[#05080a]" />

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
