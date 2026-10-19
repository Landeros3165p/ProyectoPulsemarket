"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  className?: string;
}

export function LogoutButton({ className }: LogoutButtonProps) {
  const [isSigningOut, setIsSigningOut] = useState(false);

  return (
    <button
      type="button"
      disabled={isSigningOut}
      onClick={() => {
        setIsSigningOut(true);
        void signOut({ callbackUrl: "/login" });
      }}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-60",
        className,
      )}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 text-slate-400 transition group-hover:text-rose-600"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
      </svg>
      {isSigningOut ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}
