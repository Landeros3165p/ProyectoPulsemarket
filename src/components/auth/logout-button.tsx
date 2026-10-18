"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="mt-8 w-full rounded-lg border border-slate-300 px-4 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50"
    >
      Cerrar sesión
    </button>
  );
}
