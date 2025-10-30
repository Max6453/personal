import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Webhub blog | Latest news ",
  description: "Dashboard for developers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-900">
        {children}
      </body>
    </html>
  );
}
