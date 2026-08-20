import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sartaroshxona CRM",
  description: "Sartaroshxona/salon boshqaruv tizimi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uz">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#FAFAFA] text-[#1A1A1A] antialiased">
        {children}
      </body>
    </html>
  );
}
