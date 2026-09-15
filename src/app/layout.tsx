import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tienda & Inventario - SaaS Multi-Tenant",
  description: "Crea tu tienda online y gestiona tu inventario con pedidos directos por WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased bg-[#F1F5F9] text-[#1C2434]">
        {children}
      </body>
    </html>
  );
}
