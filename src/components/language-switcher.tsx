'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/navigation'; // Import from your custom file
import { Globe, Check } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale(); // Get current language (e.g., 'en')
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // List of available languages
  const languages = [
    { code: 'en', label: 'English', native: 'English' },
    { code: 'mr', label: 'Marathi', native: 'मराठी' },
    { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  ];

  // Function to handle language switch
  const switchLanguage = (newLocale: string) => {
    // This automatically replaces '/en/dashboard' with '/mr/dashboard'
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 1. The Button (Globe Icon) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition text-slate-600"
        title="Change Language"
      >
        <Globe className="w-5 h-5" />
        <span className="uppercase font-semibold text-sm">{locale}</span>
      </button>

      {/* 2. The Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLanguage(lang.code)}
              className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-slate-50 transition ${
                locale === lang.code ? 'text-blue-600 font-bold bg-blue-50' : 'text-slate-700'
              }`}
            >
              <div className="flex flex-col">
                <span>{lang.native}</span>
                <span className="text-xs text-slate-400 font-normal">{lang.label}</span>
              </div>
              {locale === lang.code && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
