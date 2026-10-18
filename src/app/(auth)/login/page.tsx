"use client";

import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-slate-900">PulseMarket</h1>
          <p className="mt-2 text-sm text-slate-600">
            Inicia sesión para acceder al panel de analítica
          </p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="flex w-full items-center justify-center gap-3 rounded-lg bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800"
          >
            Continuar con GitHub
          </button>
          <button
            type="button"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            Continuar con Google
          </button>
        </div>
      </section>
    </main>
  );
}
