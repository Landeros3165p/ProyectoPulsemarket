"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

type Provider = "google" | "github";

const authErrorMessages: Record<string, string> = {
  OAuthSignin: "No se pudo iniciar la conexión con el proveedor. Inténtalo de nuevo.",
  OAuthCallback: "El proveedor rechazó la autenticación. Vuelve a intentarlo.",
  OAuthCreateAccount: "No se pudo crear tu cuenta con este proveedor.",
  OAuthAccountNotLinked:
    "Este correo ya está asociado a otro proveedor. Inicia sesión con el proveedor original.",
  Callback: "Ocurrió un error al procesar el inicio de sesión.",
  AccessDenied: "Acceso denegado. No tienes permiso para iniciar sesión.",
  Configuration: "Error de configuración del servidor de autenticación.",
  SessionRequired: "Debes iniciar sesión para acceder a esa página.",
  Verification: "El enlace de verificación expiró o ya fue utilizado.",
};

const defaultAuthError = "No se pudo iniciar sesión. Inténtalo de nuevo.";

const features = [
  "Métricas de ventas en tiempo real",
  "Tablero Kanban con arrastrar y soltar",
  "Catálogo con más de 10,000 registros",
];

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.96 10.96 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden="true"
      className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent"
    />
  );
}

function getCallbackPath(callbackUrl: string | null): string | null {
  if (!callbackUrl) return null;

  try {
    const url = new URL(callbackUrl, "http://localhost");
    return url.pathname === "/" ? null : url.pathname;
  } catch {
    return null;
  }
}

function LoginForm() {
  const searchParams = useSearchParams();
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const errorCode = searchParams.get("error");
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const protectedPath = getCallbackPath(searchParams.get("callbackUrl"));
  const errorMessage = errorCode
    ? (authErrorMessages[errorCode] ?? defaultAuthError)
    : null;

  function handleSignIn(provider: Provider) {
    setActiveProvider(provider);
    void signIn(provider, { callbackUrl, redirect: true });
  }

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div
          role="alert"
          className="animate-slide-up flex gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="mt-0.5 h-5 w-5 shrink-0 text-rose-500"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <div>
            <p className="font-semibold">Error de inicio de sesión</p>
            <p className="mt-0.5 text-rose-700">{errorMessage}</p>
          </div>
        </div>
      )}

      {!errorMessage && protectedPath && (
        <div className="animate-slide-up flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-500"
          >
            <rect x="4" y="11" width="16" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 0 1 8 0v4" />
          </svg>
          <p>
            <span className="font-semibold">{protectedPath}</span> es una ruta
            protegida. Inicia sesión para continuar.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <button
          type="button"
          disabled={activeProvider !== null}
          onClick={() => handleSignIn("google")}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
        >
          {activeProvider === "google" ? <Spinner /> : <GoogleIcon />}
          Continuar con Google
        </button>
        <button
          type="button"
          disabled={activeProvider !== null}
          onClick={() => handleSignIn("github")}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.99] disabled:cursor-wait disabled:opacity-70"
        >
          {activeProvider === "github" ? <Spinner /> : <GitHubIcon />}
          Continuar con GitHub
        </button>
      </div>

      <p
        aria-live="polite"
        className="min-h-[1.25rem] text-center text-xs text-slate-500"
      >
        {activeProvider
          ? `Redirigiendo a ${activeProvider === "google" ? "Google" : "GitHub"}...`
          : "Solo se permite el acceso mediante inicio de sesión único (SSO)."}
      </p>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="h-12 w-full rounded-xl" />
      <Skeleton className="mx-auto h-4 w-2/3" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="bg-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full bg-fuchsia-400/20 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/25 backdrop-blur">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M3 12h4l3-8 4 16 3-8h4" />
            </svg>
          </span>
          <span className="text-lg font-semibold tracking-tight">
            Analítica E-Commerce
          </span>
        </div>

        <div className="relative max-w-md">
          <p className="text-4xl font-bold leading-tight tracking-tight">
            Toma decisiones con datos, no con suposiciones.
          </p>
          <ul className="mt-8 space-y-4">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-white/90">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                  >
                    <path d="m5 12 5 5L20 7" />
                  </svg>
                </span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-white/60">
          © {new Date().getFullYear()} · Gestión de ventas e inventario
        </p>
      </section>

      <section className="flex items-center justify-center bg-slate-50 p-4 sm:p-8">
        <div className="animate-scale-in w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-900/5 sm:p-10">
          <div className="mb-8 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M3 12h4l3-8 4 16 3-8h4" />
              </svg>
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              PulseMarket
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Inicia sesión para acceder al panel de analítica
            </p>
          </div>

          <Suspense fallback={<LoginFormSkeleton />}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
