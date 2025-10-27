import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  Package,
  Settings,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
    href: '/dashboard',
  },
  {
    title: 'Students',
    icon: <Users className="h-4 w-4" />,
    href: '/students',
  },
  {
    title: 'Washermen',
    icon: <ShoppingBag className="h-4 w-4" />,
    href: '/washermen',
  },
  {
    title: 'Orders',
    icon: <Package className="h-4 w-4" />,
    href: '/orders',
  },
  {
    title: 'Settings',
    icon: <Settings className="h-4 w-4" />,
    href: '/settings',
  },
];

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 shrink-0 items-center border-b px-6">
        <h1 className="text-xl font-bold text-primary">WAR Admin</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant={isActive ? 'secondary' : 'ghost'}
                className={`w-full justify-start ${
                  isActive ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.title}</span>
                {item.badge && (
                  <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {item.badge}
                  </span>
                )}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator />

      {/* Logout */}
      <div className="shrink-0 p-4">
        <Button
          variant="ghost"
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          <span className="ml-3">Logout</span>
        </Button>
      </div>
    </div>
  );
}
