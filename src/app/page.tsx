
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Clock, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations('HomePage');

  const services = [
    {
      icon: <Truck className="w-8 h-8 text-primary" />,
      title: t('service1Title'),
      description: t('service1Desc'),
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: t('service2Title'),
      description: t('service2Desc'),
    },
    {
      icon: <Clock className="w-8 h-8 text-primary" />,
      title: t('service3Title'),
      description: t('service3Desc'),
    },
    {
      icon: <ShieldCheck className="w-8 h-8 text-primary" />,
      title: t('service4Title'),
      description: t('service4Desc'),
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="w-full py-20 md:py-32 lg:py-40 bg-background">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold tracking-tight font-display sm:text-5xl lg:text-6xl text-primary">
              {t('heroTitle')}
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              {t('heroSubtitle')}
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/search">{t('getQuote')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/about">{t('learnMore')}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="w-full py-20 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
             <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-display text-primary">{t('servicesTitle')}</h2>
             <p className="mt-4 text-muted-foreground">
                {t('servicesSubtitle')}
             </p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((service) => (
              <Card key={service.title} className="text-center bg-background shadow-md hover:shadow-xl transition-shadow">
                <CardHeader>
                    <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mx-auto mb-4">
                        {service.icon}
                    </div>
                    <CardTitle className="text-lg font-semibold font-display">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mt-1 text-muted-foreground">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-20 md:py-24 bg-background">
         <div className="container mx-auto px-4 md:px-6">
             <Card className="max-w-4xl mx-auto bg-primary text-primary-foreground border-0">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-display">{t('ctaTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-primary-foreground/80 mb-6">
                        {t('ctaSubtitle')}
                    </p>
                    <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                        <Link href="/search">{t('ctaButton')}</Link>
                    </Button>
                </CardContent>
            </Card>
         </div>
      </section>
    </div>
  );
}
