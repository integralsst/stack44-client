import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Building,
  Edit2,
  Loader2,
  Mail,
  Search,
  Shield,
  Trash2,
  UserPlus,
} from "lucide-react";

import {
  useAuth,
  type UserRole,
} from "../../auth/context/AuthContext";

import { apiRequest } from "../../../lib/api";
import type {
  Company,
  ManagedUser,
  Professional,
} from "../../../types/domain";
import AppModal from "../../../components/ui/AppModal";
import AppSelect from "../../../components/ui/AppSelect";

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyId: string;
  professionalId: string;
  isActive: boolean;
}

const emptyForm: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "USER",
  companyId: "",
  professionalId: "",
  isActive: true,
};

const clientRoles = new Set([
  "CLIENT_USER",
  "CLIENT_ADMIN",
]);

const internalRoles = new Set([
  "ADMIN",
  "OWNER",
  "SUPERADMIN",
]);

const inputClass =
  "w-full rounded-xl border border-neutral-800 bg-[#090909] px-3 py-2.5 text-sm text-white outline-none transition-all placeholder:text-neutral-600 hover:border-neutral-700 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10";

export default function Users() {
  const { token, user: currentUser } = useAuth();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [professionals, setProfessionals] = useState<
    Professional[]
  >([]);

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
  const [editingUser, setEditingUser] =
    useState<ManagedUser | null>(null);
  const [form, setForm] =
    useState<UserForm>(emptyForm);

  const isInternal = Boolean(
    currentUser &&
      internalRoles.has(currentUser.role)
  );

  const availableRoles = useMemo<UserRole[]>(() => {
    switch (currentUser?.role) {
      case "SUPERADMIN":
        return [
          "USER",
          "CLIENT_USER",
          "CLIENT_ADMIN",
          "PROFESSIONAL",
          "ADMIN",
          "OWNER",
          "SUPERADMIN",
        ];
      case "OWNER":
        return [
          "USER",
          "CLIENT_USER",
          "CLIENT_ADMIN",
          "PROFESSIONAL",
          "ADMIN",
        ];
      case "ADMIN":
        return [
          "USER",
          "CLIENT_USER",
          "CLIENT_ADMIN",
          "PROFESSIONAL",
        ];
      case "CLIENT_ADMIN":
        return ["CLIENT_USER"];
      default:
        return [];
    }
  }, [currentUser?.role]);

  const loadData = async () => {
    if (!token || !currentUser) return;

    setLoading(true);
    setPageError(null);

    try {
      const userRequest = apiRequest<ManagedUser[]>(
        "/api/users",
        {},
        token
      );

      const companyRequest = apiRequest<Company[]>(
        "/api/companies",
        {},
        token
      );

      const professionalRequest = isInternal
        ? apiRequest<Professional[]>(
            "/api/professionals",
            {},
            token
          )
        : Promise.resolve([]);

      const [userData, companyData, professionalData] =
        await Promise.all([
          userRequest,
          companyRequest,
          professionalRequest,
        ]);

      setUsers(userData);
      setCompanies(companyData);
      setProfessionals(professionalData);
    } catch (error) {
      setPageError(
        error instanceof Error
          ? error.message
          : "No fue posible cargar los usuarios."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [token, currentUser?.role]);

  const filteredUsers = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    if (!search) return users;

    return users.filter((user) =>
      [
        user.name,
        user.email,
        user.company?.name ?? "",
        user.professional
          ? `${user.professional.firstNames} ${user.professional.lastNames}`
          : "",
        user.role,
      ].some((value) =>
        value.toLowerCase().includes(search)
      )
    );
  }, [users, searchTerm]);

  const openCreate = () => {
    const initialRole =
      currentUser?.role === "CLIENT_ADMIN"
        ? "CLIENT_USER"
        : availableRoles[0] ?? "USER";

    setEditingUser(null);
    setForm({
      ...emptyForm,
      role: initialRole,
      companyId:
        currentUser?.role === "CLIENT_ADMIN"
          ? currentUser.companyId ?? ""
          : "",
    });
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (user: ManagedUser) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      companyId: user.companyId ?? "",
      professionalId: user.professional?.id ?? "",
      isActive: user.isActive,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleRoleChange = (role: UserRole) => {
    setForm((current) => ({
      ...current,
      role,
      companyId: clientRoles.has(role)
        ? current.companyId
        : "",
      professionalId:
        role === "PROFESSIONAL"
          ? current.professionalId
          : "",
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!token || !currentUser) return;

    setSubmitting(true);
    setFormError(null);

    try {
      const isSelf =
        editingUser?.id === currentUser.id;

      const payload: Record<string, unknown> = {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
      };

      if (form.password.trim()) {
        payload.password = form.password;
      }

      if (!editingUser || !isSelf) {
        payload.role = form.role;
        payload.companyId = clientRoles.has(form.role)
          ? form.companyId || null
          : null;
        payload.professionalId =
          form.role === "PROFESSIONAL"
            ? form.professionalId || null
            : null;
        payload.isActive = form.isActive;
      }

      if (!editingUser && !form.password.trim()) {
        throw new Error(
          "La contraseña temporal es obligatoria."
        );
      }

      if (
        clientRoles.has(form.role) &&
        !form.companyId
      ) {
        throw new Error(
          "Selecciona la empresa del usuario cliente."
        );
      }

      if (
        form.role === "PROFESSIONAL" &&
        !form.professionalId
      ) {
        throw new Error(
          "Selecciona el perfil profesional."
        );
      }

      if (editingUser) {
        await apiRequest<ManagedUser>(
          `/api/users/${editingUser.id}`,
          {
            method: "PUT",
            body: JSON.stringify(payload),
          },
          token
        );
      } else {
        await apiRequest<ManagedUser>(
          "/api/users",
          {
            method: "POST",
            body: JSON.stringify(payload),
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
          : "No fue posible guardar el usuario."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (
    user: ManagedUser
  ) => {
    if (!token) return;

    const confirmed = window.confirm(
      `¿Eliminar definitivamente al usuario "${user.name}"?`
    );

    if (!confirmed) return;

    try {
      await apiRequest(
        `/api/users/${user.id}`,
        { method: "DELETE" },
        token
      );

      await loadData();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar el usuario."
      );
    }
  };

  return (
    <div className="mx-auto flex min-h-full min-w-0 max-w-7xl flex-col">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Gestión de usuarios
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-neutral-400">
            Administra credenciales, roles, empresas y perfiles profesionales.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black shadow-lg shadow-white/5 transition-all hover:bg-neutral-200 active:scale-[0.98] sm:w-auto sm:py-2.5"
        >
          <UserPlus size={18} />
          Nuevo usuario
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
            placeholder="Buscar por nombre, correo, empresa, profesional o rol..."
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
          <table className="w-full min-w-[840px] whitespace-nowrap text-left text-sm">
            <thead className="border-b border-neutral-800 bg-[#0a0a0a]">
              <tr>
                <HeaderCell>Usuario</HeaderCell>
                <HeaderCell>Contexto</HeaderCell>
                <HeaderCell>Rol</HeaderCell>
                <HeaderCell>Estado</HeaderCell>
                <HeaderCell alignRight>Acciones</HeaderCell>
              </tr>
            </thead>

            <tbody className="divide-y divide-neutral-800/70">
              {loading ? (
                <LoadingRow colSpan={5} />
              ) : filteredUsers.length === 0 ? (
                <EmptyRow
                  colSpan={5}
                  message="No se encontraron usuarios."
                />
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="group transition-colors hover:bg-neutral-800/20"
                  >
                    <td className="px-6 py-4">
                      <UserIdentity user={user} />
                    </td>

                    <td className="px-6 py-4">
                      <UserContext user={user} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Shield
                          size={14}
                          className="text-neutral-500"
                        />
                        <RoleBadge role={user.role} />
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge active={user.isActive} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <UserActions
                        canDelete={
                          currentUser?.id !== user.id
                        }
                        onEdit={() => openEdit(user)}
                        onDelete={() =>
                          void handleDelete(user)
                        }
                      />
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
          ) : filteredUsers.length === 0 ? (
            <div className="px-4 py-14 text-center text-sm text-neutral-500">
              No se encontraron usuarios.
            </div>
          ) : (
            filteredUsers.map((user) => (
              <article
                key={user.id}
                className="space-y-4 p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <UserIdentity user={user} />

                  <UserActions
                    compact
                    canDelete={
                      currentUser?.id !== user.id
                    }
                    onEdit={() => openEdit(user)}
                    onDelete={() =>
                      void handleDelete(user)
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <MobileInfo label="Contexto">
                    <UserContext user={user} />
                  </MobileInfo>

                  <MobileInfo label="Rol">
                    <RoleBadge role={user.role} />
                  </MobileInfo>

                  <MobileInfo label="Estado">
                    <StatusBadge
                      active={user.isActive}
                    />
                  </MobileInfo>
                </div>
              </article>
            ))
          )}
        </div>

        <div className="border-t border-neutral-800/70 px-4 py-4 text-xs text-neutral-500 sm:px-6">
          Mostrando {filteredUsers.length} usuarios
        </div>
      </section>

      <AppModal
        open={modalOpen}
        title={
          editingUser
            ? "Editar usuario"
            : "Nuevo usuario"
        }
        description="El formulario se adapta al rol seleccionado."
        onClose={closeModal}
        busy={submitting}
        size="md"
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
              form="user-form"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:py-2.5"
            >
              {submitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {editingUser
                ? "Guardar cambios"
                : "Crear usuario"}
            </button>
          </div>
        }
      >
        <form
          id="user-form"
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {formError && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {formError}
            </div>
          )}

          <Field label="Nombre completo">
            <input
              required
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className={inputClass}
            />
          </Field>

          <Field label="Correo electrónico">
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

          <Field
            label={
              editingUser
                ? "Nueva contraseña (opcional)"
                : "Contraseña temporal"
            }
          >
            <input
              required={!editingUser}
              type="password"
              minLength={8}
              value={form.password}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  password: event.target.value,
                }))
              }
              className={inputClass}
            />
          </Field>

          {editingUser?.id !== currentUser?.id && (
            <>
              <Field label="Rol">
                <AppSelect
                  value={form.role}
                  onChange={(event) =>
                    handleRoleChange(
                      event.target.value as UserRole
                    )
                  }
                >
                  {availableRoles.map((role) => (
                    <option
                      key={role}
                      value={role}
                    >
                      {roleLabel(role)}
                    </option>
                  ))}
                </AppSelect>
              </Field>

              {clientRoles.has(form.role) && (
                <Field label="Empresa cliente">
                  <AppSelect
                    required
                    value={form.companyId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        companyId:
                          event.target.value,
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
                        {company.name} —{" "}
                        {company.taxId}
                      </option>
                    ))}
                  </AppSelect>
                </Field>
              )}

              {form.role === "PROFESSIONAL" && (
                <Field label="Perfil profesional">
                  <AppSelect
                    required
                    value={form.professionalId}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        professionalId:
                          event.target.value,
                      }))
                    }
                  >
                    <option value="">
                      Selecciona un profesional
                    </option>
                    {professionals
                      .filter(
                        (professional) =>
                          !professional.userId ||
                          professional.id ===
                            editingUser?.professional
                              ?.id
                      )
                      .map((professional) => (
                        <option
                          key={professional.id}
                          value={professional.id}
                        >
                          {professional.firstNames}{" "}
                          {professional.lastNames} —{" "}
                          {
                            professional.identificationNumber
                          }
                        </option>
                      ))}
                  </AppSelect>
                </Field>
              )}

              <ToggleRow
                checked={form.isActive}
                onChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    isActive: checked,
                  }))
                }
                label="Usuario activo"
              />
            </>
          )}

          {editingUser?.id === currentUser?.id && (
            <p className="rounded-xl border border-cyan-500/15 bg-cyan-500/5 px-4 py-3 text-xs leading-5 text-cyan-300">
              Al editar tu propia cuenta solo puedes cambiar nombre, correo y contraseña.
            </p>
          )}
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

function UserIdentity({
  user,
}: {
  user: ManagedUser;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 font-bold uppercase text-white">
        {user.name.charAt(0)}
      </div>

      <div className="min-w-0">
        <p className="truncate font-medium text-white">
          {user.name}
        </p>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-neutral-500">
          <Mail size={12} className="shrink-0" />
          <span className="truncate">
            {user.email}
          </span>
        </p>
      </div>
    </div>
  );
}

function UserContext({
  user,
}: {
  user: ManagedUser;
}) {
  if (user.company) {
    return (
      <div className="flex min-w-0 items-center gap-2 text-sm text-neutral-300">
        <Building
          size={14}
          className="shrink-0 text-neutral-500"
        />
        <span className="truncate">
          {user.company.name}
        </span>
      </div>
    );
  }

  if (user.professional) {
    return (
      <div className="min-w-0">
        <p className="truncate text-sm text-neutral-300">
          {user.professional.firstNames}{" "}
          {user.professional.lastNames}
        </p>
        <p className="truncate text-xs text-neutral-500">
          {user.professional.professionalRole ??
            user.professional.profession ??
            "Profesional"}
        </p>
      </div>
    );
  }

  return (
    <span className="text-sm text-neutral-500">
      Administración global
    </span>
  );
}

function UserActions({
  onEdit,
  onDelete,
  canDelete,
  compact = false,
}: {
  onEdit: () => void;
  onDelete: () => void;
  canDelete: boolean;
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
        onClick={onEdit}
        className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-neutral-800 hover:text-white"
        title="Editar usuario"
      >
        <Edit2 size={18} />
      </button>

      {canDelete && (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg p-2 text-neutral-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
          title="Eliminar usuario"
        >
          <Trash2 size={18} />
        </button>
      )}
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

function roleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    USER: "Usuario básico",
    CLIENT_USER: "Usuario cliente",
    CLIENT_ADMIN: "Administrador cliente",
    PROFESSIONAL: "Profesional",
    COORDINATOR: "Coordinador",
    ADMIN: "Administrador interno",
    OWNER: "Propietario",
    SUPERADMIN: "Superadministrador",
  };

  return labels[role];
}

function RoleBadge({
  role,
}: {
  role: UserRole;
}) {
  const style: Record<UserRole, string> = {
    USER:
      "border-neutral-700 bg-neutral-800 text-neutral-300",
    CLIENT_USER:
      "border-sky-500/20 bg-sky-500/10 text-sky-400",
    CLIENT_ADMIN:
      "border-blue-500/20 bg-blue-500/10 text-blue-400",
    PROFESSIONAL:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    COORDINATOR:
      "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
    ADMIN:
      "border-indigo-500/20 bg-indigo-500/10 text-indigo-400",
    OWNER:
      "border-purple-500/20 bg-purple-500/10 text-purple-400",
    SUPERADMIN:
      "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-400",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${style[role]}`}
    >
      {role}
    </span>
  );
}

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold ${
        active
          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
          : "border-red-500/20 bg-red-500/10 text-red-400"
      }`}
    >
      {active ? "ACTIVO" : "INACTIVO"}
    </span>
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