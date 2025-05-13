
'use client';

import { Calculator, LayoutDashboard, FileText, MessageSquare, Users, Menu } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import UserNav from './UserNav';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';


const navLinks = [
  { href: '/roadmap', label: 'Getting Started', icon: LayoutDashboard },
  { href: '/usage-examples', label: 'Usage Examples', icon: FileText },
  { href: '/chat', label: 'Chat Room', icon: MessageSquare },
  { href: '/teachers', label: 'Teachers', icon: Users },
];

export default function AppHeader() {
  const { isLoggedIn, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const NavLinkItems = ({ isMobile = false }: { isMobile?: boolean }) => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
            pathname === link.href ? "text-primary" : "text-muted-foreground",
            isMobile && "py-2 text-base"
          )}
          onClick={() => isMobile && setMobileMenuOpen(false)}
        >
          <link.icon className="h-4 w-4" />
          {link.label}
        </Link>
      ))}
    </>
  );


  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
          <Calculator className="h-8 w-8 text-accent" />
          <span>MathFluent</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <NavLinkItems />
        </nav>

        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="h-8 w-20 animate-pulse bg-muted rounded-md"></div>
          ) : isLoggedIn ? (
            <UserNav />
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/signin">Sign In</Link>
              </Button>
              <Button variant="default" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Navigation Trigger */}
          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[340px]">
                <nav className="flex flex-col gap-4 pt-8">
                  <NavLinkItems isMobile />
                  <hr className="my-2"/>
                  {isLoggedIn ? null : (
                     <>
                      <Button variant="outline" asChild onClick={() => setMobileMenuOpen(false)}>
                        <Link href="/signin">Sign In</Link>
                      </Button>
                      <Button variant="default" asChild className="bg-accent hover:bg-accent/90 text-accent-foreground" onClick={() => setMobileMenuOpen(false)}>
                        <Link href="/signup">Sign Up</Link>
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
