
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
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';

const menuItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/bookings', label: 'Bookings', icon: Ticket, badge: '12' },
  { href: '/admin/operators', label: 'Operators', icon: Building },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/buses', label: 'Buses', icon: Bus },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export default function AdminSidebarNav() {
  const pathname = usePathname();

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
                  {item.badge && <Badge className="ml-auto bg-sidebar-primary text-sidebar-primary-foreground">{item.badge}</Badge>}
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
                    <Link href="#">
                        <Avatar className="h-6 w-6">
                            <AvatarImage src="https://picsum.photos/seed/avatar1/100" />
                            <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                        <span>Admin User</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
