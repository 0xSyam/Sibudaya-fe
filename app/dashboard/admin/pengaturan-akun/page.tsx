"use client";

import Image from "next/image";
import { FormEvent, useMemo, useState } from "react";

type AdminAccount = {
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

const INITIAL_ACCOUNTS: AdminAccount[] = [
  {
    id: "adm-1",
    firstName: "Zulhusni",
    lastName: "Ardiansyah",
    email: "zuldiansyah@gmail.com",
    phone: "085677388293",
    address: "Jl. Lowenu psun. RT/RW. 04/004, Kec. Triwe, Kel. Barri, Kota Yogyakarta",
    profileImage: "",
  },
  {
    id: "adm-2",
    firstName: "Hisyam",
    lastName: "Bahri Ramadhan",
    email: "bahribahri@gmail.com",
    phone: "081231238888",
    address: "Jl. Gading No. 12, Yogyakarta",
    profileImage: "/figma/avatar-profile.jpg",
  },
  {
    id: "adm-3",
    firstName: "Fawdan",
    lastName: "Sahraman Anfari",
    email: "sahraman.anfari@gmail.com",
    phone: "081999221122",
    address: "Jl. Kusumanegara No. 30, Yogyakarta",
    profileImage: "/figma/avatar-profile.jpg",
  },
];

const EMPTY_FORM: NewAccountForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  password: "",
  confirmPassword: "",
};

function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function PengaturanAkunPage() {
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [selectedId, setSelectedId] = useState(INITIAL_ACCOUNTS[0]?.id ?? "");
  const [showDetailView, setShowDetailView] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [form, setForm] = useState<NewAccountForm>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedId) ?? null,
    [accounts, selectedId],
  );

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setError(null);
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!form.firstName || !form.lastName || !form.email || !form.phone || !form.password) {
      setError("Nama, email, nomor HP, dan password wajib diisi.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password dan konfirmasi password harus sama.");
      return;
    }

    const newAccount: AdminAccount = {
      id: `adm-${Date.now()}`,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    };

    setAccounts((prev) => [newAccount, ...prev]);
    setSelectedId(newAccount.id);
    setShowCreateModal(false);
    resetForm();
  };

  const handleDelete = () => {
    if (!selectedAccount) return;

    setAccounts((prev) => {
      const next = prev.filter((account) => account.id !== selectedAccount.id);
      setSelectedId(next[0]?.id ?? "");
      return next;
    });
    setShowDetailView(false);
    setShowDeleteModal(false);
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-225 flex-col gap-4">
        {!showDetailView && (
          <section className="rounded-xl border border-[rgba(38,43,67,0.12)] bg-white p-4 shadow-[0_4px_18px_rgba(38,43,67,0.08)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h1 className="text-[30px] font-semibold leading-9.5 text-[#c23513]">Pengaturan Akun</h1>
              <button
                type="button"
                onClick={() => {
                  resetForm();
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

              {accounts.map((account) => {
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
                    <h2 className="text-[40px] font-semibold leading-12 text-[#383f55]">
                      {selectedAccount.firstName} {selectedAccount.lastName}
                    </h2>
                    <p className="mt-1 flex items-center gap-2 text-[25px] text-[#6b7389]">
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

              <div className="mt-4 grid gap-4 text-[20px] text-[#626b81]">
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
                  Nama Belakang: {selectedAccount.lastName}
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
                  value={form.firstName}
                  onChange={(event) => setForm((prev) => ({ ...prev, firstName: event.target.value }))}
                  placeholder="Nama depan"
                  className="rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
                />
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(event) => setForm((prev) => ({ ...prev, lastName: event.target.value }))}
                  placeholder="Nama belakang"
                  className="rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
                  placeholder="Email"
                  className="rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
                />
                <input
                  type="text"
                  value={form.phone}
                  onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
                  placeholder="Nomor Hp"
                  className="rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
                />
              </div>

              <input
                type="text"
                value={form.address}
                onChange={(event) => setForm((prev) => ({ ...prev, address: event.target.value }))}
                placeholder="Alamat"
                className="w-full rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
              />

              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                placeholder="Password"
                className="w-full rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
              />

              <input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => setForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                placeholder="Konfirmasi password"
                className="w-full rounded-md border border-[rgba(38,43,67,0.14)] px-3 py-2 text-[13px] outline-none focus:border-[#c23513]"
              />

              {error && <p className="text-[12px] text-[#c23513]">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="rounded-md border border-[#f39d8d] px-4 py-2 text-[12px] font-semibold text-[#c23513]"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-[#c23513] px-4 py-2 text-[12px] font-semibold text-white"
                >
                  Daftarkan
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
                className="rounded-md bg-[#ef4444] px-4 py-2 text-[12px] font-semibold text-white"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
