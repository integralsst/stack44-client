import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  KeyRound,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Settings2,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

import AppModal from "../../../components/ui/AppModal";
import AppSelect from "../../../components/ui/AppSelect";
import { useAuth } from "../../auth/context/AuthContext";
import { apiRequest } from "../../../lib/api";
import type {
  Company,
  IdentificationType,
  ManagedUser,
  Professional,
  RiskClass,
} from "../../../types/domain";

type WizardStep = 1 | 2 | 3 | 4;
type ProfessionalMode = "existing" | "new" | "skip";

type CompanyDraft = {
  taxId: string;
  name: string;
  mainCity: string;
  companyEmail: string;
  mainRiskClass: "" | RiskClass;
  sstContactName: string;
  sstContactEmail: string;
};

type ProfessionalDraft = {
  identificationType: IdentificationType;
  identificationNumber: string;
  firstNames: string;
  lastNames: string;
  position: string;
  profession: string;
  professionalRole: string;
  email: string;
  phone: string;
};

type AccessDraft = {
  name: string;
  email: string;
  password: string;
};

const emptyCompany: CompanyDraft = {
  taxId: "",
  name: "",
  mainCity: "",
  companyEmail: "",
  mainRiskClass: "",
  sstContactName: "",
  sstContactEmail: "",
};

const emptyProfessional: ProfessionalDraft = {
  identificationType: "CC",
  identificationNumber: "",
  firstNames: "",
  lastNames: "",
  position: "",
  profession: "",
  professionalRole: "",
  email: "",
  phone: "",
};

const emptyAccess: AccessDraft = {
  name: "",
  email: "",
  password: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10";

export default function AdministracionPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [assignProfessionalId, setAssignProfessionalId] = useState("");
  const [assignRole, setAssignRole] = useState("Profesional SST");
  const [clientAdmin, setClientAdmin] = useState<AccessDraft>(emptyAccess);
  const [professionalAccessId, setProfessionalAccessId] = useState("");
  const [professionalAccessRole, setProfessionalAccessRole] =
    useState<"PROFESSIONAL" | "COORDINATOR">("PROFESSIONAL");
  const [professionalPassword, setProfessionalPassword] = useState("");

  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<WizardStep>(1);
  const [companyDraft, setCompanyDraft] = useState<CompanyDraft>(emptyCompany);
  const [createdCompany, setCreatedCompany] = useState<Company | null>(null);
  const [professionalMode, setProfessionalMode] =
    useState<ProfessionalMode>("existing");
  const [wizardProfessionalId, setWizardProfessionalId] = useState("");
  const [professionalDraft, setProfessionalDraft] =
    useState<ProfessionalDraft>(emptyProfessional);
  const [linkedProfessional, setLinkedProfessional] =
    useState<Professional | null>(null);
  const [createClientAdmin, setCreateClientAdmin] = useState(true);
  const [clientAdminDraft, setClientAdminDraft] =
    useState<AccessDraft>(emptyAccess);
  const [createProfessionalAccess, setCreateProfessionalAccess] =
    useState(false);
  const [professionalAccessDraft, setProfessionalAccessDraft] =
    useState<AccessDraft>(emptyAccess);
  const [wizardProfessionalRole, setWizardProfessionalRole] =
    useState<"PROFESSIONAL" | "COORDINATOR">("PROFESSIONAL");
  const [clientAdminCreated, setClientAdminCreated] = useState(false);
  const [professionalUserCreated, setProfessionalUserCreated] = useState(false);

  const loadData = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const [companyData, professionalData, userData] = await Promise.all([
        apiRequest<Company[]>("/api/companies", {}, token),
        apiRequest<Professional[]>("/api/professionals", {}, token),
        apiRequest<ManagedUser[]>("/api/users", {}, token),
      ]);

      setCompanies(companyData);
      setProfessionals(professionalData);
      setUsers(userData);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible cargar la administración."
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === selectedCompanyId) ?? null,
    [companies, selectedCompanyId]
  );

  const selectedCompanyProfessionals = useMemo(() => {
    if (!selectedCompanyId) return [];

    return professionals.filter((professional) =>
      professional.companyAssignments.some(
        (assignment) =>
          assignment.companyId === selectedCompanyId && assignment.isActive
      )
    );
  }, [professionals, selectedCompanyId]);

  const selectedCompanyUsers = useMemo(
    () => users.filter((user) => user.companyId === selectedCompanyId),
    [users, selectedCompanyId]
  );

  const assignableProfessionals = useMemo(() => {
    const linkedIds = new Set(selectedCompanyProfessionals.map((item) => item.id));
    return professionals.filter(
      (professional) => professional.isActive && !linkedIds.has(professional.id)
    );
  }, [professionals, selectedCompanyProfessionals]);

  const professionalsWithoutAccess = useMemo(
    () => selectedCompanyProfessionals.filter((professional) => !professional.userId),
    [selectedCompanyProfessionals]
  );

  const openWizard = () => {
    setWizardStep(1);
    setCompanyDraft(emptyCompany);
    setCreatedCompany(null);
    setProfessionalMode("existing");
    setWizardProfessionalId("");
    setProfessionalDraft(emptyProfessional);
    setLinkedProfessional(null);
    setCreateClientAdmin(true);
    setClientAdminDraft(emptyAccess);
    setCreateProfessionalAccess(false);
    setProfessionalAccessDraft(emptyAccess);
    setWizardProfessionalRole("PROFESSIONAL");
    setClientAdminCreated(false);
    setProfessionalUserCreated(false);
    setError(null);
    setWizardOpen(true);
  };

  const closeWizard = () => {
    if (busy) return;
    setWizardOpen(false);
  };

  const createCompanyAndContinue = async () => {
    if (!token) return;
    if (!companyDraft.taxId.trim() || !companyDraft.name.trim()) {
      setError("El NIT y la razón social son obligatorios.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const company = await apiRequest<Company>(
        "/api/companies",
        {
          method: "POST",
          body: JSON.stringify({
            ...companyDraft,
            taxId: companyDraft.taxId.trim(),
            name: companyDraft.name.trim(),
            mainRiskClass: companyDraft.mainRiskClass || null,
            agreedSstVisits: 0,
            agreedEmergencyVisits: 0,
            isActive: true,
          }),
        },
        token
      );

      setCreatedCompany(company);
      setClientAdminDraft((current) => ({
        ...current,
        email: companyDraft.companyEmail.trim().toLowerCase(),
      }));
      setWizardStep(2);
      await loadData();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible crear la empresa."
      );
    } finally {
      setBusy(false);
    }
  };

  const assignProfessional = async (
    professional: Professional,
    companyId: string,
    role: string
  ) => {
    if (!token) return;

    await apiRequest(
      `/api/professionals/${professional.id}/companies`,
      {
        method: "POST",
        body: JSON.stringify({
          companyId,
          assignmentRole: role.trim() || "Profesional SST",
          startDate: null,
          endDate: null,
        }),
      },
      token
    );
  };

  const saveWizardProfessional = async () => {
    if (!token || !createdCompany) return;

    if (professionalMode === "skip") {
      setWizardStep(3);
      return;
    }

    setBusy(true);
    setError(null);

    try {
      let professional: Professional;

      if (professionalMode === "existing") {
        const selected = professionals.find(
          (item) => item.id === wizardProfessionalId
        );

        if (!selected) {
          throw new Error("Selecciona un profesional para continuar.");
        }

        professional = selected;
      } else {
        if (
          !professionalDraft.identificationNumber.trim() ||
          !professionalDraft.firstNames.trim() ||
          !professionalDraft.lastNames.trim() ||
          !professionalDraft.email.trim()
        ) {
          throw new Error(
            "Identificación, nombres, apellidos y correo son obligatorios."
          );
        }

        professional = await apiRequest<Professional>(
          "/api/professionals",
          {
            method: "POST",
            body: JSON.stringify({
              ...professionalDraft,
              identificationNumber:
                professionalDraft.identificationNumber.trim(),
              firstNames: professionalDraft.firstNames.trim(),
              lastNames: professionalDraft.lastNames.trim(),
              email: professionalDraft.email.trim().toLowerCase(),
              address: "",
              isActive: true,
            }),
          },
          token
        );
      }

      const alreadyLinked = professional.companyAssignments?.some(
        (assignment) =>
          assignment.companyId === createdCompany.id && assignment.isActive
      );

      if (!alreadyLinked) {
        await assignProfessional(
          professional,
          createdCompany.id,
          professionalDraft.professionalRole || "Profesional SST"
        );
      }

      setLinkedProfessional(professional);
      setProfessionalAccessDraft({
        name: `${professional.firstNames} ${professional.lastNames}`.trim(),
        email: professional.email,
        password: "",
      });
      setCreateProfessionalAccess(!professional.userId);
      setWizardStep(3);
      await loadData();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible enlazar el profesional."
      );
    } finally {
      setBusy(false);
    }
  };

  const createUser = async (payload: Record<string, unknown>) => {
    if (!token) return;

    await apiRequest<ManagedUser>(
      "/api/users",
      {
        method: "POST",
        body: JSON.stringify({ ...payload, isActive: true }),
      },
      token
    );
  };

  const saveWizardAccesses = async () => {
    if (!createdCompany) return;

    setBusy(true);
    setError(null);

    try {
      if (createClientAdmin && !clientAdminCreated) {
        if (
          !clientAdminDraft.name.trim() ||
          !clientAdminDraft.email.trim() ||
          clientAdminDraft.password.length < 8
        ) {
          throw new Error(
            "Para el administrador cliente completa nombre, correo y una contraseña de mínimo 8 caracteres."
          );
        }

        await createUser({
          name: clientAdminDraft.name.trim(),
          email: clientAdminDraft.email.trim().toLowerCase(),
          password: clientAdminDraft.password,
          role: "CLIENT_ADMIN",
          companyId: createdCompany.id,
          professionalId: null,
        });
        setClientAdminCreated(true);
      }

      if (
        createProfessionalAccess &&
        linkedProfessional &&
        !linkedProfessional.userId &&
        !professionalUserCreated
      ) {
        if (
          !professionalAccessDraft.name.trim() ||
          !professionalAccessDraft.email.trim() ||
          professionalAccessDraft.password.length < 8
        ) {
          throw new Error(
            "Para el acceso profesional completa nombre, correo y una contraseña de mínimo 8 caracteres."
          );
        }

        await createUser({
          name: professionalAccessDraft.name.trim(),
          email: professionalAccessDraft.email.trim().toLowerCase(),
          password: professionalAccessDraft.password,
          role: wizardProfessionalRole,
          companyId: null,
          professionalId: linkedProfessional.id,
        });
        setProfessionalUserCreated(true);
      }

      setWizardStep(4);
      await loadData();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible completar los accesos."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleAssignExisting = async () => {
    if (!selectedCompany || !assignProfessionalId) return;

    const professional = professionals.find(
      (item) => item.id === assignProfessionalId
    );
    if (!professional) return;

    setBusy(true);
    setError(null);
    try {
      await assignProfessional(professional, selectedCompany.id, assignRole);
      setAssignProfessionalId("");
      await loadData();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible asignar el profesional."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCreateClientAdmin = async () => {
    if (!selectedCompany) return;
    if (
      !clientAdmin.name.trim() ||
      !clientAdmin.email.trim() ||
      clientAdmin.password.length < 8
    ) {
      setError("Completa nombre, correo y una contraseña de mínimo 8 caracteres.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await createUser({
        name: clientAdmin.name.trim(),
        email: clientAdmin.email.trim().toLowerCase(),
        password: clientAdmin.password,
        role: "CLIENT_ADMIN",
        companyId: selectedCompany.id,
        professionalId: null,
      });
      setClientAdmin(emptyAccess);
      await loadData();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible crear el administrador cliente."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleCreateProfessionalAccess = async () => {
    const professional = professionalsWithoutAccess.find(
      (item) => item.id === professionalAccessId
    );
    if (!professional) {
      setError("Selecciona un profesional sin acceso.");
      return;
    }
    if (professionalPassword.length < 8) {
      setError("La contraseña temporal debe tener mínimo 8 caracteres.");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await createUser({
        name: `${professional.firstNames} ${professional.lastNames}`.trim(),
        email: professional.email,
        password: professionalPassword,
        role: professionalAccessRole,
        companyId: null,
        professionalId: professional.id,
      });
      setProfessionalAccessId("");
      setProfessionalPassword("");
      await loadData();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible crear el acceso profesional."
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-cyan-700">
            <Settings2 size={15} />
            Administración global
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Empresas, profesionales y accesos
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Centraliza la creación y el enlace de clientes, equipo SIS y usuarios sin saltar entre módulos.
          </p>
        </div>

        <button
          type="button"
          onClick={openWizard}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-700"
        >
          <Plus size={17} />
          Alta rápida de cliente
        </button>
      </header>

      {error && !wizardOpen && (
        <AlertBox>{error}</AlertBox>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard icon={<Building2 size={19} />} label="Empresas" value={companies.length} />
        <SummaryCard
          icon={<BriefcaseBusiness size={19} />}
          label="Profesionales"
          value={professionals.length}
        />
        <SummaryCard icon={<Users size={19} />} label="Usuarios" value={users.length} />
        <SummaryCard
          icon={<ShieldCheck size={19} />}
          label="Administradores cliente"
          value={users.filter((item) => item.role === "CLIENT_ADMIN").length}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <ModuleCard
          icon={<Building2 size={20} />}
          title="Empresas"
          description="Datos generales, riesgo, contactos y entrada a la evaluación."
          onClick={() => navigate("/dashboard/empresas")}
        />
        <ModuleCard
          icon={<BriefcaseBusiness size={20} />}
          title="Profesionales"
          description="Perfiles, asignaciones por empresa y acceso profesional."
          onClick={() => navigate("/dashboard/profesionales")}
        />
        <ModuleCard
          icon={<Users size={20} />}
          title="Usuarios"
          description="Credenciales, roles, clientes y perfiles profesionales vinculados."
          onClick={() => navigate("/dashboard/usuarios")}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-black text-slate-950">Administrar una empresa existente</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              Selecciona la empresa y gestiona sus relaciones desde un solo lugar.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading || busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 transition hover:border-cyan-300 hover:text-cyan-700 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>

        <div className="p-5">
          <AppSelect
            value={selectedCompanyId}
            onChange={(event) => {
              setSelectedCompanyId(event.target.value);
              setAssignProfessionalId("");
              setProfessionalAccessId("");
              setError(null);
            }}
          >
            <option value="">Selecciona una empresa</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name} · {company.taxId}
              </option>
            ))}
          </AppSelect>

          {selectedCompany && (
            <div className="mt-5 space-y-5">
              <div className="flex flex-col gap-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-black text-slate-950">{selectedCompany.name}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    NIT {selectedCompany.taxId} · {selectedCompany.mainCity || "Sin ciudad"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/empresas/${selectedCompany.id}/evaluacion`)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-cyan-800"
                >
                  <ClipboardCheck size={15} />
                  Abrir evaluación
                </button>
              </div>

              <div className="grid gap-4 xl:grid-cols-3">
                <AdminPanel
                  icon={<Link2 size={18} />}
                  title="Asignar profesional"
                  description={`${selectedCompanyProfessionals.length} profesional(es) vinculados`}
                >
                  <AppSelect
                    value={assignProfessionalId}
                    onChange={(event) => setAssignProfessionalId(event.target.value)}
                  >
                    <option value="">Selecciona profesional</option>
                    {assignableProfessionals.map((professional) => (
                      <option key={professional.id} value={professional.id}>
                        {professional.firstNames} {professional.lastNames}
                      </option>
                    ))}
                  </AppSelect>
                  <input
                    value={assignRole}
                    onChange={(event) => setAssignRole(event.target.value)}
                    placeholder="Rol en la empresa"
                    className={inputClass}
                  />
                  <ActionButton
                    disabled={!assignProfessionalId || busy}
                    onClick={() => void handleAssignExisting()}
                  >
                    Asignar a empresa
                  </ActionButton>
                </AdminPanel>

                <AdminPanel
                  icon={<UserPlus size={18} />}
                  title="Administrador cliente"
                  description={`${selectedCompanyUsers.length} usuario(s) cliente actualmente`}
                >
                  <input
                    value={clientAdmin.name}
                    onChange={(event) =>
                      setClientAdmin((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Nombre"
                    className={inputClass}
                  />
                  <input
                    type="email"
                    value={clientAdmin.email}
                    onChange={(event) =>
                      setClientAdmin((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="Correo"
                    className={inputClass}
                  />
                  <input
                    type="password"
                    value={clientAdmin.password}
                    onChange={(event) =>
                      setClientAdmin((current) => ({ ...current, password: event.target.value }))
                    }
                    placeholder="Contraseña temporal"
                    className={inputClass}
                  />
                  <ActionButton disabled={busy} onClick={() => void handleCreateClientAdmin()}>
                    Crear administrador
                  </ActionButton>
                </AdminPanel>

                <AdminPanel
                  icon={<KeyRound size={18} />}
                  title="Acceso profesional"
                  description={`${professionalsWithoutAccess.length} profesional(es) sin usuario`}
                >
                  <AppSelect
                    value={professionalAccessId}
                    onChange={(event) => setProfessionalAccessId(event.target.value)}
                  >
                    <option value="">Selecciona profesional</option>
                    {professionalsWithoutAccess.map((professional) => (
                      <option key={professional.id} value={professional.id}>
                        {professional.firstNames} {professional.lastNames}
                      </option>
                    ))}
                  </AppSelect>
                  <AppSelect
                    value={professionalAccessRole}
                    onChange={(event) =>
                      setProfessionalAccessRole(
                        event.target.value as "PROFESSIONAL" | "COORDINATOR"
                      )
                    }
                  >
                    <option value="PROFESSIONAL">Profesional</option>
                    <option value="COORDINATOR">Coordinador</option>
                  </AppSelect>
                  <input
                    type="password"
                    value={professionalPassword}
                    onChange={(event) => setProfessionalPassword(event.target.value)}
                    placeholder="Contraseña temporal"
                    className={inputClass}
                  />
                  <ActionButton
                    disabled={!professionalAccessId || busy}
                    onClick={() => void handleCreateProfessionalAccess()}
                  >
                    Crear acceso
                  </ActionButton>
                </AdminPanel>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <RelationList
                  title="Profesionales vinculados"
                  empty="No hay profesionales asignados."
                  rows={selectedCompanyProfessionals.map((professional) => ({
                    id: professional.id,
                    primary: `${professional.firstNames} ${professional.lastNames}`,
                    secondary: professional.userId
                      ? "Con acceso al sistema"
                      : "Sin acceso al sistema",
                  }))}
                />
                <RelationList
                  title="Usuarios cliente"
                  empty="No hay usuarios cliente."
                  rows={selectedCompanyUsers.map((user) => ({
                    id: user.id,
                    primary: user.name,
                    secondary: `${user.role} · ${user.email}`,
                  }))}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {loading && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-slate-500">
          <Loader2 size={17} className="animate-spin" />
          Cargando administración…
        </div>
      )}

      <AppModal
        open={wizardOpen}
        title="Alta rápida de cliente"
        description="Crea la empresa, enlaza el equipo y configura accesos en una secuencia guiada."
        onClose={closeWizard}
        busy={busy}
        size="xl"
        footer={
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={closeWizard}
              disabled={busy}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              {wizardStep === 4 ? "Cerrar" : "Salir y continuar después"}
            </button>
            {wizardStep === 1 && (
              <PrimaryButton busy={busy} onClick={() => void createCompanyAndContinue()}>
                Crear empresa y continuar
              </PrimaryButton>
            )}
            {wizardStep === 2 && (
              <PrimaryButton busy={busy} onClick={() => void saveWizardProfessional()}>
                Guardar equipo y continuar
              </PrimaryButton>
            )}
            {wizardStep === 3 && (
              <PrimaryButton busy={busy} onClick={() => void saveWizardAccesses()}>
                Finalizar configuración
              </PrimaryButton>
            )}
            {wizardStep === 4 && createdCompany && (
              <PrimaryButton
                busy={false}
                onClick={() =>
                  navigate(`/dashboard/empresas/${createdCompany.id}/evaluacion`)
                }
              >
                Abrir evaluación
              </PrimaryButton>
            )}
          </div>
        }
      >
        <WizardProgress step={wizardStep} />
        {error && (
          <div className="mt-4">
            <AlertBox>{error}</AlertBox>
          </div>
        )}

        {wizardStep === 1 && (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="NIT *">
              <input
                value={companyDraft.taxId}
                onChange={(event) =>
                  setCompanyDraft((current) => ({ ...current, taxId: event.target.value }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Razón social *">
              <input
                value={companyDraft.name}
                onChange={(event) =>
                  setCompanyDraft((current) => ({ ...current, name: event.target.value }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Ciudad principal">
              <input
                value={companyDraft.mainCity}
                onChange={(event) =>
                  setCompanyDraft((current) => ({ ...current, mainCity: event.target.value }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Correo de la empresa">
              <input
                type="email"
                value={companyDraft.companyEmail}
                onChange={(event) =>
                  setCompanyDraft((current) => ({ ...current, companyEmail: event.target.value }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Clase de riesgo">
              <AppSelect
                value={companyDraft.mainRiskClass}
                onChange={(event) =>
                  setCompanyDraft((current) => ({
                    ...current,
                    mainRiskClass: event.target.value as "" | RiskClass,
                  }))
                }
              >
                <option value="">Sin definir</option>
                {(["I", "II", "III", "IV", "V"] as RiskClass[]).map((risk) => (
                  <option key={risk} value={risk}>Clase {risk}</option>
                ))}
              </AppSelect>
            </Field>
            <Field label="Contacto SST">
              <input
                value={companyDraft.sstContactName}
                onChange={(event) =>
                  setCompanyDraft((current) => ({ ...current, sstContactName: event.target.value }))
                }
                className={inputClass}
              />
            </Field>
            <Field label="Correo contacto SST" spanTwo>
              <input
                type="email"
                value={companyDraft.sstContactEmail}
                onChange={(event) =>
                  setCompanyDraft((current) => ({ ...current, sstContactEmail: event.target.value }))
                }
                className={inputClass}
              />
            </Field>
          </div>
        )}

        {wizardStep === 2 && createdCompany && (
          <div className="mt-6 space-y-5">
            <ContextBanner title={createdCompany.name} detail={`NIT ${createdCompany.taxId}`} />
            <div className="grid gap-3 sm:grid-cols-3">
              <ChoiceCard
                selected={professionalMode === "existing"}
                title="Profesional existente"
                description="Selecciona alguien ya registrado."
                onClick={() => setProfessionalMode("existing")}
              />
              <ChoiceCard
                selected={professionalMode === "new"}
                title="Crear profesional"
                description="Regístralo y enlázalo de una vez."
                onClick={() => setProfessionalMode("new")}
              />
              <ChoiceCard
                selected={professionalMode === "skip"}
                title="Configurar después"
                description="La empresa queda creada sin equipo."
                onClick={() => setProfessionalMode("skip")}
              />
            </div>

            {professionalMode === "existing" && (
              <Field label="Profesional">
                <AppSelect
                  value={wizardProfessionalId}
                  onChange={(event) => setWizardProfessionalId(event.target.value)}
                >
                  <option value="">Selecciona profesional</option>
                  {professionals.map((professional) => (
                    <option key={professional.id} value={professional.id}>
                      {professional.firstNames} {professional.lastNames} · {professional.email}
                    </option>
                  ))}
                </AppSelect>
              </Field>
            )}

            {professionalMode === "new" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tipo de identificación">
                  <AppSelect
                    value={professionalDraft.identificationType}
                    onChange={(event) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        identificationType: event.target.value as IdentificationType,
                      }))
                    }
                  >
                    {(["CC", "CE", "TI", "PPT", "PASSPORT", "NIT", "OTHER"] as IdentificationType[]).map(
                      (type) => <option key={type} value={type}>{type}</option>
                    )}
                  </AppSelect>
                </Field>
                <Field label="Identificación *">
                  <input
                    value={professionalDraft.identificationNumber}
                    onChange={(event) =>
                      setProfessionalDraft((current) => ({
                        ...current,
                        identificationNumber: event.target.value,
                      }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Nombres *">
                  <input
                    value={professionalDraft.firstNames}
                    onChange={(event) =>
                      setProfessionalDraft((current) => ({ ...current, firstNames: event.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Apellidos *">
                  <input
                    value={professionalDraft.lastNames}
                    onChange={(event) =>
                      setProfessionalDraft((current) => ({ ...current, lastNames: event.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Profesión">
                  <input
                    value={professionalDraft.profession}
                    onChange={(event) =>
                      setProfessionalDraft((current) => ({ ...current, profession: event.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Cargo / rol en la empresa">
                  <input
                    value={professionalDraft.professionalRole}
                    onChange={(event) =>
                      setProfessionalDraft((current) => ({ ...current, professionalRole: event.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Correo *">
                  <input
                    type="email"
                    value={professionalDraft.email}
                    onChange={(event) =>
                      setProfessionalDraft((current) => ({ ...current, email: event.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Teléfono">
                  <input
                    value={professionalDraft.phone}
                    onChange={(event) =>
                      setProfessionalDraft((current) => ({ ...current, phone: event.target.value }))
                    }
                    className={inputClass}
                  />
                </Field>
              </div>
            )}
          </div>
        )}

        {wizardStep === 3 && createdCompany && (
          <div className="mt-6 space-y-5">
            <ContextBanner
              title={createdCompany.name}
              detail={linkedProfessional
                ? `Profesional: ${linkedProfessional.firstNames} ${linkedProfessional.lastNames}`
                : "Sin profesional asignado en este alta"}
            />

            <ToggleSection
              checked={createClientAdmin}
              onChange={setCreateClientAdmin}
              title="Crear administrador cliente"
              description="Quedará enlazado automáticamente a esta empresa."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  value={clientAdminDraft.name}
                  onChange={(event) =>
                    setClientAdminDraft((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Nombre"
                  className={inputClass}
                />
                <input
                  type="email"
                  value={clientAdminDraft.email}
                  onChange={(event) =>
                    setClientAdminDraft((current) => ({ ...current, email: event.target.value }))
                  }
                  placeholder="Correo"
                  className={inputClass}
                />
                <input
                  type="password"
                  value={clientAdminDraft.password}
                  onChange={(event) =>
                    setClientAdminDraft((current) => ({ ...current, password: event.target.value }))
                  }
                  placeholder="Contraseña temporal (mín. 8)"
                  className={`${inputClass} sm:col-span-2`}
                />
              </div>
            </ToggleSection>

            {linkedProfessional && !linkedProfessional.userId && (
              <ToggleSection
                checked={createProfessionalAccess}
                onChange={setCreateProfessionalAccess}
                title="Crear acceso del profesional"
                description="El usuario quedará enlazado al perfil profesional seleccionado."
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    value={professionalAccessDraft.name}
                    onChange={(event) =>
                      setProfessionalAccessDraft((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Nombre"
                    className={inputClass}
                  />
                  <input
                    type="email"
                    value={professionalAccessDraft.email}
                    onChange={(event) =>
                      setProfessionalAccessDraft((current) => ({ ...current, email: event.target.value }))
                    }
                    placeholder="Correo"
                    className={inputClass}
                  />
                  <AppSelect
                    value={wizardProfessionalRole}
                    onChange={(event) =>
                      setWizardProfessionalRole(
                        event.target.value as "PROFESSIONAL" | "COORDINATOR"
                      )
                    }
                  >
                    <option value="PROFESSIONAL">Profesional</option>
                    <option value="COORDINATOR">Coordinador</option>
                  </AppSelect>
                  <input
                    type="password"
                    value={professionalAccessDraft.password}
                    onChange={(event) =>
                      setProfessionalAccessDraft((current) => ({ ...current, password: event.target.value }))
                    }
                    placeholder="Contraseña temporal (mín. 8)"
                    className={inputClass}
                  />
                </div>
              </ToggleSection>
            )}
          </div>
        )}

        {wizardStep === 4 && createdCompany && (
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 text-emerald-700" size={22} />
                <div>
                  <h3 className="font-black text-emerald-950">Cliente configurado</h3>
                  <p className="mt-1 text-sm text-emerald-800">
                    {createdCompany.name} · NIT {createdCompany.taxId}
                  </p>
                </div>
              </div>
            </div>
            <ResultRow label="Empresa" value="Creada" />
            <ResultRow
              label="Profesional"
              value={linkedProfessional
                ? `${linkedProfessional.firstNames} ${linkedProfessional.lastNames}`
                : "Pendiente de configurar"}
            />
            <ResultRow
              label="Administrador cliente"
              value={createClientAdmin
                ? clientAdminCreated
                  ? "Creado"
                  : "Pendiente"
                : "Omitido"}
            />
            <ResultRow
              label="Acceso profesional"
              value={linkedProfessional?.userId
                ? "Ya existía"
                : createProfessionalAccess
                  ? professionalUserCreated
                    ? "Creado"
                    : "Pendiente"
                  : "Omitido"}
            />
          </div>
        )}
      </AppModal>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
        {icon}
      </span>
      <div>
        <p className="text-xl font-black text-slate-950">{value}</p>
        <p className="text-xs font-semibold text-slate-500">{label}</p>
      </div>
    </div>
  );
}

function ModuleCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-36 flex-col items-start rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-cyan-50 group-hover:text-cyan-700">
        {icon}
      </span>
      <h2 className="mt-4 text-base font-black text-slate-950">{title}</h2>
      <p className="mt-1 flex-1 text-xs leading-5 text-slate-500">{description}</p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-cyan-700">
        Abrir módulo <ArrowRight size={13} />
      </span>
    </button>
  );
}

function AdminPanel({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-700 shadow-sm">
          {icon}
        </span>
        <div>
          <h3 className="text-sm font-black text-slate-950">{title}</h3>
          <p className="mt-0.5 text-[11px] leading-4 text-slate-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function RelationList({
  title,
  empty,
  rows,
}: {
  title: string;
  empty: string;
  rows: Array<{ id: string; primary: string; secondary: string }>;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-black text-slate-950">{title}</h3>
      <div className="mt-3 divide-y divide-slate-100">
        {rows.length === 0 ? (
          <p className="py-4 text-xs text-slate-500">{empty}</p>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="py-3">
              <p className="text-sm font-bold text-slate-800">{row.primary}</p>
              <p className="mt-0.5 text-xs text-slate-500">{row.secondary}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

function ActionButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function PrimaryButton({
  children,
  busy,
  onClick,
}: {
  children: ReactNode;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:opacity-50"
    >
      {busy && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

function WizardProgress({ step }: { step: WizardStep }) {
  const labels = ["Empresa", "Equipo", "Accesos", "Resumen"];
  return (
    <div className="grid grid-cols-4 gap-2">
      {labels.map((label, index) => {
        const number = index + 1;
        const active = number <= step;
        return (
          <div key={label}>
            <div className={`h-1.5 rounded-full ${active ? "bg-cyan-600" : "bg-slate-200"}`} />
            <p className={`mt-2 text-[10px] font-bold ${active ? "text-cyan-700" : "text-slate-400"}`}>
              {number}. {label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function Field({
  label,
  children,
  spanTwo = false,
}: {
  label: string;
  children: ReactNode;
  spanTwo?: boolean;
}) {
  return (
    <label className={spanTwo ? "sm:col-span-2" : ""}>
      <span className="mb-1.5 block text-xs font-bold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function ChoiceCard({
  selected,
  title,
  description,
  onClick,
}: {
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-cyan-300 bg-cyan-50 ring-2 ring-cyan-500/10"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <p className="text-sm font-black text-slate-950">{title}</p>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </button>
  );
}

function ToggleSection({
  checked,
  onChange,
  title,
  description,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-black text-slate-950">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(!checked)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? "bg-cyan-600" : "bg-slate-300"}`}
        >
          <span
            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
      {checked && <div className="mt-4">{children}</div>}
    </section>
  );
}

function ContextBanner({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3">
      <p className="text-sm font-black text-slate-950">{title}</p>
      <p className="mt-1 text-xs text-slate-600">{detail}</p>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-3">
      <span className="text-xs font-bold text-slate-500">{label}</span>
      <span className="text-sm font-black text-slate-900">{value}</span>
    </div>
  );
}

function AlertBox({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      {children}
    </div>
  );
}
