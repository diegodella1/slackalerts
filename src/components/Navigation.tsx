'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bell, TrendingUp, Settings, Home } from 'lucide-react';
import LogoutButton from './LogoutButton';
import { ThemeToggle } from './ThemeToggle';

export function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/price', label: 'Price', icon: TrendingUp },
    { href: '/rules', label: 'Rules', icon: Settings },
    { href: '/alerts', label: 'Alerts', icon: Bell },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="font-bold text-xl">
              Bitcoin Alerts
            </Link>
            
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </div>
    </nav>
  );
} 