"use client";

import Link from "next/link";
import { FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaPaperPlane, FaCar, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function Footer() {
  const [isInView, setIsInView] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Our Fleet", href: "/cars" },
    { name: "Contact", href: "/contact" },
    { name: "FAQs", href: "#faqs" },
  ];

  const services = [
    { name: "Luxury Car Rentals", href: "/cars" },
    { name: "Corporate Rentals", href: "/cars" },
    { name: "Wedding Car Services", href: "/cars" },
    { name: "Airport Transfers", href: "/contact" },
    { name: "Special Event Rentals", href: "/cars" },
    { name: "Chauffeur Services", href: "/contact" },
  ];

  return (
    <footer ref={footerRef} className="bg-gray-900 text-white pt-20">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
          
          {/* Brand & About */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <div className="p-2 bg-[#f4b400] rounded-xl">
                <FaCar className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">
                CarRental <span className="text-[#f4b400]">Pro</span>
              </span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Three Brother's provides premium luxury car rentals with exceptional service and the finest vehicles for any occasion. Experience the thrill of driving luxury.
            </p>
            
            {/* Social Links */}
            <div className="flex gap-3">
              {[
                { icon: FaFacebookF, href: "#" },
                { icon: FaInstagram, href: "#" },
                { icon: FaTwitter, href: "#" },
                { icon: FaLinkedinIn, href: "#" }
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -3 }}
                  className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-[#f4b400] transition-colors"
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-lg font-semibold mb-6 relative">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-[#f4b400]"></span>
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <Link 
                    href={link.href} 
                    className="text-gray-400 hover:text-[#f4b400] transition-colors flex items-center gap-2 group"
                  >
                    <FaArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#f4b400]" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Our Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <h4 className="text-lg font-semibold mb-6 relative">
              Our Services
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-[#f4b400]"></span>
            </h4>
            <ul className="space-y-3">
              {services.map((service, index) => (
                <li key={index}>
                  <Link 
                    href={service.href} 
                    className="text-gray-400 hover:text-[#f4b400] transition-colors flex items-center gap-2 group"
                  >
                    <FaArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-[#f4b400]" />
                    {service.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            <h4 className="text-lg font-semibold mb-6 relative">
              Contact Info
              <span className="absolute -bottom-2 left-0 w-12 h-0.5 bg-[#f4b400]"></span>
            </h4>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <FaMapMarkerAlt className="text-[#f4b400] mt-1 flex-shrink-0" />
                <div className="text-gray-400 text-sm">
                  <p>123 Luxury Drive, Beverly Hills</p>
                  <p>CA 90210, United States</p>
                </div>
              </li>
              <li className="flex gap-3">
                <FaPhoneAlt className="text-[#f4b400] mt-1 flex-shrink-0" />
                <div className="text-gray-400 text-sm">
                  <p>+1 (800) THREE BROTHERS</p>
                  <p>+1 (310) 555-1234</p>
                </div>
              </li>
              <li className="flex gap-3">
                <FaEnvelope className="text-[#f4b400] mt-1 flex-shrink-0" />
                <div className="text-gray-400 text-sm">
                  <p>bookings@threebrothers.com</p>
                  <p>info@threebrothers.com</p>
                </div>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5 }}
          className="mt-16 p-8 bg-white/5 rounded-3xl border border-white/10"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-xl font-bold mb-2">Subscribe to Our Newsletter</h4>
              <p className="text-gray-400 text-sm">Get the latest updates on new fleet additions and special offers.</p>
            </div>
            <form className="flex w-full md:w-auto">
              <input 
                type="email" 
                placeholder="Your email address"
                required
                className="flex-grow md:w-72 px-5 py-4 rounded-l-xl bg-white/10 text-white placeholder-gray-400 border border-white/20 focus:outline-none focus:border-[#f4b400] transition-colors"
              />
              <button 
                type="submit" 
                className="px-6 py-4 bg-[#f4b400] text-white font-semibold rounded-r-xl hover:bg-[#d49b00] transition-colors"
              >
                <FaPaperPlane />
              </button>
            </form>
          </div>
        </motion.div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm">
            &copy; 2025 Three Brother's Luxury Car Rentals. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="#" className="hover:text-[#f4b400] transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-[#f4b400] transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-[#f4b400] transition-colors">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
