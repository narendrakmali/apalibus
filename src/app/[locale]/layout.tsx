
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
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
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
  );
}
