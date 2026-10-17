import type { ReactNode } from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PulseMarket - Dashboard de Analítica E-Commerce",
  description: "Gestión y analítica en tiempo real para e-commerce",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-50 antialiased">{children}</body>
    </html>
  );
}
