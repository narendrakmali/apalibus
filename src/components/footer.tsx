import Link from "next/link";
import { useTranslations } from "next-intl";

export default function Footer() {
    const t = useTranslations('Footer');
    const currentYear = new Date().getFullYear();

    return (
        <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
          <p className="text-xs text-foreground/50">
            {t('copyright', { year: currentYear })}
          </p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link href="/about" className="text-xs hover:underline underline-offset-4">
              {t('about')}
            </Link>
            <Link href="/terms" className="text-xs hover:underline underline-offset-4">
              {t('terms')}
            </Link>
            <Link href="/privacy" className="text-xs hover:underline underline-offset-4">
              {t('privacy')}
            </Link>
            <Link href="/contact" className="text-xs hover:underline underline-offset-4">
              {t('contact')}
            </Link>
            <Link href="/admin/login" className="text-xs hover:underline underline-offset-4">
              {t('admin')}
            </Link>
          </nav>
        </footer>
    )
}
