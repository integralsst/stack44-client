import { motion, type Variants } from "framer-motion";
import OfficeHero from "../components/OfficeHero";
import CloudBridge from "../components/CloudBridge";
import Comparison from "../components/Comparison";
import { DiagnosticQuiz } from "../components/DiagnosticQuiz";
import { SGSSTDashboard } from "../components/SGSSTDashboard";
import FeaturesBento from "../components/ModulesBento";
import FAQSection from "../components/FAQSection";

const appleEase = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: appleEase },
  },
};

export default function LandingPage() {
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(#334155_1px,transparent_1px)] opacity-20 [background-size:24px_24px]" />

      <main className="relative z-10 flex flex-col gap-0">
        <OfficeHero />
        <CloudBridge />

        <motion.div
          id="comparativa"
          className="relative z-20 scroll-mt-32 bg-[#05080a]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <Comparison />
        </motion.div>

        <motion.div
          id="diagnostico"
          className="mt-12 scroll-mt-32 md:mt-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <DiagnosticQuiz />
        </motion.div>

        <motion.div
          id="dashboard"
          className="mt-12 scroll-mt-32 md:mt-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <SGSSTDashboard />
        </motion.div>

        <motion.div
          id="modulos"
          className="mt-12 scroll-mt-32 md:mt-24"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeUp}
        >
          <FeaturesBento />
        </motion.div>

        <div className="flex flex-col">
          <motion.div
            id="faq"
            className="mt-12 scroll-mt-32 md:mt-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeUp}
          >
            <FAQSection />
          </motion.div>
        </div>
      </main>
    </div>
  );
}
