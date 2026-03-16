"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { adminAkunApi } from "@/app/lib/api";
import type {
  AdminAccount,
  CreateAdminAccountDto,
  ResetAdminPasswordDto,
  UpdateAdminAccountDto,
} from "@/app/lib/types";

type UiAdminAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  profileImage?: string;
};

type NewAccountForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
};

type ResetPasswordForm = {
  newPassword: string;
  confirmNewPassword: string;
};

const EMPTY_FORM: NewAccountForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
};

const EMPTY_RESET_FORM: ResetPasswordForm = {
  newPassword: "",
  confirmNewPassword: "",
};

function getInitials(firstName: string, lastName: string) {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);
  const pair = `${first}${last}`.trim();
  return pair ? pair.toUpperCase() : "AD";
}

function toUiAdminAccount(account: AdminAccount): UiAdminAccount {
  return {
    id: account.user_id,
    firstName: account.first_name?.trim() || "-",
    lastName: account.last_name?.trim() || "",
    email: account.email,
    phone: account.no_telp?.trim() || "-",
    address: account.address?.trim() || "",
    profileImage: "",
  };
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const apiErr = error as { message?: string | string[] };
  if (Array.isArray(apiErr?.message)) {
    return apiErr.message.join(". ");
  }
  if (typeof apiErr?.message === "string" && apiErr.message.trim()) {
    return apiErr.message;
  }
  return fallback;
}

export default function PengaturanAkunPage() {
  const [accounts, setAccounts] = useState<UiAdminAccount[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [showDetailView, setShowDetailView] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  const [createForm, setCreateForm] = useState<NewAccountForm>(EMPTY_FORM);
  const [editForm, setEditForm] = useState<NewAccountForm>(EMPTY_FORM);
  const [resetForm, setResetForm] = useState<ResetPasswordForm>(EMPTY_RESET_FORM);

  const [error, setError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [submittingDelete, setSubmittingDelete] = useState(false);
  const [submittingReset, setSubmittingReset] = useState(false);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedId) ?? null,
    [accounts, selectedId],
  );

  const resetCreateForm = () => {
    setCreateForm(EMPTY_FORM);
    setError(null);
  };

  const resetEditForm = () => {
    setEditForm(EMPTY_FORM);
    setEditError(null);
  };

  const resetPasswordForm = () => {
    setResetForm(EMPTY_RESET_FORM);
    setResetError(null);
  };

  const loadAdmins = async () => {
    setLoading(true);
    setPageError(null);
    try {
      const data = await adminAkunApi.getAllAdmins();
      const mapped = data.map(toUiAdminAccount);
      setAccounts(mapped);
      setSelectedId((prev) => {
        if (prev && mapped.some((item) => item.id === prev)) {
          return prev;
        }
        return mapped[0]?.id ?? "";
      });
    } catch (err) {
      setPageError(getApiErrorMessage(err, "Gagal memuat daftar akun admin."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAdmins();
  }, []);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!createForm.firstName || !createForm.lastName || !createForm.email || !createForm.phone || !createForm.password) {
      setError("Nama, email, nomor HP, dan password wajib diisi.");
      return;
    }

    if (createForm.password !== createForm.confirmPassword) {
      setError("Password dan konfirmasi password harus sama.");
      return;
    }

    const payload: CreateAdminAccountDto = {
      first_name: createForm.firstName.trim(),
      last_name: createForm.lastName.trim(),
      email: createForm.email.trim().toLowerCase(),
      no_telp: createForm.phone.trim(),
      address: createForm.address.trim() || undefined,
      password: createForm.password,
      confirm_password: createForm.confirmPassword,
    };

    setSubmittingCreate(true);
    try {
      const created = await adminAkunApi.createAdmin(payload);
      const newAccount = toUiAdminAccount(created);
      setAccounts((prev) => [newAccount, ...prev]);
      setSelectedId(newAccount.id);
      setShowCreateModal(false);
      resetCreateForm();
      setSuccessMessage("Akun admin baru berhasil dibuat.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Gagal membuat akun admin."));
    } finally {
      setSubmittingCreate(false);
    }
  };

  const openEditModal = () => {
    if (!selectedAccount) return;

    setEditForm({
      firstName: selectedAccount.firstName === "-" ? "" : selectedAccount.firstName,
      lastName: selectedAccount.lastName,
      email: selectedAccount.email,
      phone: selectedAccount.phone === "-" ? "" : selectedAccount.phone,
      address: selectedAccount.address,
      password: "",
      confirmPassword: "",
    });
    setEditError(null);
    setShowEditModal(true);
  };

  const handleEdit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAccount) return;

    setEditError(null);
    setSuccessMessage(null);

    if (!editForm.firstName || !editForm.lastName || !editForm.email || !editForm.phone) {
      setEditError("Nama, email, dan nomor HP wajib diisi.");
      return;
    }

    const withPassword = editForm.password.trim().length > 0 || editForm.confirmPassword.trim().length > 0;
    if (withPassword && editForm.password !== editForm.confirmPassword) {
      setEditError("Password dan konfirmasi password harus sama.");
      return;
    }

    const payload: UpdateAdminAccountDto = {
      first_name: editForm.firstName.trim(),
      last_name: editForm.lastName.trim(),
      email: editForm.email.trim().toLowerCase(),
      no_telp: editForm.phone.trim(),
      address: editForm.address.trim() || undefined,
      ...(withPassword
        ? {
            password: editForm.password,
            confirm_password: editForm.confirmPassword,
          }
        : {}),
    };

    setSubmittingEdit(true);
    try {
      const updated = await adminAkunApi.updateAdmin(selectedAccount.id, payload);
      const nextAccount = toUiAdminAccount(updated);
      setAccounts((prev) => prev.map((item) => (item.id === selectedAccount.id ? nextAccount : item)));
      setShowEditModal(false);
      resetEditForm();
      setSuccessMessage("Akun admin berhasil diperbarui.");
    } catch (err) {
      setEditError(getApiErrorMessage(err, "Gagal memperbarui akun admin."));
    } finally {
      setSubmittingEdit(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAccount) return;

    setSubmittingDelete(true);
    setSuccessMessage(null);
    try {
      await adminAkunApi.deleteAdmin(selectedAccount.id);
      setAccounts((prev) => {
        const next = prev.filter((account) => account.id !== selectedAccount.id);
        setSelectedId(next[0]?.id ?? "");
        return next;
      });
      setShowDetailView(false);
      setShowDeleteModal(false);
      setSuccessMessage("Akun admin berhasil dihapus.");
    } catch (err) {
      setPageError(getApiErrorMessage(err, "Gagal menghapus akun admin."));
    } finally {
      setSubmittingDelete(false);
    }
  };

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedAccount) return;

    setResetError(null);
    setSuccessMessage(null);

    if (!resetForm.newPassword || !resetForm.confirmNewPassword) {
      setResetError("Password baru dan konfirmasi password wajib diisi.");
      return;
    }

    if (resetForm.newPassword.length < 8) {
      setResetError("Password baru minimal 8 karakter.");
      return;
    }

    if (resetForm.newPassword !== resetForm.confirmNewPassword) {
      setResetError("Password baru dan konfirmasi password harus sama.");
      return;
    }

    const payload: ResetAdminPasswordDto = {
      new_password: resetForm.newPassword,
      confirm_new_password: resetForm.confirmNewPassword,
    };

    setSubmittingReset(true);
    try {
      await adminAkunApi.resetPassword(selectedAccount.id, payload);
      setShowResetModal(false);
      resetPasswordForm();
      setSuccessMessage("Password admin berhasil direset.");
    } catch (err) {
      setResetError(getApiErrorMessage(err, "Gagal mereset password admin."));
    } finally {
      setSubmittingReset(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-225 flex-col gap-4">
        {pageError && (
          <div className="rounded-lg border border-[#f5b3a5] bg-[#fff3f0] px-4 py-3 text-[13px] text-[#9b2f15]">
            {pageError}
          </div>
        )}

        {successMessage && (
          <div className="rounded-lg border border-[#b8dfc4] bg-[#edf9f1] px-4 py-3 text-[13px] text-[#1f6b36]">
            {successMessage}
          </div>
        )}

        {!showDetailView && (
          <section className="rounded-xl border border-[rgba(38,43,67,0.12)] bg-white p-4 shadow-[0_4px_18px_rgba(38,43,67,0.08)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-[30px] font-semibold leading-9.5 text-[#c23513]">Pengaturan Akun</h1>
              <button
                type="button"
                onClick={() => {
                  resetCreateForm();
                  setShowCreateModal(true);
                }}
                className="rounded-md bg-[#c23513] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#a72d10]"
              >
                Add New User
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-[rgba(38,43,67,0.08)]">
              <div className="grid grid-cols-[1fr_auto] bg-[#f3f3f5] px-4 py-3 text-[12px] font-semibold uppercase tracking-wide text-[#6d788d]">
                <p>Username</p>
                <p>Action</p>
              </div>

              {loading && (
                <div className="border-t border-[rgba(38,43,67,0.08)] px-4 py-6 text-center text-[13px] text-[#7a8398]">
                  Memuat daftar akun...
                </div>
              )}

              {!loading && accounts.length === 0 && (
                <div className="border-t border-[rgba(38,43,67,0.08)] px-4 py-6 text-center text-[13px] text-[#7a8398]">
                  Belum ada akun admin.
                </div>
              )}

              {!loading && accounts.map((account) => {
                const isActive = account.id === selectedId;
                return (
                  <div
                    key={account.id}
                    className="grid grid-cols-[1fr_auto] items-center gap-3 border-t border-[rgba(38,43,67,0.08)] px-4 py-3"
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(account.id)}
                      className="min-w-0"
                    >
                      <div className="flex items-center gap-3 text-left">
                        {account.profileImage ? (
                          <Image
                            src={account.profileImage}
                            alt={`Foto profil ${account.firstName} ${account.lastName}`}
                            width={34}
                            height={34}
                            className="size-8.5 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <span className="flex size-8.5 shrink-0 items-center justify-center rounded-full bg-[#f7d8d0] text-[12px] font-semibold text-[#c23513]">
                            {getInitials(account.firstName, account.lastName)}
                          </span>
                        )}
                        <span className="min-w-0">
                          <span className={`block truncate text-[15px] font-semibold ${isActive ? "text-[#262b43]" : "text-[#545d76]"}`}>
                            {account.firstName} {account.lastName}
                          </span>
                          <span className="block truncate text-[13px] text-[#8a90a5]">{account.email}</span>
                        </span>
                      </div>
                    </button>

                    <div className="flex items-center gap-3 text-[#6d788d]">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(account.id);
                          setShowDetailView(true);
                        }}
                        className="rounded p-1 transition hover:bg-[#f2f4f8] hover:text-[#48506a]"
                        aria-label="Lihat detail akun"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 17L17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M8 7H17V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedId(account.id);
                          setShowDeleteModal(true);
                        }}
                        className="rounded p-1 transition hover:bg-[#f8dad1] hover:text-[#c23513]"
                        aria-label="Hapus akun"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 7H20M9 7V5H15V7M8 10V18M12 10V18M16 10V18M6 7L7 20H17L18 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {showDetailView && selectedAccount && (
          <>
            <div className="flex justify-start">
              <button
                type="button"
                onClick={() => setShowDetailView(false)}
                className="rounded-md border border-[rgba(38,43,67,0.16)] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#596077] transition hover:bg-[#f4f5f8]"
              >
                Kembali ke daftar
              </button>
            </div>

            <section className="rounded-xl border border-[rgba(38,43,67,0.12)] bg-white p-4 shadow-[0_4px_18px_rgba(38,43,67,0.08)] sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Image
                    src={selectedAccount.profileImage || "/figma/avatar-profile.jpg"}
                    alt={`Foto profil ${selectedAccount.firstName} ${selectedAccount.lastName}`}
                    width={96}
                    height={96}
                    className="size-24 rounded-xl object-cover"
                  />

                  <div>
                    <h2 className="text-[24px] font-semibold leading-8 text-[#383f55] sm:text-[30px] sm:leading-10">
                      {selectedAccount.firstName} {selectedAccount.lastName}
                    </h2>
                    <p className="mt-1 flex items-center gap-2 text-[14px] font-medium text-[#6b7389] sm:text-[16px]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 21C4 17.6863 7.58172 15 12 15C16.4183 15 20 17.6863 20 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Admin
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="rounded-md bg-[#f5b126] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#dd9e22]"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[#f04f47] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#dc3d35]"
                  >
                    Hapus Akun
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M4 7H20M9 7V5H15V7M8 10V18M12 10V18M16 10V18M6 7L7 20H17L18 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[rgba(38,43,67,0.12)] bg-white p-4 shadow-[0_4px_18px_rgba(38,43,67,0.08)] sm:p-5">
              <p className="text-[13px] uppercase tracking-wide text-[#a3a9b8]">About</p>

              <div className="mt-4 grid gap-3 text-[14px] text-[#626b81] sm:text-[16px]">
                <p className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 21C4 17.6863 7.58172 15 12 15C16.4183 15 20 17.6863 20 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Nama Depan: {selectedAccount.firstName}
                </p>
                <p className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 21C4 17.6863 7.58172 15 12 15C16.4183 15 20 17.6863 20 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Nama Belakang: {selectedAccount.lastName || "-"}
                </p>
                <p className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6.75C3 5.7835 3.7835 5 4.75 5H19.25C20.2165 5 21 5.7835 21 6.75V17.25C21 18.2165 20.2165 19 19.25 19H4.75C3.7835 19 3 18.2165 3 17.25V6.75Z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M4 7L12 13L20 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Email: {selectedAccount.email}
                </p>
                <p className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92V19.92C22 20.4723 21.5523 20.92 21 20.92C11.6112 20.92 4 13.3088 4 3.92C4 3.36772 4.44772 2.92 5 2.92H8C8.55228 2.92 9 3.36772 9 3.92V6.92C9 7.47228 8.55228 7.92 8 7.92H6.92C7.49483 10.2712 9.32877 12.1052 11.68 12.68V11.6C11.68 11.0477 12.1277 10.6 12.68 10.6H15.68C16.2323 10.6 16.68 11.0477 16.68 11.6V14.6C16.68 15.1523 16.2323 15.6 15.68 15.6H14.6C15.1748 17.9512 17.0088 19.7852 19.36 20.36V19.28C19.36 18.7277 19.8077 18.28 20.36 18.28H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Nomor Hp: {selectedAccount.phone}
                </p>
                <p className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20V6H4V4ZM4 7H13V20L9 16L5 20V7H4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Alamat: {selectedAccount.address || "-"}
                </p>
              </div>

              <div className="mt-6">
                <p className="text-[15px] text-[#a3a9b8]">Password</p>
                <button
                  type="button"
                  onClick={() => {
                    resetPasswordForm();
                    setShowResetModal(true);
                  }}
                  className="mt-2 inline-flex items-center gap-1 rounded-md bg-[#fde2df] px-4 py-2 text-[14px] font-semibold text-[#f04f47] transition hover:bg-[#fbd3cf]"
                >
                  Reset Password
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M7 17L17 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 7H17V16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </section>
          </>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(17,24,39,0.45)] px-4">
          <div className="w-full max-w-107.5 rounded-xl bg-white p-5 shadow-2xl">
            <h2 className="text-[24px] font-semibold text-[#262b43]">Registrasi Akun Admin</h2>
            <p className="mt-1 text-[13px] text-[#6d788d]">Buat akun untuk admin pengajuan</p>

            <form className="mt-4 space-y-3" onSubmit={handleCreate}>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={createForm.firstName}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  placeholder="Nama depan"
                  className="rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
                />
                <input
                  type="text"
                  value={createForm.lastName}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  placeholder="Nama belakang"
                  className="rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  value={createForm.email}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Email"
                  className="rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
                />
                <input
                  type="text"
                  value={createForm.phone}
                  onChange={(event) => setCreateForm((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="Nomor Hp"
                  className="rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
                />
              </div>

              <input
                type="text"
                value={createForm.address}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, address: event.target.value }))}
                placeholder="Alamat"
                className="w-full rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
              />

              <input
                type="password"
                value={createForm.password}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Password"
                className="w-full rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
              />

              <input
                type="password"
                value={createForm.confirmPassword}
                onChange={(event) => setCreateForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                placeholder="Konfirmasi password"
                className="w-full rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
              />

              {error && <p className="text-[12px] text-[#c23513]">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                  }}
                  className="rounded-md border border-[#f39d8d] px-4 py-2 text-[12px] font-semibold text-[#c23513]"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={submittingCreate}
                  className="rounded-md bg-[#c23513] px-4 py-2 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingCreate ? "Menyimpan..." : "Daftarkan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedAccount && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(17,24,39,0.45)] px-4">
          <div className="w-full max-w-107.5 rounded-xl bg-white p-5 shadow-2xl">
            <h2 className="text-[24px] font-semibold text-[#262b43]">Edit Akun Admin</h2>
            <p className="mt-1 text-[13px] text-[#6d788d]">Perbarui data admin yang dipilih</p>

            <form className="mt-4 space-y-3" onSubmit={handleEdit}>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  placeholder="Nama depan"
                  className="rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
                />
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  placeholder="Nama belakang"
                  className="rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Email"
                  className="rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
                />
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="Nomor Hp"
                  className="rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
                />
              </div>

              <input
                type="text"
                value={editForm.address}
                onChange={(event) => setEditForm((prev) => ({ ...prev, address: event.target.value }))}
                placeholder="Alamat"
                className="w-full rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
              />

              <input
                type="password"
                value={editForm.password}
                onChange={(event) => setEditForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Password baru (opsional)"
                className="w-full rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
              />

              <input
                type="password"
                value={editForm.confirmPassword}
                onChange={(event) => setEditForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                placeholder="Konfirmasi password baru"
                className="w-full rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
              />

              {editError && <p className="text-[12px] text-[#c23513]">{editError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    resetEditForm();
                  }}
                  className="rounded-md border border-[#f39d8d] px-4 py-2 text-[12px] font-semibold text-[#c23513]"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="rounded-md bg-[#f5b126] px-4 py-2 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingEdit ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && selectedAccount && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(17,24,39,0.45)] px-4">
          <div className="w-full max-w-105 rounded-xl bg-white p-5 shadow-2xl">
            <h2 className="text-[24px] font-semibold text-[#262b43]">Hapus Akun?</h2>
            <p className="mt-1 text-[13px] text-[#6d788d]">
              Akun {selectedAccount.firstName} {selectedAccount.lastName} akan dihapus secara permanen.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="rounded-md border border-[#f39d8d] px-4 py-2 text-[12px] font-semibold text-[#c23513]"
              >
                Kembali
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submittingDelete}
                className="rounded-md bg-[#ef4444] px-4 py-2 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submittingDelete ? "Menghapus..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResetModal && selectedAccount && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(17,24,39,0.45)] px-4">
          <div className="w-full max-w-105 rounded-xl bg-white p-5 shadow-2xl">
            <h2 className="text-[24px] font-semibold text-[#262b43]">Reset Password Admin</h2>
            <p className="mt-1 text-[13px] text-[#6d788d]">
              Masukkan password baru untuk {selectedAccount.firstName} {selectedAccount.lastName}.
            </p>

            <form className="mt-4 space-y-3" onSubmit={handleResetPassword}>
              <input
                type="password"
                value={resetForm.newPassword}
                onChange={(event) => setResetForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                placeholder="Password baru"
                className="w-full rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
              />

              <input
                type="password"
                value={resetForm.confirmNewPassword}
                onChange={(event) => setResetForm((prev) => ({ ...prev, confirmNewPassword: event.target.value }))}
                placeholder="Konfirmasi password baru"
                className="w-full rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
              />

              {resetError && <p className="text-[12px] text-[#c23513]">{resetError}</p>}

              <div className="mt-5 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    resetPasswordForm();
                  }}
                  className="rounded-md border border-[#f39d8d] px-4 py-2 text-[12px] font-semibold text-[#c23513]"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={submittingReset}
                  className="rounded-md bg-[#ef4444] px-4 py-2 text-[12px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingReset ? "Memproses..." : "Reset Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
