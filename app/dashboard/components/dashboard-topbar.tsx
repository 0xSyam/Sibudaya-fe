"use client";

import Image from "next/image";
import { useState, useRef, useEffect } from "react";
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
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Click-outside untuk tutup dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
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
        <button
          type="button"
          className="relative flex h-10 w-[38px] items-center justify-center rounded-[48px] text-[rgba(38,43,67,0.9)]"
          aria-label="Notifikasi"
        >
          <BellIcon />
          <span className="absolute right-[7px] top-[9px] size-[7px] rounded-full bg-[#f03d3d]" />
        </button>

        {/* Avatar + Dropdown */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setShowMenu((v) => !v)}
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
            <div className="absolute right-0 top-[calc(100%+8px)] w-[240px] rounded-[10px] border border-[rgba(38,43,67,0.12)] bg-white py-2 shadow-[0_4px_14px_0_rgba(38,43,67,0.16)]">
              {/* Info user */}
              {user && (
                <div className="border-b border-[rgba(38,43,67,0.1)] px-4 pb-3 pt-2">
                  <p className="truncate text-[14px] font-medium text-[rgba(38,43,67,0.9)]">
                    {user.email}
                  </p>
                  <p className="text-[12px] text-[rgba(38,43,67,0.5)]">
                    {user.role === "SUPER_ADMIN"
                      ? "Super Admin"
                      : user.role === "ADMIN"
                        ? "Admin"
                        : "User"}{" "}
                    &middot;{" "}
                    {user.provider === "GOOGLE" ? "Google" : "Email"}
                  </p>
                </div>
              )}

              {/* Logout */}
              <button
                type="button"
                onClick={() => {
                  setShowMenu(false);
                  logout();
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-[14px] text-red-600 hover:bg-red-50 cursor-pointer transition-colors"
              >
                <LogoutIcon />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
