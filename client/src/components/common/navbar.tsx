import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Home, Menu, X, LogIn, User, ChevronDown, ArrowRightLeft, Calculator, MapPin, BarChart, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { LoginButton } from "@/components/auth/auth-buttons";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { settings } = useSiteSettings();
  
  // Fetch contact information for customer care number
  const { data: contactInfo } = useQuery<{
    id: number;
    siteName: string;
    address: string;
    phone1: string;
    phone2?: string | null;
    email1: string;
    email2?: string | null;
    mapUrl?: string | null;
  }>({
    queryKey: ["/api/contact-info"],
  });

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Enhanced mobile menu toggle with body scroll lock
  const toggleMobileMenu = () => {
    const newState = !mobileMenuOpen;
    setMobileMenuOpen(newState);
    console.log('Mobile menu toggled:', newState);
    
    // Prevent body scroll when menu is open on mobile
    if (newState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  };

  // Mobile navigation handler with enhanced reliability for HOME LOAN
  const handleMobileNavigation = (url: string, label: string) => {
    console.log(`${label} navigation triggered`);
    setMobileMenuOpen(false);
    document.body.style.overflow = 'unset';
    
    // Special handling for HOME LOAN on mobile
    if (label === 'HOME LOAN') {
      console.log('HOME LOAN mobile navigation - using direct location change');
      // Force immediate navigation for HOME LOAN
      window.location.href = '/home-loan';
      return;
    }
    
    // For other navigation items
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  };

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Element;
      if (mobileMenuOpen && !target.closest('.mobile-menu-container')) {
        setMobileMenuOpen(false);
        document.body.style.overflow = 'unset';
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}>
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="relative">
        <div className="flex items-center justify-between h-16">
          {/* Left Section - Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="p-2 bg-blue-600 rounded-lg shadow-sm group-hover:bg-blue-700 transition-colors duration-200">
                <Home className="text-white h-6 w-6" />
              </div>
              <span className="font-bold text-xl text-gray-800 group-hover:text-blue-600 transition-colors duration-200">{settings.siteName}</span>
            </Link>
          </div>

          {/* Center Section - Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1">
            <div className="flex items-center space-x-1">
              <Link 
                href="/properties?type=buy" 
                className={`font-medium text-base px-4 py-2 rounded-md transition-colors duration-200 ${location === '/properties' || (location.includes('/properties') && location.includes('type=buy')) ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`}
              >
                Buy
              </Link>
              <Link 
                href="/properties?type=rent" 
                className={`font-medium text-base px-4 py-2 rounded-md transition-colors duration-200 ${location.includes('type=rent') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`}
              >
                Rent
              </Link>
              <Link 
                href="/home-loan" 
                className={`font-medium text-base px-4 py-2 rounded-md transition-colors duration-200 ${location === '/home-loan' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`}
              >
                Home Loan
              </Link>
              <Link 
                href="/properties" 
                className={`font-medium text-base px-4 py-2 rounded-md transition-colors duration-200 ${location === '/properties' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`}
              >
                Properties
              </Link>
              <Link 
                href="/contact" 
                className={`font-medium text-base px-4 py-2 rounded-md transition-colors duration-200 ${location === '/contact' ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`}
              >
                Contact
              </Link>
            </div>
          </nav>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {/* Customer Care Number */}
            {contactInfo?.phone1 && (
              <div className="hidden lg:flex items-center space-x-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200">
                <Phone className="h-4 w-4" />
                <a href={`tel:${contactInfo.phone1}`} className="text-sm font-medium">
                  {contactInfo.phone1}
                </a>
              </div>
            )}
            <LoginButton />
            <div className="md:hidden">
              <button 
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleMobileMenu();
                }}
                onTouchStart={(e) => {
                  e.stopPropagation();
                }}
                aria-label="Toggle mobile menu"
                className="mobile-menu-button flex items-center justify-center w-12 h-12 bg-white border-2 border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
              >
                {mobileMenuOpen ? (
                  <X className="h-7 w-7 text-gray-800" strokeWidth={2.5} />
                ) : (
                  <Menu className="h-7 w-7 text-gray-800" strokeWidth={2.5} />
                )}
              </button>
            </div>
          </div>
          </div>
        </div>
      </div>
      
      {/* Modern Dark Mobile Menu - Slide Down */}
      <div 
        className={`md:hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700 shadow-2xl transition-all duration-300 ease-in-out overflow-hidden pointer-events-auto ${
          mobileMenuOpen ? 'max-h-[100vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ pointerEvents: mobileMenuOpen ? 'auto' : 'none' }}
      >
        <div className="px-4 py-4 bg-gradient-to-r from-slate-800/90 to-slate-700/90 backdrop-blur-sm border-b border-slate-600/50">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-white tracking-wide">Navigation</span>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMobileMenuOpen(false);
                document.body.style.overflow = 'unset';
              }}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all duration-200"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <nav className="px-4 py-6 space-y-4 bg-gradient-to-b from-slate-900 to-slate-800 max-h-[70vh] overflow-y-auto" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1000 }}>
          
          {/* Modern Dark Navigation Items */}
          <div className="space-y-3">
            {/* BUY Properties */}
            <div 
              className="mobile-nav-item flex items-center w-full py-4 px-5 text-left font-semibold text-lg bg-gradient-to-r from-blue-600/20 to-blue-500/20 hover:from-blue-600/30 hover:to-blue-500/30 rounded-xl border border-blue-400/30 hover:border-blue-400/50 shadow-lg backdrop-blur-sm transition-all duration-300 touch-manipulation cursor-pointer group"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('BUY clicked');
                try {
                  setMobileMenuOpen(false);
                  document.body.style.overflow = 'unset';
                  setTimeout(() => {
                    window.location.href = '/properties?type=buy';
                  }, 100);
                } catch (error) {
                  console.error('Navigation error:', error);
                  window.location.href = '/properties?type=buy';
                }
              }}
            >
              <Home className="h-6 w-6 mr-4 text-blue-400 group-hover:text-blue-300 transition-colors" />
              <span className="text-white font-medium group-hover:text-blue-100 transition-colors">BUY Properties</span>
            </div>

            {/* RENT Properties */}
            <div 
              className="mobile-nav-item flex items-center w-full py-4 px-5 text-left font-semibold text-lg bg-gradient-to-r from-emerald-600/20 to-emerald-500/20 hover:from-emerald-600/30 hover:to-emerald-500/30 rounded-xl border border-emerald-400/30 hover:border-emerald-400/50 shadow-lg backdrop-blur-sm transition-all duration-300 touch-manipulation cursor-pointer group"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('RENT clicked');
                try {
                  setMobileMenuOpen(false);
                  document.body.style.overflow = 'unset';
                  setTimeout(() => {
                    window.location.href = '/properties?type=rent';
                  }, 100);
                } catch (error) {
                  console.error('Navigation error:', error);
                  window.location.href = '/properties?type=rent';
                }
              }}
            >
              <MapPin className="h-6 w-6 mr-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
              <span className="text-white font-medium group-hover:text-emerald-100 transition-colors">RENT Properties</span>
            </div>

            {/* HOME LOAN */}
            <div 
              className="mobile-nav-item flex items-center w-full py-4 px-5 text-left font-semibold text-lg bg-gradient-to-r from-violet-600/20 to-violet-500/20 hover:from-violet-600/30 hover:to-violet-500/30 rounded-xl border border-violet-400/30 hover:border-violet-400/50 shadow-lg backdrop-blur-sm transition-all duration-300 touch-manipulation cursor-pointer group"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('HOME LOAN clicked');
                try {
                  setMobileMenuOpen(false);
                  document.body.style.overflow = 'unset';
                  setTimeout(() => {
                    window.location.href = '/home-loan';
                  }, 100);
                } catch (error) {
                  console.error('Navigation error:', error);
                  window.location.href = '/home-loan';
                }
              }}
            >
              <Calculator className="h-6 w-6 mr-4 text-violet-400 group-hover:text-violet-300 transition-colors" />
              <span className="text-white font-medium group-hover:text-violet-100 transition-colors">HOME LOAN</span>
            </div>

            {/* PROPERTIES */}
            <div 
              className="mobile-nav-item flex items-center w-full py-4 px-5 text-left font-semibold text-lg bg-gradient-to-r from-orange-600/20 to-amber-500/20 hover:from-orange-600/30 hover:to-amber-500/30 rounded-xl border border-orange-400/30 hover:border-orange-400/50 shadow-lg backdrop-blur-sm transition-all duration-300 touch-manipulation cursor-pointer group"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('PROPERTIES clicked');
                try {
                  setMobileMenuOpen(false);
                  document.body.style.overflow = 'unset';
                  setTimeout(() => {
                    window.location.href = '/properties';
                  }, 100);
                } catch (error) {
                  console.error('Navigation error:', error);
                  window.location.href = '/properties';
                }
              }}
            >
              <BarChart className="h-6 w-6 mr-4 text-orange-400 group-hover:text-orange-300 transition-colors" />
              <span className="text-white font-medium group-hover:text-orange-100 transition-colors">PROPERTIES</span>
            </div>

            {/* CONTACT */}
            <div 
              className="mobile-nav-item flex items-center w-full py-4 px-5 text-left font-semibold text-lg bg-gradient-to-r from-rose-600/20 to-rose-500/20 hover:from-rose-600/30 hover:to-rose-500/30 rounded-xl border border-rose-400/30 hover:border-rose-400/50 shadow-lg backdrop-blur-sm transition-all duration-300 touch-manipulation cursor-pointer group"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('CONTACT clicked');
                try {
                  setMobileMenuOpen(false);
                  document.body.style.overflow = 'unset';
                  setTimeout(() => {
                    window.location.href = '/contact';
                  }, 100);
                } catch (error) {
                  console.error('Navigation error:', error);
                  window.location.href = '/contact';
                }
              }}
            >
              <Phone className="h-6 w-6 mr-4 text-rose-400 group-hover:text-rose-300 transition-colors" />
              <span className="text-white font-medium group-hover:text-rose-100 transition-colors">CONTACT</span>
            </div>
          </div>

          {/* Customer Care Number */}
          {contactInfo?.phone1 && (
            <div className="mt-6 p-6 bg-gradient-to-r from-emerald-500/90 to-teal-600/90 rounded-2xl shadow-xl border border-emerald-300/40 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm mb-2">Customer Care</p>
                  <a 
                    href={`tel:${contactInfo.phone1}`} 
                    className="text-white font-bold text-2xl tracking-wide hover:text-emerald-50 active:scale-95 transition-all duration-300 block"
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      document.body.style.overflow = 'unset';
                    }}
                  >
                    {contactInfo.phone1}
                  </a>
                  <p className="text-emerald-50 text-xs mt-1 opacity-90">Tap to call now</p>
                </div>
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                  <Phone className="h-7 w-7 text-white animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Login Section */}
          <div className="mt-6 pt-4 border-t-2 border-gray-200">
            <div 
              onClick={(e) => {
                setMobileMenuOpen(false);
                document.body.style.overflow = 'unset';
              }}
              className="w-full"
            >
              <LoginButton />
            </div>
          </div>
        </nav>
      </div>
      </div>
    </header>
  );
}
