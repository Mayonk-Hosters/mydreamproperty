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
    <header className={`sticky top-0 bg-white shadow-sm z-50 transition-all duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="text-primary text-xl sm:text-2xl" />
              <span className="font-bold text-lg sm:text-xl text-primary truncate max-w-[150px] sm:max-w-none">{settings.siteName}</span>
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
              <div className="hidden lg:flex items-center space-x-2 text-white bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:from-blue-700 hover:to-blue-800 transform hover:scale-105">
                <Phone className="h-4 w-4 animate-pulse" />
                <span className="text-sm font-semibold tracking-wide">
                  <a href={`tel:${contactInfo.phone1}`} className="hover:text-blue-100 transition-colors">
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
