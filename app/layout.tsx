import type { Metadata } from "next";
import { Roboto, Work_Sans} from "next/font/google";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal | Dashboard",
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
        className={`${roboto.variable} ${workSans.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
