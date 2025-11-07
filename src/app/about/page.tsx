
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Bus, Clock, Users, Car, Plane, Briefcase, School } from 'lucide-react';

export default function AboutUsPage() {

  const whyChooseUs = [
    { text: "Safety First: Our fleet of vehicles is meticulously maintained and operated by experienced, professional, and courteous drivers.", icon: <ShieldCheck className="h-6 w-6 text-primary" /> },
    { text: "Diverse Fleet: We offer a wide range of vehicles to suit any group size or requirement, from sedans to large buses.", icon: <Bus className="h-6 w-6 text-primary" /> },
    { text: "Reliability & Punctuality: We pride ourselves on dependable services, ensuring you reach your destination on time.", icon: <Clock className="h-6 w-6 text-primary" /> },
    { text: "Customized Solutions: We cater to a wide range of travel needs, offering flexible rental options and itinerary planning services.", icon: <Users className="h-6 w-6 text-primary" /> },
  ];

  const services = [
    { title: "Local Car Rentals", description: "Perfect for city tours and local events.", icon: <Car className="w-8 h-8 text-primary" /> },
    { title: "Outstation Trips", description: "Explore new destinations with our comfortable round-trip options.", icon: <Bus className="w-8 h-8 text-primary" /> },
    { title: "Airport Transfers", description: "Reliable and timely transfers to and from major airports.", icon: <Plane className="w-8 h-8 text-primary" /> },
    { title: "Group Travel", description: "Specialized services for family vacations, school trips, and corporate outings.", icon: <Users className="w-8 h-8 text-primary" /> },
    { title: "Tour Operator Services", description: "Expert planning for business and school tours.", icon: <Briefcase className="w-8 h-8 text-primary" /> },
  ];

  const fleet = [
    { type: "Sedans", capacity: "4-5 Seater", ideal: "Corporate travel, airport transfers, city tours" },
    { type: "SUVs", capacity: "5-7 Seater", ideal: "Families, large groups with extra luggage" },
    { type: "Tempo Travellers", capacity: "9, 12, 15, 17 Seater", ideal: "Group outings, school excursions, family vacations" },
    { type: "Buses", capacity: "AC (2x2) & Non-AC (2x3) options", ideal: "Large events, group tours, long-distance travel" },
  ];

  return (
    <div className="container mx-auto py-12 px-4 md:px-6">
      <header className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight font-display sm:text-5xl text-primary">
          Welcome to Sakpal Travels
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">Experience safe, comfortable, and reliable transportation across Maharashtra and beyond.</p>
      </header>

      <section className="mb-16 max-w-4xl mx-auto text-center">
        <p className="text-base text-muted-foreground">
         Established in 2001, Sakpal Travels is a premier transportation operator based in Mahad, Raigad-Maharashtra. With a strong commitment to customer satisfaction and a stellar 5.0 customer rating, we provide exceptional travel experiences tailored to your needs. Whether you're planning a family vacation, a corporate event, a school excursion, or just need a reliable ride to the airport, our dedicated team ensures a hassle-free and memorable journey every time.
        </p>
      </section>

      <section id="why-choose-us" className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-8 font-display text-primary">Why Choose Us?</h2>
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
             <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-display text-primary">Our Services</h2>
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
             <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-display text-primary">Our Fleet</h2>
          </div>
            <Card>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Vehicle Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Seating Capacity</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Ideal For</th>
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
