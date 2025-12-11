import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['en', 'hi', 'mr'],
  defaultLocale: 'en',
  localePrefix: 'always'
});

export const config = {
  // Skip all paths that should not be internationalized. This example skips the
  // folders "api", "images", and anything starting with an underscore.
  matcher: ['/((?!api|_next|.*\\..*).*)']
};
