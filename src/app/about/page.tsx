
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Star, Target, Compass, Eye } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function AboutUsPage() {
  const t = useTranslations('AboutPage');

  const offerings = [
    t('offer1'),
    t('offer2'),
    t('offer3'),
    t('offer4'),
    t('offer5'),
  ];

  const whyChooseUs = [
    t('whyUs1'),
    t('whyUs2'),
    t('whyUs3'),
    t('whyUs4'),
    t('whyUs5'),
  ];

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-display sm:text-5xl text-primary">
          {t('title')}
        </h1>
      </header>

      <section className="mb-12 max-w-4xl mx-auto">
        <p className="text-lg text-center text-muted-foreground">
          {t('subtitle')}
        </p>
      </section>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
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
        <Card className="bg-secondary/50 border-0 shadow-lg">
            <CardHeader className="items-center text-center">
                <Eye className="h-10 w-10 text-primary mb-2" />
                <CardTitle className="text-2xl font-semibold font-display">{t('visionTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-center text-lg text-muted-foreground">
                {t('visionDesc')}
                </p>
            </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-10 mb-12">
        <section>
          <h2 className="text-3xl font-bold text-center mb-6 font-display flex items-center justify-center gap-2 text-primary"><Compass className="h-8 w-8"/> {t('offerTitle')}</h2>
          <ul className="space-y-3">
            {offerings.map((item, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-bold text-center mb-6 font-display flex items-center justify-center gap-2 text-primary"><Star className="h-8 w-8"/> {t('whyUsTitle')}</h2>
          <ul className="space-y-3">
            {whyChooseUs.map((item, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="h-5 w-5 text-accent mr-3 mt-1 flex-shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>


      <section className="text-center mt-16">
        <h3 className="text-2xl font-semibold mb-4 font-display">
          {t('ctaTitle')}
        </h3>
        <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
          <Link href="/search">{t('ctaButton')}</Link>
        </Button>
      </section>
    </div>
  );
}
