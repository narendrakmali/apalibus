import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { FirebaseClientProvider } from '@/firebase';
import Header from "@/components/header";
import Footer from "@/components/footer";

const locales = ['en', 'hi', 'mr'];

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <FirebaseClientProvider>
            <Header />
            <main className="flex-grow bg-background">
              {children}
            </main>
            <Footer />
          </FirebaseClientProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
