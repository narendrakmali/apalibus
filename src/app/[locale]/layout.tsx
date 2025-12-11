
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { FirebaseClientProvider } from '@/firebase';
import Header from "@/components/header";
import Footer from "@/components/footer";
import { locales } from '@/navigation';
import type { Metadata } from 'next';
import "../globals.css";


export const metadata: Metadata = {
  title: 'Samagam Transport Seva',
  description: 'Transport Logistics Management for the 59th Annual Samagam, Sangli.',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <FirebaseClientProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow bg-slate-50">
                {children}
              </main>
              <Footer />
            </div>
          </FirebaseClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
