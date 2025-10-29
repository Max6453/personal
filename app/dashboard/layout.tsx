import type { Metadata } from "next";
import Header from "@/components/sideHeader";

export const metadata: Metadata = {
  title: "Webhub | Dashboard",
  description: "Dashboard for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header/>
        {children}
      </body>
    </html>
  );
}
