
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Bus, Clock, Users, Car, Plane, Briefcase, School } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function AboutUsPage() {
  const t = useTranslations('AboutPage');

  const whyChooseUs = [
    { text: t('whyUs1'), icon: <ShieldCheck className="h-6 w-6 text-primary" /> },
    { text: t('whyUs2'), icon: <Bus className="h-6 w-6 text-primary" /> },
    { text: t('whyUs3'), icon: <Clock className="h-6 w-6 text-primary" /> },
    { text: t('whyUs4'), icon: <Users className="h-6 w-6 text-primary" /> },
  ];

  const services = [
    { title: t('service1Title'), description: t('service1Desc'), icon: <Car className="w-8 h-8 text-primary" /> },
    { title: t('service2Title'), description: t('service2Desc'), icon: <Bus className="w-8 h-8 text-primary" /> },
    { title: t('service3Title'), description: t('service3Desc'), icon: <Plane className="w-8 h-8 text-primary" /> },
    { title: t('service4Title'), description: t('service4Desc'), icon: <Users className="w-8 h-8 text-primary" /> },
    { title: t('service5Title'), description: t('service5Desc'), icon: <Briefcase className="w-8 h-8 text-primary" /> },
  ];

  const fleet = [
    { type: t('fleet1Type'), capacity: t('fleet1Capacity'), ideal: t('fleet1Ideal') },
    { type: t('fleet2Type'), capacity: t('fleet2Capacity'), ideal: t('fleet2Ideal') },
    { type: t('fleet3Type'), capacity: t('fleet3Capacity'), ideal: t('fleet3Ideal') },
    { type: t('fleet4Type'), capacity: t('fleet4Capacity'), ideal: t('fleet4Ideal') },
  ];

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight font-display sm:text-5xl text-primary">
          {t('title')}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">{t('subtitle')}</p>
      </header>

      <section className="mb-16 max-w-4xl mx-auto text-center">
        <p className="text-base text-muted-foreground">
         {t('intro')}
        </p>
      </section>

      <section id="why-choose-us" className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8 font-display text-primary">{t('whyUsTitle')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChooseUs.map((item, index) => (
                <div key={index} className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                        {item.icon}
                    </div>
                    <p className="text-muted-foreground">{item.text}</p>
                </div>
            ))}
        </div>
      </section>

      <section id="services" className="w-full py-20 bg-secondary">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
             <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-display text-primary">{t('servicesTitle')}</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
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

       <section id="fleet" className="w-full py-20">
        <div className="container mx-auto px-4 md:px-6">
           <div className="text-center max-w-2xl mx-auto mb-12">
             <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-display text-primary">{t('fleetTitle')}</h2>
          </div>
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('fleetHeaderType')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('fleetHeaderCapacity')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('fleetHeaderIdeal')}</th>
                                </tr>
                            </thead>
                            <tbody className="bg-background divide-y divide-border">
                                {fleet.map((vehicle, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{vehicle.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{vehicle.capacity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{vehicle.ideal}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
      </section>

    </div>
  );
}
