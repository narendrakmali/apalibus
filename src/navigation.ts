
import {createLocalizedPathnamesNavigation} from 'next-intl/navigation';
 
export const locales = ['en', 'hi', 'mr'] as const;
export const localePrefix = 'always'; // Default

// The `pathnames` object holds pairs of internal
// and external paths, separated by locale.
export const pathnames = {
  // If all locales use the same pathnames, a single
  // external path can be used for all locales.
  '/': '/',
  '/request-quote': '/request-quote',
  '/msrtc-booking': '/msrtc-booking',
  '/inform-transport': '/inform-transport',
  '/sewa-volunteer': '/sewa-volunteer',
  '/track-status': '/track-status',
  '/admin': '/admin',
  '/admin/login': '/admin/login',
  '/admin/requests': '/admin/requests',
  '/admin/requests/[id]': '/admin/requests/[id]',
  '/admin/operators': '/admin/operators',
  '/admin/users': '/admin/users',
  '/admin/msrtc-requests': '/admin/msrtc-requests',
  '/admin/ticket-dispatch': '/admin/ticket-dispatch',
};
 
export const {Link, redirect, usePathname, useRouter} =
  createLocalizedPathnamesNavigation({locales, localePrefix, pathnames});
