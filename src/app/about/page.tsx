
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, Target, ShieldCheck, Smile, Clock } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function AboutUsPage() {
  const t = useTranslations('AboutPage');

  const fleet = [
    t('fleet1'),
    t('fleet2'),
  ];

  const whyChooseUs = [
    { text: t('whyUs1'), icon: <ShieldCheck className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" /> },
    { text: t('whyUs2'), icon: <Smile className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" /> },
    { text: t('whyUs3'), icon: <Clock className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" /> },
    { text: t('whyUs4'), icon: <Star className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" /> },
  ];

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-display sm:text-5xl text-primary">
          {t('title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{t('subtitle')}</p>
      </header>

      <section className="mb-12 max-w-4xl mx-auto text-center">
        <p className="text-base text-muted-foreground">
         {t('intro')}
        </p>
      </section>

      <div className="grid md:grid-cols-1 gap-12 mb-16">
        <Card className="bg-secondary/50 border-0 shadow-lg">
            <CardHeader className="items-center text-center">
                <Target className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-2xl font-semibold font-display">{t('missionTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-lg text-muted-foreground">
                  {t('missionDesc')}
                </p>
            </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-12 items-start">
        <section>
          <h2 className="text-3xl font-bold text-center mb-6 font-display text-primary">{t('fleetTitle')}</h2>
          <ul className="space-y-4">
            {fleet.map((item, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                <span className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-center mb-6 font-display text-primary">{t('whyUsTitle')}</h2>
          <ul className="space-y-4">
            {whyChooseUs.map((item, index) => (
              <li key={index} className="flex items-start">
                {item.icon}
                <span className="text-muted-foreground">{item.text}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="text-center mt-16">
        <h3 className="text-2xl font-semibold mb-4 font-display text-center max-w-3xl mx-auto">
         {t('ctaTitle')}
        </h3>
      </section>
    </div>
  );
}
