"use client";

import { FormEvent, useMemo, useState } from "react";

type AdminAccount = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
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
  },
  {
    id: "adm-2",
    firstName: "Hisyam",
    lastName: "Bahri Ramadhan",
    email: "bahribahri@gmail.com",
    phone: "081231238888",
    address: "Jl. Gading No. 12, Yogyakarta",
  },
  {
    id: "adm-3",
    firstName: "Fawdan",
    lastName: "Sahraman Anfari",
    email: "sahraman.anfari@gmail.com",
    phone: "081999221122",
    address: "Jl. Kusumanegara No. 30, Yogyakarta",
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

export default function PengaturanAkunPage() {
  const [accounts, setAccounts] = useState(INITIAL_ACCOUNTS);
  const [selectedId, setSelectedId] = useState(INITIAL_ACCOUNTS[0]?.id ?? "");
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
    setShowDeleteModal(false);
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto flex w-full max-w-225 flex-col gap-4">
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
                    className="min-w-0 text-left"
                  >
                    <p className={`truncate text-[15px] font-semibold ${isActive ? "text-[#262b43]" : "text-[#545d76]"}`}>
                      {account.firstName} {account.lastName}
                    </p>
                    <p className="truncate text-[13px] text-[#8a90a5]">{account.email}</p>
                  </button>

                  <div className="flex items-center gap-3 text-[#6d788d]">
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

        {selectedAccount && (
          <section className="rounded-xl border border-[rgba(38,43,67,0.12)] bg-white p-4 shadow-[0_4px_18px_rgba(38,43,67,0.08)] sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[rgba(38,43,67,0.08)] pb-4">
              <div>
                <h2 className="text-[24px] font-semibold text-[#262b43]">
                  {selectedAccount.firstName} {selectedAccount.lastName}
                </h2>
                <p className="mt-1 text-[13px] text-[#6d788d]">Role: Admin</p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="rounded-md border border-[#f39d8d] px-3 py-2 text-[12px] font-semibold text-[#c23513] transition hover:bg-[#fff1ee]"
              >
                Hapus Akun
              </button>
            </div>

            <div className="mt-4 grid gap-3 text-[14px] text-[#3e4663]">
              <p>
                <span className="font-semibold text-[#6d788d]">Nama Depan:</span> {selectedAccount.firstName}
              </p>
              <p>
                <span className="font-semibold text-[#6d788d]">Nama Belakang:</span> {selectedAccount.lastName}
              </p>
              <p>
                <span className="font-semibold text-[#6d788d]">Email:</span> {selectedAccount.email}
              </p>
              <p>
                <span className="font-semibold text-[#6d788d]">Nomor HP:</span> {selectedAccount.phone}
              </p>
              <p>
                <span className="font-semibold text-[#6d788d]">Alamat:</span> {selectedAccount.address || "-"}
              </p>
            </div>
          </section>
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
