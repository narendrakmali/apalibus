
'use client';
import { useTranslations } from "next-intl";

export default function Footer() {
    const t = useTranslations('Footer');
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-slate-200 py-6">
            <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
                <p>{t('copyright', { year: currentYear })}</p>
                <p className="mt-1">{t('partner')}</p>
            </div>
      </footer>
    )
}
