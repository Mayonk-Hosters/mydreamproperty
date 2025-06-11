import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Home, Menu, X, LogIn, User, ChevronDown, ArrowRightLeft, Calculator, MapPin, BarChart, Phone, Wrench } from "lucide-react";
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
          <div className="flex items-center flex-shrink-0 min-w-0">
            <Link href="/" className="flex items-center space-x-3 group">
              {/* Attractive Logo with Gradient */}
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <Home className="text-white h-7 w-7" />
                </div>
                {/* Decorative dot */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              {/* Brand Name */}
              <div className="flex flex-col">
                <span className="font-bold text-xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent group-hover:from-blue-700 group-hover:via-purple-700 group-hover:to-pink-700 transition-all duration-300">
                  My Dream Property
                </span>
                <span className="text-xs text-gray-500 font-medium hidden sm:block">Find Your Dream Property Today</span>
              </div>
            </Link>
          </div>

          {/* Center Section - Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1 px-4">
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
              
              {/* Property Services Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className={`font-medium text-base px-4 py-2 rounded-md transition-colors duration-200 ${location.includes('/calculator') || location.includes('/services') ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'}`}
                  >
                    Property Services
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/emi-calculator" className="flex items-center w-full">
                      <Calculator className="mr-2 h-4 w-4" />
                      <span>EMI Calculator</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/area-calculator" className="flex items-center w-full">
                      <ArrowRightLeft className="mr-2 h-4 w-4" />
                      <span>Area Calculator</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
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
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Customer Care Number */}
            {contactInfo?.phone1 && (
              <a 
                href={`tel:${contactInfo.phone1}`}
                className="hidden lg:flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-sm"
              >
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {contactInfo.phone1}
                </span>
              </a>
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
      
      {/* Clean White Mobile Menu - Slide Down */}
      <div 
        className={`md:hidden bg-white border-t border-gray-200 shadow-xl transition-all duration-300 ease-in-out overflow-hidden pointer-events-auto ${
          mobileMenuOpen ? 'max-h-[100vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ pointerEvents: mobileMenuOpen ? 'auto' : 'none' }}
      >
        <div className="px-4 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xl font-bold text-gray-800 tracking-wide">Navigation</span>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMobileMenuOpen(false);
                document.body.style.overflow = 'unset';
              }}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200"
              aria-label="Close menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        <nav className="px-4 py-6 space-y-4 bg-white max-h-[70vh] overflow-y-auto" style={{ pointerEvents: 'auto', position: 'relative', zIndex: 1000 }}>
          
          {/* Clean White Navigation Items */}
          <div className="space-y-3">
            {/* BUY Properties */}
            <div 
              className="mobile-nav-item flex items-center w-full py-4 px-5 text-left font-semibold text-lg bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-xl border border-blue-200 hover:border-blue-300 shadow-lg transition-all duration-300 touch-manipulation cursor-pointer group"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('BUY clicked');
                setMobileMenuOpen(false);
                document.body.style.overflow = 'unset';
                window.location.href = '/properties?type=buy';
              }}
            >
              <Home className="h-6 w-6 mr-4 text-blue-600 group-hover:text-blue-700 transition-colors" />
              <span className="text-blue-800 font-medium group-hover:text-blue-900 transition-colors">BUY Properties</span>
            </div>

            {/* RENT Properties */}
            <div 
              className="mobile-nav-item flex items-center w-full py-4 px-5 text-left font-semibold text-lg bg-gradient-to-r from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 rounded-xl border border-emerald-200 hover:border-emerald-300 shadow-lg transition-all duration-300 touch-manipulation cursor-pointer group"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('RENT clicked');
                setMobileMenuOpen(false);
                document.body.style.overflow = 'unset';
                window.location.href = '/properties?type=rent';
              }}
            >
              <MapPin className="h-6 w-6 mr-4 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
              <span className="text-emerald-800 font-medium group-hover:text-emerald-900 transition-colors">RENT Properties</span>
            </div>

            {/* PROPERTY SERVICES */}
            <div className="space-y-2">
              <div className="text-sm font-medium text-gray-700 px-2">Property Services</div>
              
              {/* EMI Calculator */}
              <div 
                className="mobile-nav-item flex items-center w-full py-3 px-5 text-left font-semibold text-base bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl border border-indigo-200 hover:border-indigo-300 shadow-lg transition-all duration-300 touch-manipulation cursor-pointer group"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('EMI Calculator clicked');
                  setMobileMenuOpen(false);
                  document.body.style.overflow = 'unset';
                  window.location.href = '/emi-calculator';
                }}
              >
                <Calculator className="h-5 w-5 mr-3 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
                <span className="text-indigo-800 font-medium group-hover:text-indigo-900 transition-colors">EMI Calculator</span>
              </div>

              {/* Area Calculator */}
              <div 
                className="mobile-nav-item flex items-center w-full py-3 px-5 text-left font-semibold text-base bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 rounded-xl border border-indigo-200 hover:border-indigo-300 shadow-lg transition-all duration-300 touch-manipulation cursor-pointer group"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Area Calculator clicked');
                  setMobileMenuOpen(false);
                  document.body.style.overflow = 'unset';
                  window.location.href = '/area-calculator';
                }}
              >
                <ArrowRightLeft className="h-5 w-5 mr-3 text-indigo-600 group-hover:text-indigo-700 transition-colors" />
                <span className="text-indigo-800 font-medium group-hover:text-indigo-900 transition-colors">Area Calculator</span>
              </div>
            </div>

            {/* HOME LOAN */}
            <div 
              className="mobile-nav-item flex items-center w-full py-4 px-5 text-left font-semibold text-lg bg-gradient-to-r from-violet-50 to-violet-100 hover:from-violet-100 hover:to-violet-200 rounded-xl border border-violet-200 hover:border-violet-300 shadow-lg transition-all duration-300 touch-manipulation cursor-pointer group"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('HOME LOAN clicked');
                setMobileMenuOpen(false);
                document.body.style.overflow = 'unset';
                window.location.href = '/home-loan';
              }}
            >
              <Calculator className="h-6 w-6 mr-4 text-violet-600 group-hover:text-violet-700 transition-colors" />
              <span className="text-violet-800 font-medium group-hover:text-violet-900 transition-colors">HOME LOAN</span>
            </div>

            {/* PROPERTIES */}
            <div 
              className="mobile-nav-item flex items-center w-full py-4 px-5 text-left font-semibold text-lg bg-gradient-to-r from-orange-50 to-amber-100 hover:from-orange-100 hover:to-amber-200 rounded-xl border border-orange-200 hover:border-orange-300 shadow-lg transition-all duration-300 touch-manipulation cursor-pointer group"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('PROPERTIES clicked');
                setMobileMenuOpen(false);
                document.body.style.overflow = 'unset';
                window.location.href = '/properties';
              }}
            >
              <BarChart className="h-6 w-6 mr-4 text-orange-600 group-hover:text-orange-700 transition-colors" />
              <span className="text-orange-800 font-medium group-hover:text-orange-900 transition-colors">PROPERTIES</span>
            </div>

            {/* CONTACT */}
            <div 
              className="mobile-nav-item flex items-center w-full py-4 px-5 text-left font-semibold text-lg bg-gradient-to-r from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 rounded-xl border border-rose-200 hover:border-rose-300 shadow-lg transition-all duration-300 touch-manipulation cursor-pointer group"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('CONTACT clicked');
                setMobileMenuOpen(false);
                document.body.style.overflow = 'unset';
                window.location.href = '/contact';
              }}
            >
              <Phone className="h-6 w-6 mr-4 text-rose-600 group-hover:text-rose-700 transition-colors" />
              <span className="text-rose-800 font-medium group-hover:text-rose-900 transition-colors">CONTACT</span>
            </div>
          </div>

          {/* Customer Care Number */}
          {contactInfo?.phone1 && (
            <div className="mt-6 p-5 bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl shadow-lg border border-green-200">
              <div className="text-center">
                <p className="text-green-800 font-semibold text-sm mb-3">Customer Care</p>
                <a 
                  href={`tel:${contactInfo.phone1}`} 
                  className="text-green-900 font-bold text-2xl tracking-wide hover:text-green-700 active:scale-95 transition-all duration-300 block mb-2"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    document.body.style.overflow = 'unset';
                  }}
                >
                  {contactInfo.phone1}
                </a>
                <div className="flex items-center justify-center gap-2">
                  <Phone className="h-4 w-4 text-green-700" />
                  <p className="text-green-700 text-xs opacity-90">Tap to call now</p>
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
