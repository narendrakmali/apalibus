
'use client';

import { PT_Sans, Space_Grotesk, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/error-fallback';
import { FirebaseClientProvider } from "@/firebase/client-provider";

const ptSans = PT_Sans({ 
  subsets: ["latin"], 
  weight: ['400', '700'],
  variable: "--font-pt-sans" 
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"], 
  variable: "--font-space-grotesk" 
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700'],
  variable: '--font-poppins',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Sakpal Travels</title>
        <meta name="description" content="A comprehensive web-based bus booking platform." />
      </head>
      <body className={cn("min-h-screen flex flex-col font-sans antialiased", ptSans.variable, spaceGrotesk.variable, poppins.variable)}>
          <FirebaseClientProvider>
            <Header />
            <main className="flex-grow bg-background">
              <ErrorBoundary
                  FallbackComponent={ErrorFallback}
                  onReset={() => {
                      // This will force a hard reload of the page
                      window.location.reload();
                  }}
              >
                {children}
              </ErrorBoundary>
            </main>
            <Footer />
          </FirebaseClientProvider>
      </body>
    </html>
  );
}
