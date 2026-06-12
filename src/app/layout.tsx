import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Морской бой: Библейская Битва",
  description: "Морской бой 10×10 с библейской викториной перед каждым выстрелом",
  appleWebApp: {
    capable: true,
    title: "Библейская Битва",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0a1628",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body className="antialiased min-h-screen min-h-[100dvh] overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
