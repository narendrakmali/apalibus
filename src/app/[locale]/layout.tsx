
import { notFound } from 'next/navigation';
import {NextIntlClientProvider, useMessages} from 'next-intl';
import Header from "@/components/header";
import Footer from "@/components/footer";
import { getMessages } from 'next-intl/server';

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

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
            <Header />
            <main className="flex-grow bg-background">
              {children}
            </main>
            <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
