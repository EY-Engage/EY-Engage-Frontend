import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import "./globals.css";
import { Providers } from "@/providers/providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen">
        <ReactQueryProvider>
          <Providers>
            {children}
          </Providers>
        </ReactQueryProvider>
      </body>
    </html>
  );
}