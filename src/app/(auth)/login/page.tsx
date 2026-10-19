"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { showErrorAlert } from "@/lib/alerts";

const highlights = [
  "Métricas de ventas en tiempo real",
  "Tablero Kanban con arrastrar y soltar",
  "Catálogo con más de 10,000 registros",
];

function PulseMark() {
  return (
    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-violet-200">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-6 w-6"
      >
        <path d="M3 12h4l3-7 4 14 3-7h4" />
      </svg>
    </span>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" className="h-5 w-5">
      <path
        fill="#FFC107"
        d="M43.6 24.5c0-1.4-.1-2.8-.4-4.1H24v7.8h11c-.5 2.5-2 4.7-4.2 6.1v5h6.8c4-3.7 6-9 6-14.8Z"
      />
      <path
        fill="#FF3D00"
        d="M24 44c5.5 0 10.1-1.8 13.5-4.8l-6.8-5c-1.9 1.3-4.1 2-6.7 2-5.2 0-9.6-3.5-11.2-8.2H5.8v5.2A20 20 0 0 0 24 44Z"
      />
      <path
        fill="#4CAF50"
        d="M12.8 28c-.9-2.5-.9-5.3 0-7.8V15H5.8a20 20 0 0 0 0 18.2l7-5.2Z"
      />
      <path
        fill="#1976D2"
        d="M24 12c2.8 0 5.4 1 7.4 3l5.8-5.8A19.5 19.5 0 0 0 24 4 20 20 0 0 0 5.8 15l7 5.2C14.4 15.5 18.8 12 24 12Z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.55.1.76-.24.76-.53v-2.08c-3.1.68-3.76-1.32-3.76-1.32-.5-1.29-1.24-1.63-1.24-1.63-1.01-.69.08-.68.08-.68 1.12.08 1.71 1.15 1.71 1.15 1 .1.76 2.33 3.3 1.65.1-.72.39-1.22.7-1.5-2.48-.28-5.09-1.24-5.09-5.53 0-1.22.44-2.22 1.15-3-.12-.28-.5-1.42.11-2.96 0 0 .94-.3 3.05 1.15a10.6 10.6 0 0 1 5.55 0c2.11-1.45 3.05-1.15 3.05-1.15.61 1.54.23 2.68.11 2.96.72.78 1.15 1.78 1.15 3 0 4.3-2.61 5.24-5.1 5.52.4.35.75 1.03.75 2.08V22c0 .29.2.63.76.53A11.1 11.1 0 0 0 12 .9Z" />
    </svg>
  );
}

export default function LoginPage() {
  useEffect(() => {
    const url = new URL(window.location.href);
    const error = url.searchParams.get("error");

    if (!error) return;

    showErrorAlert(
      "No se pudo iniciar sesión",
      "La autenticación no pudo completarse. Revisa la configuración OAuth y vuelve a intentarlo.",
    );
    url.searchParams.delete("error");
    window.history.replaceState(
      null,
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );
  }, []);

  return (
    <main className="grid min-h-screen bg-slate-50 md:grid-cols-2">
      <section className="login-brand-panel relative flex min-h-[250px] flex-col overflow-hidden px-6 py-7 text-white sm:px-10 md:min-h-screen md:px-8 lg:px-12 lg:py-10">
        <div className="login-grid-overlay absolute inset-0" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              className="h-5 w-5"
            >
              <path d="M3 12h4l3-7 4 14 3-7h4" />
            </svg>
          </span>
          <span className="text-sm font-bold tracking-tight">
            Analítica E-Commerce
          </span>
        </div>

        <div className="relative my-auto max-w-xl py-10 lg:py-20">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-violet-100/80">
            Inteligencia para tu negocio
          </p>
          <h1 className="max-w-lg text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
            Toma decisiones con datos, no con suposiciones.
          </h1>
          <ul className="mt-7 space-y-3">
            {highlights.map((highlight) => (
              <li
                key={highlight}
                className="flex items-center gap-3 text-sm font-medium text-white/85 sm:text-base"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    className="h-3.5 w-3.5"
                  >
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                </span>
                {highlight}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/65">
          © 2026 · Gestión de ventas e inventario
        </p>
      </section>

      <section className="flex min-h-[480px] items-center justify-center px-5 py-10 sm:px-10 md:min-h-screen md:px-5 lg:px-10">
        <div className="w-full max-w-md rounded-[1.5rem] border border-slate-200/80 bg-white p-6 shadow-xl shadow-slate-200/60 sm:p-8 lg:p-10">
          <div className="flex flex-col items-center text-center">
            <PulseMark />
            <h2 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-900">
              PulseMarket
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Inicia sesión para acceder al panel de analítica
            </p>
          </div>

          <div className="mt-8 space-y-3">
            <button
              type="button"
              onClick={() =>
                signIn("google", { callbackUrl: "/dashboard", redirect: true })
              }
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <GoogleIcon />
              Continuar con Google
            </button>
            <button
              type="button"
              onClick={() =>
                signIn("github", { callbackUrl: "/dashboard", redirect: true })
              }
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              <GitHubIcon />
              Continuar con GitHub
            </button>
          </div>

          <p className="mt-6 text-center text-xs leading-5 text-slate-400">
            Acceso seguro mediante Google o GitHub.
          </p>
        </div>
      </section>
    </main>
  );
}
