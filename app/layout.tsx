import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casino Platform",
  description: "Casino affiliate catalog",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Aboreto&family=Abril+Fatface&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
