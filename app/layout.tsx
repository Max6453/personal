import type { Metadata } from "next";
import { Roboto, Work_Sans, Quantico } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

const quantico = Quantico({
  variable: "--font-quantico",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Webhub | from developers to developers",
  description: "Dashboard for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      className={`${roboto.variable} ${workSans.variable} ${quantico.variable}  antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
