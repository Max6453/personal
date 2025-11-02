import type { Metadata } from "next";
import Header from "@/components/sideHeader";
import { TokenProvider } from '@/lib/token-context';

export const metadata: Metadata = {
  title: "Webhub | Dashboard",
  description: "Dashboard for developers",
};

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="en">
      <body>
       <TokenProvider>
        <Header/>
        {children}
       </TokenProvider> 
      </body>
    </html>
  );
}
