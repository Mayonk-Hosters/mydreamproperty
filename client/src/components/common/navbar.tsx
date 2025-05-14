import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Home, Menu, X, LogIn, User, ChevronDown, ArrowRightLeft, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useSiteSettings } from "@/hooks/use-site-settings";
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
              <a 
                href="https://moneycapital.co.in/sign-in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-medium text-sm lg:text-base text-primary hover:text-primary-dark flex items-center"
              >
                <span className="relative">
                  Home Loan
                  <span className="absolute -top-1.5 -right-2 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                </span>
              </a>
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
            <Link href="/admin" className="hidden sm:block">
              <Button variant="outline" size="sm" className="px-3 py-1.5 bg-gray-100 rounded text-sm hover:bg-gray-200 transition-all">
                <User className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            </Link>
            <Button size="sm" className="px-2 sm:px-3 py-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-all flex items-center text-xs sm:text-sm">
              <LogIn className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Login
            </Button>
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
            <a 
              href="https://moneycapital.co.in/sign-in" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="py-2.5 px-2 font-medium text-base text-primary hover:text-primary-dark flex items-center rounded-md hover:bg-gray-50"
            >
              <span className="relative">
                Home Loan
                <span className="absolute -top-1.5 -right-2 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              </span>
            </a>
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
            <Link 
              href="/admin" 
              className="py-2.5 px-2 font-medium text-base rounded-md text-gray-800 hover:text-primary hover:bg-gray-50 sm:hidden"
            >
              Admin Panel
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
