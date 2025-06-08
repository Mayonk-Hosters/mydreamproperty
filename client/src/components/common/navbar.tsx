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

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className={`sticky top-0 bg-gradient-to-r from-blue-50/80 via-white/95 to-purple-50/80 backdrop-blur-md border-b border-gradient-to-r border-blue-200/30 z-50 transition-all duration-500 ${scrolled ? 'shadow-2xl shadow-purple-500/10 bg-gradient-to-r from-blue-50/90 via-white/98 to-purple-50/90' : 'shadow-lg shadow-blue-500/5'}`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative p-2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-2xl shadow-lg shadow-blue-500/30 group-hover:shadow-xl group-hover:shadow-purple-500/40 transition-all duration-300 group-hover:scale-110">
                <Home className="text-white text-lg sm:text-xl drop-shadow-sm" />
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              <span className="font-extrabold text-lg sm:text-xl bg-gradient-to-r from-blue-700 via-purple-600 to-indigo-700 bg-clip-text text-transparent truncate max-w-[150px] sm:max-w-none group-hover:from-purple-700 group-hover:via-blue-600 group-hover:to-indigo-800 transition-all duration-300">{settings.siteName}</span>
            </Link>
            <nav className="hidden md:flex space-x-3 lg:space-x-4 ml-6 lg:ml-8">
              <Link href="/properties?type=buy" className={`relative px-6 py-3 rounded-2xl font-bold text-sm lg:text-base transition-all duration-500 transform hover:scale-110 hover:-translate-y-0.5 ${location === '/properties' || (location.includes('/properties') && location.includes('type=buy')) ? 'bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 text-white shadow-xl shadow-blue-500/40 border border-blue-400/50' : 'bg-gradient-to-br from-white via-blue-50/50 to-white text-gray-700 border border-blue-200/60 hover:border-blue-400 hover:from-blue-100 hover:via-blue-50 hover:to-blue-100 hover:text-blue-800 shadow-lg hover:shadow-xl hover:shadow-blue-500/25'} overflow-hidden group`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[150%] transition-all duration-700"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                  </svg>
                  Buy Properties
                </span>
              </Link>
              <Link href="/properties?type=rent" className={`relative px-6 py-3 rounded-2xl font-bold text-sm lg:text-base transition-all duration-500 transform hover:scale-110 hover:-translate-y-0.5 ${location.includes('type=rent') ? 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 text-white shadow-xl shadow-emerald-500/40 border border-emerald-400/50' : 'bg-gradient-to-br from-white via-emerald-50/50 to-white text-gray-700 border border-emerald-200/60 hover:border-emerald-400 hover:from-emerald-100 hover:via-emerald-50 hover:to-emerald-100 hover:text-emerald-800 shadow-lg hover:shadow-xl hover:shadow-emerald-500/25'} overflow-hidden group`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transform -skew-x-12 translate-x-[-100%] group-hover:translate-x-[150%] transition-all duration-700"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Rent Properties
                </span>
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
      
      {/* Mobile Menu - Slide down animation */}
      <div 
        className={`md:hidden bg-white border-t overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container mx-auto px-4 py-2">
          <nav className="flex flex-col space-y-3 py-2">
            <Link 
              href="/properties?type=buy" 
              className={`py-2.5 px-2 font-medium text-base rounded-md ${
                location === '/properties' || (location.includes('/properties') && location.includes('type=buy')) 
                  ? 'text-primary bg-blue-50' 
                  : 'text-gray-800 hover:text-primary hover:bg-gray-50'
              }`}
            >
              Buy
            </Link>
            <Link 
              href="/properties?type=rent" 
              className={`py-2.5 px-2 font-medium text-base rounded-md ${
                location.includes('type=rent') 
                  ? 'text-primary bg-blue-50' 
                  : 'text-gray-800 hover:text-primary hover:bg-gray-50'
              }`}
            >
              Rent
            </Link>
            <Link 
              href="/home-loan" 
              className={`py-2.5 px-2 font-medium text-base rounded-md ${
                location === '/home-loan' 
                  ? 'text-primary bg-blue-50' 
                  : 'text-gray-800 hover:text-primary hover:bg-gray-50'
              }`}
            >
              Home Loan
            </Link>
            <div className="flex flex-col">
              <Link 
                href="/#services" 
                className={`py-2.5 px-2 font-medium text-base rounded-md ${
                  location === '/#services' 
                    ? 'text-primary bg-blue-50' 
                    : 'text-gray-800 hover:text-primary hover:bg-gray-50'
                }`}
              >
                Property Services
              </Link>

              <Link 
                href="/property-calculator" 
                className={`py-2 px-8 font-medium text-sm rounded-md flex items-center ${
                  location === '/property-calculator' 
                    ? 'text-primary bg-blue-50' 
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                }`}
              >
                <ArrowRightLeft className="h-3.5 w-3.5 mr-2" />
                Property Calculators
              </Link>
            </div>
            <Link 
              href="/contact" 
              className={`py-2.5 px-2 font-medium text-base rounded-md ${
                location === '/contact' 
                  ? 'text-primary bg-blue-50' 
                  : 'text-gray-800 hover:text-primary hover:bg-gray-50'
              }`}
            >
              Contact
            </Link>
            {/* Customer Care Number for Mobile */}
            {contactInfo?.phone1 && (
              <div className="py-2.5 px-2">
                <div className="flex items-center space-x-3 text-white bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:from-green-600 hover:to-green-700 transform hover:scale-105">
                  <div className="flex items-center justify-center w-8 h-8 bg-white bg-opacity-20 rounded-full">
                    <Phone className="h-4 w-4 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs font-medium text-green-100 block">Customer Care</span>
                    <span className="text-sm font-bold tracking-wide">
                      <a href={`tel:${contactInfo.phone1}`} className="hover:text-green-100 transition-colors">
                        {contactInfo.phone1}
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div className="py-2.5 px-2">
              <LoginButton />
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
