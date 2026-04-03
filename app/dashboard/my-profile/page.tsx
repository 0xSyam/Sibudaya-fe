"use client";

import Image from "next/image";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { authApi } from "@/app/lib/api";
import { useAuth } from "@/app/lib/auth-context";
import type { SafeUser, UpdateMyProfileDto } from "@/app/lib/types";

type ProfileForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
};

const EMPTY_FORM: ProfileForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
};

function getApiErrorMessage(error: unknown, fallback: string) {
  const apiErr = error as { message?: string | string[] };
  if (Array.isArray(apiErr?.message)) return apiErr.message.join(". ");
  if (typeof apiErr?.message === "string" && apiErr.message.trim()) return apiErr.message;
  return fallback;
}

function toProfileForm(user: SafeUser): ProfileForm {
  return {
    firstName: user.first_name ?? "",
    lastName: user.last_name ?? "",
    email: user.email ?? "",
    phone: user.no_telp ?? "",
    address: user.address ?? "",
  };
}

export default function MyProfilePage() {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState<SafeUser | null>(null);
  const [editForm, setEditForm] = useState<ProfileForm>(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await authApi.getMe();
      setProfile(me);
      setEditForm(toProfileForm(me));
    } catch (err) {
      setError(getApiErrorMessage(err, "Gagal memuat data profil."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const displayName = useMemo(() => {
    if (!profile) return user?.email ?? "User";
    const full = `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim();
    return full || profile.email || "User";
  }, [profile, user?.email]);

  const roleLabel =
    profile?.role === "SUPER_ADMIN"
      ? "Super Admin"
      : profile?.role === "ADMIN"
        ? "Admin"
        : "User";

  const handleOpenEdit = () => {
    if (!profile) return;
    setEditForm(toProfileForm(profile));
    setEditError(null);
    setShowEditModal(true);
  };

  const handleEditSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!profile) return;

    setEditError(null);
    setSuccess(null);

    if (!editForm.email.trim()) {
      setEditError("Email wajib diisi.");
      return;
    }

    const payload: UpdateMyProfileDto = {
      first_name: editForm.firstName.trim(),
      last_name: editForm.lastName.trim(),
      email: editForm.email.trim().toLowerCase(),
      no_telp: editForm.phone.trim(),
      address: editForm.address.trim(),
    };

    setSubmittingEdit(true);
    try {
      const updated = await authApi.updateMe(payload);
      setProfile(updated);
      await refreshUser();
      setShowEditModal(false);
      setSuccess("Profil berhasil diperbarui.");
    } catch (err) {
      setEditError(getApiErrorMessage(err, "Gagal memperbarui profil."));
    } finally {
      setSubmittingEdit(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-225 flex-col gap-4">


        {error && (
          <div className="rounded-lg border border-[#f5b3a5] bg-[#fff3f0] px-4 py-3 text-[13px] text-[#9b2f15]">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-lg border border-[#b8dfc4] bg-[#edf9f1] px-4 py-3 text-[13px] text-[#1f6b36]">
            {success}
          </div>
        )}

        {loading ? (
          <section className="rounded-xl border border-[rgba(38,43,67,0.12)] bg-white p-6 text-[14px] text-[#7a8398] shadow-[0_4px_18px_rgba(38,43,67,0.08)]">
            Memuat data profil...
          </section>
        ) : profile ? (
          <>
            <section className="rounded-xl border border-[rgba(38,43,67,0.12)] bg-white p-4 shadow-[0_4px_18px_rgba(38,43,67,0.08)] sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <Image
                    src="/figma/avatar-profile.jpg"
                    alt={`Foto profil ${displayName}`}
                    width={96}
                    height={96}
                    className="size-24 rounded-xl object-cover"
                  />

                  <div>
                    <h2 className="text-[22px] font-semibold leading-7 text-[#383f55] sm:text-[28px] sm:leading-9">
                      {displayName}
                    </h2>
                    <p className="mt-1 flex items-center gap-2 text-[14px] font-medium text-[#6b7389] sm:text-[16px]">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4 21C4 17.6863 7.58172 15 12 15C16.4183 15 20 17.6863 20 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {roleLabel}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenEdit}
                    className="rounded-md bg-[#f5b126] px-4 py-2 text-[13px] font-semibold text-white transition hover:bg-[#dd9e22]"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[rgba(38,43,67,0.12)] bg-white p-4 shadow-[0_4px_18px_rgba(38,43,67,0.08)] sm:p-5">
              <p className="text-[13px] uppercase tracking-wide text-[#a3a9b8]">About</p>

              <div className="mt-4 grid gap-3 text-[15px] text-[#626b81] sm:text-[16px]">
                <p className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 21C4 17.6863 7.58172 15 12 15C16.4183 15 20 17.6863 20 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Nama Depan: {profile.first_name || "-"}
                </p>
                <p className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4 21C4 17.6863 7.58172 15 12 15C16.4183 15 20 17.6863 20 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Nama Belakang: {profile.last_name || "-"}
                </p>
                <p className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6.75C3 5.7835 3.7835 5 4.75 5H19.25C20.2165 5 21 5.7835 21 6.75V17.25C21 18.2165 20.2165 19 19.25 19H4.75C3.7835 19 3 18.2165 3 17.25V6.75Z" stroke="currentColor" strokeWidth="1.8" />
                    <path d="M4 7L12 13L20 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Email: {profile.email}
                </p>
                <p className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 16.92V19.92C22 20.4723 21.5523 20.92 21 20.92C11.6112 20.92 4 13.3088 4 3.92C4 3.36772 4.44772 2.92 5 2.92H8C8.55228 2.92 9 3.36772 9 3.92V6.92C9 7.47228 8.55228 7.92 8 7.92H6.92C7.49483 10.2712 9.32877 12.1052 11.68 12.68V11.6C11.68 11.0477 12.1277 10.6 12.68 10.6H15.68C16.2323 10.6 16.68 11.0477 16.68 11.6V14.6C16.68 15.1523 16.2323 15.6 15.68 15.6H14.6C15.1748 17.9512 17.0088 19.7852 19.36 20.36V19.28C19.36 18.7277 19.8077 18.28 20.36 18.28H21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Nomor Hp: {profile.no_telp || "-"}
                </p>
                <p className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M4 4H20V6H4V4ZM4 7H13V20L9 16L5 20V7H4Z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Alamat: {profile.address || "-"}
                </p>
              </div>
            </section>
          </>
        ) : null}
      </div>

      {showEditModal && profile && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(17,24,39,0.45)] px-4">
          <div className="w-full max-w-107.5 rounded-xl bg-white p-5 shadow-2xl">
            <h2 className="text-[22px] font-semibold text-[#262b43] sm:text-[24px]">Edit Profil</h2>
            <p className="mt-1 text-[14px] text-[#6d788d]">Perbarui data profil akun Anda</p>

            <form className="mt-4 space-y-3" onSubmit={handleEditSubmit}>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  placeholder="Nama depan"
                  className="rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[14px] outline-none focus:border-[#c23513]"
                />
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  placeholder="Nama belakang"
                  className="rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[14px] outline-none focus:border-[#c23513]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Email"
                  className="rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[14px] outline-none focus:border-[#c23513]"
                  required
                />
                <input
                  type="text"
                  value={editForm.phone}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="Nomor Hp"
                  className="rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[14px] outline-none focus:border-[#c23513]"
                />
              </div>

              <input
                type="text"
                value={editForm.address}
                onChange={(event) => setEditForm((prev) => ({ ...prev, address: event.target.value }))}
                placeholder="Alamat"
                className="w-full rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[14px] outline-none focus:border-[#c23513]"
              />

              {editError && <p className="text-[12px] text-[#c23513]">{editError}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditError(null);
                    setEditForm(toProfileForm(profile));
                  }}
                  className="rounded-md border border-[#f39d8d] px-4 py-2 text-[13px] font-semibold text-[#c23513]"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="rounded-md bg-[#f5b126] px-4 py-2 text-[13px] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submittingEdit ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
