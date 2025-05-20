import { Home, Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "wouter";
import { useSiteSettings } from "@/hooks/use-site-settings";

export function Footer() {
  const { settings } = useSiteSettings();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white pt-10 pb-6">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="mb-6 sm:mb-0">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Home className="mr-2 h-5 w-5" /> {settings.siteName}
            </h3>
            <p className="text-gray-400 mb-4 text-sm md:text-base">
              Your trusted partner in finding the perfect property. With our expert agents and extensive listings, we make real estate simple.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-all p-1.5">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-all p-1.5">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-all p-1.5">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-all p-1.5">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="mb-6 sm:mb-0">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-all inline-block py-1">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/properties" className="text-gray-400 hover:text-white transition-all inline-block py-1">
                  Properties
                </Link>
              </li>
              <li>
                <Link href="/agents" className="text-gray-400 hover:text-white font-medium transition-all bg-gray-800 px-2 py-1 rounded inline-block">
                  Find Agents
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-all inline-block py-1">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Properties */}
          <div className="mb-6 sm:mb-0">
            <h3 className="text-lg font-semibold mb-4">Properties</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/properties?type=buy" className="text-gray-400 hover:text-white transition-all inline-block py-1">
                  Houses for Sale
                </Link>
              </li>
              <li>
                <Link href="/properties?type=rent" className="text-gray-400 hover:text-white transition-all inline-block py-1">
                  Apartments for Rent
                </Link>
              </li>
              <li>
                <Link href="/properties?propertyType=Commercial" className="text-gray-400 hover:text-white transition-all inline-block py-1">
                  Commercial Properties
                </Link>
              </li>
              <li>
                <Link href="/properties?propertyType=Villa" className="text-gray-400 hover:text-white transition-all inline-block py-1">
                  Luxury Villas
                </Link>
              </li>
              <li>
                <Link href="/properties?status=new" className="text-gray-400 hover:text-white transition-all inline-block py-1">
                  New Developments
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="mt-0.5 mr-2 h-4 w-4 flex-shrink-0" />
                <span className="text-gray-400 text-sm md:text-base">
                  {settings.contactInfo?.address || "123 Real Estate Ave, New York, NY 10001"}
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="text-gray-400 text-sm md:text-base">
                  {settings.contactInfo?.phone1 || "9822854499"}
                </span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="text-gray-400 text-sm md:text-base break-all">
                  {settings.contactInfo?.email1 || "info@mydreamproperty.co.in"}
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-800 text-center text-gray-500 text-xs sm:text-sm">
          <p>&copy; {currentYear} {settings.siteName}. All rights reserved.</p>
          <p className="mt-2 text-xs">
            Optimized for iOS and Android devices
            <span className="mx-1">·</span>
            <a 
              href="/admin-access" 
              className="text-gray-500 hover:text-gray-400"
              title="Site version 2.5.1"
            >
              v2.5.1
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
