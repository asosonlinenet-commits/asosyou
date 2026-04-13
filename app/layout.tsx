import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Popup from "./components/Popup"; // 👈 IMPORT DO POPUP

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ASOS",
  description: "Plataforma digital baseada em tarefas com potencial de ganhos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR"> {/* 👈 AJUSTEI PARA BR */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Popup /> {/* 👈 POPUP AQUI */}
        {children}
      </body>
    </html>
  );
}