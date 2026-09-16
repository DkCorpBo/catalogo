import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#3C50E0",
};

export const metadata: Metadata = {
  title: "Tienda & Inventario - SaaS Multi-Tenant",
  description: "Crea tu tienda online y gestiona tu inventario con pedidos directos por WhatsApp.",
  applicationName: "Mi Tienda",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Mi Tienda",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased bg-[#F1F5F9] text-[#1C2434] select-none sm:select-auto">
        {children}
      </body>
    </html>
  );
}
