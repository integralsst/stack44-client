import {
  ArrowLeft,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import { COMPROMISOS_ACTUALIZADOS_EVENT } from "../../compromisos/lib/alertas-compromisos.events";
import {
  obtenerAccionesEmpresa,
  obtenerEmpresasCentroAcciones,
  obtenerResumenCentroAcciones,
} from "../api/centro-acciones.api";
import AccionCompactaCard from "../components/AccionCompactaCard";
import EmpresaAccionesItem from "../components/EmpresaAccionesItem";
import FiltrosCentroAcciones from "../components/FiltrosCentroAcciones";
import ResumenAccionesBar from "../components/ResumenAccionesBar";
import type {
  AccionesEmpresaResponse,
  EmpresaCentroAcciones,
  EmpresasCentroAccionesResponse,
  FiltroCategoriaAcciones,
  FiltroPrioridadAcciones,
  PaginacionAcciones,
  ResumenCentroAcciones,
} from "../types/centro-acciones.types";

const LIMITE_EMPRESAS = 25;
const LIMITE_ACCIONES = 25;

export default function CentroAccionesPage() {
  const { token } = useAuth();
  const [resumen, setResumen] =
    useState<ResumenCentroAcciones | null>(null);
  const [empresasData, setEmpresasData] =
    useState<EmpresasCentroAccionesResponse | null>(null);
  const [accionesData, setAccionesData] =
    useState<AccionesEmpresaResponse | null>(null);
  const [empresaSeleccionada, setEmpresaSeleccionada] =
    useState<EmpresaCentroAcciones | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [categoria, setCategoria] =
    useState<FiltroCategoriaAcciones>("TODAS");
  const [prioridad, setPrioridad] =
    useState<FiltroPrioridadAcciones>("TODAS");
  const [paginaEmpresas, setPaginaEmpresas] = useState(1);
  const [paginaAcciones, setPaginaAcciones] = useState(1);
  const [accionAbierta, setAccionAbierta] = useState<string | null>(null);
  const [cargandoResumen, setCargandoResumen] = useState(false);
  const [cargandoEmpresas, setCargandoEmpresas] = useState(false);
  const [cargandoAcciones, setCargandoAcciones] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actualizacion, setActualizacion] = useState(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setBusquedaAplicada(busqueda.trim());
      setPaginaEmpresas(1);
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [busqueda]);

  const cargarResumen = useCallback(async () => {
    if (!token) return;

    setCargandoResumen(true);

    try {
      setResumen(await obtenerResumenCentroAcciones(token));
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible cargar el resumen de acciones."
      );
    } finally {
      setCargandoResumen(false);
    }
  }, [token]);

  const cargarEmpresas = useCallback(async () => {
    if (!token) return;

    setCargandoEmpresas(true);
    setError(null);

    try {
      setEmpresasData(
        await obtenerEmpresasCentroAcciones(token, {
          busqueda: busquedaAplicada,
          categoria,
          prioridad,
          pagina: paginaEmpresas,
          limite: LIMITE_EMPRESAS,
        })
      );
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible cargar las empresas."
      );
    } finally {
      setCargandoEmpresas(false);
    }
  }, [
    token,
    busquedaAplicada,
    categoria,
    prioridad,
    paginaEmpresas,
  ]);

  const cargarAcciones = useCallback(async () => {
    if (!token || !empresaSeleccionada) return;

    setCargandoAcciones(true);
    setError(null);

    try {
      setAccionesData(
        await obtenerAccionesEmpresa(token, empresaSeleccionada.id, {
          categoria,
          prioridad,
          pagina: paginaAcciones,
          limite: LIMITE_ACCIONES,
        })
      );
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible cargar las acciones de la empresa."
      );
    } finally {
      setCargandoAcciones(false);
    }
  }, [
    token,
    empresaSeleccionada,
    categoria,
    prioridad,
    paginaAcciones,
  ]);

  useEffect(() => {
    void cargarResumen();
  }, [cargarResumen, actualizacion]);

  useEffect(() => {
    void cargarEmpresas();
  }, [cargarEmpresas, actualizacion]);

  useEffect(() => {
    if (empresaSeleccionada) {
      void cargarAcciones();
    }
  }, [cargarAcciones, actualizacion, empresaSeleccionada]);

  useEffect(() => {
    const actualizar = () => setActualizacion((current) => current + 1);
    const actualizarAlVolver = () => {
      if (document.visibilityState === "visible") actualizar();
    };

    window.addEventListener(COMPROMISOS_ACTUALIZADOS_EVENT, actualizar);
    window.addEventListener("focus", actualizar);
    document.addEventListener("visibilitychange", actualizarAlVolver);

    return () => {
      window.removeEventListener(COMPROMISOS_ACTUALIZADOS_EVENT, actualizar);
      window.removeEventListener("focus", actualizar);
      document.removeEventListener("visibilitychange", actualizarAlVolver);
    };
  }, []);

  const cambiarFiltro = (
    siguienteCategoria: FiltroCategoriaAcciones,
    siguientePrioridad: FiltroPrioridadAcciones
  ) => {
    setCategoria(siguienteCategoria);
    setPrioridad(siguientePrioridad);
    setPaginaEmpresas(1);
    setPaginaAcciones(1);
    setAccionAbierta(null);
  };

  const abrirEmpresa = (empresa: EmpresaCentroAcciones) => {
    setEmpresaSeleccionada(empresa);
    setPaginaAcciones(1);
    setAccionAbierta(null);
    setAccionesData(null);
  };

  const volverAEmpresas = () => {
    setEmpresaSeleccionada(null);
    setAccionesData(null);
    setAccionAbierta(null);
  };

  const actualizarTodo = () => {
    setActualizacion((current) => current + 1);
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Centro de acciones
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            Revisa primero lo urgente, entra a una empresa y resuelve cada pendiente desde su pantalla original.
          </p>
        </div>

        <button
          type="button"
          onClick={actualizarTodo}
          disabled={cargandoResumen || cargandoEmpresas || cargandoAcciones}
          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:text-cyan-700 disabled:opacity-50"
        >
          <RefreshCw
            size={15}
            className={
              cargandoResumen || cargandoEmpresas || cargandoAcciones
                ? "animate-spin"
                : ""
            }
          />
          Actualizar
        </button>
      </header>

      {resumen ? (
        <ResumenAccionesBar resumen={resumen} />
      ) : (
        <div className="h-20 animate-pulse rounded-2xl bg-white" />
      )}

      <FiltrosCentroAcciones
        busqueda={busqueda}
        categoria={categoria}
        prioridad={prioridad}
        resumen={resumen}
        onBusqueda={setBusqueda}
        onFiltro={cambiarFiltro}
      />

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {empresaSeleccionada ? (
        <DetalleEmpresa
          empresa={empresaSeleccionada}
          data={accionesData}
          cargando={cargandoAcciones}
          accionAbierta={accionAbierta}
          onToggleAccion={(id) =>
            setAccionAbierta((current) => (current === id ? null : id))
          }
          onBack={volverAEmpresas}
          onPage={setPaginaAcciones}
        />
      ) : (
        <ListaEmpresas
          data={empresasData}
          cargando={cargandoEmpresas}
          onOpen={abrirEmpresa}
          onPage={setPaginaEmpresas}
        />
      )}
    </section>
  );
}

function ListaEmpresas({
  data,
  cargando,
  onOpen,
  onPage,
}: {
  data: EmpresasCentroAccionesResponse | null;
  cargando: boolean;
  onOpen: (empresa: EmpresaCentroAcciones) => void;
  onPage: (pagina: number) => void;
}) {
  if (cargando && !data) {
    return <CargandoLista />;
  }

  if ((data?.empresas.length ?? 0) === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
        <p className="mt-3 text-sm font-black text-slate-950">
          No hay empresas para este filtro
        </p>
        <p className="mt-1 text-xs text-slate-600">
          Cambia la búsqueda o selecciona “Todas”.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs font-bold text-slate-500">
          {data?.paginacion.total ?? 0} empresa(s)
        </p>
        {cargando && (
          <span className="text-[11px] font-semibold text-cyan-700">
            Actualizando…
          </span>
        )}
      </div>

      <div className="space-y-2">
        {data?.empresas.map((empresa) => (
          <EmpresaAccionesItem
            key={empresa.id}
            empresa={empresa}
            onOpen={() => onOpen(empresa)}
          />
        ))}
      </div>

      {data && (
        <Paginacion data={data.paginacion} onPage={onPage} />
      )}
    </div>
  );
}

function DetalleEmpresa({
  empresa,
  data,
  cargando,
  accionAbierta,
  onToggleAccion,
  onBack,
  onPage,
}: {
  empresa: EmpresaCentroAcciones;
  data: AccionesEmpresaResponse | null;
  cargando: boolean;
  accionAbierta: string | null;
  onToggleAccion: (id: string) => void;
  onBack: () => void;
  onPage: (pagina: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-cyan-700 hover:text-cyan-900"
        >
          <ArrowLeft size={15} />
          Volver a empresas
        </button>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-black text-slate-950">
              {empresa.nombre}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              NIT {empresa.nit}
              {empresa.ciudadPrincipal
                ? ` · ${empresa.ciudadPrincipal}`
                : ""}
            </p>
          </div>
          {data && (
            <p className="text-xs font-bold text-slate-600">
              {data.resumen.total} acción(es) · {data.resumen.urgentes} urgente(s)
            </p>
          )}
        </div>
      </div>

      {cargando && !data ? (
        <CargandoLista />
      ) : (data?.acciones.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-12 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
          <p className="mt-3 text-sm font-black text-emerald-950">
            Empresa al día para este filtro
          </p>
          <p className="mt-1 text-xs text-emerald-800">
            No hay acciones pendientes que debas gestionar aquí.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            {data?.acciones.map((accion) => (
              <AccionCompactaCard
                key={accion.id}
                accion={accion}
                abierta={accionAbierta === accion.id}
                onToggle={() => onToggleAccion(accion.id)}
              />
            ))}
          </div>

          {data && (
            <Paginacion data={data.paginacion} onPage={onPage} />
          )}
        </>
      )}
    </div>
  );
}

function Paginacion({
  data,
  onPage,
}: {
  data: PaginacionAcciones;
  onPage: (pagina: number) => void;
}) {
  if (data.paginas <= 1) return null;

  return (
    <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-sm">
      <button
        type="button"
        onClick={() => onPage(data.pagina - 1)}
        disabled={data.pagina <= 1}
        className="rounded-lg border border-slate-200 px-3 py-2 font-bold text-slate-700 disabled:opacity-40"
      >
        Anterior
      </button>
      <span className="font-semibold text-slate-500">
        Página {data.pagina} de {data.paginas}
      </span>
      <button
        type="button"
        onClick={() => onPage(data.pagina + 1)}
        disabled={data.pagina >= data.paginas}
        className="rounded-lg border border-slate-200 px-3 py-2 font-bold text-slate-700 disabled:opacity-40"
      >
        Siguiente
      </button>
    </div>
  );
}

function CargandoLista() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-20 animate-pulse rounded-2xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}
