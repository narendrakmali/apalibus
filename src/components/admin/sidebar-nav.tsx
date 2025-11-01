
'use client';
import { usePathname } from 'next/navigation';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import {
  Bus,
  LayoutDashboard,
  Ticket,
  Users,
  Building,
  Settings,
  CircleHelp,
  User,
  Map,
  History,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';


const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/buses', label: 'My Buses', icon: Bus },
  { href: '/admin/bookings', label: 'Bookings', icon: Ticket, isBooking: true },
  { href: '/admin/history', label: 'Booking History', icon: History },
  { href: '/admin/tracking', label: 'Live Tracking', icon: Map },
  { href: '/admin/operators', label: 'Register Operator', icon: Building },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function BookingBadge() {
    const { user } = useUser();
    const firestore = useFirestore();

    const bookingsQuery = useMemoFirebase(() => {
        if (!firestore || !user?.uid) return null;
        return query(collection(firestore, 'bookings'), where('operatorId', '==', user.uid), where('status', '==', 'pending'));
    }, [firestore, user?.uid]);

    const { data: bookings } = useCollection(bookingsQuery);

    if (!bookings || bookings.length === 0) return null;

    return <Badge className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground">{bookings.length}</Badge>;
}

export default function AdminSidebarNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const userInitial = user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'A';

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2">
          <Bus className="h-6 w-6 text-primary" />
          <span className="font-headline font-bold text-lg text-sidebar-foreground">Traverse</span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                tooltip={{ children: item.label, side: 'right', align: 'center' }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                  {item.isBooking ? <BookingBadge /> : null}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: 'Help', side: 'right', align: 'center' }}>
                    <Link href="#">
                        <CircleHelp />
                        <span>Help</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip={{ children: 'Profile', side: 'right', align: 'center' }}>
                    <Link href="/dashboard">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src={user?.photoURL || undefined} />
                            <AvatarFallback>{userInitial}</AvatarFallback>
                        </Avatar>
                        <span>{user?.displayName || 'Admin User'}</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
