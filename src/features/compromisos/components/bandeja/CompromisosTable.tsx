import {
  ArrowRight,
  Inbox,
} from "lucide-react";
import {
  Link,
} from "react-router-dom";

import { formatearFechaCompromiso } from "../../presentacion/fecha-compromiso";
import type {
  CompromisoListado,
  PaginacionCompromisos,
} from "../../types/consulta-compromisos.types";
import {
  EstadoCompromisoBadge,
  SemaforoCompromisoBadge,
} from "./CompromisoBadges";

interface Props {
  compromisos: CompromisoListado[];
  paginacion: PaginacionCompromisos | null;
  cargando: boolean;
  detalleBasePath: string;
  onPageChange: (page: number) => void;
}

export default function CompromisosTable({
  compromisos,
  paginacion,
  cargando,
  detalleBasePath,
  onPageChange,
}: Props) {
  if (cargando && compromisos.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  if (compromisos.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
        <Inbox
          size={34}
          className="text-slate-400"
        />
        <h2 className="mt-3 text-base font-semibold text-slate-900">
          No hay compromisos para mostrar
        </h2>
        <p className="mt-1 max-w-lg text-sm text-slate-500">
          Ajusta los filtros o finaliza una gestión con calificación 0 o 3 para crear el primer compromiso.
        </p>
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full border-collapse text-left">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">
                Aspecto y proceso
              </th>
              <th className="px-4 py-3">
                Empresa
              </th>
              <th className="px-4 py-3">
                Responsable
              </th>
              <th className="px-4 py-3">
                Fecha límite
              </th>
              <th className="px-4 py-3">
                Estado
              </th>
              <th className="px-4 py-3 text-right">
                Detalle
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {compromisos.map(
              (compromiso) => {
                const principal =
                  compromiso.responsables.find(
                    (responsable) =>
                      responsable.tipo ===
                      "PRINCIPAL"
                  );

                return (
                  <tr
                    key={compromiso.id}
                    className="align-top transition hover:bg-slate-50/80"
                  >
                    <td className="max-w-md px-4 py-4">
                      <p className="text-xs font-semibold text-cyan-700">
                        {compromiso.aspecto.codigo ??
                          "Sin código"}
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold text-slate-900">
                        {compromiso.aspecto.nombre}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {compromiso.proceso
                          ?.nombre ??
                          "Sin proceso asociado"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {compromiso.empresa.nombre}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        NIT {compromiso.empresa.nit}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm font-medium text-slate-900">
                        {principal
                          ?.usuarioResponsable
                          .nombre ??
                          "Sin principal activo"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {Math.max(
                          0,
                          compromiso.responsables
                            .length - 1
                        )}{" "}
                        apoyo(s)
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="mb-2 text-sm font-medium text-slate-900">
                        {formatearFechaCompromiso(
                          compromiso.fechaLimite
                        )}
                      </p>
                      <SemaforoCompromisoBadge
                        semaforo={
                          compromiso.semaforo
                        }
                      />
                    </td>
                    <td className="px-4 py-4">
                      <EstadoCompromisoBadge
                        estado={compromiso.estado}
                      />
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Link
                        to={
                          detalleBasePath +
                          "/" +
                          compromiso.id
                        }
                        className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"
                      >
                        Ver
                        <ArrowRight
                          size={15}
                        />
                      </Link>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      {paginacion && (
        <footer className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {paginacion.total} resultado(s) · Página{" "}
            {paginacion.pagina} de{" "}
            {paginacion.totalPaginas}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={
                paginacion.pagina <= 1 ||
                cargando
              }
              onClick={() =>
                onPageChange(
                  paginacion.pagina - 1
                )
              }
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={
                paginacion.pagina >=
                  paginacion.totalPaginas ||
                cargando
              }
              onClick={() =>
                onPageChange(
                  paginacion.pagina + 1
                )
              }
              className="h-9 rounded-xl border border-slate-200 bg-white px-3 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </footer>
      )}
    </section>
  );
}
