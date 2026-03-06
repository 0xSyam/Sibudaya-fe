"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/lib/auth-context";

function BellIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M14 21H10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17 8C17 5.23858 14.7614 3 12 3C9.23858 3 7 5.23858 7 8V10.7639C7 11.3274 6.8415 11.8796 6.54281 12.3575L5.37988 14.2179C4.54971 15.5462 5.50472 17.25 7.07087 17.25H16.9291C18.4953 17.25 19.4503 15.5462 18.6201 14.2179L17.4572 12.3575C17.1585 11.8796 17 11.3274 17 10.7639V8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="16,17 21,12 16,7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M20.59 22C20.59 18.13 16.74 15 12 15C7.26 15 3.41 18.13 3.41 22" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 7L12 13L21 7" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 4H5C3.9 4 3 4.9 3 6V18C3 19.1 3.9 20 5 20H19C20.1 20 21 19.1 21 18V6C21 4.9 20.1 4 19 4Z" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UserAvatar({ email }: { email?: string }) {
  // Ambil inisial dari email
  const initial = email ? email.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex size-10 items-center justify-center rounded-full bg-[#c23513] text-[15px] font-semibold text-white">
      {initial}
    </div>
  );
}

export function DashboardTopbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const userName = user?.email ? user.email.split("@")[0] : "Rayhan";
  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);
  const roleLabel =
    user?.role === "SUPER_ADMIN"
      ? "Super Admin"
      : user?.role === "ADMIN"
        ? "Admin"
        : "User";
  const notifications = [
    {
      title: "Data Pengajuan Ditolak",
      message: "Data pengajuan pentas dengan nama kegiatan Pijar Resonasi Ditolak",
      time: "Today",
      unread: true,
    },
    {
      title: "Data Berhasil Diajukan",
      message: "Data pengajuan pentas dengan nama kegiatan pijar resonasi berhasil diajukan dang sedang di review oleh pihak dinas kebudayaan",
      time: "Yesterday",
      unread: false,
    },
  ];
  const unreadCount = notifications.filter((item) => item.unread).length;

  // Click-outside untuk tutup dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-20 h-[64px] border-b border-[rgba(38,43,67,0.12)] bg-white px-4 sm:px-6">
      <div className="flex h-full items-center justify-end gap-3">
        {/* Notifikasi */}
        <div ref={notifRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowNotifications((v) => !v);
              setShowMenu(false);
            }}
            className="relative flex h-10 w-[38px] items-center justify-center rounded-[48px] text-[rgba(38,43,67,0.9)]"
            aria-label="Notifikasi"
          >
            <BellIcon />
            {unreadCount > 0 ? (
              <span className="absolute right-[7px] top-[9px] size-[7px] rounded-full bg-[#cc3e15]" />
            ) : null}
          </button>

          {showNotifications ? (
            <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[420px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-[14px] border border-[rgba(38,43,67,0.12)] bg-white shadow-[0_18px_48px_-20px_rgba(22,35,71,0.45)]">
              <div className="flex items-center justify-between px-5 py-4">
                <h3 className="text-[18px] font-semibold text-[#3c4358]">Notifications</h3>
                <div className="flex items-center gap-3">
                  <span className="rounded-[999px] bg-[#f1ddd8] px-3 py-1 text-[14px] font-medium text-[#cc3e15]">
                    {unreadCount} New
                  </span>
                  <span className="text-[#4a5066]">
                    <InboxIcon />
                  </span>
                </div>
              </div>

              {notifications.map((item, index) => (
                <div key={`${item.title}-${index}`} className="border-t border-[rgba(60,67,88,0.14)] px-5 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="text-[16px] font-semibold leading-7 text-[#3c4358]">{item.title}</h4>
                    {item.unread ? <span className="mt-2 size-3 rounded-full bg-[#cc3e15]" /> : null}
                  </div>
                  <p className="mt-1 max-w-[340px] text-[14px] leading-6 text-[#646b7d]">
                    {item.message}
                  </p>
                  <p className="mt-2 text-[14px] text-[#a0a6b5]">{item.time}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Avatar + Dropdown */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => {
              setShowMenu((v) => !v);
              setShowNotifications(false);
            }}
            className="cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-[#c23513] focus:ring-offset-2"
            aria-label="Menu profil"
          >
            {user ? (
              <UserAvatar email={user.email} />
            ) : (
              <Image
                src="/figma/avatar-profile.jpg"
                alt="Foto profil"
                width={40}
                height={40}
                className="size-10 rounded-full object-cover"
              />
            )}
          </button>

          {showMenu && (
            <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[270px] overflow-hidden rounded-[14px] border border-[rgba(38,43,67,0.12)] bg-[#f9f9fb] p-3 shadow-[0_18px_48px_-20px_rgba(22,35,71,0.45)]">
              <div className="rounded-[10px] bg-white">
                <div className="flex items-center gap-3 px-4 py-4">
                  {user ? (
                    <UserAvatar email={user.email} />
                  ) : (
                    <Image
                      src="/figma/avatar-profile.jpg"
                      alt="Foto profil"
                      width={40}
                      height={40}
                      className="size-10 rounded-full object-cover"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold leading-[22px] text-[#3c4358]">
                      {displayName}
                    </p>
                    <p className="text-[12px] leading-5 text-[#8a90a5]">{roleLabel}</p>
                  </div>
                </div>

                <div className="h-px w-full bg-[rgba(60,67,88,0.14)]" />

                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    router.push("/dashboard");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-[#3c4358] transition-colors hover:bg-[rgba(60,67,88,0.06)]"
                >
                  <ProfileIcon />
                  <span className="text-[16px] leading-6">My Profile</span>
                </button>

                <div className="h-px w-full bg-[rgba(60,67,88,0.14)]" />

                <div className="p-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      logout();
                    }}
                    className="flex h-[46px] w-full items-center justify-center gap-2 rounded-[10px] bg-[#ff4d4f] px-4 text-[15px] font-medium leading-6 text-white transition-colors hover:bg-[#ee4346]"
                  >
                    <span>Logout</span>
                    <LogoutIcon />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
