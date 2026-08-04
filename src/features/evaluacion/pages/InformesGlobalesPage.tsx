import {
  FileText,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

import AppButton from "../../../components/ui/AppButton";
import AppModal from "../../../components/ui/AppModal";
import { useAuth } from "../../auth/context/AuthContext";
import {
  generarInformePeriodo,
  obtenerDetalleInformePeriodo,
} from "../api/informes-periodo.api";
import AppAlert from "../components/feedback/AppAlert";
import AppSpinner from "../components/feedback/AppSpinner";
import DetalleInformeVersion from "../components/informes/DetalleInformeVersion";
import GenerarInformeVersionForm from "../components/informes/GenerarInformeVersionForm";
import FiltrosInformesGlobales from "../components/informes-globales/FiltrosInformesGlobales";
import ListadoInformesGlobales from "../components/informes-globales/ListadoInformesGlobales";
import ResumenInformesGlobales from "../components/informes-globales/ResumenInformesGlobales";
import { useInformesGlobales } from "../hooks/useInformesGlobales";
import type {
  GenerarInformePeriodoInput,
  InformePeriodoDetalle,
} from "../types/informe-periodo.types";

export default function InformesGlobalesPage() {
  const { token, hasRole } = useAuth();
  const {
    data,
    filtros,
    cargando,
    error,
    actualizarFiltro,
    setFiltros,
    limpiarFiltros,
    recargar,
  } = useInformesGlobales();

  const [generarOpen, setGenerarOpen] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [detalle, setDetalle] =
    useState<InformePeriodoDetalle | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [errorOperacion, setErrorOperacion] =
    useState<string | null>(null);

  const puedeGenerar = hasRole(
    "PROFESSIONAL",
    "ADMIN",
    "OWNER",
    "SUPERADMIN"
  );

  const empresaSeleccionada = data?.empresas.find(
    (empresa) => empresa.id === filtros.empresaId
  );
  const anioSeleccionado = filtros.anio
    ? Number(filtros.anio)
    : null;

  const cambiarEmpresa = (empresaId: string) => {
    const empresa = data?.empresas.find(
      (item) => item.id === empresaId
    );

    setFiltros((actuales) => ({
      ...actuales,
      empresaId,
      anio: empresaId
        ? String(empresa?.periodos[0]?.anio ?? "")
        : "",
      pagina: 1,
    }));
  };

  const abrirDetalle = async (id: string) => {
    if (!token) return;

    setSelectedId(id);
    setCargandoDetalle(true);
    setErrorOperacion(null);

    try {
      const resultado = await obtenerDetalleInformePeriodo(id, token);
      setDetalle(resultado);
    } catch (currentError) {
      setErrorOperacion(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible abrir la versión."
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  const generar = async (
    input: GenerarInformePeriodoInput
  ): Promise<boolean> => {
    if (
      !token ||
      !empresaSeleccionada ||
      !anioSeleccionado
    ) {
      return false;
    }

    setProcesando(true);
    setErrorOperacion(null);

    try {
      await generarInformePeriodo(
        empresaSeleccionada.id,
        anioSeleccionado,
        input,
        token
      );
      setGenerarOpen(false);
      await recargar();
      return true;
    } catch (currentError) {
      setErrorOperacion(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible generar la versión."
      );
      return false;
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 pb-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-cyan-300">
            <FileText size={20} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">
              SG-SST
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">
            Informes
          </h1>
          <p className="mt-1 max-w-3xl text-sm text-neutral-500">
            Consulta y genera versiones por empresa sin entrar a cada evaluación. Cada versión conserva la fotografía del periodo en su fecha de corte.
          </p>
        </div>

        <AppButton
          size="sm"
          variant="secondary"
          loading={cargando && data !== null}
          loadingLabel="Actualizando"
          leadingIcon={<RefreshCw size={14} />}
          onClick={() => void recargar()}
        >
          Actualizar
        </AppButton>
      </header>

      <ResumenInformesGlobales resumen={data?.resumen ?? null} />

      <FiltrosInformesGlobales
        data={data}
        filtros={filtros}
        puedeGenerar={puedeGenerar}
        onChange={actualizarFiltro}
        onEmpresaChange={cambiarEmpresa}
        onClear={limpiarFiltros}
        onGenerate={() => setGenerarOpen(true)}
      />

      {(error || errorOperacion) && (
        <AppAlert
          tone="error"
          title="No fue posible completar la operación"
          description={errorOperacion ?? error ?? "Error inesperado."}
        />
      )}

      {cargando && !data ? (
        <div className="flex min-h-72 items-center justify-center rounded-2xl border border-neutral-800 bg-[#101112]">
          <div className="flex flex-col items-center gap-3 text-neutral-500">
            <AppSpinner />
            <p className="text-xs">Cargando informes...</p>
          </div>
        </div>
      ) : (
        <ListadoInformesGlobales
          versiones={data?.versiones ?? []}
          paginacion={data?.paginacion ?? null}
          cargandoDetalle={cargandoDetalle}
          selectedId={selectedId}
          onOpen={abrirDetalle}
          onPageChange={(pagina) =>
            actualizarFiltro("pagina", pagina)
          }
        />
      )}

      <AppModal
        open={generarOpen}
        title="Generar nueva versión"
        description={
          empresaSeleccionada && anioSeleccionado
            ? `${empresaSeleccionada.nombre} · enero a diciembre de ${anioSeleccionado}`
            : "Selecciona una empresa y un periodo."
        }
        onClose={() => {
          if (!procesando) {
            setGenerarOpen(false);
          }
        }}
        busy={procesando}
        size="xl"
      >
        {empresaSeleccionada && anioSeleccionado ? (
          <GenerarInformeVersionForm
            anio={anioSeleccionado}
            empresaNombre={empresaSeleccionada.nombre}
            categorias={data?.categorias ?? []}
            procesando={procesando}
            onSubmit={generar}
          />
        ) : (
          <AppAlert
            tone="warning"
            title="Falta seleccionar empresa y periodo"
            description="Cierra esta ventana y usa los filtros superiores antes de generar una versión."
          />
        )}
      </AppModal>

      <AppModal
        open={detalle !== null}
        title={
          detalle
            ? `${detalle.snapshot.resultado.empresa.nombre} · Versión ${detalle.numeroVersion}`
            : "Detalle de informe"
        }
        description={
          detalle
            ? `Periodo ${detalle.anio} · fotografía histórica del SG-SST`
            : undefined
        }
        onClose={() => setDetalle(null)}
        size="2xl"
      >
        {detalle && (
          <DetalleInformeVersion
            detalle={detalle}
            onBack={() => setDetalle(null)}
          />
        )}
      </AppModal>
    </div>
  );
}