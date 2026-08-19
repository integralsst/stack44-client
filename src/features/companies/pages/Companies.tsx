import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Calendar,
  ClipboardCheck,
  Edit2,
  Loader2,
  Mail,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import { apiRequest } from "../../../lib/api";
import type {
  Company,
  RiskClass,
} from "../../../types/domain";
import AppModal from "../../../components/ui/AppModal";
import AppSelect from "../../../components/ui/AppSelect";

interface CompanyForm {
  taxId: string;
  name: string;
  startDate: string;
  mainAddress: string;
  mainCity: string;
  companyEmail: string;
  mainRiskClass: "" | RiskClass;
  economicActivityCode: string;
  economicActivityDescription: string;
  companyDescription: string;
  managerName: string;
  managerEmail: string;
  sstContactName: string;
  sstContactEmail: string;
  agreedSstVisits: string;
  agreedEmergencyVisits: string;
  isActive: boolean;
}

const emptyForm: CompanyForm = {
  taxId: "",
  name: "",
  startDate: "",
  mainAddress: "",
  mainCity: "",
  companyEmail: "",
  mainRiskClass: "",
  economicActivityCode: "",
  economicActivityDescription: "",
  companyDescription: "",
  managerName: "",
  managerEmail: "",
  sstContactName: "",
  sstContactEmail: "",
  agreedSstVisits: "0",
  agreedEmergencyVisits: "0",
  isActive: true,
};

const inputClass =
  "w-full rounded-xl border border-neutral-800 bg-[#090909] px-3 py-2.5 text-sm text-white outline-none transition-all [color-scheme:dark] placeholder:text-neutral-600 hover:border-neutral-700 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10";

function toInputDate(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

function companyToForm(company: Company): CompanyForm {
  return {
    taxId: company.taxId,
    name: company.name,
    startDate: toInputDate(company.startDate),
    mainAddress: company.mainAddress ?? "",
    mainCity: company.mainCity ?? "",
    companyEmail: company.companyEmail ?? "",
    mainRiskClass: company.mainRiskClass ?? "",
    economicActivityCode:
      company.economicActivityCode ?? "",
    economicActivityDescription:
      company.economicActivityDescription ?? "",
    companyDescription:
      company.companyDescription ?? "",
    managerName: company.managerName ?? "",
    managerEmail: company.managerEmail ?? "",
    sstContactName: company.sstContactName ?? "",
    sstContactEmail:
      company.sstContactEmail ?? "",
    agreedSstVisits: String(
      company.agreedSstVisits
    ),
    agreedEmergencyVisits: String(
      company.agreedEmergencyVisits
    ),
    isActive: company.isActive,
  };
}

export default function Companies() {
  const navigate = useNavigate();
  const { token, isInternalUser, hasRole } = useAuth();
  const isClientAdmin = hasRole("CLIENT_ADMIN");

  const canOpenEvaluation = hasRole(
    "CLIENT_ADMIN",
    "PROFESSIONAL",
    "COORDINATOR",
    "ADMIN",
    "OWNER",
    "SUPERADMIN"
  );
  const evaluationActionLabel = isClientAdmin
    ? "Consultar"
    : "Evaluar";

  const [companies, setCompanies] = useState<Company[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState<string | null>(
    null
  );
  const [formError, setFormError] = useState<string | null>(
    null
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] =
    useState<Company | null>(null);
  const [form, setForm] =
    useState<CompanyForm>(emptyForm);

  const openEvaluation = (company: Company) => {
    navigate(
      `/dashboard/empresas/${company.id}/evaluacion`
    );
  };

  const fetchCompanies = async () => {
    if (!token) return;

    setLoading(true);
    setPageError(null);

    try {
      const data = await apiRequest<Company[]>(
        "/api/companies",
        {},
        token
      );
      setCompanies(data);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "No fue posible cargar las empresas."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCompanies();
  }, [token]);

  const filteredCompanies = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return companies;

    return companies.filter((company) =>
      [
        company.name,
        company.taxId,
        company.mainCity ?? "",
        company.companyEmail ?? "",
        company.sstContactName ?? "",
      ].some((value) =>
        value.toLowerCase().includes(search)
      )
    );
  }, [companies, searchTerm]);

  const openCreate = () => {
    setEditingCompany(null);
    setForm(emptyForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (company: Company) => {
    setEditingCompany(company);
    setForm(companyToForm(company));
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCompany(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const updateField = <K extends keyof CompanyForm>(
    field: K,
    value: CompanyForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!token) return;

    setSubmitting(true);
    setFormError(null);

    const payload = {
      ...form,
      taxId: form.taxId.trim(),
      name: form.name.trim(),
      startDate: form.startDate || null,
      mainRiskClass: form.mainRiskClass || null,
      agreedSstVisits: Number(
        form.agreedSstVisits || 0
      ),
      agreedEmergencyVisits: Number(
        form.agreedEmergencyVisits || 0
      ),
    };

    try {
      if (editingCompany) {
        await apiRequest<Company>(
          `/api/companies/${editingCompany.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
          token
        );
      } else {
        await apiRequest<Company>(
          "/api/companies",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          token
        );
      }

      closeModal();
      await fetchCompanies();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "No fue posible guardar la empresa."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (
    company: Company
  ) => {
    if (!token) return;

    const confirmed = window.confirm(
      `¿Desactivar la empresa "${company.name}"? Sus datos no se eliminarán.`
    );

    if (!confirmed) return;

    try {
      await apiRequest(
        `/api/companies/${company.id}`,
        { method: "DELETE" },
        token
      );

      await fetchCompanies();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "No fue posible desactivar la empresa."
      );
    }
  };

  return (
    <div className="mx-auto flex min-h-full min-w-0 max-w-7xl flex-col">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Gestión de empresas
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-400">
            {isInternalUser
              ? "Administra la información general, contractual y de riesgo de los clientes SG-SST."
              : "Consulta la información y el estado de la gestión SG-SST de tu empresa."}
          </p>
        </div>

        {isInternalUser && (
          <button
            type="button"
            onClick={openCreate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-white/5 transition-all hover:bg-neutral-200 active:scale-[0.98] sm:w-auto sm:py-2.5"
          >
            <Plus size={18} />
            Nueva empresa
          </button>
        )}
      </header>

      {pageError && (
        <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {pageError}
        </div>
      )}

      <div className="mb-5">
        <div className="relative w-full max-w-xl">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            type="search"
            placeholder="Buscar por empresa, NIT, ciudad o contacto..."
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            className="w-full rounded-xl border border-neutral-800 bg-[#111111] py-3 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-neutral-500 hover:border-neutral-700 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
          />
        </div>
      </div>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-neutral-800/70 bg-[#111111] shadow-xl">
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[980px] whitespace-nowrap text-left text-sm">
            <thead className="border-b border-neutral-800 bg-[#0a0a0a]">
              <tr>
                <HeaderCell>Empresa</HeaderCell>
                <HeaderCell>Ubicación y riesgo</HeaderCell>
                <HeaderCell>Contacto SST</HeaderCell>
                <HeaderCell>Visitas</HeaderCell>
                <HeaderCell>Relaciones</HeaderCell>
                <HeaderCell alignRight>Acciones</HeaderCell>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-800/70">
              {loading ? (
                <LoadingRow colSpan={6} />
              ) : filteredCompanies.length === 0 ? (
                <EmptyRow
                  colSpan={6}
                  message="No se encontraron empresas."
                />
              ) : (
                filteredCompanies.map((company) => (
                  <tr
                    key={company.id}
                    className="group transition-colors hover:bg-neutral-800/20"
                  >
                    <td className="px-6 py-4">
                      <CompanyIdentity company={company} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <p className="flex items-center gap-1.5 text-neutral-300">
                          <MapPin
                            size={13}
                            className="text-neutral-500"
                          />
                          {company.mainCity ?? "Sin ciudad"}
                        </p>
                        <p className="text-neutral-500">
                          Riesgo:{" "}
                          {company.mainRiskClass ??
                            "Sin definir"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs">
                        <p className="text-neutral-300">
                          {company.sstContactName ??
                            "Sin contacto SST"}
                        </p>
                        <p className="flex items-center gap-1.5 text-neutral-500">
                          <Mail size={12} />
                          {company.sstContactEmail ??
                            company.companyEmail ??
                            "Sin correo"}
                        </p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <VisitSummary company={company} />
                    </td>

                    <td className="px-6 py-4">
                      <RelationSummary company={company} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      {(canOpenEvaluation || isInternalUser) && (
                        <ActionButtons
                          onEvaluate={
                            canOpenEvaluation
                              ? () => openEvaluation(company)
                              : undefined
                          }
                          evaluationLabel={evaluationActionLabel}
                          onEdit={
                            isInternalUser
                              ? () => openEdit(company)
                              : undefined
                          }
                          onDelete={
                            isInternalUser
                              ? () =>
                                  void handleDeactivate(company)
                              : undefined
                          }
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-neutral-800/70 lg:hidden">
          {loading ? (
            <div className="flex justify-center px-4 py-14">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="px-4 py-14 text-center text-sm text-neutral-500">
              No se encontraron empresas.
            </div>
          ) : (
            filteredCompanies.map((company) => (
              <article
                key={company.id}
                className="space-y-4 p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <CompanyIdentity company={company} />

                  {isInternalUser && (
                    <ActionButtons
                      compact
                      onEdit={() => openEdit(company)}
                      onDelete={() =>
                        void handleDeactivate(company)
                      }
                    />
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <InfoCard
                    label="Ubicación"
                    value={
                      company.mainCity ?? "Sin ciudad"
                    }
                    secondary={`Riesgo: ${
                      company.mainRiskClass ??
                      "Sin definir"
                    }`}
                  />

                  <InfoCard
                    label="Contacto SST"
                    value={
                      company.sstContactName ??
                      "Sin contacto"
                    }
                    secondary={
                      company.sstContactEmail ??
                      company.companyEmail ??
                      "Sin correo"
                    }
                  />

                  <InfoCard
                    label="Visitas"
                    value={`SST: ${company.agreedSstVisits}`}
                    secondary={`Emergencias: ${company.agreedEmergencyVisits}`}
                  />

                  <InfoCard
                    label="Relaciones"
                    value={`${
                      company._count?.users ?? 0
                    } usuarios`}
                    secondary={`${
                      company._count
                        ?.professionalAssignments ?? 0
                    } profesionales`}
                  />
                </div>

                {canOpenEvaluation && (
                  <button
                    type="button"
                    onClick={() => openEvaluation(company)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm font-bold text-cyan-300 transition hover:bg-cyan-500/20"
                  >
                    <ClipboardCheck size={17} />
                    {isClientAdmin
                      ? "Consultar evaluación SG-SST"
                      : "Abrir evaluación SG-SST"}
                  </button>
                )}
              </article>
            ))
          )}
        </div>

        <div className="border-t border-neutral-800/70 px-4 py-4 text-xs text-neutral-500 sm:px-6">
          Mostrando {filteredCompanies.length} empresas activas
        </div>
      </section>

      <AppModal
        open={modalOpen}
        title={
          editingCompany
            ? "Editar empresa"
            : "Registrar empresa"
        }
        description="Completa la información contractual, de contacto y riesgo."
        onClose={closeModal}
        busy={submitting}
        size="2xl"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-5 py-3 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-700 disabled:opacity-50 sm:w-auto sm:py-2.5"
            >
              Cancelar
            </button>

            <button
              type="submit"
              form="company-form"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5"
            >
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {editingCompany
                ? "Guardar cambios"
                : "Crear empresa"}
            </button>
          </div>
        }
      >
        <form
          id="company-form"
          onSubmit={handleSubmit}
          className="space-y-8"
        >
          {formError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          <FormSection title="Identificación y ubicación">
            <FormField label="NIT *">
              <TextInput
                required
                value={form.taxId}
                onChange={(value) =>
                  updateField("taxId", value)
                }
              />
            </FormField>

            <FormField label="Razón social *">
              <TextInput
                required
                value={form.name}
                onChange={(value) =>
                  updateField("name", value)
                }
              />
            </FormField>

            <FormField label="Fecha de inicio">
              <TextInput
                type="date"
                value={form.startDate}
                onChange={(value) =>
                  updateField("startDate", value)
                }
              />
            </FormField>

            <FormField label="Ciudad principal">
              <TextInput
                value={form.mainCity}
                onChange={(value) =>
                  updateField("mainCity", value)
                }
              />
            </FormField>

            <FormField
              label="Dirección principal"
              spanTwo
            >
              <TextInput
                value={form.mainAddress}
                onChange={(value) =>
                  updateField("mainAddress", value)
                }
              />
            </FormField>

            <FormField
              label="Email de la empresa"
              spanTwo
            >
              <TextInput
                type="email"
                value={form.companyEmail}
                onChange={(value) =>
                  updateField("companyEmail", value)
                }
              />
            </FormField>
          </FormSection>

          <FormSection title="Riesgo y actividad económica">
            <FormField label="Clase de riesgo principal">
              <AppSelect
                value={form.mainRiskClass}
                onChange={(event) =>
                  updateField(
                    "mainRiskClass",
                    event.target.value as
                      | ""
                      | RiskClass
                  )
                }
              >
                <option value="">Sin definir</option>
                {["I", "II", "III", "IV", "V"].map(
                  (risk) => (
                    <option
                      key={risk}
                      value={risk}
                    >
                      Clase {risk}
                    </option>
                  )
                )}
              </AppSelect>
            </FormField>

            <FormField label="Código de actividad económica">
              <TextInput
                value={form.economicActivityCode}
                onChange={(value) =>
                  updateField(
                    "economicActivityCode",
                    value
                  )
                }
              />
            </FormField>

            <FormField
              label="Descripción de actividad económica"
              spanTwo
            >
              <TextArea
                value={
                  form.economicActivityDescription
                }
                onChange={(value) =>
                  updateField(
                    "economicActivityDescription",
                    value
                  )
                }
              />
            </FormField>

            <FormField
              label="Descripción de la empresa"
              spanTwo
            >
              <TextArea
                value={form.companyDescription}
                onChange={(value) =>
                  updateField(
                    "companyDescription",
                    value
                  )
                }
              />
            </FormField>
          </FormSection>

          <FormSection title="Gerencia y contacto SST">
            <FormField label="Nombre del gerente">
              <TextInput
                value={form.managerName}
                onChange={(value) =>
                  updateField("managerName", value)
                }
              />
            </FormField>

            <FormField label="Email del gerente">
              <TextInput
                type="email"
                value={form.managerEmail}
                onChange={(value) =>
                  updateField("managerEmail", value)
                }
              />
            </FormField>

            <FormField label="Nombre del contacto SST">
              <TextInput
                value={form.sstContactName}
                onChange={(value) =>
                  updateField("sstContactName", value)
                }
              />
            </FormField>

            <FormField label="Email del contacto SST">
              <TextInput
                type="email"
                value={form.sstContactEmail}
                onChange={(value) =>
                  updateField(
                    "sstContactEmail",
                    value
                  )
                }
              />
            </FormField>
          </FormSection>

          <FormSection title="Visitas convenidas">
            <FormField label="Visitas SST">
              <TextInput
                type="number"
                min="0"
                value={form.agreedSstVisits}
                onChange={(value) =>
                  updateField(
                    "agreedSstVisits",
                    value
                  )
                }
              />
            </FormField>

            <FormField label="Visitas de emergencias">
              <TextInput
                type="number"
                min="0"
                value={form.agreedEmergencyVisits}
                onChange={(value) =>
                  updateField(
                    "agreedEmergencyVisits",
                    value
                  )
                }
              />
            </FormField>

            {editingCompany && (
              <FormField
                label="Estado de la empresa"
                spanTwo
              >
                <ToggleRow
                  checked={form.isActive}
                  onChange={(checked) =>
                    updateField("isActive", checked)
                  }
                  label="Empresa activa"
                />
              </FormField>
            )}
          </FormSection>
        </form>
      </AppModal>
    </div>
  );
}

function HeaderCell({
  children,
  alignRight = false,
}: {
  children: ReactNode;
  alignRight?: boolean;
}) {
  return (
    <th
      className={`px-6 py-4 text-xs font-medium uppercase tracking-wider text-neutral-400 ${
        alignRight ? "text-right" : ""
      }`}
    >
      {children}
    </th>
  );
}

function LoadingRow({
  colSpan,
}: {
  colSpan: number;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-14 text-center"
      >
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-neutral-500" />
      </td>
    </tr>
  );
}

function EmptyRow({
  colSpan,
  message,
}: {
  colSpan: number;
  message: string;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-6 py-14 text-center text-neutral-500"
      >
        {message}
      </td>
    </tr>
  );
}

function CompanyIdentity({
  company,
}: {
  company: Company;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-700/50 bg-neutral-800/80 text-neutral-300">
        <Building2 size={17} />
      </div>
      <div className="min-w-0">
        <p className="truncate font-semibold text-white">
          {company.name}
        </p>
        <p className="mt-0.5 truncate font-mono text-xs text-neutral-500">
          {company.taxId}
        </p>
      </div>
    </div>
  );
}

function VisitSummary({
  company,
}: {
  company: Company;
}) {
  return (
    <div className="space-y-1 text-xs text-neutral-300">
      <p>
        SST: <strong>{company.agreedSstVisits}</strong>
      </p>
      <p>
        Emergencias:{" "}
        <strong>
          {company.agreedEmergencyVisits}
        </strong>
      </p>
    </div>
  );
}

function RelationSummary({
  company,
}: {
  company: Company;
}) {
  return (
    <div className="flex gap-4 text-xs text-neutral-300">
      <span className="flex items-center gap-1.5">
        <Users
          size={14}
          className="text-neutral-500"
        />
        {company._count?.users ?? 0} usuarios
      </span>
      <span className="flex items-center gap-1.5">
        <Calendar
          size={14}
          className="text-neutral-500"
        />
        {company._count
          ?.professionalAssignments ?? 0}{" "}
        profesionales
      </span>
    </div>
  );
}

function ActionButtons({
  onEvaluate,
  evaluationLabel = "Evaluar",
  onEdit,
  onDelete,
  compact = false,
}: {
  onEvaluate?: () => void;
  evaluationLabel?: string;
  onEdit?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center ${
        compact ? "gap-1" : "justify-end gap-1"
      }`}
    >
      {onEvaluate && (
        <button
          type="button"
          onClick={onEvaluate}
          className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300 transition-colors hover:bg-cyan-500/20"
          title={
            evaluationLabel === "Consultar"
              ? "Consultar evaluación SG-SST"
              : "Abrir evaluación SG-SST"
          }
        >
          <ClipboardCheck size={16} />
          {!compact && <span>{evaluationLabel}</span>}
        </button>
      )}

      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"
          title="Editar empresa"
        >
          <Edit2 size={17} />
        </button>
      )}

      {onDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
          title="Desactivar empresa"
        >
          <Trash2 size={17} />
        </button>
      )}
    </div>
  );
}

function InfoCard({
  label,
  value,
  secondary,
}: {
  label: string;
  value: string;
  secondary: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-neutral-800 bg-[#0a0a0a] p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
        {label}
      </p>
      <p className="mt-1 truncate text-sm text-neutral-200">
        {value}
      </p>
      <p className="mt-0.5 truncate text-xs text-neutral-500">
        {secondary}
      </p>
    </div>
  );
}

function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-4 text-sm font-bold text-white sm:text-base">
        {title}
      </h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function FormField({
  label,
  children,
  spanTwo = false,
}: {
  label: string;
  children: ReactNode;
  spanTwo?: boolean;
}) {
  return (
    <label
      className={`block min-w-0 ${
        spanTwo ? "md:col-span-2" : ""
      }`}
    >
      <span className="mb-1.5 block text-xs font-medium text-neutral-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function TextInput({
  value,
  onChange,
  type = "text",
  ...props
}: {
  value: string;
  onChange: (value: string) => void;
  type?: string;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "type"
>) {
  return (
    <input
      {...props}
      type={type}
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className={inputClass}
    />
  );
}

function TextArea({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      rows={4}
      className={`${inputClass} resize-y`}
    />
  );
}

function ToggleRow({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-[#090909] px-4 py-3">
      <span className="text-sm text-neutral-300">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition-colors ${
          checked
            ? "bg-cyan-500"
            : "bg-neutral-700"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
            checked
              ? "translate-x-6"
              : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
