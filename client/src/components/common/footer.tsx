import { Home, Facebook, Twitter, Instagram, Linkedin, MapPin, Phone, Mail } from "lucide-react";
import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Home className="mr-2" /> RealEstate Pro
            </h3>
            <p className="text-gray-400 mb-4">
              Your trusted partner in finding the perfect property. With our expert agents and extensive listings, we make real estate simple.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-all">
                <Facebook />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-all">
                <Twitter />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-all">
                <Instagram />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-all">
                <Linkedin />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/"><a className="text-gray-400 hover:text-white transition-all">Home</a></Link></li>
              <li><Link href="/properties"><a className="text-gray-400 hover:text-white transition-all">Properties</a></Link></li>
              <li><Link href="/agents"><a className="text-gray-400 hover:text-white transition-all">Agents</a></Link></li>
              <li><Link href="/blog"><a className="text-gray-400 hover:text-white transition-all">Blog</a></Link></li>
              <li><Link href="/about"><a className="text-gray-400 hover:text-white transition-all">About Us</a></Link></li>
              <li><Link href="/contact"><a className="text-gray-400 hover:text-white transition-all">Contact</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Properties</h3>
            <ul className="space-y-2">
              <li><Link href="/properties?type=sale"><a className="text-gray-400 hover:text-white transition-all">Houses for Sale</a></Link></li>
              <li><Link href="/properties?type=rent"><a className="text-gray-400 hover:text-white transition-all">Apartments for Rent</a></Link></li>
              <li><Link href="/properties?propertyType=Commercial"><a className="text-gray-400 hover:text-white transition-all">Commercial Properties</a></Link></li>
              <li><Link href="/properties?propertyType=Villa"><a className="text-gray-400 hover:text-white transition-all">Luxury Villas</a></Link></li>
              <li><Link href="/properties?status=new"><a className="text-gray-400 hover:text-white transition-all">New Developments</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="mt-1 mr-2 h-4 w-4" />
                <span className="text-gray-400">123 Real Estate Ave, New York, NY 10001</span>
              </li>
              <li className="flex items-center">
                <Phone className="mr-2 h-4 w-4" />
                <span className="text-gray-400">(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="mr-2 h-4 w-4" />
                <span className="text-gray-400">info@realestatepro.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-6 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} RealEstate Pro. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
