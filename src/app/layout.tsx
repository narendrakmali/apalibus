'use client';

import { PT_Sans, Space_Grotesk, Poppins } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
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

// This is the root layout and does not have access to the locale.
// It's a client component to use Firebase and ErrorBoundary.
// The actual locale-specific layout is at `/[locale]/layout.tsx`.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <FirebaseClientProvider>
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={() => {
                // This will force a hard reload of the page
                window.location.reload();
            }}
        >
          {children}
        </ErrorBoundary>
    </FirebaseClientProvider>
  );
}

    