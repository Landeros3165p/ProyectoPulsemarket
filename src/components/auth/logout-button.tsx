"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="w-full rounded-lg px-2.5 py-2 text-left text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
    >
      Cerrar sesión
    </button>
  );
}
