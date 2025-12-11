import { notFound } from 'next/navigation';
import {NextIntlClientProvider, useMessages} from 'next-intl';
import Header from "@/components/header";
import Footer from "@/components/footer";

const locales = ['en', 'hi', 'mr'];

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) {
    notFound();
  }

  const messages = useMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
        <html lang={locale}>
          <body>
            <Header />
            <main className="flex-grow bg-background">
              {children}
            </main>
            <Footer />
          </body>
        </html>
    </NextIntlClientProvider>
  );
}

    