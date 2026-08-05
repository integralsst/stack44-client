import { useState } from "react";

import { useAuth } from "../../auth/context/AuthContext";
import { descargarPdfInformePeriodo } from "../api/informes-periodo.api";

export interface DescargarInformePdfInput {
  id: string;
  empresaNombre?: string;
  anio?: number;
  numeroVersion?: number;
}

function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function fallbackFilename(input: DescargarInformePdfInput): string {
  const empresa = slug(input.empresaNombre ?? "EMPRESA") || "EMPRESA";
  const anio = input.anio ?? "PERIODO";
  const version = input.numeroVersion ?? "VERSION";

  return `Informe_SGSST_${empresa}_${anio}_V${version}.pdf`;
}

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}

export function useDescargaInformePdf() {
  const { token } = useAuth();
  const [descargandoId, setDescargandoId] = useState<string | null>(null);
  const [errorDescarga, setErrorDescarga] = useState<string | null>(null);

  const descargar = async (
    input: DescargarInformePdfInput
  ): Promise<boolean> => {
    if (!token || descargandoId) {
      return false;
    }

    setDescargandoId(input.id);
    setErrorDescarga(null);

    try {
      const result = await descargarPdfInformePeriodo(input.id, token);
      saveBlob(
        result.blob,
        result.filename ?? fallbackFilename(input)
      );
      return true;
    } catch (error) {
      setErrorDescarga(
        error instanceof Error
          ? error.message
          : "No fue posible descargar el PDF."
      );
      return false;
    } finally {
      setDescargandoId(null);
    }
  };

  return {
    descargar,
    descargandoId,
    errorDescarga,
    limpiarErrorDescarga: () => setErrorDescarga(null),
  };
}
