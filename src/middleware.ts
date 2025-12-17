import createMiddleware from 'next-intl/middleware';
import { locales } from './navigation';
 
export default createMiddleware({
  // A list of all locales that are supported
  locales: locales,
 
  // Used when no locale matches
  defaultLocale: 'en'
});
 
export const config = {
  // Matcher ignoring `_next` and API routes
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
