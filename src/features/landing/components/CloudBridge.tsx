import { motion, useReducedMotion } from "framer-motion";

// Nubes dibujadas en CSS: sin imágenes externas, sin capturar scroll ni eventos táctiles.
const clouds = [
  { left: "-12%", top: 30, width: 420, delay: 0.0 },
  { left: "9%", top: 16, width: 340, delay: 0.12 },
  { left: "31%", top: 48, width: 420, delay: 0.18 },
  { left: "58%", top: 10, width: 360, delay: 0.09 },
  { left: "78%", top: 37, width: 460, delay: 0.22 },
] as const;

export default function CloudBridge() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none relative z-20 -mt-24 h-[210px] w-full overflow-hidden bg-gradient-to-b from-[#f7faf8]/90 via-[#e9f3f4] via-[55%] to-[#05080a] md:-mt-32 md:h-[280px]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-transparent to-white/25" />
      {clouds.map((cloud, index) => (
        <motion.div
          key={index}
          initial={prefersReducedMotion ? false : { opacity: 0, x: -28, y: 50, scale: 0.94 }}
          whileInView={{ opacity: index % 2 ? 0.88 : 0.98, x: 0, y: 0, scale: 1 }}
          viewport={{ once: false, amount: 0.15 }}
          transition={{ duration: prefersReducedMotion ? 0 : 1.1, delay: cloud.delay, ease: [0.22, 1, 0.36, 1] }}
          className="absolute"
          style={{
            left: cloud.left,
            top: cloud.top,
            width: cloud.width,
            height: 142,
          }}
        >
          <span className="absolute inset-x-0 bottom-0 h-[58px] rounded-[100%] bg-white/85 blur-xl" />
          <span className="absolute bottom-7 left-[4%] h-[94px] w-[45%] rounded-full bg-white/90 blur-lg" />
          <span className="absolute bottom-5 left-[28%] h-[126px] w-[42%] rounded-full bg-white/90 blur-lg" />
          <span className="absolute bottom-4 right-[0%] h-[88px] w-[43%] rounded-full bg-white/90 blur-xl" />
        </motion.div>
      ))}
      <div className="absolute bottom-0 inset-x-0 h-[110px] bg-gradient-to-b from-transparent via-[#05080a]/40 to-[#05080a]" />
    </div>
  );
}
