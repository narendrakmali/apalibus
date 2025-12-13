import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { locales } from './navigation'; // Import the list from the file we made earlier

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();

  return {
    // This points to the /messages folder in your PROJECT ROOT (not src)
    messages: (await import(`../messages/${locale}.json`)).default
  };
});

