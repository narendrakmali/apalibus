import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { FirebaseClientProvider } from '@/firebase';
import Header from "@/components/header";
import Footer from "@/components/footer";
import { locales } from '@/navigation';

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Receiving messages provided in `i18n/request.ts`
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
