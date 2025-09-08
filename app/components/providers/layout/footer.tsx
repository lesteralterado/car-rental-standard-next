"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaPaperPlane } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-primary text-white pt-16">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Section */}
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5 pb-12">
          
          {/* About Us */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-2 relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-accent">
              About Us
            </h4>
            <p className="text-slate-400 mb-5">
              Three Brother&apos;s provides premium luxury car rentals with exceptional service and the finest vehicles for any occasion.
            </p>
            <div className="flex gap-3 text-white">
              <Link href="#" className="hover:text-accent transition"><FaFacebookF /></Link>
              <Link href="#" className="hover:text-accent transition"><FaInstagram /></Link>
              <Link href="#" className="hover:text-accent transition"><FaTwitter /></Link>
              <Link href="#" className="hover:text-accent transition"><FaLinkedinIn /></Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-2 relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-accent">
              Quick Links
            </h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><Link href="#home" className="hover:text-accent">Home</Link></li>
              <li><Link href="#about" className="hover:text-accent">About Us</Link></li>
              <li><Link href="#services" className="hover:text-accent">Our Fleet</Link></li>
              <li><Link href="#gallery" className="hover:text-accent">Gallery</Link></li>
              <li><Link href="#contact" className="hover:text-accent">Contact</Link></li>
              <li><Link href="#faqs" className="hover:text-accent">FAQs</Link></li>
            </ul>
          </div>

          {/* Our Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-2 relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-accent">
              Our Services
            </h4>
            <ul className="space-y-3 text-slate-400 text-sm">
              <li><Link href="#" className="hover:text-accent">Luxury Car Rentals</Link></li>
              <li><Link href="#" className="hover:text-accent">Corporate Rentals</Link></li>
              <li><Link href="#" className="hover:text-accent">Wedding Car Services</Link></li>
              <li><Link href="#" className="hover:text-accent">Airport Transfers</Link></li>
              <li><Link href="#" className="hover:text-accent">Special Event Rentals</Link></li>
              <li><Link href="#" className="hover:text-accent">Chauffeur Services</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-2 relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-accent">
              Contact Info
            </h4>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <FaMapMarkerAlt className="text-accent mt-1" />
                <div>
                  <p>123 Luxury Drive, Beverly Hills</p>
                  <p>CA 90210, United States</p>
                </div>
              </li>
              <li className="flex gap-3">
                <FaPhoneAlt className="text-accent mt-1" />
                <div>
                  <p>+63 (800) THREE BROTHER&apos;S</p>
                  <p>+63 9618179619</p>
                </div>
              </li>
              <li className="flex gap-3">
                <FaEnvelope className="text-accent mt-1" />
                <div>
                  <p>bookings@threebrothers.com</p>
                  <p>info@threebrother&apos;s.com</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-lg font-semibold mb-6 pb-2 relative after:absolute after:bottom-0 after:left-0 after:w-12 after:h-0.5 after:bg-accent">
              Newsletter
            </h4>
            <p className="text-slate-400 mb-5 text-sm">
              Subscribe to receive special offers and updates on new additions to our fleet.
            </p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email address"
                required
                className="flex-grow px-4 py-3 rounded-l-md bg-white/10 text-white placeholder-slate-400 border-none focus:ring-2 focus:ring-accent outline-none"
              />
              <button type="submit" className="px-4 py-3 bg-accent text-dark rounded-r-md hover:bg-yellow-500 transition">
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-white/10 py-5 text-center text-slate-400 text-sm">
        &copy; 2025 Three Brother&apos;s Luxury Car Rentals. All rights reserved.
      </div>
    </footer>
  );
}
