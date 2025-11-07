
import type { Metadata } from "next";
import { PT_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { FirebaseClientProvider } from "@/firebase/client-provider";
import { getMessages } from 'next-intl/server';
import {NextIntlClientProvider} from 'next-intl';

const ptSans = PT_Sans({ 
  subsets: ["latin"], 
  weight: ['400', '700'],
  variable: "--font-pt-sans" 
});
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });

export const metadata: Metadata = {
  title: "Sakpal Travels",
  description: "A comprehensive web-based bus booking platform.",
};

export default async function RootLayout({
  children,
  params: { locale }
}: Readonly<{
  children: React.ReactNode;
  params: { locale: string };
}>) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={cn("min-h-screen font-sans antialiased", ptSans.variable, spaceGrotesk.variable)}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <FirebaseClientProvider>
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </FirebaseClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
