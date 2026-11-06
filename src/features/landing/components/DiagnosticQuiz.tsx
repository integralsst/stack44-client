"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClipboardCheck,
  Users,
  Activity,
  FileCheck,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";

type QuizStep = "start" | "question" | "lead_capture" | "result";

const questions = [
  {
    id: "q_size",
    title: "¿Cuántos trabajadores o contratistas directos tiene tu empresa?",
    icon: Users,
    options: [
      { label: "De 1 a 10 trabajadores", value: "small", score: 0 },
      { label: "De 11 a 50 trabajadores", value: "medium", score: 0 },
      { label: "Más de 50 trabajadores", value: "large", score: 0 },
    ],
  },
  {
    id: "q_matrix",
    title: "¿Cuentas con una Matriz de Riesgos técnica y actualizada?",
    icon: Activity,
    options: [
      { label: "Sí, documentada y actualizada", value: "yes", score: 33 },
      { label: "Tengo un formato genérico/viejo", value: "partial", score: 10 },
      { label: "No tengo o no sé qué es", value: "no", score: 0 },
    ],
  },
  {
    id: "q_records",
    title: "¿Las bitácoras y actas del comité COPASST/Vigía están al día?",
    icon: FileCheck,
    options: [
      { label: "Todo en orden y documentado", value: "yes", score: 33 },
      { label: "Faltan firmas y reuniones", value: "partial", score: 10 },
      { label: "No llevamos ese control", value: "no", score: 0 },
    ],
  },
];

const DesktopDiagnosticBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 hidden overflow-hidden md:block"
    >
      {/* Brillos muy suaves en los bordes */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(6,182,212,0.10),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(14,165,233,0.08),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(6,182,212,0.06),transparent_32%)]" />

      {/* Capa central oscura para proteger la lectura */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,8,10,0.92)_0%,rgba(5,8,10,0.76)_38%,transparent_72%)]" />

      {/* Grid suave solo en los bordes */}
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.16]"
        viewBox="0 0 900 620"
        preserveAspectRatio="none"
        style={{
          maskImage:
            "radial-gradient(ellipse at center, transparent 0%, transparent 42%, black 78%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, transparent 0%, transparent 42%, black 78%)",
        }}
      >
        <defs>
          <pattern
            id="quiz-grid-soft"
            width="46"
            height="46"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 46 0 L 0 0 0 46"
              fill="none"
              stroke="rgba(148,163,184,0.22)"
              strokeWidth="1"
            />
          </pattern>

          <linearGradient id="quiz-scan-line" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="rgba(6,182,212,0)" />
            <stop offset="50%" stopColor="rgba(6,182,212,0.45)" />
            <stop offset="100%" stopColor="rgba(6,182,212,0)" />
          </linearGradient>
        </defs>

        <rect width="900" height="620" fill="url(#quiz-grid-soft)" />

        <motion.line
          x1="0"
          x2="900"
          initial={{ y1: 90, y2: 90 }}
          stroke="url(#quiz-scan-line)"
          strokeWidth="1.5"
          animate={{ y1: [90, 520, 90], y2: [90, 520, 90] }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        <motion.path
          d="M80 450 C180 320 250 500 350 360 S520 260 630 330 S760 450 830 260"
          fill="none"
          stroke="rgba(6,182,212,0.28)"
          strokeWidth="1.5"
          strokeDasharray="8 12"
          initial={{ pathLength: 0, opacity: 0.2 }}
          animate={{ pathLength: 1, opacity: 0.45 }}
          transition={{
            duration: 5,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        />

        <motion.g
          animate={{ rotate: 360 }}
          transition={{
            duration: 36,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ transformOrigin: "760px 170px" }}
        >
          <circle
            cx="760"
            cy="170"
            r="72"
            fill="none"
            stroke="rgba(6,182,212,0.16)"
            strokeWidth="1.5"
          />
          <circle
            cx="760"
            cy="170"
            r="42"
            fill="none"
            stroke="rgba(6,182,212,0.18)"
            strokeWidth="1.5"
            strokeDasharray="6 10"
          />
        </motion.g>
      </svg>

      {/* Elementos laterales muy discretos */}
      <motion.div
        className="absolute right-8 top-28 h-24 w-40 rounded-[1.5rem] border border-cyan-500/10 bg-white/[0.015] backdrop-blur-sm"
        animate={{
          y: [0, -8, 0],
          opacity: [0.22, 0.36, 0.22],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute bottom-20 left-8 h-24 w-36 rounded-[1.5rem] border border-white/10 bg-white/[0.015] backdrop-blur-sm"
        animate={{
          y: [0, 8, 0],
          opacity: [0.18, 0.3, 0.18],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

const MobileDiagnosticBackground = () => {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden md:hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.11),transparent_36%),radial-gradient(circle_at_100%_90%,rgba(14,165,233,0.07),transparent_34%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(5,8,10,0.88)_0%,rgba(5,8,10,0.72)_48%,transparent_86%)]" />

      <motion.div
        className="absolute -right-28 -top-28 h-64 w-64 rounded-full border border-cyan-400/10"
        animate={{
          rotate: 360,
          scale: [1, 1.05, 1],
        }}
        transition={{
          rotate: {
            duration: 28,
            repeat: Infinity,
            ease: "linear",
          },
          scale: {
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      />
    </div>
  );
};

export const DiagnosticQuiz = () => {
  const [step, setStep] = useState<QuizStep>("start");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [score, setScore] = useState(34);

  const [leadData, setLeadData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const handleStart = () => setStep("question");

  const handleAnswer = (questionId: string, value: string, points: number) => {
    if (answers[questionId]) return;

    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setScore((prev) => Math.min(prev + points, 100));

    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ((prev) => prev + 1);
      } else {
        setStep("lead_capture");
      }
    }, 300);
  };

  const handleLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("result");
  };

  const isSmallBusiness = answers["q_size"] === "small";

  const progressPercentage =
    step === "start"
      ? 0
      : step === "result"
      ? 100
      : step === "lead_capture"
      ? 86
      : ((currentQ + 1) / questions.length) * 72;

  return (
    <div className="relative isolate mx-auto flex min-h-[540px] w-[calc(100%-1.25rem)] max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/5 bg-[#0c1015] font-sans shadow-[0_0_80px_-30px_rgba(6,182,212,0.28)] sm:w-full md:min-h-[580px]">
      <DesktopDiagnosticBackground />
      <MobileDiagnosticBackground />

      <div className="absolute inset-0 -z-20 bg-[#05080a]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Header */}
      <div className="relative flex items-center justify-between border-b border-white/5 bg-[#05080a]/80 px-5 py-4 backdrop-blur-xl sm:px-6 sm:py-5">
        <div className="flex items-center gap-3 text-slate-300">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/[0.03] text-cyan-400">
            <ClipboardCheck size={18} strokeWidth={2} />
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
              Auditoría Flash
            </span>
            <span className="hidden text-[11px] font-medium text-slate-600 sm:block">
              Diagnóstico SG-SST
            </span>
          </div>
        </div>

        {step === "question" && (
          <span className="rounded-full border border-white/5 bg-white/[0.03] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Fase 0{currentQ + 1} / 0{questions.length}
          </span>
        )}

        {step === "lead_capture" && (
          <span className="rounded-full border border-cyan-500/20 bg-cyan-950/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">
            Listo
          </span>
        )}

        <div className="absolute bottom-0 left-0 h-[2px] w-full bg-white/5">
          <motion.div
            className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.7)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="relative flex flex-1 flex-col justify-center p-6 sm:p-8 md:p-10">
        <AnimatePresence mode="wait">
          {step === "start" && (
            <motion.div
              key="start"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: "opacity, transform" }}
              className="mx-auto w-full max-w-lg text-center"
            >
              <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-white/5 bg-white/[0.03] text-cyan-400 shadow-[0_0_40px_-20px_rgba(6,182,212,0.7)]">
                <ShieldAlert size={34} strokeWidth={1.5} />
              </div>

              <div className="mb-6 inline-flex items-center justify-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Evaluación rápida
              </div>

              <h3 className="mx-auto mb-6 max-w-xl text-4xl font-bold leading-[1.05] tracking-tighter text-white sm:text-5xl md:text-6xl">
                Identifica tu vulnerabilidad{" "}
                <span className="text-slate-700">legal.</span>
              </h3>

              <p className="mx-auto mb-9 max-w-sm text-sm font-medium leading-relaxed text-slate-400 sm:text-base">
                Evalúa tu exposición a multas procesando 3 variables críticas de
                tu operación.
              </p>

              <button
                onClick={handleStart}
                className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-400 px-8 py-4 text-sm font-bold text-slate-950 transition-all duration-300 hover:bg-cyan-300 active:scale-[0.98] sm:w-auto"
              >
                Ejecutar diagnóstico
                <ChevronRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </button>
            </motion.div>
          )}

          {step === "question" && (
            <motion.div
              key={`q_${currentQ}`}
              initial={{ opacity: 0, x: 22 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -22 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: "opacity, transform" }}
              className="mx-auto w-full max-w-xl"
            >
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] text-cyan-400">
                  {React.createElement(questions[currentQ].icon, {
                    size: 24,
                    strokeWidth: 1.6,
                  })}
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600">
                    Variable crítica
                  </p>
                  <p className="text-sm font-medium text-slate-400">
                    Selecciona la opción más cercana a tu realidad
                  </p>
                </div>
              </div>

              <h3 className="mb-8 text-3xl font-bold leading-[1.1] tracking-tighter text-white sm:text-4xl">
                {questions[currentQ].title}
              </h3>

              <div className="flex flex-col gap-3">
                {questions[currentQ].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() =>
                      handleAnswer(questions[currentQ].id, opt.value, opt.score)
                    }
                    className="group w-full rounded-2xl border border-white/5 bg-[#080b0e]/90 p-5 text-left transition-all duration-300 hover:border-cyan-500/30 hover:bg-[#0c131a] active:scale-[0.985]"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-sm font-semibold leading-relaxed text-slate-300 transition-colors group-hover:text-white sm:text-base">
                        {opt.label}
                      </span>

                      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 transition-colors group-hover:border-cyan-400/50">
                        <div className="h-2 w-2 rounded-full bg-cyan-400 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === "lead_capture" && (
            <motion.div
              key="lead"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: "opacity, transform" }}
              className="mx-auto flex w-full max-w-md flex-col items-center"
            >
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/5 bg-white/[0.03] text-cyan-400">
                <Activity size={28} strokeWidth={1.5} />
              </div>

              <div className="mb-5 inline-flex items-center justify-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Análisis completado
              </div>

              <h3 className="mb-4 text-center text-4xl font-bold leading-[1.05] tracking-tighter text-white sm:text-5xl">
                Tu resultado está{" "}
                <span className="text-slate-700">listo.</span>
              </h3>

              <p className="mx-auto mb-8 max-w-xs text-center text-sm font-medium leading-relaxed text-slate-400 sm:text-base">
                Ingresa tus datos corporativos para revelar el nivel de riesgo
                detectado.
              </p>

              <form
  onSubmit={handleLeadSubmit}
  className="flex w-full flex-col gap-4"
>
  <input
    required
    name="company"
    type="text"
    placeholder="Nombre de la empresa"
    autoComplete="organization"
    enterKeyHint="next"
    className="w-full appearance-none rounded-2xl border border-white/5 bg-[#080b0e] p-4 text-base leading-6 font-medium text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-500/40 focus:bg-[#0c131a]"
    value={leadData.name}
    onChange={(e) =>
      setLeadData({ ...leadData, name: e.target.value })
    }
  />

  <input
    required
    name="email"
    type="email"
    placeholder="Correo corporativo"
    autoComplete="email"
    inputMode="email"
    enterKeyHint="next"
    autoCapitalize="none"
    autoCorrect="off"
    spellCheck={false}
    className="w-full appearance-none rounded-2xl border border-white/5 bg-[#080b0e] p-4 text-base leading-6 font-medium text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-500/40 focus:bg-[#0c131a]"
    value={leadData.email}
    onChange={(e) =>
      setLeadData({ ...leadData, email: e.target.value })
    }
  />

  <input
    required
    name="phone"
    type="tel"
    placeholder="WhatsApp o celular"
    autoComplete="tel"
    inputMode="tel"
    enterKeyHint="done"
    className="w-full appearance-none rounded-2xl border border-white/5 bg-[#080b0e] p-4 text-base leading-6 font-medium text-white outline-none transition-all placeholder:text-slate-600 focus:border-cyan-500/40 focus:bg-[#0c131a]"
    value={leadData.phone}
    onChange={(e) =>
      setLeadData({ ...leadData, phone: e.target.value })
    }
  />

  <button
    type="submit"
    className="mt-2 w-full touch-manipulation rounded-full bg-cyan-400 p-4 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-300 active:scale-[0.98]"
  >
    Revelar resultados
  </button>
</form>
            </motion.div>
          )}

          {step === "result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              style={{ willChange: "opacity, transform" }}
              className="mx-auto flex w-full max-w-lg flex-col items-center text-center"
            >
              <div className="relative mb-7 h-36 w-36">
                <svg className="h-full w-full -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    stroke="#1e293b"
                    strokeWidth="7"
                    fill="transparent"
                  />

                  <motion.circle
                    cx="72"
                    cy="72"
                    r="64"
                    stroke={score > 70 ? "#22d3ee" : "#ef4444"}
                    strokeWidth="7"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray="402"
                    initial={{ strokeDashoffset: 402 }}
                    animate={{
                      strokeDashoffset: 402 - (402 * score) / 100,
                    }}
                    transition={{
                      duration: 1.4,
                      ease: [0.16, 1, 0.3, 1],
                      delay: 0.2,
                    }}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-bold tracking-tighter text-white">
                    {score}%
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600">
                    Score
                  </span>
                </div>
              </div>

              <div className="mb-5 inline-flex items-center justify-center gap-2 rounded-full border border-white/5 bg-white/[0.02] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                Resultado del diagnóstico
              </div>

              <h3 className="mb-5 text-4xl font-bold leading-[1.05] tracking-tighter text-white sm:text-5xl">
                {score > 70 ? (
                  <>
                    Cumplimiento{" "}
                    <span className="text-slate-700">parcial.</span>
                  </>
                ) : (
                  <>
                    Riesgo{" "}
                    <span className="text-slate-700">crítico.</span>
                  </>
                )}
              </h3>

              <div className="mb-8 max-w-sm rounded-[1.5rem] border border-white/5 bg-[#080b0e] p-5 text-left text-sm font-medium leading-relaxed text-slate-400">
                {isSmallBusiness
                  ? "Para una operación de tu tamaño, la norma exige estándares clave innegociables. Detectamos brechas operativas que pueden gestionarse con un sistema documental claro, trazable y actualizado."
                  : "Por el volumen de trabajadores, tu empresa necesita mayor control documental, seguimiento técnico y evidencia organizada. Operar sin un sistema centralizado puede aumentar la exposición a sanciones y hallazgos."}
              </div>

              {isSmallBusiness ? (
                <div className="flex w-full flex-col items-center">
                  <div className="mb-6 flex flex-col items-center">
                    <span className="mb-3 rounded-full border border-cyan-500/20 bg-cyan-950/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                      Licencia autogestionable
                    </span>

                    <div className="text-4xl font-bold tracking-tighter text-white">
                      $99.000{" "}
                      <span className="text-sm font-medium uppercase tracking-widest text-slate-500">
                        COP/mes
                      </span>
                    </div>
                  </div>

                  <button className="flex w-full items-center justify-center gap-2 rounded-full bg-cyan-400 px-8 py-4 text-sm font-bold text-slate-950 transition-all hover:bg-cyan-300 active:scale-[0.98] sm:w-auto">
                    <CheckCircle2 size={18} strokeWidth={2.5} />
                    Blindar mi empresa
                  </button>
                </div>
              ) : (
                <div className="flex w-full flex-col items-center pt-2">
                  <button className="flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-8 py-4 text-sm font-bold text-white transition-colors hover:bg-white/10 sm:w-auto">
                    <Users size={18} strokeWidth={2.5} />
                    Agendar auditoría técnica
                  </button>

                  <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-slate-600">
                    15 min con un especialista
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
