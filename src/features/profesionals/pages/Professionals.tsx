import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  BriefcaseBusiness,
  Building2,
  Edit2,
  Link2,
  Loader2,
  Mail,
  Phone,
  Plus,
  Search,
  Trash2,
  Unlink,
} from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import { apiRequest } from "../../../lib/api";
import type {
  Company,
  IdentificationType,
  Professional,
  ProfessionalAssignment,
} from "../../../types/domain";
import AppModal from "../../../components/ui/AppModal";
import AppSelect from "../../../components/ui/AppSelect";
import AssignmentCategoriesButton from "../components/AssignmentCategoriesButton";

interface ProfessionalForm {
  identificationType: IdentificationType;
  identificationNumber: string;
  firstNames: string;
  lastNames: string;
  position: string;
  profession: string;
  professionalRole: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
}

interface AssignmentForm {
  companyId: string;
  assignmentRole: string;
  startDate: string;
  endDate: string;
}

const emptyProfessionalForm: ProfessionalForm = {
  identificationType: "CC",
  identificationNumber: "",
  firstNames: "",
  lastNames: "",
  position: "",
  profession: "",
  professionalRole: "",
  email: "",
  phone: "",
  address: "",
  isActive: true,
};

const emptyAssignmentForm: AssignmentForm = {
  companyId: "",
  assignmentRole: "",
  startDate: "",
  endDate: "",
};

const inputClass =
  "w-full rounded-xl border border-neutral-800 bg-[#090909] px-3 py-2.5 text-sm text-white outline-none transition-all [color-scheme:dark] placeholder:text-neutral-600 hover:border-neutral-700 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10";

export default function Professionals() {
  const { token } = useAuth();

  const [professionals, setProfessionals] = useState<
    Professional[]
  >([]);
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
  const [editingProfessional, setEditingProfessional] =
    useState<Professional | null>(null);
  const [form, setForm] = useState<ProfessionalForm>(
    emptyProfessionalForm
  );

  const [assignmentOpen, setAssignmentOpen] =
    useState(false);
  const [
    assignmentProfessional,
    setAssignmentProfessional,
  ] = useState<Professional | null>(null);
  const [assignmentForm, setAssignmentForm] =
    useState<AssignmentForm>(emptyAssignmentForm);

  const loadData = async () => {
    if (!token) return;

    setLoading(true);
    setPageError(null);

    try {
      const [professionalData, companyData] =
        await Promise.all([
          apiRequest<Professional[]>(
            "/api/professionals",
            {},
            token
          ),
          apiRequest<Company[]>(
            "/api/companies",
            {},
            token
          ),
        ]);

      setProfessionals(professionalData);
      setCompanies(companyData);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los profesionales."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token]);

  const filteredProfessionals = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return professionals;

    return professionals.filter((professional) =>
      [
        professional.firstNames,
        professional.lastNames,
        professional.identificationNumber,
        professional.email,
        professional.profession ?? "",
        professional.professionalRole ?? "",
      ].some((value) =>
        value.toLowerCase().includes(search)
      )
    );
  }, [professionals, searchTerm]);

  const openCreate = () => {
    setEditingProfessional(null);
    setForm(emptyProfessionalForm);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (professional: Professional) => {
    setEditingProfessional(professional);
    setForm({
      identificationType:
        professional.identificationType,
      identificationNumber:
        professional.identificationNumber,
      firstNames: professional.firstNames,
      lastNames: professional.lastNames,
      position: professional.position ?? "",
      profession: professional.profession ?? "",
      professionalRole:
        professional.professionalRole ?? "",
      email: professional.email,
      phone: professional.phone ?? "",
      address: professional.address ?? "",
      isActive: professional.isActive,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProfessional(null);
    setForm(emptyProfessionalForm);
    setFormError(null);
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!token) return;

    setSubmitting(true);
    setFormError(null);

    try {
      if (editingProfessional) {
        await apiRequest<Professional>(
          `/api/professionals/${editingProfessional.id}`,
          {
            method: "PUT",
            body: JSON.stringify(form),
          },
          token
        );
      } else {
        await apiRequest<Professional>(
          "/api/professionals",
          {
            method: "POST",
            body: JSON.stringify(form),
          },
          token
        );
      }

      closeModal();
      await loadData();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el profesional."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (
    professional: Professional
  ) => {
    if (!token) return;

    const confirmed = window.confirm(
      `¿Desactivar a "${professional.firstNames} ${professional.lastNames}"?`
    );

    if (!confirmed) return;

    try {
      await apiRequest(
        `/api/professionals/${professional.id}`,
        { method: "DELETE" },
        token
      );
      await loadData();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "No fue posible desactivar el profesional."
      );
    }
  };

  const openAssignment = (
    professional: Professional
  ) => {
    setAssignmentProfessional(professional);
    setAssignmentForm(emptyAssignmentForm);
    setFormError(null);
    setAssignmentOpen(true);
  };

  const closeAssignment = () => {
    setAssignmentOpen(false);
    setAssignmentProfessional(null);
    setAssignmentForm(emptyAssignmentForm);
    setFormError(null);
  };

  const handleAssignCompany = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!token || !assignmentProfessional) return;

    setSubmitting(true);
    setFormError(null);

    try {
      await apiRequest(
        `/api/professionals/${assignmentProfessional.id}/companies`,
        {
          method: "POST",
          body: JSON.stringify({
            ...assignmentForm,
            startDate:
              assignmentForm.startDate || null,
            endDate: assignmentForm.endDate || null,
          }),
        },
        token
      );

      closeAssignment();
      await loadData();
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "No fue posible realizar la asignación."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (
    professional: Professional,
    assignment: ProfessionalAssignment
  ) => {
    if (!token) return;

    const confirmed = window.confirm(
      `¿Retirar a ${professional.firstNames} de ${assignment.company.name}?`
    );

    if (!confirmed) return;

    try {
      await apiRequest(
        `/api/professionals/${professional.id}/companies/${assignment.companyId}`,
        { method: "DELETE" },
        token
      );
      await loadData();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "No fue posible retirar la asignación."
      );
    }
  };

  return (
    <div className="mx-auto flex min-h-full min-w-0 max-w-7xl flex-col">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Profesionales y prestadores
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-400">
            Gestiona perfiles, acceso al sistema y empresas asignadas.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition-all hover:bg-neutral-200 active:scale-[0.98] sm:w-auto sm:py-2.5"
        >
          <Plus size={18} />
          Nuevo profesional
        </button>
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
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(event.target.value)
            }
            placeholder="Buscar por nombre, identificación, correo o profesión..."
            className="w-full rounded-xl border border-neutral-800 bg-[#111111] py-3 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-neutral-500 hover:border-neutral-700 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10"
          />
        </div>
      </div>

      <section className="min-w-0 overflow-hidden rounded-2xl border border-neutral-800/70 bg-[#111111] shadow-xl">
        <div className="hidden overflow-x-auto xl:block">
          <table className="w-full min-w-[1120px] whitespace-nowrap text-left text-sm">
            <thead className="border-b border-neutral-800 bg-[#0a0a0a]">
              <tr>
                <HeaderCell>Profesional</HeaderCell>
                <HeaderCell>Información laboral</HeaderCell>
                <HeaderCell>Contacto</HeaderCell>
                <HeaderCell>Empresas asignadas</HeaderCell>
                <HeaderCell>Acceso</HeaderCell>
                <HeaderCell alignRight>Acciones</HeaderCell>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-800/70">
              {loading ? (
                <LoadingRow colSpan={6} />
              ) : filteredProfessionals.length === 0 ? (
                <EmptyRow
                  colSpan={6}
                  message="No se encontraron profesionales."
                />
              ) : (
                filteredProfessionals.map(
                  (professional) => (
                    <tr
                      key={professional.id}
                      className="group transition-colors hover:bg-neutral-800/20"
                    >
                      <td className="px-6 py-4">
                        <ProfessionalIdentity
                          professional={professional}
                        />
                      </td>

                      <td className="px-6 py-4">
                        <WorkSummary
                          professional={professional}
                        />
                      </td>

                      <td className="px-6 py-4">
                        <ContactSummary
                          professional={professional}
                        />
                      </td>

                      <td className="px-6 py-4">
                        <AssignmentChips
                          professional={professional}
                          onRemove={
                            handleRemoveAssignment
                          }
                        />
                      </td>

                      <td className="px-6 py-4">
                        <AccessSummary
                          professional={professional}
                        />
                      </td>

                      <td className="px-6 py-4 text-right">
                        <ProfessionalActions
                          onAssign={() =>
                            openAssignment(
                              professional
                            )
                          }
                          onEdit={() =>
                            openEdit(professional)
                          }
                          onDelete={() =>
                            void handleDeactivate(
                              professional
                            )
                          }
                        />
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-neutral-800/70 xl:hidden">
          {loading ? (
            <div className="flex justify-center px-4 py-14">
              <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
            </div>
          ) : filteredProfessionals.length === 0 ? (
            <div className="px-4 py-14 text-center text-sm text-neutral-500">
              No se encontraron profesionales.
            </div>
          ) : (
            filteredProfessionals.map(
              (professional) => (
                <article
                  key={professional.id}
                  className="space-y-4 p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <ProfessionalIdentity
                      professional={professional}
                    />

                    <ProfessionalActions
                      compact
                      onAssign={() =>
                        openAssignment(professional)
                      }
                      onEdit={() =>
                        openEdit(professional)
                      }
                      onDelete={() =>
                        void handleDeactivate(
                          professional
                        )
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <MobileInfo label="Información laboral">
                      <WorkSummary
                        professional={professional}
                      />
                    </MobileInfo>

                    <MobileInfo label="Contacto">
                      <ContactSummary
                        professional={professional}
                      />
                    </MobileInfo>

                    <MobileInfo label="Acceso">
                      <AccessSummary
                        professional={professional}
                      />
                    </MobileInfo>

                    <MobileInfo label="Empresas asignadas">
                      <AssignmentChips
                        professional={professional}
                        onRemove={
                          handleRemoveAssignment
                        }
                      />
                    </MobileInfo>
                  </div>
                </article>
              )
            )
          )}
        </div>

        <div className="border-t border-neutral-800/70 px-4 py-4 text-xs text-neutral-500 sm:px-6">
          Mostrando {filteredProfessionals.length} profesionales activos
        </div>
      </section>

      <AppModal
        open={modalOpen}
        title={
          editingProfessional
            ? "Editar profesional"
            : "Registrar profesional"
        }
        description="Gestiona los datos personales, laborales y de contacto."
        onClose={closeModal}
        busy={submitting}
        size="lg"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-5 py-3 text-sm font-medium text-neutral-300 hover:bg-neutral-700 disabled:opacity-50 sm:w-auto sm:py-2.5"
            >
              Cancelar
            </button>

            <button
              type="submit"
              form="professional-form"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black hover:bg-neutral-200 disabled:opacity-50 sm:w-auto sm:py-2.5"
            >
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {editingProfessional
                ? "Guardar cambios"
                : "Crear profesional"}
            </button>
          </div>
        }
      >
        <form
          id="professional-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {formError && (
            <ErrorBox message={formError} />
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Tipo de identificación">
              <AppSelect
                value={form.identificationType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    identificationType:
                      event.target
                        .value as IdentificationType,
                  }))
                }
              >
                {[
                  "CC",
                  "CE",
                  "TI",
                  "PPT",
                  "PASSPORT",
                  "NIT",
                  "OTHER",
                ].map((type) => (
                  <option
                    key={type}
                    value={type}
                  >
                    {identificationTypeLabel(
                      type as IdentificationType
                    )}
                  </option>
                ))}
              </AppSelect>
            </Field>

            <Field label="Número de identificación">
              <input
                required
                value={form.identificationNumber}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    identificationNumber:
                      event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Nombres">
              <input
                required
                value={form.firstNames}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    firstNames: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Apellidos">
              <input
                required
                value={form.lastNames}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    lastNames: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Cargo">
              <input
                value={form.position}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    position: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Profesión">
              <input
                value={form.profession}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    profession: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Rol operativo">
              <input
                value={form.professionalRole}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    professionalRole:
                      event.target.value,
                  }))
                }
                placeholder="Ej. Asesor SST"
                className={inputClass}
              />
            </Field>

            <Field label="Correo">
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Celular">
              <input
                value={form.phone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    phone: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Dirección">
              <input
                value={form.address}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    address: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
          </div>

          {editingProfessional && (
            <ToggleRow
              checked={form.isActive}
              onChange={(checked) =>
                setForm((current) => ({
                  ...current,
                  isActive: checked,
                }))
              }
              label="Profesional activo"
            />
          )}
        </form>
      </AppModal>

      <AppModal
        open={
          assignmentOpen &&
          Boolean(assignmentProfessional)
        }
        title={`Asignar empresa${
          assignmentProfessional
            ? ` a ${assignmentProfessional.firstNames}`
            : ""
        }`}
        description="La asignación define qué empresas puede consultar el profesional."
        onClose={closeAssignment}
        busy={submitting}
        size="md"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeAssignment}
              disabled={submitting}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-5 py-3 text-sm font-medium text-neutral-300 hover:bg-neutral-700 disabled:opacity-50 sm:w-auto sm:py-2.5"
            >
              Cancelar
            </button>

            <button
              type="submit"
              form="assignment-form"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black hover:bg-neutral-200 disabled:opacity-50 sm:w-auto sm:py-2.5"
            >
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Guardar asignación
            </button>
          </div>
        }
      >
        <form
          id="assignment-form"
          onSubmit={handleAssignCompany}
          className="space-y-5"
        >
          {formError && (
            <ErrorBox message={formError} />
          )}

          <Field label="Empresa">
            <AppSelect
              required
              value={assignmentForm.companyId}
              onChange={(event) =>
                setAssignmentForm((current) => ({
                  ...current,
                  companyId: event.target.value,
                }))
              }
            >
              <option value="">
                Selecciona una empresa
              </option>
              {companies.map((company) => (
                <option
                  key={company.id}
                  value={company.id}
                >
                  {company.name} — {company.taxId}
                </option>
              ))}
            </AppSelect>
          </Field>

          <Field label="Rol en la asignación">
            <input
              value={assignmentForm.assignmentRole}
              onChange={(event) =>
                setAssignmentForm((current) => ({
                  ...current,
                  assignmentRole:
                    event.target.value,
                }))
              }
              placeholder="Ej. Asesor principal SST"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Fecha inicial">
              <input
                type="date"
                value={assignmentForm.startDate}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    startDate: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>

            <Field label="Fecha final">
              <input
                type="date"
                value={assignmentForm.endDate}
                onChange={(event) =>
                  setAssignmentForm((current) => ({
                    ...current,
                    endDate: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Field>
          </div>
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

function ProfessionalIdentity({
  professional,
}: {
  professional: Professional;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-800">
        <BriefcaseBusiness
          size={17}
          className="text-emerald-400"
        />
      </div>

      <div className="min-w-0">
        <p className="truncate font-medium text-white">
          {professional.firstNames}{" "}
          {professional.lastNames}
        </p>
        <p className="truncate font-mono text-xs text-neutral-500">
          {professional.identificationType}{" "}
          {professional.identificationNumber}
        </p>
      </div>
    </div>
  );
}

function WorkSummary({
  professional,
}: {
  professional: Professional;
}) {
  return (
    <div className="min-w-0">
      <p className="truncate text-sm text-neutral-300">
        {professional.professionalRole ??
          professional.position ??
          "Sin rol operativo"}
      </p>
      <p className="truncate text-xs text-neutral-500">
        {professional.profession ??
          "Profesión no registrada"}
      </p>
    </div>
  );
}

function ContactSummary({
  professional,
}: {
  professional: Professional;
}) {
  return (
    <div className="min-w-0 space-y-1">
      <p className="flex min-w-0 items-center gap-1.5 text-xs text-neutral-300">
        <Mail size={12} className="shrink-0" />
        <span className="truncate">
          {professional.email}
        </span>
      </p>
      <p className="flex min-w-0 items-center gap-1.5 text-xs text-neutral-500">
        <Phone size={12} className="shrink-0" />
        <span className="truncate">
          {professional.phone ?? "Sin celular"}
        </span>
      </p>
    </div>
  );
}

function AssignmentChips({
  professional,
  onRemove,
}: {
  professional: Professional;
  onRemove: (
    professional: Professional,
    assignment: ProfessionalAssignment
  ) => Promise<void>;
}) {
  const activeAssignments =
    professional.companyAssignments.filter(
      (assignment) => assignment.isActive
    );

  if (activeAssignments.length === 0) {
    return (
      <span className="text-xs text-neutral-500">
        Sin asignaciones
      </span>
    );
  }

  const professionalName = `${professional.firstNames} ${professional.lastNames}`;

  return (
    <div className="flex max-w-lg flex-wrap gap-2">
      {activeAssignments.map((assignment) => (
        <div
          key={assignment.id}
          className="flex max-w-full items-center gap-1 rounded-xl border border-blue-500/20 bg-blue-500/10 p-1 text-blue-300"
        >
          <div className="flex min-w-0 items-center gap-1.5 px-2 py-1 text-[10px] font-medium">
            <Building2 size={11} className="shrink-0" />
            <span className="truncate">
              {assignment.company.name}
            </span>
          </div>

          <AssignmentCategoriesButton
            professionalId={professional.id}
            professionalName={professionalName}
            assignment={assignment}
          />

          <button
            type="button"
            onClick={() =>
              void onRemove(
                professional,
                assignment
              )
            }
            title={`Retirar asignación de ${assignment.company.name}`}
            className="rounded-lg p-1.5 text-blue-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <Unlink size={11} />
          </button>
        </div>
      ))}
    </div>
  );
}

function AccessSummary({
  professional,
}: {
  professional: Professional;
}) {
  if (professional.user) {
    return (
      <div className="min-w-0">
        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
          <Link2 size={11} />
          CON USUARIO
        </span>
        <p className="mt-1 truncate text-xs text-neutral-500">
          {professional.user.email}
        </p>
      </div>
    );
  }

  return (
    <span className="inline-flex rounded-full border border-neutral-700 bg-neutral-800 px-2.5 py-1 text-[10px] font-bold text-neutral-400">
      SIN ACCESO
    </span>
  );
}

function ProfessionalActions({
  onAssign,
  onEdit,
  onDelete,
  compact = false,
}: {
  onAssign: () => void;
  onEdit: () => void;
  onDelete: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex items-center ${
        compact ? "gap-1" : "justify-end"
      }`}
    >
      <button
        type="button"
        onClick={onAssign}
        className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
        title="Asignar empresa"
      >
        <Building2 size={17} />
      </button>

      <button
        type="button"
        onClick={onEdit}
        className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"
        title="Editar profesional"
      >
        <Edit2 size={17} />
      </button>

      <button
        type="button"
        onClick={onDelete}
        className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
        title="Desactivar profesional"
      >
        <Trash2 size={17} />
      </button>
    </div>
  );
}

function MobileInfo({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-neutral-800 bg-[#0a0a0a] p-3">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
        {label}
      </p>
      {children}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-medium text-neutral-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function ErrorBox({
  message,
}: {
  message: string;
}) {
  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
      {message}
    </div>
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

function identificationTypeLabel(
  value: IdentificationType
): string {
  const labels: Record<
    IdentificationType,
    string
  > = {
    CC: "Cédula de ciudadanía",
    CE: "Cédula de extranjería",
    TI: "Tarjeta de identidad",
    PPT: "Permiso por protección temporal",
    PASSPORT: "Pasaporte",
    NIT: "NIT",
    OTHER: "Otro",
  };

  return labels[value];
}