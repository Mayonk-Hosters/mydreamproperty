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
    <header className={`sticky top-0 relative overflow-hidden z-50 transition-all duration-700 ${scrolled ? 'shadow-2xl shadow-purple-500/20' : 'shadow-xl shadow-indigo-500/10'}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-blue-500/5 to-purple-600/10 backdrop-blur-xl"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-violet-400/60 to-transparent"></div>
      <div className="relative bg-gradient-to-r from-slate-50/90 via-white/95 to-indigo-50/90 backdrop-blur-lg border-b border-violet-200/30">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-300/5 via-transparent to-blue-300/5"></div>
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="relative">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative p-2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-110">
                <Home className="text-white text-lg sm:text-xl drop-shadow-sm" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="font-extrabold text-lg sm:text-xl bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-700 bg-clip-text text-transparent truncate max-w-[150px] sm:max-w-none group-hover:from-purple-700 group-hover:via-blue-600 group-hover:to-indigo-800 transition-all duration-300">{settings.siteName}</span>
            </Link>
            <nav className="hidden md:flex space-x-4 lg:space-x-6 ml-4 lg:ml-6">
              <Link href="/properties?type=buy" className={`font-medium text-sm lg:text-base ${location === '/properties' || (location.includes('/properties') && location.includes('type=buy')) ? 'text-primary' : 'text-gray-800 hover:text-primary'}`}>
                Buy
              </Link>
              <Link href="/properties?type=rent" className={`font-medium text-sm lg:text-base ${location.includes('type=rent') ? 'text-primary' : 'text-gray-800 hover:text-primary'}`}>
                Rent
              </Link>
              {/* Sell link removed */}
              {/* Agents link removed and moved to footer */}
              <Link 
                href="/home-loan" 
                className={`font-medium text-sm lg:text-base ${
                  location === '/home-loan' 
                    ? 'text-primary' 
                    : 'text-gray-800 hover:text-primary'
                }`}
              >
                Home Loan
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger className={`font-medium text-sm lg:text-base flex items-center ${location === '/#services' || location === '/property-calculator' ? 'text-primary' : 'text-gray-800 hover:text-primary'}`}>
                  Property Services <ChevronDown className="h-4 w-4 ml-1" />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href="/#services" className="flex items-center w-full cursor-pointer">
                      All Services
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/property-calculator" className="flex items-center w-full cursor-pointer">
                      <ArrowRightLeft className="h-4 w-4 mr-2" />
                      Property Calculators
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link href="/contact" className={`font-medium text-sm lg:text-base ${location === '/contact' ? 'text-primary' : 'text-gray-800 hover:text-primary'}`}>
                Contact
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Customer Care Number */}
            {contactInfo?.phone1 && (
              <div className="hidden lg:flex items-center space-x-3 text-white bg-gradient-to-br from-rose-500 via-pink-600 to-purple-700 px-6 py-3 rounded-3xl shadow-2xl shadow-pink-500/30 hover:shadow-2xl hover:shadow-rose-500/50 transition-all duration-500 hover:from-rose-600 hover:via-pink-700 hover:to-purple-800 transform hover:scale-110 hover:-translate-y-1 border border-pink-400/40 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[150%] transition-all duration-700"></div>
                <Phone className="h-5 w-5 animate-pulse drop-shadow-lg relative z-10" />
                <span className="text-sm font-extrabold tracking-wide drop-shadow-lg relative z-10">
                  <a href={`tel:${contactInfo.phone1}`} className="hover:text-pink-100 transition-colors">
                    {contactInfo.phone1}
                  </a>
                </span>
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
      
      {/* Simple Mobile Menu - Slide Down */}
      <div 
        className={`md:hidden bg-white border-t border-gray-200 shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? 'max-h-[100vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-800">Navigation Menu</span>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMobileMenuOpen(false);
                document.body.style.overflow = 'unset';
              }}
              className="p-1 text-gray-600 hover:text-gray-800 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <nav className="px-4 py-4 space-y-3 bg-white max-h-[70vh] overflow-y-auto">
          {/* BUY Properties */}
          <a 
            href="/properties?type=buy"
            className="mobile-nav-item flex items-center w-full py-4 px-4 text-left font-bold text-lg text-gray-800 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 active:scale-95 transition-all duration-200 touch-manipulation cursor-pointer no-underline"
            onClick={() => {
              console.log('BUY clicked - direct link');
              setMobileMenuOpen(false);
              document.body.style.overflow = 'unset';
            }}
          >
            <Home className="h-6 w-6 mr-4 text-blue-600" />
            <span className="text-blue-800">BUY Properties</span>
          </a>

          {/* RENT Properties */}
          <a 
            href="/properties?type=rent"
            className="mobile-nav-item flex items-center w-full py-4 px-4 text-left font-bold text-lg text-gray-800 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:from-green-100 hover:to-green-200 hover:border-green-300 active:scale-95 transition-all duration-200 touch-manipulation cursor-pointer no-underline"
            onClick={() => {
              console.log('RENT clicked - direct link');
              setMobileMenuOpen(false);
              document.body.style.overflow = 'unset';
            }}
          >
            <MapPin className="h-6 w-6 mr-4 text-green-600" />
            <span className="text-green-800">RENT Properties</span>
          </a>

          {/* HOME LOAN */}
          <a 
            href="/home-loan"
            className="mobile-nav-item flex items-center w-full py-4 px-4 text-left font-bold text-lg text-gray-800 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl border-2 border-purple-200 hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 active:scale-95 transition-all duration-200 touch-manipulation cursor-pointer no-underline"
            onClick={() => {
              console.log('HOME LOAN clicked - direct link');
              setMobileMenuOpen(false);
              document.body.style.overflow = 'unset';
            }}
          >
            <Calculator className="h-6 w-6 mr-4 text-purple-600" />
            <span className="text-purple-800">HOME LOAN</span>
          </a>

          {/* PROPERTY (All Properties) */}
          <a 
            href="/properties"
            className="mobile-nav-item flex items-center w-full py-4 px-4 text-left font-bold text-lg text-gray-800 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 hover:from-orange-100 hover:to-orange-200 hover:border-orange-300 active:scale-95 transition-all duration-200 touch-manipulation cursor-pointer no-underline"
            onClick={() => {
              console.log('PROPERTY clicked - direct link');
              setMobileMenuOpen(false);
              document.body.style.overflow = 'unset';
            }}
          >
            <BarChart className="h-6 w-6 mr-4 text-orange-600" />
            <span className="text-orange-800">PROPERTY</span>
          </a>

          {/* SERVICES */}
          <a 
            href="/#services"
            className="mobile-nav-item flex items-center w-full py-4 px-4 text-left font-bold text-lg text-gray-800 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-xl border-2 border-cyan-200 hover:from-cyan-100 hover:to-cyan-200 hover:border-cyan-300 active:scale-95 transition-all duration-200 touch-manipulation cursor-pointer no-underline"
            onClick={() => {
              console.log('SERVICES clicked - direct link');
              setMobileMenuOpen(false);
              document.body.style.overflow = 'unset';
            }}
          >
            <BarChart className="h-6 w-6 mr-4 text-cyan-600" />
            <span className="text-cyan-800">SERVICES</span>
          </a>

          {/* CONTACT */}
          <a 
            href="/contact"
            className="mobile-nav-item flex items-center w-full py-4 px-4 text-left font-bold text-lg text-gray-800 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border-2 border-red-200 hover:from-red-100 hover:to-red-200 hover:border-red-300 active:scale-95 transition-all duration-200 touch-manipulation cursor-pointer no-underline"
            onClick={() => {
              console.log('CONTACT clicked - direct link');
              setMobileMenuOpen(false);
              document.body.style.overflow = 'unset';
            }}
          >
            <Phone className="h-6 w-6 mr-4 text-red-600" />
            <span className="text-red-800">CONTACT</span>
          </a>

          {/* Customer Care Number */}
          {contactInfo?.phone1 && (
            <div className="mt-6 p-5 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-xl shadow-lg border-2 border-emerald-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-semibold text-sm mb-2">Customer Care</p>
                  <a 
                    href={`tel:${contactInfo.phone1}`} 
                    className="text-white font-black text-2xl tracking-wide hover:text-emerald-100 active:scale-95 transition-all duration-200 block"
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      document.body.style.overflow = 'unset';
                    }}
                  >
                    {contactInfo.phone1}
                  </a>
                  <p className="text-emerald-100 text-xs mt-1">Tap to call now</p>
                </div>
                <div className="bg-white bg-opacity-25 rounded-full p-4">
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
