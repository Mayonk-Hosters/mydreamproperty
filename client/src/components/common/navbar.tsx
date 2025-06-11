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
    
    // Prevent body scroll when menu is open on mobile
    if (newState) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
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
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
                className="focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          </div>
        </div>
      </div>
      
      {/* Enhanced Mobile Menu with Full Screen Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setMobileMenuOpen(false);
              document.body.style.overflow = 'unset';
            }}
          />
          
          {/* Menu Content */}
          <div className="mobile-menu-container absolute top-0 left-0 right-0 bg-white shadow-2xl">
            <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between p-4">
                <span className="text-lg font-bold text-gray-800">Menu</span>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.body.style.overflow = 'unset';
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
            
            <div className="max-h-[80vh] overflow-y-auto bg-white">
              <nav className="px-4 py-4 space-y-2">
                {/* Buy Properties */}
                <Link 
                  href="/properties?type=buy" 
                  className={`flex items-center w-full py-4 px-4 text-left font-semibold text-lg rounded-xl transition-all duration-200 active:scale-95 ${
                    location === '/properties' || (location.includes('/properties') && location.includes('type=buy')) 
                      ? 'text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg' 
                      : 'text-gray-800 bg-gray-50 hover:bg-blue-50 hover:text-blue-700 border border-gray-200'
                  }`}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.body.style.overflow = 'unset';
                  }}
                >
                  <Home className="h-5 w-5 mr-3" />
                  BUY Properties
                </Link>

                {/* Rent Properties */}
                <Link 
                  href="/properties?type=rent" 
                  className={`flex items-center w-full py-4 px-4 text-left font-semibold text-lg rounded-xl transition-all duration-200 active:scale-95 ${
                    location.includes('type=rent') 
                      ? 'text-white bg-gradient-to-r from-green-600 to-green-700 shadow-lg' 
                      : 'text-gray-800 bg-gray-50 hover:bg-green-50 hover:text-green-700 border border-gray-200'
                  }`}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.body.style.overflow = 'unset';
                  }}
                >
                  <MapPin className="h-5 w-5 mr-3" />
                  RENT Properties
                </Link>

                {/* Home Loan */}
                <Link 
                  href="/home-loan" 
                  className={`flex items-center w-full py-4 px-4 text-left font-semibold text-lg rounded-xl transition-all duration-200 active:scale-95 ${
                    location === '/home-loan' 
                      ? 'text-white bg-gradient-to-r from-purple-600 to-purple-700 shadow-lg' 
                      : 'text-gray-800 bg-gray-50 hover:bg-purple-50 hover:text-purple-700 border border-gray-200'
                  }`}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.body.style.overflow = 'unset';
                  }}
                >
                  <Calculator className="h-5 w-5 mr-3" />
                  HOME LOAN
                </Link>

                {/* Property Services */}
                <Link 
                  href="/#services" 
                  className={`flex items-center w-full py-4 px-4 text-left font-semibold text-lg rounded-xl transition-all duration-200 active:scale-95 ${
                    location === '/#services' 
                      ? 'text-white bg-gradient-to-r from-orange-600 to-orange-700 shadow-lg' 
                      : 'text-gray-800 bg-gray-50 hover:bg-orange-50 hover:text-orange-700 border border-gray-200'
                  }`}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.body.style.overflow = 'unset';
                  }}
                >
                  <BarChart className="h-5 w-5 mr-3" />
                  PROPERTY SERVICES
                </Link>

                {/* Property Calculator */}
                <Link 
                  href="/property-calculator" 
                  className={`flex items-center w-full py-4 px-4 text-left font-semibold text-lg rounded-xl transition-all duration-200 active:scale-95 ${
                    location === '/property-calculator' 
                      ? 'text-white bg-gradient-to-r from-indigo-600 to-indigo-700 shadow-lg' 
                      : 'text-gray-800 bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 border border-gray-200'
                  }`}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.body.style.overflow = 'unset';
                  }}
                >
                  <ArrowRightLeft className="h-5 w-5 mr-3" />
                  Property Calculator
                </Link>

                {/* Contact */}
                <Link 
                  href="/contact" 
                  className={`flex items-center w-full py-4 px-4 text-left font-semibold text-lg rounded-xl transition-all duration-200 active:scale-95 ${
                    location === '/contact' 
                      ? 'text-white bg-gradient-to-r from-red-600 to-red-700 shadow-lg' 
                      : 'text-gray-800 bg-gray-50 hover:bg-red-50 hover:text-red-700 border border-gray-200'
                  }`}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    document.body.style.overflow = 'unset';
                  }}
                >
                  <Phone className="h-5 w-5 mr-3" />
                  CONTACT
                </Link>

                {/* Customer Care Section */}
                {contactInfo?.phone1 && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-medium text-sm mb-1">Customer Care</p>
                        <a 
                          href={`tel:${contactInfo.phone1}`} 
                          className="text-white font-bold text-xl tracking-wide hover:text-emerald-100 transition-colors active:scale-95"
                          onClick={() => {
                            setMobileMenuOpen(false);
                            document.body.style.overflow = 'unset';
                          }}
                        >
                          {contactInfo.phone1}
                        </a>
                      </div>
                      <div className="bg-white bg-opacity-20 rounded-full p-3">
                        <Phone className="h-6 w-6 text-white animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Login Button */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div onClick={() => {
                    setMobileMenuOpen(false);
                    document.body.style.overflow = 'unset';
                  }}>
                    <LoginButton />
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
      </div>
    </header>
  );
}
