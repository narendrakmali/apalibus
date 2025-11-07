
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next-intl/navigation';
import { useState, useTransition } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
  const t = useTranslations('LanguageSwitcher');
  const [isPending, startTransition] = useTransition();
  const locale = useLocale();
  const [value, setValue] = useState(locale);
  const router = useRouter();
  const pathname = usePathname();

  function onSelectChange(value: string) {
    setValue(value);
    startTransition(() => {
      router.replace(pathname, { locale: value });
    });
  }

  return (
    <Select onValueChange={onSelectChange} value={value} disabled={isPending}>
      <SelectTrigger className="w-auto gap-2 border-0 shadow-none bg-card">
         <Globe className="h-4 w-4" />
        <SelectValue placeholder={t('label')} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">{t('en')}</SelectItem>
        <SelectItem value="hi">{t('hi')}</SelectItem>
        <SelectItem value="mr">{t('mr')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
