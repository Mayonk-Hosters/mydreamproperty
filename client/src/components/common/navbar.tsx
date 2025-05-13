import { useState } from "react";
import { Link } from "wouter";
import { Home, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  return (
    <header className="sticky top-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <Home className="text-primary text-2xl" />
              <span className="font-bold text-xl text-primary">RealEstate Pro</span>
            </Link>
            <nav className="hidden md:flex space-x-6 ml-6">
              <Link href="/">
                <a className={`font-medium ${location === '/' ? 'text-primary' : 'text-gray-800 hover:text-primary'}`}>
                  Home
                </a>
              </Link>
              <Link href="/properties?type=buy">
                <a className={`font-medium ${location === '/properties' || (location.includes('/properties') && location.includes('type=buy')) ? 'text-primary' : 'text-gray-800 hover:text-primary'}`}>
                  Buy
                </a>
              </Link>
              <Link href="/properties?type=rent">
                <a className={`font-medium ${location.includes('type=rent') ? 'text-primary' : 'text-gray-800 hover:text-primary'}`}>
                  Rent
                </a>
              </Link>
              {/* Sell link removed */}
              {/* Agents link removed and moved to footer */}
              <a 
                href="https://moneycapital.co.in/sign-in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-medium text-primary hover:text-primary-dark flex items-center"
              >
                <span className="relative">
                  Home Loan
                  <span className="absolute -top-1.5 -right-2 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                </span>
              </a>
              <Link href="/contact">
                <a className={`font-medium ${location === '/contact' ? 'text-primary' : 'text-gray-800 hover:text-primary'}`}>
                  Contact
                </a>
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/admin">
              <Button variant="outline" size="sm" className="px-3 py-1.5 bg-gray-100 rounded text-sm hover:bg-gray-200 transition-all">
                Admin
              </Button>
            </Link>
            <Button size="sm" className="px-3 py-1.5 bg-primary text-white rounded hover:bg-primary/90 transition-all flex items-center">
              Login
            </Button>
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-2">
            <nav className="flex flex-col space-y-2">
              <Link href="/">
                <a className={`py-2 font-medium ${location === '/' ? 'text-primary' : 'text-gray-800 hover:text-primary'}`}>
                  Home
                </a>
              </Link>
              <Link href="/properties?type=buy">
                <a className={`py-2 font-medium ${location === '/properties' || (location.includes('/properties') && location.includes('type=buy')) ? 'text-primary' : 'text-gray-800 hover:text-primary'}`}>
                  Buy
                </a>
              </Link>
              <Link href="/properties?type=rent">
                <a className={`py-2 font-medium ${location.includes('type=rent') ? 'text-primary' : 'text-gray-800 hover:text-primary'}`}>
                  Rent
                </a>
              </Link>
              {/* Sell link removed */}
              {/* Agents link removed and moved to footer */}
              <a 
                href="https://moneycapital.co.in/sign-in" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="py-2 font-medium text-primary hover:text-primary-dark flex items-center"
              >
                <span className="relative">
                  Home Loan
                  <span className="absolute -top-1.5 -right-2 h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                </span>
              </a>
              <Link href="/contact">
                <a className={`py-2 font-medium ${location === '/contact' ? 'text-primary' : 'text-gray-800 hover:text-primary'}`}>
                  Contact
                </a>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
